import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ordersApi, customersApi, productsApi } from '../api/client';

const STATUS_BADGES = {
  pending: 'badge-warning',
  confirmed: 'badge-info',
  shipped: 'badge-info',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
};

function OrderModal({ onClose, onSave }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    customersApi.getAll().then(r => setCustomers(r.data)).catch(() => {});
    productsApi.getAll().then(r => setProducts(r.data)).catch(() => {});
  }, []);

  const addItem = () => setItems([...items, { product_id: '', quantity: 1 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => setItems(items.map((it, idx) => idx === i ? { ...it, [field]: val } : it));

  const getProduct = (id) => products.find(p => p.id === parseInt(id));

  const total = items.reduce((sum, it) => {
    const p = getProduct(it.product_id);
    return sum + (p ? p.price * (parseInt(it.quantity) || 0) : 0);
  }, 0);

  const submit = async () => {
    if (!customerId) { toast.error('Please select a customer'); return; }
    const validItems = items.filter(it => it.product_id && it.quantity > 0);
    if (validItems.length === 0) { toast.error('Add at least one product'); return; }
    setSaving(true);
    try {
      await ordersApi.create({ customer_id: parseInt(customerId), items: validItems.map(it => ({ product_id: parseInt(it.product_id), quantity: parseInt(it.quantity) })), notes });
      toast.success('Order created!');
      onSave();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{maxWidth: 600}}>
        <div className="modal-header">
          <span className="modal-title">Create New Order</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Customer *</label>
              <select className="form-input" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                <option value="">Select a customer...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>

            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <label className="form-label">Order Items *</label>
                <button className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Item</button>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {items.map((item, i) => {
                  const prod = getProduct(item.product_id);
                  return (
                    <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 80px auto',gap:8,alignItems:'end'}}>
                      <div>
                        <select className="form-input" value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}>
                          <option value="">Select product...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name} — ${p.price} (stock: {p.stock_quantity})</option>)}
                        </select>
                        {prod && <div style={{fontSize:11,color:'var(--gray-500)',marginTop:3}}>Available: {prod.stock_quantity} units</div>}
                      </div>
                      <input className="form-input" type="number" min="1" max={prod?.stock_quantity || 9999} value={item.quantity} onChange={e => updateItem(i, 'quantity', parseInt(e.target.value))} placeholder="Qty" />
                      {items.length > 1 && <button className="btn btn-danger btn-sm" onClick={() => removeItem(i)} style={{height:37}}>✕</button>}
                    </div>
                  );
                })}
              </div>
              {total > 0 && (
                <div style={{marginTop:14,padding:'10px 14px',background:'var(--primary-light)',borderRadius:8,display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontWeight:600,color:'var(--primary)'}}>Estimated Total</span>
                  <span style={{fontWeight:700,color:'var(--primary)',fontSize:18}}>${total.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-input" value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any special instructions..." />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? 'Creating...' : 'Create Order'}</button>
        </div>
      </div>
    </div>
  );
}

function OrderDetail({ order, onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{maxWidth:560}}>
        <div className="modal-header">
          <span className="modal-title">Order #{order.id}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
            <div><div style={{fontSize:12,color:'var(--gray-500)',marginBottom:4}}>Customer</div><strong>{order.customer?.name}</strong><div style={{fontSize:13,color:'var(--gray-500)'}}>{order.customer?.email}</div></div>
            <div><div style={{fontSize:12,color:'var(--gray-500)',marginBottom:4}}>Status</div><span className={`badge ${STATUS_BADGES[order.status]}`}>{order.status}</span></div>
            <div><div style={{fontSize:12,color:'var(--gray-500)',marginBottom:4}}>Created</div>{new Date(order.created_at).toLocaleString()}</div>
            <div><div style={{fontSize:12,color:'var(--gray-500)',marginBottom:4}}>Total</div><strong style={{fontSize:20,color:'var(--primary)'}}>${order.total_amount.toFixed(2)}</strong></div>
          </div>
          {order.notes && <div style={{background:'var(--gray-50)',padding:'10px 14px',borderRadius:8,marginBottom:16,fontSize:14}}><strong>Notes:</strong> {order.notes}</div>}
          <table>
            <thead><tr><th>Product</th><th>SKU</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.id}>
                  <td>{item.product?.name || 'Unknown'}</td>
                  <td><code style={{background:'#f3f4f6',padding:'2px 6px',borderRadius:4,fontSize:12}}>{item.product?.sku}</code></td>
                  <td>{item.quantity}</td>
                  <td>${item.unit_price.toFixed(2)}</td>
                  <td><strong>${(item.unit_price * item.quantity).toFixed(2)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="modal-footer"><button className="btn btn-secondary" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  const load = () => {
    setLoading(true);
    ordersApi.getAll().then(r => setOrders(r.data)).catch(() => toast.error('Failed to load orders')).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const deleteOrder = async (o) => {
    if (!window.confirm(`Cancel order #${o.id}? Stock will be restored.`)) return;
    try { await ordersApi.delete(o.id); toast.success('Order cancelled & stock restored'); load(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      {showCreate && <OrderModal onClose={() => setShowCreate(false)} onSave={() => { setShowCreate(false); load(); }} />}
      {viewOrder && <OrderDetail order={viewOrder} onClose={() => setViewOrder(null)} />}

      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} orders total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Order</button>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">All Orders</span></div>
        <div className="table-container">
          {loading ? <div className="empty-state"><div className="empty-state-icon">⏳</div><p>Loading...</p></div>
          : orders.length === 0 ? <div className="empty-state"><div className="empty-state-icon">📋</div><p className="empty-state-text">No orders yet. Create your first order!</p></div>
          : (
            <table>
              <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td><strong>#{o.id}</strong></td>
                    <td><div>{o.customer?.name}</div><div style={{fontSize:12,color:'var(--gray-500)'}}>{o.customer?.email}</div></td>
                    <td><span className="badge badge-gray">{o.items.length} item{o.items.length !== 1 ? 's' : ''}</span></td>
                    <td><strong>${o.total_amount.toFixed(2)}</strong></td>
                    <td><span className={`badge ${STATUS_BADGES[o.status]}`}>{o.status}</span></td>
                    <td style={{fontSize:13,color:'var(--gray-500)'}}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setViewOrder(o)}>👁️ View</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteOrder(o)}>✕ Cancel</button>
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
