import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Menu,
  X,
  Boxes,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/orders', label: 'Orders', icon: ShoppingCart },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1100,
          display: 'none',
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: 'none',
          }}
        />
      )}

      <aside
        className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 'var(--sidebar-width)',
          height: '100vh',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          transition: 'transform var(--transition-base)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '24px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px var(--accent-primary-glow)',
            }}
          >
            <Boxes size={22} color="white" />
          </div>
          <div>
            <h2
              style={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: 'var(--text-primary)',
              }}
            >
              InvenTrack
            </h2>
            <p
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Management
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', overflow: 'auto' }}>
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '8px 12px',
              marginBottom: 4,
            }}
          >
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 4,
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-primary-glow)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-glass-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3,
                      height: 20,
                      borderRadius: '0 3px 3px 0',
                      background: 'var(--accent-primary)',
                    }}
                  />
                )}
                <Icon
                  size={18}
                  style={{
                    color: isActive ? 'var(--accent-primary-hover)' : 'inherit',
                  }}
                />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <p>InvenTrack v1.0</p>
          <p style={{ opacity: 0.6 }}>© 2026</p>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex !important;
          }
          .sidebar-overlay {
            display: block !important;
          }
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar-open {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
}
