import { useState, useEffect } from 'react';
import {
  Package,
  Users,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { productAPI, customerAPI, orderAPI } from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    orders: 0,
    lowStock: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [productsRes, customersRes, ordersRes] = await Promise.all([
        productAPI.getAll(),
        customerAPI.getAll(),
        orderAPI.getAll(),
      ]);

      const products = productsRes.data;
      const lowStock = products.filter((p) => p.stock_quantity <= 5);

      setStats({
        products: products.length,
        customers: customersRes.data.length,
        orders: ordersRes.data.length,
        lowStock: lowStock.length,
      });

      setRecentOrders(ordersRes.data.slice(0, 5));
      setLowStockProducts(lowStock.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      label: 'Total Products',
      value: stats.products,
      icon: Package,
      color: 'indigo',
      link: '/products',
    },
    {
      label: 'Total Customers',
      value: stats.customers,
      icon: Users,
      color: 'emerald',
      link: '/customers',
    },
    {
      label: 'Total Orders',
      value: stats.orders,
      icon: ShoppingCart,
      color: 'amber',
      link: '/orders',
    },
    {
      label: 'Low Stock Alerts',
      value: stats.lowStock,
      icon: AlertTriangle,
      color: 'rose',
      link: '/products',
    },
  ];

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>Loading your overview...</p>
          </div>
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-glass stat-card" style={{ height: 140 }}>
              <div className="skeleton" style={{ width: 48, height: 48, marginBottom: 16 }} />
              <div className="skeleton" style={{ width: 60, height: 32, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: 100, height: 14 }} />
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
          <h1>Dashboard</h1>
          <p>Welcome back! Here's your inventory overview.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <TrendingUp size={18} style={{ color: 'var(--accent-secondary)' }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.link}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="card-glass stat-card">
                <div className={`stat-icon ${card.color}`}>
                  <Icon size={22} />
                </div>
                <div className="stat-value">{card.value}</div>
                <div className="stat-label">{card.label}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two-column layout for orders and low stock */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: 24,
        }}
      >
        {/* Recent Orders */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Orders</h3>
            <Link
              to="/orders"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.8125rem' }}
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <ShoppingCart size={36} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: '0.875rem', marginTop: 8 }}>No orders yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-color)',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-glass-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-glass)';
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      Order #{order.id}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {order.customer?.name} · {order.items?.length || 0} item(s)
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(order.order_date).toLocaleDateString()}
                    </div>
                    <StatusBadge type="info">
                      ${order.items?.reduce(
                        (sum, item) => sum + item.product.price * item.quantity,
                        0
                      ).toFixed(2)}
                    </StatusBadge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Low Stock Alerts</h3>
            <Link
              to="/products"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.8125rem' }}
            >
              Manage <ArrowRight size={14} />
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <Package size={36} style={{ opacity: 0.3, color: 'var(--accent-secondary)' }} />
              <p style={{ fontSize: '0.875rem', marginTop: 8, color: 'var(--accent-secondary)' }}>
                All products well-stocked!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      SKU: {product.sku}
                    </div>
                  </div>
                  <StatusBadge
                    type={product.stock_quantity === 0 ? 'danger' : 'warning'}
                  >
                    {product.stock_quantity === 0
                      ? 'Out of Stock'
                      : `${product.stock_quantity} left`}
                  </StatusBadge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
