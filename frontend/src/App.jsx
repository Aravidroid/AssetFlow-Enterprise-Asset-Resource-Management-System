import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Boxes, Database, Cpu, Calendar, CheckCircle } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import AssetList from './pages/AssetList';
import AssetDetail from './pages/AssetDetail';
import Bookings from './pages/Bookings';
import Transfers from './pages/Transfers';

function Navigation({ userRole }) {
  const location = useLocation();

  const allNavItems = [
    { path: '/', label: 'Executive Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Department Head', 'Employee'] },
    { path: '/assets', label: 'Asset Directory', icon: Boxes, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { path: '/transfers', label: 'Transfers & Approvals', icon: CheckCircle, roles: ['Admin', 'Asset Manager', 'Department Head'] },
    { path: '/bookings', label: 'Resource Bookings', icon: Calendar, roles: ['Admin', 'Employee'] }
  ];

  const visibleItems = allNavItems.filter(item => item.roles.includes(userRole));

  return (
    <nav className="space-y-1.5 px-3 py-6">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              isActive
                ? 'bg-violet-600/25 text-violet-400 border-l-4 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border-l-4 border-transparent'
            }`}
          >
            <Icon size={18} className={isActive ? 'animate-pulse' : ''} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('assetflow_role') || 'Admin');

  return (
    <Router>
      <div className="flex min-h-screen bg-[#070a13] text-slate-100 overflow-x-hidden font-sans">
        {/* Sidebar Nav */}
        <aside className="w-64 shrink-0 glass border-r border-slate-800/80 flex flex-col hidden md:flex sticky top-0 h-screen z-10">
          {/* Logo Brand */}
          <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
            <div className="bg-gradient-to-tr from-violet-600 to-pink-500 p-2.5 rounded-xl shadow-lg shadow-violet-500/20">
              <Cpu size={22} className="text-white animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-pink-400 to-amber-300 bg-clip-text text-transparent m-0 p-0 leading-none">
                AssetFlow
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-violet-500/80 block mt-1">
                Intel System v1.0
              </span>
            </div>
          </div>

          <Navigation userRole={userRole} />

          {/* Connected State Badge */}
          <div className="mt-auto p-4 border-t border-slate-800/80">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-300 truncate flex items-center gap-1.5">
                  <Database size={12} className="text-slate-400" />
                  Local Instance Active
                </p>
                <p className="text-[10px] text-slate-500 truncate">SQLite Layer</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Header */}
          <header className="h-16 shrink-0 glass border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
            {/* Mobile Title */}
            <div className="flex items-center gap-3 md:hidden">
              <div className="bg-gradient-to-tr from-violet-600 to-pink-500 p-1.5 rounded-lg">
                <Cpu size={18} className="text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent m-0">
                AssetFlow
              </h1>
            </div>

            {/* Desktop Quick Header */}
            <div className="hidden md:flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-350">Active Role:</span>
                <select 
                  value={userRole} 
                  onChange={(e) => {
                    localStorage.setItem('assetflow_role', e.target.value);
                    setUserRole(e.target.value);
                    // Force refresh to reload views cleanly
                    window.location.reload();
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer font-bold"
                >
                  <option value="Admin">🛡️ Admin</option>
                  <option value="Asset Manager">💼 Asset Manager</option>
                  <option value="Department Head">🎓 Department Head</option>
                  <option value="Employee">👤 Employee</option>
                </select>
              </div>
            </div>

            {/* DateTime Display (Context Date: July 12, 2026) */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs bg-slate-900/60 border border-slate-800/60 px-3.5 py-1.5 rounded-lg text-slate-300 font-medium">
                <Calendar size={13} className="text-violet-400" />
                <span>July 12, 2026</span>
              </div>

              {/* Quick Links for mobile */}
              <div className="flex items-center gap-1.5 md:hidden">
                <Link
                  to="/"
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                >
                  <LayoutDashboard size={18} />
                </Link>
                <Link
                  to="/assets"
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                >
                  <Boxes size={18} />
                </Link>
              </div>
            </div>
          </header>

          {/* Main Scroll Container */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-b from-[#070a13] to-[#04060d]">
            <Routes>
              <Route path="/" element={<Dashboard userRole={userRole} />} />
              <Route path="/assets" element={<AssetList userRole={userRole} />} />
              <Route path="/assets/:id" element={<AssetDetail userRole={userRole} />} />
              <Route path="/bookings" element={<Bookings userRole={userRole} />} />
              <Route path="/transfers" element={<Transfers userRole={userRole} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
