import ProductImage from '../components/common/ProductImage';
import { dataErrorMessage } from '../services/config';
import DataError from '../components/common/DataError';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts, deleteProduct, updateProduct } from '../services/products';
import { Edit2, Trash2, Search, PackageOpen, Plus, Minus, ChevronLeft, ChevronRight, X, Save, AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import { useToast } from '../components/common/ToastProvider';
import Modal from '../components/common/Modal';
import AddProduct from './AddProduct';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const rowVariants = {
  hidden:  { opacity: 0, x: -24, scale: 0.98 },
  visible: {
    opacity: 1, x: 0, scale: 1,
    transition: { type: 'spring', stiffness: 340, damping: 26 },
  },
  exit: {
    opacity: 0,
    x: 40,
    scale: 0.95,
    filter: 'blur(3px)',
    transition: { duration: 0.28, ease: 'easeIn' },
  },
};

const ITEMS_PER_PAGE = 8;

export default function Inventory() {
  const { addToast } = useToast();
  const [confirmingDelete, setConfirmingDelete] = useState(null); // product id
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setDataError('');
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products", error);
      setDataError(dataErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      // Remove from state AFTER exit animation starts (AnimatePresence handles timing)
      setProducts(prev => prev.filter(p => p.id !== id));
      setConfirmingDelete(null);
      addToast('Asset purged from ecosystem.', 'success', { title: 'Purged' });
    } catch (error) {
      console.error('Failed to delete product', error);
      setConfirmingDelete(null);
      addToast('Purge failed. Try again.', 'error', { title: 'Error' });
    }
  };

  const handleStockChange = async (id, currentStock, delta) => {
    const newStock = Math.max(0, Number(currentStock) + delta);
    try {
      await updateProduct(id, { stock: newStock });
      setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
    } catch (error) {
      console.error("Failed to update stock", error);
      addToast("Sync failed.", "error");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct({ ...product });
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async () => {
    try {
      await updateProduct(editingProduct.id, {
        productName: editingProduct.productName || editingProduct.name,
        category: editingProduct.category,
        price: editingProduct.price,
        stock: editingProduct.stock,
      });
      setProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct, name: editingProduct.productName, price: Number(editingProduct.price), stock: Number(editingProduct.stock) } : p));
      setIsEditModalOpen(false);
      addToast("Asset re-materialized successfully!", "success");
    } catch (error) {
      console.error("Failed to update product", error);
      addToast("Synchronization failed.", "error");
    }
  };

  const filteredProducts = products.filter(product =>
    (product.productName || product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>
          <div className="flex gap-3">
            <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-12 w-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>

        {/* Toolbar Skeleton */}
        <div className="h-20 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl" />

        {/* Table Skeleton */}
        <div className="glass-card rounded-4xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="h-14 bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800" />
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center px-8 py-5 gap-6">
                <div className="h-14 w-14 bg-slate-200 dark:bg-slate-800 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>
                <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="w-20 h-6 bg-slate-200 dark:bg-slate-800 rounded-full ml-auto" />
                <div className="w-32 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl mx-8" />
                <div className="w-24 h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <DataError message={dataError} />
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Global Registry</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white font-display uppercase tracking-tightest leading-tight">Asset <span className="text-brand-600 dark:text-brand-500">Inventory</span></h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">Synchronized monitoring of all categorized merchandise within the pet store perimeter.</p>
        </div>

        <div className="flex items-center gap-3">
           <motion.button
             whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
             whileTap={{ scale: 0.95 }}
             onClick={fetchProducts}
             className="p-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-brand-600 transition-all btn-hover"
           >
              <RefreshCw className="h-5 w-5" />
           </motion.button>
           <motion.button
             whileHover={{ scale: 1.02, y: -2 }}
             whileTap={{ scale: 0.98 }}
             onClick={() => setIsAddModalOpen(true)}
             className="px-6 py-3.5 bg-brand-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:bg-brand-700 transition-all flex items-center gap-2 btn-hover"
           >
              <Plus className="h-4 w-4" /> New Materialization
           </motion.button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="glass-card rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center border-white/40">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by name or category..."
            className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all dark:text-white placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex items-center gap-2 px-4 border-l border-slate-100 dark:border-slate-800">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Units:</span>
           <span className="px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[10px] font-mono font-bold tracking-widest">{products.length}</span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="glass-card glass-shine rounded-4xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] w-24">Media</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Designation</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Classification</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Value</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center w-40">Status/Vitals</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <motion.tbody
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-slate-50 dark:divide-slate-800/30"
            >
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <PackageOpen className="h-16 w-16 mb-4 text-slate-400" />
                      <p className="text-sm font-bold uppercase tracking-widest">Signal Missing</p>
                      <p className="text-xs font-semibold mt-2">No data aligns with current filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout" initial={false}>
                  {paginatedProducts.map((product) => (
                    <motion.tr
                      key={product.id}
                      layout
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className={`group hover:bg-brand-500/5 transition-colors duration-200 ${
                        product.stock < 5 ? 'bg-rose-500/[0.03]' : ''
                      } ${confirmingDelete === product.id ? 'bg-rose-500/10 dark:bg-rose-500/10' : ''}`}
                    >
                      {/* â”€â”€ Media â”€â”€ */}
                      <td className="px-8 py-5">
                        <div className="relative h-14 w-14 group-hover:scale-110 transition-transform duration-500">
                          <ProductImage
                            src={product.imageUrl}
                            alt={product.productName || product.name}
                            className="h-full w-full rounded-2xl object-cover ring-2 ring-white dark:ring-slate-900 shadow-sm"
                          />
                          {product.stock < 5 && (
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-rose-500 rounded-full border-2 border-white dark:border-[#020617] animate-ping" />
                          )}
                        </div>
                      </td>

                      {/* â”€â”€ Designation â”€â”€ */}
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{product.productName || product.name}</span>
                          <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase">UID: {product.id.slice(0, 8)}</span>
                        </div>
                      </td>

                      {/* â”€â”€ Category â”€â”€ */}
                      <td className="px-8 py-5">
                        <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          {product.category}
                        </span>
                      </td>

                      {/* â”€â”€ Price â”€â”€ */}
                      <td className="px-8 py-5 text-sm font-extrabold text-brand-600 dark:text-brand-400 text-right font-display">
                        â‚¹{product.price ? product.price.toLocaleString() : '0.00'}
                      </td>

                      {/* â”€â”€ Stock â”€â”€ */}
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-4">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => handleStockChange(product.id, product.stock, -1)}
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-rose-600 hover:border-rose-100 dark:hover:border-rose-900 transition-all"
                          >
                            <Minus className="h-4 w-4" />
                          </motion.button>
                          <div className="flex flex-col items-center min-w-[3rem]">
                            <span className={`text-sm font-mono font-bold ${
                              product.stock < 5 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                            }`}>
                              {product.stock}
                            </span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Units</span>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => handleStockChange(product.id, product.stock, 1)}
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-emerald-600 hover:border-emerald-100 dark:hover:border-emerald-900 transition-all"
                          >
                            <Plus className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </td>

                      {/* â”€â”€ Actions â”€â”€ */}
                      <td className="px-8 py-5 text-right">
                        <AnimatePresence mode="wait" initial={false}>
                          {confirmingDelete === product.id ? (
                            /* Inline confirm strip */
                            <motion.div
                              key="confirm"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.15 }}
                              className="flex justify-end items-center gap-2"
                            >
                              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mr-1">Purge?</span>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(product.id)}
                                className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 transition-colors"
                              >
                                Confirm
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setConfirmingDelete(null)}
                                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </motion.button>
                            </motion.div>
                          ) : (
                            /* Normal action buttons */
                            <motion.div
                              key="actions"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <motion.button
                                whileHover={{ scale: 1.08, boxShadow: '0 0 12px 2px rgba(99,102,241,0.2)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEdit(product)}
                                className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-brand-600 transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.08, boxShadow: '0 0 12px 2px rgba(239,68,68,0.2)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setConfirmingDelete(product.id)}
                                className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </motion.tbody>
          </table>
        </div>

        {/* Improved Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-8 py-6 bg-slate-50/30 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Displaying <span className="text-slate-900 dark:text-white">{startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)}</span> of <span className="text-slate-900 dark:text-white">{filteredProducts.length}</span> Registered Units
            </span>
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={page === 1}
                onClick={() => setCurrentPage(page - 1)}
                className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 disabled:opacity-20 hover:text-brand-600 transition-all flex items-center gap-2 btn-hover shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </motion.button>
              <div className="flex items-center px-4 py-2 bg-slate-900 dark:bg-white rounded-2xl text-white dark:text-slate-900 text-[10px] font-bold font-mono">
                {page} / {totalPages}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={page === totalPages}
                onClick={() => setCurrentPage(page + 1)}
                className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 disabled:opacity-20 hover:text-brand-600 transition-all flex items-center gap-2 btn-hover shadow-sm"
              >
                Next <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      >
        <AddProduct
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchProducts();
          }}
        />
      </Modal>

      {/* Edit Modal (Inline for now) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-white dark:bg-[#020617] rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                   <span className="text-[10px] font-bold text-brand-500 uppercase tracking-[0.2em]">Asset Configuration</span>
                   <h3 className="text-3xl font-bold text-slate-900 dark:text-white font-display uppercase tracking-tightest mt-1">Refine Unit</h3>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all">
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all dark:text-white"
                    value={editingProduct.productName || editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, productName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Market Value (â‚¹)</label>
                    <input
                      type="number"
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all dark:text-white"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Vitals Stock</label>
                    <input
                      type="number"
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all dark:text-white"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Product Category</label>
                  <select
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all dark:text-white appearance-none"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  >
                    {['Dog', 'Cat', 'Bird', 'Fish', 'Small Pets', 'Pet Accessories', 'Pet Food', 'Grooming'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-12">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 px-6 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all btn-hover"
                >
                  Abort
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdateProduct}
                  className="flex-[2] py-4 px-8 bg-brand-600 text-white font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 btn-hover flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" /> Sync Changes
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
