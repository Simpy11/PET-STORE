import DataError from '../components/common/DataError';
import React, { useEffect, useState } from 'react';
import SummaryCard from '../components/dashboard/SummaryCard';
import { Package, AlertTriangle, ShoppingBag, IndianRupee, TrendingUp, ArrowRight, Sparkles, Zap, Flame, MoveRight, Clock } from 'lucide-react';
import { subscribeToProducts } from '../services/products';
import { subscribeToOrders } from '../services/orders';
import { subscribeToDashboardStats, subscribeToHourlyOrders } from '../services/stats';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function AnimatedCounter({ value }) {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) => Math.floor(current).toLocaleString());

  useEffect(() => {
    spring.set(numericValue);
  }, [numericValue, spring]);

  return <motion.span>{display}</motion.span>;
}

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    itemsSoldToday: 0,
    totalOrdersToday: 0,
    lowStockCount: 0,
    topSellingProduct: "Loading..."
  });
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState('');

  useEffect(() => {
    const onError = () => { setDataError('Dashboard data could not load.'); setLoading(false); };
    const unsubProducts = subscribeToProducts(setProducts, onError);
    const unsubOrders = subscribeToOrders((updatedOrders) => {
      setOrders(updatedOrders);
      setLoading(false);
    }, onError);
    const unsubStats = subscribeToDashboardStats(setStats, onError);
    const unsubHourly = subscribeToHourlyOrders(setHourlyData, onError);

    return () => {
      unsubProducts();
      unsubOrders();
      unsubStats();
      unsubHourly();
    };
  }, []);

  // Calculate today's revenue specifically
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const revenueToday = orders
    .filter(order => {
      const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : (order.createdAt ? new Date(order.createdAt) : new Date(0));
      return orderDate >= todayStart;
    })
    .reduce((acc, order) => {
      const product = products.find(p => p.id === order.productId);
      const quantity = order.quantity || order.qty || order.count || 1;
      return acc + (quantity * (product ? product.price : 10));
    }, 0);

  const dashboardStats = [
    { name: 'Products', value: stats.totalProducts, icon: Package, sub: 'Total Catalog', color: 'text-blue-500' },
    { name: 'Revenue Today', value: 'Ã¢â€šÂ¹' + Math.floor(revenueToday).toLocaleString(), icon: IndianRupee, sub: 'Gross Value', color: 'text-emerald-500' },
    { name: 'Items Sold Today', value: stats.itemsSoldToday, icon: ShoppingBag, sub: 'Total Items Sold', color: 'text-brand-500' },
    { name: 'Orders Today', value: stats.totalOrdersToday, icon: ShoppingBag, sub: 'Document Count', color: 'text-amber-500' },
    { name: 'Low Stock', value: stats.lowStockCount, icon: AlertTriangle, sub: 'Requires Action', color: 'text-rose-500' },
    // Top Seller can be displayed elsewhere or if space permits.
  ];

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse p-10">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl mb-10"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white/40 dark:bg-slate-900/40 rounded-3xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <DataError message={dataError} />
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="px-3 py-1 bg-brand-500/10 dark:bg-brand-500/20 rounded-full border border-brand-500/20 flex items-center gap-1.5">
               <Zap className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400 fill-brand-600" />
               <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">Real-time Stream Active</span>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tightest leading-tight">
            HQ <span className="text-brand-600 dark:text-brand-500">Monitor</span>
          </h1>
        </div>
        <Link to="/analytics" className="px-6 py-3.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
           <Sparkles className="h-4 w-4" /> Deep Analysis
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {dashboardStats.map((stat) => (
          <div key={stat.name} className="glass-card p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.name}</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
                  {stat.isProduct ? (
                    <span className="text-sm truncate max-w-[120px]">{stat.value}</span>
                  ) : (
                    <AnimatedCounter value={stat.value} />
                  )}
                </h3>
                <p className="text-[9px] font-bold text-slate-400 mt-1">{stat.sub}</p>
              </div>
              <div className={`p-3 rounded-2xl ${stat.color.replace('text', 'bg')}/10 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ${stat.color.replace('text', 'bg')}`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Hourly Flux Chart */}
        <div className="lg:col-span-8 glass-card rounded-[2.5rem] p-8 min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Order Flux</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Last 24 Hour Delta</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-brand-500 uppercase">
              <Clock className="h-3 w-3" /> Live
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorO" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F010" />
                <XAxis 
                  dataKey="hour" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  minTickGap={30}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px', color: '#fff' }}
                  itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorO)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Demand Widget (Reused with refresh) */}
        <div className="lg:col-span-4 glass-card rounded-[2.5rem] p-8">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Catalog Vitals</h2>
              <Flame className="h-5 w-5 text-brand-500 animate-pulse" />
           </div>
           <div className="space-y-6">
              {products.slice(0, 5).map((product, _i) => (
                <motion.div 
                  layout
                  key={product.id} 
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img src={product.imageUrl} className="h-10 w-10 rounded-xl object-cover" alt="" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{product.name}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{product.demandCount || 0} manifestions</p>
                    </div>
                  </div>
                  <div className={`text-[10px] font-black ${product.stock < 5 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {product.stock}U
                  </div>
                </motion.div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
