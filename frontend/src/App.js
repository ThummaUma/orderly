import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import './App.css';

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-icon">📦</span>
            <span className="brand-name">InvenTrack</span>
          </div>
          <nav className="sidebar-nav">
            <NavLink to="/" end className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <span>🏠</span> Dashboard
            </NavLink>
            <NavLink to="/products" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <span>🛍️</span> Products
            </NavLink>
            <NavLink to="/customers" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <span>👥</span> Customers
            </NavLink>
            <NavLink to="/orders" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <span>📋</span> Orders
            </NavLink>
          </nav>
          <div className="sidebar-footer">Inventory System v1.0</div>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
