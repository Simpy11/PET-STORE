import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/products';
import { getOrders } from '../services/orders';
import { Package, ShoppingBag, AlertTriangle, TrendingUp, Activity, PieChart as PieIcon, BarChart3, LineChart as LineIcon, Zap, Globe } from 'lucide-react';
import { useTheme } from '../components/common/ThemeProvider';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area
} from 'recharts';

const COLORS = ['#a855f7', '#22d3ee', '#10b981', '#f43f5e', '#ec4899', '#f59e0b'];

export default function Analytics() {
  const { theme } = useTheme();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const textColor = isDark ? '#64748b' : '#94a3b8';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prods, ords] = await Promise.all([getProducts(), getOrders()]);
      setProducts(prods);
      setOrders(ords);
    } catch (error) {
      console.error("Failed to load analytics data", error);
    } finally {
      setLoading(false);
    }
  };

  // Metric calculations
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const lowStockProducts = products.filter(p => p.stock < 5).length;

  const productOrderCount = {};
  orders.forEach(o => {
    // Determine the product name from the matching product if o.productName isn't robust, 
    // or just rely on o.productName if the orders schema also updated. For safety:
    const prod = products.find(p => p.id === o.productId);
    const resolvedName = prod ? (prod.productName || prod.name) : o.productName;

    if (resolvedName) {
      productOrderCount[resolvedName] = (productOrderCount[resolvedName] || 0) + (o.quantity || 1);
    }
  });
  const topSellingProduct = Object.entries(productOrderCount).sort((a, b) => b[1] - a[1])[0];

  const categoryCount = {};
  products.forEach(p => {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

  const ordersPerDay = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    ordersPerDay[key] = 0;
  }
  orders.forEach(o => {
    if (o.createdAt) {
      const d = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (ordersPerDay[key] !== undefined) {
        ordersPerDay[key]++;
      }
    }
  });
  const ordersPerDayData = Object.entries(ordersPerDay).map(([name, orders]) => ({ name, orders }));

  const monthlySales = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    monthlySales[key] = 0;
  }
  orders.forEach(o => {
    if (o.createdAt) {
      const d = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
      const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (monthlySales[key] !== undefined) {
        const product = products.find(p => p.id === o.productId);
        const price = product ? product.price : 0;
        monthlySales[key] += (o.quantity || 1) * price;
      }
    }
  });
  const monthlySalesData = Object.entries(monthlySales).map(([name, revenue]) => ({ name, revenue: parseFloat(revenue.toFixed(2)) }));

  const metrics = [
    { title: 'Global Catalog', value: totalProducts, icon: Package, color: 'text-indigo-600 dark:text-indigo-400', label: 'Units' },
    { title: 'Fulfillment', value: totalOrders, icon: ShoppingBag, color: 'text-blue-600 dark:text-blue-400', label: 'Completed' },
    { title: 'Stock Vitals', value: lowStockProducts, icon: AlertTriangle, color: 'text-rose-600 dark:text-rose-400', label: 'Alerts' },
    { title: 'Top Performer', value: topSellingProduct ? topSellingProduct[1] : 0, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', label: topSellingProduct ? topSellingProduct[0].slice(0, 10) : 'None' },
  ];

  const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card !bg-white/90 dark:!bg-slate-900/90 p-4 border-brand-500/20 rounded-2xl shadow-2xl backdrop-blur-xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">
            {prefix}{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white/40 dark:bg-slate-900/40 rounded-4xl" />)}
        </div>
        <div className="h-[500px] bg-white/40 dark:bg-slate-900/40 rounded-4xl" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Telemetry Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Intelligence Suite</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white font-display uppercase tracking-tightest leading-tight">Insight <span className="text-brand-600 dark:text-brand-500">Telemetry</span></h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">Multi-vector performance markers synchronized with global inventory protocols.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-brand-500/10 dark:bg-brand-500/20 rounded-full border border-brand-500/20 flex items-center gap-2">
              <Zap className="h-4 w-4 text-brand-600 dark:text-brand-400 fill-brand-600 dark:fill-brand-400" />
              <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest animate-pulse">Real-Time Sync Active</span>
           </div>
        </div>
      </div>

      {/* High-Density Metrics */}
      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }}
              key={m.title} 
              className="glass-card rounded-4xl p-6 group hover:border-brand-500/30 transition-all duration-500"
            >
               <div className="flex items-center justify-between">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl group-hover:bg-brand-600 group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100 dark:border-slate-800">
                     <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{m.title}</p>
                     <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{m.value}</p>
                     <p className="text-[8px] font-mono font-bold text-slate-400 uppercase mt-0.5">{m.label}</p>
                  </div>
               </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Advanced Telemetry Grid */}
      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
        }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-8 lg:grid-cols-12"
      >
        
        {/* Revenue Trajectory (Major Card) */}
        <motion.div 
          variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } } }}
          className="lg:col-span-12 glass-card rounded-[2.5rem] p-8 lg:p-10 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-10 relative z-10">
             <div>
                <div className="flex items-center gap-2 mb-1">
                   <LineIcon className="h-4 w-4 text-indigo-500" />
                   <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display uppercase tracking-tight">Revenue Trajectory</h2>
                </div>
                <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase">6-Month Fiscal Mapping</p>
             </div>
          </div>
          
          <div className="relative z-10">
            {monthlySalesData.every(d => d.revenue === 0) ? (
              <div className="h-80 flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-tighter opacity-40">No verified sales records.</div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={monthlySalesData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="10 10" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: textColor, fontWeight: 800, letterSpacing: '0.1em' }} dy={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: textColor, fontWeight: 800 }} tickFormatter={(v) => `₹${v}`} dx={-10} />
                  <Tooltip content={<CustomTooltip prefix="₹" />} cursor={{ stroke: 'rgba(99,102,241,0.2)', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fill="url(#colorRevenue)" isAnimationActive={true} animationDuration={1500} animationEasing="ease-out" strokeLinecap="round" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          
          {/* Subtle BG Glow */}
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-600/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        </motion.div>

        {/* Segment Distribution (Bento Card) */}
        <motion.div 
          variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } } }}
          className="lg:col-span-5 glass-card rounded-[2.5rem] p-8 group"
        >
          <div className="flex items-center gap-2 mb-8">
             <PieIcon className="h-4 w-4 text-emerald-500" />
             <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display uppercase tracking-tight">Segments</h2>
          </div>
          
          <div className="h-80">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-tighter opacity-40">Null Data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={true}
                    animationBegin={400}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Velocity Monitor (Bento Card) */}
        <motion.div 
          variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } } }}
          className="lg:col-span-7 glass-card rounded-[2.5rem] p-8 group"
        >
          <div className="flex items-center gap-2 mb-8">
             <BarChart3 className="h-4 w-4 text-amber-500" />
             <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display uppercase tracking-tight">Flow Velocity</h2>
          </div>
          
          <div className="h-80">
            {ordersPerDayData.every(d => d.orders === 0) ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-tighter opacity-40">No Signal</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersPerDayData}>
                  <CartesianGrid strokeDasharray="5 5" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: textColor, fontWeight: 800, letterSpacing: '0.1em' }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: textColor, fontWeight: 800 }} allowDecimals={false} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }} />
                  <Bar dataKey="orders" fill="rgba(99, 102, 241, 0.8)" radius={[10, 10, 5, 5]} isAnimationActive={true} animationBegin={600} animationDuration={1200} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
