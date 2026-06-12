import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { productAPI } from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', sku: '', price: '', stock_quantity: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const res = await productAPI.getAll(search);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => loadProducts(), 300);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  function openCreate() {
    setEditProduct(null);
    setForm({ name: '', sku: '', price: '', stock_quantity: '' });
    setError('');
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      stock_quantity: String(product.stock_quantity),
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const data = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: parseFloat(form.price),
      stock_quantity: parseInt(form.stock_quantity),
    };

    if (!data.name || !data.sku || isNaN(data.price) || isNaN(data.stock_quantity)) {
      setError('All fields are required with valid values.');
      setSaving(false);
      return;
    }

    try {
      if (editProduct) {
        await productAPI.update(editProduct.id, data);
      } else {
        await productAPI.create(data);
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await productAPI.delete(id);
      setDeleteConfirm(null);
      loadProducts();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  function getStockBadge(qty) {
    if (qty === 0) return <StatusBadge type="danger">Out of Stock</StatusBadge>;
    if (qty <= 5) return <StatusBadge type="warning">{qty} left</StatusBadge>;
    return <StatusBadge type="success">In Stock ({qty})</StatusBadge>;
  }

  const columns = [
    { key: 'id', label: 'ID', style: { width: 60 } },
    { key: 'name', label: 'Product Name', render: (row) => (
      <span style={{ fontWeight: 600 }}>{row.name}</span>
    )},
    { key: 'sku', label: 'SKU', render: (row) => (
      <code style={{ 
        fontSize: '0.8125rem', 
        background: 'var(--bg-glass)', 
        padding: '2px 8px', 
        borderRadius: 'var(--radius-sm)',
        color: 'var(--accent-primary-hover)',
      }}>
        {row.sku}
      </code>
    )},
    { key: 'price', label: 'Price', render: (row) => (
      <span style={{ fontWeight: 600 }}>${row.price.toFixed(2)}</span>
    )},
    { key: 'stock_quantity', label: 'Stock', render: (row) => getStockBadge(row.stock_quantity) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="table-actions">
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => openEdit(row)}
            title="Edit product"
          >
            <Pencil size={15} />
          </button>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setDeleteConfirm(row)}
            title="Delete product"
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
          <h1>Products</h1>
          <p>Manage your inventory catalog</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or SKU..."
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editProduct ? 'Edit Product' : 'Add New Product'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editProduct ? 'Update' : 'Create'}
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
            <label className="form-label">Product Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Wireless Keyboard"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">SKU</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. WK-001"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Price ($)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Stock Quantity</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                min="0"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                required
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Product"
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
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
