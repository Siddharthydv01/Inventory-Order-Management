import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Mail } from 'lucide-react';
import { customerAPI } from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await customerAPI.getAll(search);
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => loadCustomers(), 300);
    return () => clearTimeout(timer);
  }, [loadCustomers]);

  function openCreate() {
    setEditCustomer(null);
    setForm({ name: '', email: '' });
    setError('');
    setModalOpen(true);
  }

  function openEdit(customer) {
    setEditCustomer(customer);
    setForm({ name: customer.name, email: customer.email });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const data = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
    };

    if (!data.name || !data.email) {
      setError('All fields are required.');
      setSaving(false);
      return;
    }

    try {
      if (editCustomer) {
        await customerAPI.update(editCustomer.id, data);
      } else {
        await customerAPI.create(data);
      }
      setModalOpen(false);
      loadCustomers();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await customerAPI.delete(id);
      setDeleteConfirm(null);
      loadCustomers();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  // Generate a consistent avatar color from name
  function getAvatarColor(name) {
    const colors = [
      '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
      '#f43f5e', '#f97316', '#eab308', '#22c55e',
      '#14b8a6', '#06b6d4', '#3b82f6',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  const columns = [
    { key: 'id', label: 'ID', style: { width: 60 } },
    {
      key: 'name',
      label: 'Customer',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: getAvatarColor(row.name),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {row.name.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontWeight: 600 }}>{row.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Mail size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ color: 'var(--text-secondary)' }}>{row.email}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="table-actions">
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => openEdit(row)}
            title="Edit customer"
          >
            <Pencil size={15} />
          </button>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setDeleteConfirm(row)}
            title="Delete customer"
            style={{ color: 'var(--accent-danger)' }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>Manage your customer directory</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email..."
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCustomer ? 'Edit Customer' : 'Add New Customer'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editCustomer ? 'Update' : 'Create'}
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
              }}
            >
              {error}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. john@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Customer"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={() => handleDelete(deleteConfirm?.id)}
            >
              Delete
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to delete{' '}
          <strong style={{ color: 'var(--text-primary)' }}>
            {deleteConfirm?.name}
          </strong>
          ? All associated orders will also be deleted.
        </p>
      </Modal>
    </div>
  );
}
