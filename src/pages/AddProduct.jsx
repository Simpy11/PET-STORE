import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Hash, ListOrdered, ChevronRight, Save, RotateCcw, Image as ImageIcon, Sparkles, ShoppingBag, Trash2 } from 'lucide-react';

import { addProduct } from '../services/products';
import ImageUpload from '../components/common/ImageUpload';
import { useToast } from '../components/common/ToastProvider';

export default function AddProduct({ onClose, onSuccess }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    price: '',
    stock: '',
    imageUrl: '',
    imageName: '', // For the preview card
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (url, fileName) => {
    setFormData((prev) => ({ ...prev, imageUrl: url, imageName: fileName }));
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '', imageName: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.productName || !formData.category || formData.price === '' || formData.stock === '') {
        throw new Error('Please fill in all required fields.');
      }

      const productData = {
        productName: formData.productName,
        category: formData.category,
        price: formData.price,
        stock: formData.stock,
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=400&h=400'
      };

      await addProduct(productData);
      addToast('Product successfully added to catalog!', 'success');
      
      if (onSuccess) {
        onSuccess();
      } else {
        setFormData({ productName: '', category: '', price: '', stock: '', imageUrl: '', imageName: '' });
        setTimeout(() => {
          navigate('/inventory');
        }, 1500);
      }
    } catch (error) {
      addToast(error.message || 'Failed to add product.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={onClose ? "" : "max-w-5xl mx-auto"}>
      {/* Header Evolution */}
      {!onClose && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Catalog Management</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
             <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white font-display uppercase tracking-tightest leading-tight">Add <span className="text-brand-600 dark:text-brand-500">Product</span></h1>
             <div className="px-3 py-1 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
               <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
               <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none">New Entry Ready</span>
             </div>
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-lg">
            Register a new product into the store inventory. Make sure to include proper pricing and visual assets.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Form (Bento Card) */}
        <div className="lg:col-span-8">
          <div className="glass-card glass-shine rounded-[2.5rem] overflow-hidden border border-white/40 shadow-2xl shadow-slate-200/50 dark:shadow-none p-10 lg:p-12">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-8">
                {/* Product Name */}
                <div className="space-y-3">
                  <label htmlFor="productName" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Product Name <span className="text-rose-500">*</span></label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none group-focus-within/input:text-brand-600 transition-colors">
                      <div className="h-12 w-12 flex items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                         <Package className="h-5 w-5" />
                      </div>
                    </div>
                    <input
                      type="text"
                      name="productName"
                      id="productName"
                      value={formData.productName}
                      onChange={handleChange}
                      className="block w-full pl-16 pr-6 py-5 bg-transparent border-b-2 border-slate-100 dark:border-slate-800 text-base font-bold transition-all focus:outline-none focus:border-brand-500 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                      placeholder="Enter product name (e.g. Dog Food, Cat Toy)"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  {/* Category */}
                  <div className="space-y-3">
                    <label htmlFor="category" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Product Category <span className="text-rose-500">*</span></label>
                    <div className="relative">
                       <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="block w-full px-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all dark:text-white appearance-none"
                        required
                      >
                        <option value="">Select category...</option>
                        {['Dog', 'Cat', 'Bird', 'Fish', 'Small Pets', 'Pet Accessories', 'Pet Food', 'Grooming'].map(cat => (
                           <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="space-y-3">
                    <label htmlFor="price" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Product Price <span className="text-rose-500">*</span></label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none group-focus-within/input:text-brand-600 transition-colors">
                        <div className="h-[3.25rem] w-12 flex items-center justify-center text-slate-400 font-bold text-lg">
                           ₹
                        </div>
                      </div>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all dark:text-white"
                        placeholder="Enter product price"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Stock Quantity */}
                <div className="space-y-3">
                  <label htmlFor="stock" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Stock Quantity <span className="text-rose-500">*</span></label>
                  <div className="flex items-center gap-4">
                     <div className="h-14 w-14 shrink-0 flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-xl">
                        <Hash className="h-6 w-6" />
                     </div>
                     <input
                      type="number"
                      name="stock"
                      id="stock"
                      min="0"
                      step="1"
                      value={formData.stock}
                      onChange={handleChange}
                      className="block w-full px-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all dark:text-white"
                      placeholder="Enter available stock"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-10 flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setFormData({ productName: '', category: '', price: '', stock: '', imageUrl: '', imageName: '' })}
                  className="px-8 py-5 border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all btn-hover"
                >
                  <RotateCcw className="h-4 w-4 mr-2" /> Reset Form
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-5 px-10 bg-brand-600 text-white rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest shadow-2xl shadow-brand-500/30 hover:bg-brand-700 transition-all btn-hover disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  <Save className="h-5 w-5" /> {loading ? 'Saving to Database...' : 'Add Product'}
                </motion.button>
              </div>
            </form>
          </div>
        </div>

        {/* Media Bento Column */}
        <div className="lg:col-span-4 flex flex-col gap-10">
          
          <AnimatePresence mode="popLayout" initial={false}>
            {!formData.imageUrl ? (
              <motion.div 
                key="uploader"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="glass-card rounded-[2.5rem] p-8 border border-white/40"
              >
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product Image</h3>
                    <ImageIcon className="h-4 w-4 text-brand-600" />
                 </div>
                 <ImageUpload 
                    onUploadComplete={handleImageUpload} 
                  />
              </motion.div>
            ) : (
              <motion.div 
                key="preview-card"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="glass-card rounded-[2.5rem] p-2 overflow-hidden border border-white/40 ring-1 ring-slate-950/5 relative group"
              >
                <div className="absolute top-6 left-6 z-20">
                   <span className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-xl text-[9px] font-bold text-white uppercase tracking-widest border border-white/10 shadow-xl">
                      Ready to Publish
                   </span>
                </div>

                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden">
                   <img src={formData.imageUrl} className="h-full w-full object-cover" alt="Product Preview" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
                </div>

                <div className="absolute bottom-6 inset-x-6 z-20 flex items-end justify-between">
                   <div>
                     <p className="text-white font-display font-bold text-xl line-clamp-1 truncate mb-1">
                        {formData.productName || 'Unnamed Product'}
                     </p>
                     <div className="flex items-center gap-2">
                        <ImageIcon className="h-3.5 w-3.5 text-brand-400" />
                        <span className="text-xs font-medium text-slate-300 truncate max-w-[150px]">{formData.imageName || 'image_file.jpg'}</span>
                     </div>
                   </div>
                   
                   <motion.button
                     whileHover={{ scale: 1.1, backgroundColor: '#ef4444' }}
                     whileTap={{ scale: 0.9 }}
                     onClick={handleRemoveImage}
                     className="p-3 bg-white/10 hover:bg-rose-500 backdrop-blur-md rounded-2xl text-white transition-colors border border-white/10 shadow-xl"
                   >
                      <Trash2 className="h-4 w-4" />
                   </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>

      </div>
    </div>
  );
}
