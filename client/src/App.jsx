import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import InventoryPage from './pages/InventoryPage';
import ProductForm from './components/ProductForm';
import BillingPage from './pages/BillingPage';
import SalesHistory from './pages/SalesHistory';
import ToBuyList from './pages/ToBuyList';
import './styles/global.css';

// Simple helper to highlight active link
const NavLink = ({ to, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={isActive ? 'active' : ''}>{label}</Link>
  );
};

const Layout = ({ children }) => {
  return (
    <>
      <div className="sidebar">
        <h1>JMD POS</h1>
        <nav>
          <NavLink to="/" label="Dashboard / Inventory" />
          <NavLink to="/products" label="Product Management" />
          <NavLink to="/billing" label="Billing" />
          <NavLink to="/sales" label="Sales History" />
          <NavLink to="/tobuy" label="To-Buy List" />
        </nav>
      </div>
      <div className="main-content">
        {children}
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<InventoryPage />} />
          <Route path="/products" element={<ProductForm />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/sales" element={<SalesHistory />} />
          <Route path="/tobuy" element={<ToBuyList />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
