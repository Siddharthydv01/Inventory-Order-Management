import { useState, useEffect } from 'react';
import {
  Plus,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  X,
  Minus,
} from 'lucide-react';
import { orderAPI, productAPI, customerAPI } from '../api/client';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // For order creation form
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await orderAPI.getAll();
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }

  async function openCreate() {
    setError('');
    setSelectedCustomer('');
    setOrderItems([{ product_id: '', quantity: 1 }]);

    try {
      const [custRes, prodRes] = await Promise.all([
        customerAPI.getAll(),
        productAPI.getAll(),
      ]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
      setModalOpen(true);
    } catch (err) {
      console.error('Failed to load form data:', err);
    }
  }

  function addItem() {
    setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  }

  function removeItem(idx) {
    if (orderItems.length <= 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== idx));
  }

  function updateItem(idx, field, value) {
    const updated = [...orderItems];
    updated[idx] = { ...updated[idx], [field]: value };
    setOrderItems(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    if (!selectedCustomer) {
      setError('Please select a customer.');
      setSaving(false);
      return;
    }

    const items = orderItems
      .filter((item) => item.product_id)
      .map((item) => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity) || 1,
      }));

    if (items.length === 0) {
      setError('Please add at least one product.');
      setSaving(false);
      return;
    }

    try {
      await orderAPI.create({
        customer_id: parseInt(selectedCustomer),
        items,
      });
      setModalOpen(false);
      loadOrders();
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'object' && detail.items) {
        const stockErrors = detail.items
          .map(
            (item) =>
              `${item.product_name}: requested ${item.requested}, available ${item.available}`
          )
          .join('\n');
        setError(`Insufficient stock:\n${stockErrors}`);
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Failed to create order. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  }

  function getOrderTotal(order) {
    return order.items
      ?.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      .toFixed(2);
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <div>
            <h1>Orders</h1>
            <p>Loading orders...</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ height: 80 }}>
              <div className="skeleton" style={{ width: '60%', height: 20, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '30%', height: 14 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p>View and create customer orders</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> New Order
        </button>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <ShoppingCart size={48} />
            <p>No orders yet. Create your first order!</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            return (
              <div key={order.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Order header row */}
                <div
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 24px',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-glass-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--accent-primary-glow)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ShoppingCart size={18} style={{ color: 'var(--accent-primary-hover)' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                        Order #{order.id}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {order.customer?.name} · {new Date(order.order_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                        ${getOrderTotal(order)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {order.items?.length || 0} item(s)
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} />
                    ) : (
                      <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </div>
                </div>

                {/* Expanded order details */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: '1px solid var(--border-color)',
                      padding: '16px 24px',
                      background: 'rgba(0,0,0,0.15)',
                      animation: 'fadeIn 200ms ease-out',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: 12,
                      }}
                    >
                      Order Items
                    </div>
                    <div className="table-container" style={{ border: 'none' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Unit Price</th>
                            <th>Qty</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items?.map((item) => (
                            <tr key={item.id}>
                              <td style={{ fontWeight: 600 }}>{item.product.name}</td>
                              <td>
                                <code
                                  style={{
                                    fontSize: '0.8125rem',
                                    background: 'var(--bg-glass)',
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--accent-primary-hover)',
                                  }}
                                >
                                  {item.product.sku}
                                </code>
                              </td>
                              <td>${item.product.price.toFixed(2)}</td>
                              <td>
                                <StatusBadge type="info">×{item.quantity}</StatusBadge>
                              </td>
                              <td style={{ fontWeight: 600 }}>
                                ${(item.product.price * item.quantity).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '12px 20px 0',
                        marginTop: 8,
                        borderTop: '1px solid var(--border-color)',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Customer Email
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {order.customer?.email}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Order Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Order"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Placing Order...' : 'Place Order'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-danger-glow)',
                color: 'var(--accent-danger)',
                fontSize: '0.8125rem',
                marginBottom: 16,
                whiteSpace: 'pre-line',
              }}
            >
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Customer</label>
            <select
              className="form-select"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              required
            >
              <option value="">Select a customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <label className="form-label" style={{ margin: 0 }}>
                Order Items
              </label>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={addItem}
                style={{ color: 'var(--accent-primary-hover)' }}
              >
                <Plus size={14} /> Add Item
              </button>
            </div>

            {orderItems.map((item, idx) => {
              const selectedProduct = products.find(
                (p) => p.id === parseInt(item.product_id)
              );
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: 8,
                    marginBottom: 8,
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <select
                      className="form-select"
                      value={item.product_id}
                      onChange={(e) => updateItem(idx, 'product_id', e.target.value)}
                      required
                    >
                      <option value="">Select product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ${p.price.toFixed(2)} (Stock: {p.stock_quantity})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ width: 90 }}>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      max={selectedProduct?.stock_quantity || 999}
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      placeholder="Qty"
                      required
                    />
                  </div>
                  {orderItems.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      onClick={() => removeItem(idx)}
                      style={{ color: 'var(--accent-danger)', marginTop: 2 }}
                    >
                      <Minus size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Order summary */}
          {orderItems.some((item) => item.product_id) && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-color)',
                marginTop: 16,
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 8,
                }}
              >
                Order Summary
              </div>
              {orderItems
                .filter((item) => item.product_id)
                .map((item, idx) => {
                  const product = products.find(
                    (p) => p.id === parseInt(item.product_id)
                  );
                  if (!product) return null;
                  const subtotal = product.price * (parseInt(item.quantity) || 0);
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.8125rem',
                        padding: '4px 0',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <span>
                        {product.name} × {item.quantity}
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              <div
                style={{
                  borderTop: '1px solid var(--border-color)',
                  marginTop: 8,
                  paddingTop: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                }}
              >
                <span>Total</span>
                <span style={{ color: 'var(--accent-secondary-hover)', fontSize: '1rem' }}>
                  $
                  {orderItems
                    .filter((item) => item.product_id)
                    .reduce((sum, item) => {
                      const product = products.find(
                        (p) => p.id === parseInt(item.product_id)
                      );
                      return sum + (product?.price || 0) * (parseInt(item.quantity) || 0);
                    }, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
