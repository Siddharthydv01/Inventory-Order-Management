"""Orders router — create and list orders with stock validation."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.database import get_db
from app.models import Order, OrderItem, Product, Customer
from app.schemas import OrderCreate, OrderResponse

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("/", response_model=List[OrderResponse])
def list_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """List all orders with customer info and order items."""
    orders = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .order_by(Order.order_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get an order by ID with full details."""
    order = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found",
        )
    return order


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """
    Create a new order with stock validation.

    Business Rules:
    1. Customer must exist.
    2. All products must exist.
    3. Sufficient stock must be available for each item.
    4. Stock is decremented atomically upon successful order creation.
    """
    # 1. Validate customer exists
    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id {order_data.customer_id} not found",
        )

    # 2. Validate all products and check stock
    insufficient_stock = []
    products_map = {}

    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item.product_id} not found",
            )

        if product.stock_quantity < item.quantity:
            insufficient_stock.append(
                {
                    "product_id": product.id,
                    "product_name": product.name,
                    "requested": item.quantity,
                    "available": product.stock_quantity,
                }
            )

        products_map[item.product_id] = product

    # 3. If any item has insufficient stock, fail the entire order
    if insufficient_stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Insufficient stock for one or more items",
                "items": insufficient_stock,
            },
        )

    # 4. Create order and decrement stock in a single transaction
    try:
        order = Order(customer_id=order_data.customer_id)
        db.add(order)
        db.flush()  # Get the order ID without committing

        for item in order_data.items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
            )
            db.add(order_item)

            # Decrement stock
            product = products_map[item.product_id]
            product.stock_quantity -= item.quantity

        db.commit()

        # Reload with relationships for response
        db.refresh(order)
        order = (
            db.query(Order)
            .options(
                joinedload(Order.customer),
                joinedload(Order.items).joinedload(OrderItem.product),
            )
            .filter(Order.id == order.id)
            .first()
        )

        return order

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}",
        )
