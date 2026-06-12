"""Pydantic schemas for request/response validation."""

from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime


# ─── Product Schemas ────────────────────────────────────────────────

class ProductBase(BaseModel):
    """Base schema for product data."""
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    sku: str = Field(..., min_length=1, max_length=100, description="Unique stock keeping unit")
    price: float = Field(..., gt=0, description="Product price (must be > 0)")
    stock_quantity: int = Field(..., ge=0, description="Available stock quantity")


class ProductCreate(ProductBase):
    """Schema for creating a new product."""
    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product (all fields optional)."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)


class ProductResponse(ProductBase):
    """Schema for product response."""
    id: int

    class Config:
        from_attributes = True


# ─── Customer Schemas ───────────────────────────────────────────────

class CustomerBase(BaseModel):
    """Base schema for customer data."""
    name: str = Field(..., min_length=1, max_length=255, description="Customer name")
    email: EmailStr = Field(..., description="Unique customer email")


class CustomerCreate(CustomerBase):
    """Schema for creating a new customer."""
    pass


class CustomerUpdate(BaseModel):
    """Schema for updating a customer (all fields optional)."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None


class CustomerResponse(CustomerBase):
    """Schema for customer response."""
    id: int

    class Config:
        from_attributes = True


# ─── Order Schemas ──────────────────────────────────────────────────

class OrderItemCreate(BaseModel):
    """Schema for an item within a new order."""
    product_id: int = Field(..., description="ID of the product to order")
    quantity: int = Field(..., gt=0, description="Quantity to order (must be > 0)")


class OrderCreate(BaseModel):
    """Schema for creating a new order."""
    customer_id: int = Field(..., description="ID of the customer placing the order")
    items: List[OrderItemCreate] = Field(..., min_length=1, description="List of order items")


class OrderItemResponse(BaseModel):
    """Schema for order item in response."""
    id: int
    product_id: int
    quantity: int
    product: ProductResponse

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    """Schema for order response."""
    id: int
    customer_id: int
    order_date: datetime
    customer: CustomerResponse
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True
