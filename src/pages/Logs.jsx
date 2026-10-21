import { dataErrorMessage } from '../services/config';
import DataError from '../components/common/DataError';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToActivityLogs } from '../services/activityLogs';
import { Clock, User, Activity, FileText, Search, ChevronLeft, ChevronRight, X, Filter, ShoppingCart, Boxes, Package, Terminal } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
};

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [activeFilter, setActiveFilter] = useState('System');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const unsubscribe = subscribeToActivityLogs((updatedLogs) => {
      setDataError('');
      setLogs(updatedLogs);
      setLoading(false);
    }, activeFilter === 'System' ? null : activeFilter, error => { setDataError(dataErrorMessage(error)); setLoading(false); });

    return () => unsubscribe();
  }, [activeFilter]);

  const filteredLogs = logs.filter(log =>
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paginatedLogs = filteredLogs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const filters = [
    { name: 'System', icon: Terminal, color: 'text-slate-500', bg: 'bg-slate-500/10' },
    { name: 'Orders', icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Inventory', icon: Boxes, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { name: 'Products', icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: 'short'
    });
  };

  if (loading && logs.length === 0) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-20 bg-slate-100 dark:bg-slate-900 rounded-3xl w-full" />
        <div className="grid grid-cols-1 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 dark:bg-slate-900/50 rounded-2xl w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 selection:bg-brand-500/20">
      <DataError message={dataError} />
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Internal Audit</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white font-display uppercase tracking-tightest leading-tight">System <span className="text-brand-600 dark:text-brand-500">Logs</span></h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">Immutable record of administrative protocols and state changes.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {filters.map((f) => {
            const Icon = f.icon;
            return (
              <motion.button
                key={f.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setActiveFilter(f.name); setCurrentPage(1); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeFilter === f.name
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${activeFilter === f.name ? 'text-white' : f.color}`} />
                {f.name}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-card rounded-3xl p-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs by action, user, or description..."
            className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all dark:text-white placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-card rounded-4xl overflow-hidden shadow-2xl border-white/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] w-48">Time</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] w-32">User</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] w-48">Action</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Description</th>
              </tr>
            </thead>
            <motion.tbody
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-slate-50 dark:divide-slate-800/30"
            >
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <FileText className="h-16 w-16 mb-4 text-slate-400" />
                      <p className="text-sm font-bold uppercase tracking-widest">No spectral trace</p>
                      <p className="text-xs font-semibold mt-2">Zero logs found for the current parameters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {paginatedLogs.map((log) => (
                    <motion.tr
                      layout
                      key={log.id}
                      variants={itemVariants}
                      className="group hover:bg-brand-500/5 transition-colors duration-200"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{formatTime(log.timestamp)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                         <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-lg bg-brand-500/10 flex items-center justify-center">
                               <User className="h-3 w-3 text-brand-600 dark:text-brand-400" />
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{log.user}</span>
                         </div>
                      </td>
                      <td className="px-8 py-4">
                         <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                           log.category === 'Orders' ? 'bg-blue-500/10 text-blue-600' :
                           log.category === 'Inventory' ? 'bg-amber-500/10 text-amber-600' :
                           log.category === 'Products' ? 'bg-emerald-500/10 text-emerald-600' :
                           'bg-slate-500/10 text-slate-600'
                         }`}>
                           {log.actionType}
                         </span>
                      </td>
                      <td className="px-8 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                        {log.description}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </motion.tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-6 bg-slate-50/20 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Trace <span className="text-slate-900 dark:text-white">{logs.length}</span> Records
            </p>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={page === 1}
                onClick={() => setCurrentPage(page - 1)}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 disabled:opacity-20 translate-y-[-1px]"
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>
              <div className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black font-mono">
                {page} / {totalPages}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={page === totalPages}
                onClick={() => setCurrentPage(page + 1)}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 disabled:opacity-20 translate-y-[-1px]"
              >
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
