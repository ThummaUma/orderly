import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state"><div className="empty-state-icon">⏳</div><p>Loading dashboard...</p></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome to your Inventory & Order Management System</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">🛍️</div>
          <div>
            <div className="stat-value">{stats?.total_products ?? 0}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">👥</div>
          <div>
            <div className="stat-value">{stats?.total_customers ?? 0}</div>
            <div className="stat-label">Total Customers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">📋</div>
          <div>
            <div className="stat-value">{stats?.total_orders ?? 0}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⚠️</div>
          <div>
            <div className="stat-value">{stats?.low_stock_products?.length ?? 0}</div>
            <div className="stat-label">Low Stock Alerts</div>
          </div>
        </div>
      </div>

      {stats?.low_stock_products?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">⚠️ Low Stock Products</span>
            <span className="badge badge-warning">Needs Attention</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {stats.low_stock_products.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td><code style={{background:'#f3f4f6',padding:'2px 6px',borderRadius:4,fontSize:12}}>{p.sku}</code></td>
                    <td>{p.category || '—'}</td>
                    <td>
                      <span className={`badge ${p.stock_quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                        {p.stock_quantity} units
                      </span>
                    </td>
                    <td>${p.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(!stats?.low_stock_products?.length) && (
        <div className="card" style={{padding: '32px', textAlign: 'center'}}>
          <div style={{fontSize: 40, marginBottom: 12}}>✅</div>
          <p style={{color: 'var(--gray-500)'}}>All products are well stocked. No alerts at this time.</p>
        </div>
      )}
    </div>
  );
}
