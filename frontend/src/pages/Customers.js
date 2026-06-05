import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { customersApi } from '../api/client';

function CustomerModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name:'', email:'', phone:'', address:'' });
  const [saving, setSaving] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.name || !form.email) { toast.error('Name and Email are required'); return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { toast.error('Invalid email address'); return; }
    setSaving(true);
    try {
      await customersApi.create(form);
      toast.success('Customer created!');
      onSave();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Add Customer</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" name="name" value={form.name} onChange={handle} placeholder="e.g. John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input className="form-input" name="email" type="email" value={form.email} onChange={handle} placeholder="john@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" name="phone" value={form.phone} onChange={handle} placeholder="+1 234 567 8900" />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-input" name="address" value={form.address} onChange={handle} rows={2} placeholder="Street, City, Country" />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? 'Saving...' : 'Add Customer'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    customersApi.getAll().then(r => setCustomers(r.data)).catch(() => toast.error('Failed to load customers')).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const deleteCustomer = async (c) => {
    if (!window.confirm(`Delete customer "${c.name}"? This may affect their orders.`)) return;
    try { await customersApi.delete(c.id); toast.success('Customer deleted'); load(); }
    catch (e) { toast.error(e.message); }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  return (
    <div>
      {showModal && <CustomerModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load(); }} />}
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{customers.length} registered customers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Customer</button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Customer List</span>
          <input className="form-input" style={{width: 220}} placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="table-container">
          {loading ? <div className="empty-state"><div className="empty-state-icon">⏳</div><p>Loading...</p></div>
          : filtered.length === 0 ? <div className="empty-state"><div className="empty-state-icon">👥</div><p className="empty-state-text">No customers yet. Add your first customer!</p></div>
          : (
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td style={{color:'var(--primary)'}}>{c.email}</td>
                    <td>{c.phone || <span style={{color:'var(--gray-300)'}}>—</span>}</td>
                    <td style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.address || <span style={{color:'var(--gray-300)'}}>—</span>}</td>
                    <td style={{fontSize:13,color:'var(--gray-500)'}}>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteCustomer(c)}>🗑️ Delete</button>
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
