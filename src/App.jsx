import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import AddProduct from './pages/AddProduct';
import Orders from './pages/Orders';
import Analytics from './pages/Analytics';
import Logs from './pages/Logs';
import { ToastProvider } from './components/common/ToastProvider';
import { ThemeProvider } from './components/common/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AdminLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/add" element={<AddProduct />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/logs" element={<Logs />} />
          </Routes>
        </AdminLayout>
      </BrowserRouter>
    </ToastProvider>
  </ThemeProvider>
  );
}

export default App;
