import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { productsApi } from '../api/client';

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product || { name:'', sku:'', price:'', stock_quantity:'', category:'', description:'' });
  const [saving, setSaving] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.name || !form.sku || !form.price) { toast.error('Name, SKU, and Price are required'); return; }
    setSaving(true);
    try {
      const data = { ...form, price: parseFloat(form.price), stock_quantity: parseInt(form.stock_quantity) || 0 };
      if (product) await productsApi.update(product.id, data);
      else await productsApi.create(data);
      toast.success(product ? 'Product updated!' : 'Product created!');
      onSave();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{product ? 'Edit Product' : 'Add Product'}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className="form-input" name="name" value={form.name} onChange={handle} placeholder="e.g. MacBook Pro" />
              </div>
              <div className="form-group">
                <label className="form-label">SKU *</label>
                <input className="form-input" name="sku" value={form.sku} onChange={handle} placeholder="e.g. MBP-001" disabled={!!product} />
              </div>
              <div className="form-group">
                <label className="form-label">Price ($) *</label>
                <input className="form-input" name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={handle} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input className="form-input" name="stock_quantity" type="number" min="0" value={form.stock_quantity} onChange={handle} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-input" name="category" value={form.category} onChange={handle} placeholder="e.g. Electronics" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" name="description" value={form.description} onChange={handle} rows={3} placeholder="Optional description..." />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    productsApi.getAll().then(r => setProducts(r.data)).catch(() => toast.error('Failed to load products')).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const deleteProduct = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try { await productsApi.delete(p.id); toast.success('Product deleted'); load(); }
    catch (e) { toast.error(e.message); }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {modal && <ProductModal product={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} products in inventory</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>+ Add Product</button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Product Catalog</span>
          <input className="form-input" style={{width: 220}} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="table-container">
          {loading ? <div className="empty-state"><div className="empty-state-icon">⏳</div><p>Loading...</p></div>
          : filtered.length === 0 ? <div className="empty-state"><div className="empty-state-icon">📦</div><p className="empty-state-text">No products found. Add your first product!</p></div>
          : (
            <table>
              <thead>
                <tr><th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong>{p.description && <div style={{fontSize:12,color:'var(--gray-500)',marginTop:2}}>{p.description.slice(0,50)}{p.description.length>50?'...':''}</div>}</td>
                    <td><code style={{background:'#f3f4f6',padding:'2px 6px',borderRadius:4,fontSize:12}}>{p.sku}</code></td>
                    <td>{p.category || <span style={{color:'var(--gray-300)'}}>—</span>}</td>
                    <td><strong>${p.price.toFixed(2)}</strong></td>
                    <td>
                      <span className={`badge ${p.stock_quantity === 0 ? 'badge-danger' : p.stock_quantity <= 10 ? 'badge-warning' : 'badge-success'}`}>
                        {p.stock_quantity} units
                      </span>
                    </td>
                    <td>
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setModal(p)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(p)}>🗑️ Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
