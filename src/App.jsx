import React from 'react';
import ErrorBoundary from './components/common/ErrorBoundary';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import AddProduct from './pages/AddProduct';
import Orders from './pages/Orders';
import Analytics from './pages/Analytics';
import Logs from './pages/Logs';
import { ToastProvider } from './components/common/ToastProvider';
import { ThemeProvider } from './components/common/ThemeProvider';

function PageRoutes() {
  const location = useLocation();
  return <ErrorBoundary key={location.pathname}><Routes location={location}>
    <Route path="/" element={<Dashboard />} />
    <Route path="/inventory" element={<Inventory />} />
    <Route path="/add" element={<AddProduct />} />
    <Route path="/orders" element={<Orders />} />
    <Route path="/analytics" element={<Analytics />} />
    <Route path="/logs" element={<Logs />} />
    <Route path="*" element={<div className="p-8 dark:text-white"><h1 className="text-2xl font-bold">Page not found</h1><Link className="underline" to="/">Go to dashboard</Link></div>} />
  </Routes></ErrorBoundary>;
}

function App() {
  return (
    <ErrorBoundary>
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AdminLayout>
          <PageRoutes />
        </AdminLayout>
      </BrowserRouter>
    </ToastProvider>
  </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
