import React, { useEffect, useState, useRef } from 'react';
import { subscribeToOrders, updateOrder, addOrder } from '../services/orders';
import { getProducts } from '../services/products';
import { Search, Filter, Clock, Truck, PackageCheck, CheckCircle2, Plus, X, ChevronLeft, ChevronRight, Activity, Terminal, Bell } from 'lucide-react';
import { useToast } from '../components/common/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered'];
const ITEMS_PER_PAGE = 8;

const STATUS_ICONS = {
  Pending: Clock,
  Processing: PackageCheck,
  Shipped: Truck,
  Delivered: CheckCircle2,
};

const STATUS_STYLING = {
  Pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  Processing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  Shipped: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  Delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
};

export default function Orders() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [newOrderHighlight, setNewOrderHighlight] = useState(null);
  const [newOrder, setNewOrder] = useState({
    productId: '',
    productName: '',
    quantity: 1,
    customerName: '',
    customerEmail: '',
    status: 'Pending'
  });
  const [submitting, setSubmitting] = useState(false);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    fetchProducts();
    
    const unsubscribe = subscribeToOrders((updatedOrders) => {
      if (!isFirstLoad.current && updatedOrders.length > orders.length) {
        const latestOrder = updatedOrders[0];
        addToast(`New order received: ${latestOrder.orderId}`, 'success');
        setNewOrderHighlight(latestOrder.id);
        setTimeout(() => setNewOrderHighlight(null), 5000);
      }
      setOrders(updatedOrders);
      setLoading(false);
      isFirstLoad.current = false;
    });

    return () => unsubscribe();
  }, [orders.length]);

  const fetchProducts = async () => {
    try {
      const prodData = await getProducts();
      setProducts(prodData);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrder(orderId, { status: newStatus });
      addToast(`Protocol updated: ${newStatus}`, 'success');
    } catch (error) {
      addToast("Status sync failed.", "error");
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!newOrder.productId || !newOrder.customerName || !newOrder.customerEmail) {
      addToast("Required fields missing.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const orderData = { ...newOrder, orderId };
      await addOrder(orderData);
      addToast(`Order ${orderId} manifested successfully!`, 'success');
      setShowNewOrder(false);
      setNewOrder({ productId: '', productName: '', quantity: 1, customerName: '', customerEmail: '', status: 'Pending' });
    } catch (error) {
      addToast("Manifest creation failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="bg-white/40 dark:bg-slate-900/40 rounded-4xl h-[600px] border border-slate-100 dark:border-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Flow Logistics</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white font-display uppercase tracking-tightest leading-tight">Order <span className="text-brand-600 dark:text-brand-500">Manifest</span></h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">Real-time ledger of all incoming and processed transactions within the eco-system.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setShowNewOrder(true)} 
             className="px-6 py-3.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
           >
              <Plus className="h-4 w-4" /> Manifest Order
           </button>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/40 border">
        {/* Advanced Filters */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-8 bg-slate-50/30 dark:bg-slate-900/30">
          <div className="flex flex-wrap gap-2.5">
            {['All', ...STATUS_OPTIONS].map(status => (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                className={`px-5 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all border-2 ${
                  statusFilter === status 
                    ? 'bg-brand-600 border-brand-600 text-white shadow-xl shadow-brand-500/20' 
                    : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-brand-500'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by Order ID, Product name, or Consignee..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800/50">
                <th className="px-10 py-6">Identity</th>
                <th className="px-10 py-6">Asset Manifest</th>
                <th className="px-10 py-6">Consignee</th>
                <th className="px-10 py-6">Unit Vol</th>
                <th className="px-10 py-6">Synchronized</th>
                <th className="px-10 py-6 text-center">Protocol Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/20">
              <AnimatePresence mode="popLayout">
                {paginatedOrders.length === 0 ? (
                   <motion.tr 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     key="empty"
                   >
                      <td colSpan="6" className="px-10 py-24 text-center">
                        <div className="flex flex-col items-center justify-center opacity-30">
                           <Terminal className="h-14 w-14 mb-4" />
                           <p className="text-xs font-bold uppercase tracking-widest">Null return on filter query</p>
                        </div>
                      </td>
                   </motion.tr>
                ) : (
                  paginatedOrders.map((order) => {
                    const createdAt = order.createdAt?.toDate ? order.createdAt.toDate() : (order.createdAt ? new Date(order.createdAt) : new Date());
                    const isNew = newOrderHighlight === order.id;

                    const displayIdentity = order.orderId || order.id?.substring(0, 11) || 'N/A';
                    const displayProductName = order.productName || products.find(p => p.id === order.productId)?.name || 'Unknown Asset';
                    const displayCustomerName = order.customerName || order.buyerName || order.userName || 'Unknown Consignee';
                    const displayCustomerEmail = order.customerEmail || order.buyerEmail || order.email || '';
                    const displayQuantity = order.quantity || order.qty || order.count || 1;
                    
                    return (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0,
                          backgroundColor: isNew ? 'var(--color-brand-500-10, rgba(14, 165, 233, 0.1))' : 'transparent',
                          scale: isNew ? 1.01 : 1
                        }}
                        exit={{ opacity: 0, x: 20 }}
                        key={order.id} 
                        className={`group transition-all duration-300 ${isNew ? 'ring-2 ring-brand-500 ring-inset' : 'hover:bg-brand-500/[0.03]'}`}
                      >
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-3">
                            {isNew && <span className="h-2 w-2 rounded-full bg-brand-500 animate-ping" />}
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{displayIdentity}</span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{displayProductName}</span>
                        </td>
                        <td className="px-10 py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{displayCustomerName}</span>
                              <span className="text-[10px] text-slate-400">{displayCustomerEmail}</span>
                            </div>
                        </td>
                        <td className="px-10 py-6 font-mono text-sm font-bold text-slate-500 dark:text-slate-400">
                          {displayQuantity}U
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex flex-col items-start">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{createdAt.toLocaleDateString()}</span>
                            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter mt-1">{createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex justify-center">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className={`text-[10px] font-bold py-2 pl-4 pr-10 rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat uppercase tracking-widest ${STATUS_STYLING[order.status]}`}
                            >
                              {STATUS_OPTIONS.map(opt => (
                                <option key={opt} value={opt} className="bg-white dark:bg-slate-950 font-sans">{opt}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {totalPages > 1 && (
          <div className="px-10 py-8 bg-slate-50/20 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Sequence <span className="text-slate-900 dark:text-white">{startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length)}</span> / {filteredOrders.length}
            </span>
            <div className="flex gap-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-400 disabled:opacity-20 hover:text-brand-600 transition-all btn-hover shadow-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-400 disabled:opacity-20 hover:text-brand-600 transition-all btn-hover shadow-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manifest New Order Modal */}
      <AnimatePresence>
        {showNewOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewOrder(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-[#020617] rounded-[3rem] w-full max-w-xl shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-10 lg:p-14">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <span className="text-[10px] font-bold text-brand-500 uppercase tracking-[0.2em]">Transaction Protocol</span>
                    <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white font-display uppercase tracking-tightest mt-2">New Manifest</h3>
                  </div>
                  <button onClick={() => setShowNewOrder(false)} className="p-4 rounded-[1.5rem] hover:bg-slate-100 dark:hover:bg-slate-900 transition-all">
                    <X className="h-8 w-8 text-slate-400" />
                  </button>
                </div>
                
                <form onSubmit={handleCreateOrder} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Target Consumable</label>
                    <select
                      required
                      className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all dark:text-white appearance-none"
                      value={newOrder.productId}
                      onChange={(e) => {
                        const prod = products.find(p => p.id === e.target.value);
                        setNewOrder({ ...newOrder, productId: e.target.value, productName: prod ? prod.name : '' });
                      }}
                    >
                      <option value="">Select asset class...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} className="bg-white dark:bg-slate-950">{p.name} [QTY: {p.stock}]</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Consignee Identity</label>
                    <input
                      required
                      type="text"
                      placeholder="Full Name"
                      className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all dark:text-white"
                      value={newOrder.customerName}
                      onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Consignee Communication</label>
                      <input
                        required
                        type="email"
                        placeholder="Email Address"
                        className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all dark:text-white"
                        value={newOrder.customerEmail}
                        onChange={(e) => setNewOrder({ ...newOrder, customerEmail: e.target.value })}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Unit Volume</label>
                      <input
                        required
                        type="number"
                        min="1"
                        className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all dark:text-white"
                        value={newOrder.quantity}
                        onChange={(e) => setNewOrder({ ...newOrder, quantity: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
                    <button 
                      type="button"
                      onClick={() => setShowNewOrder(false)} 
                      className="w-full sm:flex-1 py-5 px-8 border-2 border-slate-100 dark:border-slate-800 text-slate-400 font-bold rounded-[1.5rem] text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all btn-hover"
                    >
                      Discard Sync
                    </button>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:flex-[2] py-5 px-10 bg-brand-600 text-white font-bold rounded-[1.5rem] text-[10px] uppercase tracking-widest hover:bg-brand-700 transition-all shadow-2xl shadow-brand-500/30 btn-hover flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {submitting ? 'Manifesting...' : 'Finalize manifestation'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
