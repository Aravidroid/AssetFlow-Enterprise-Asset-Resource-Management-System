import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockDb, getDaysDiff } from '../mockDb';
import { 
  CheckCircle, 
  UserCheck, 
  Wrench, 
  Coffee, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  ArrowRight,
  ShieldAlert as ShieldIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';

export default function Dashboard() {
  const [assets, setAssets] = useState([]);
  const CURRENT_DATE_STR = "2026-07-12";

  useEffect(() => {
    setAssets(mockDb.getAssets());
  }, []);

  // 1. KPI Counts
  const totalCount = assets.length;
  const availableCount = assets.filter(a => a.status === 'Available').length;
  const allocatedCount = assets.filter(a => a.status === 'Allocated').length;
  const maintenanceCount = assets.filter(a => a.status === 'Under Maintenance').length;
  const idleCount = assets.filter(a => a.isIdle).length;
  const criticalCount = assets.filter(a => a.healthStatus === 'Critical').length;
  const expiringWarrantyCount = assets.filter(a => !a.isWarrantyExpired && a.warrantyDaysLeft <= 90).length;

  // 2. Chart 1: Status Distribution Data
  const statusData = [
    { name: 'Allocated', value: allocatedCount, color: '#6366f1' },
    { name: 'Available', value: availableCount, color: '#10b981' },
    { name: 'Under Maintenance', value: maintenanceCount, color: '#f97316' },
  ].filter(item => item.value > 0);

  // 3. Chart 2: Health Distribution Data
  const healthyCount = assets.filter(a => a.healthScore >= 70).length;
  const warningCount = assets.filter(a => a.healthScore >= 50 && a.healthScore < 70).length;
  
  const healthData = [
    { name: 'Healthy (70-100)', count: healthyCount, fill: '#10b981' },
    { name: 'Warning (50-69)', count: warningCount, fill: '#f59e0b' },
    { name: 'Critical (<50)', count: criticalCount, fill: '#ef4444' },
  ];

  // 4. Smart Alerts calculations
  const alerts = [];

  assets.forEach(asset => {
    // Critical Health
    if (asset.healthStatus === 'Critical') {
      alerts.push({
        id: `${asset.id}-health`,
        assetId: asset.id,
        assetName: asset.name,
        type: 'critical_health',
        level: 'Critical',
        message: `Asset Health Score is ${asset.healthScore}% (${asset.maintenancePriority} Priority).`,
        badgeColor: 'bg-red-500/10 text-red-400 border-red-500/30'
      });
    }

    // Idle Assets
    if (asset.isIdle) {
      alerts.push({
        id: `${asset.id}-idle`,
        assetId: asset.id,
        assetName: asset.name,
        type: 'idle',
        level: 'Warning',
        message: `Asset has been unallocated for ${asset.idleDays} days (Idle). Recommended: Reallocate.`,
        badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      });
    }

    // Warranty Expiring
    if (!asset.isWarrantyExpired && asset.warrantyDaysLeft <= 90) {
      alerts.push({
        id: `${asset.id}-warranty`,
        assetId: asset.id,
        assetName: asset.name,
        type: 'warranty',
        level: 'Info',
        message: `Warranty expires in ${asset.warrantyDaysLeft} days (${new Date(asset.purchaseDate).toLocaleDateString()}).`,
        badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/30'
      });
    }

    // Overdue Returns (Allocated > 90 days ago)
    if (asset.status === 'Allocated' && asset.lastAllocatedDate) {
      const daysAllocated = getDaysDiff(CURRENT_DATE_STR, asset.lastAllocatedDate);
      if (daysAllocated > 90) {
        alerts.push({
          id: `${asset.id}-overdue`,
          assetId: asset.id,
          assetName: asset.name,
          type: 'overdue',
          level: 'Warning',
          message: `Long-term allocation: Held by ${asset.currentUser} for ${daysAllocated} days. Check usage.`,
          badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
        });
      }
    }
  });

  // Calculate overall utilization rate
  const allocatedAssets = assets.filter(a => a.status === 'Allocated');
  const avgUtilization = allocatedAssets.length > 0 
    ? Math.round(allocatedAssets.reduce((acc, a) => acc + a.utilization, 0) / allocatedAssets.length)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Executive Intelligence
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time health, operations, and resource efficiency oversight.
          </p>
        </div>
        <Link 
          to="/assets" 
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-violet-500/15 hover:shadow-violet-500/25 transition-all duration-300 hover:-translate-y-0.5 text-sm"
        >
          View Asset Directory
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Available Card */}
        <div className="glass-card rounded-2xl p-5 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.08)] transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Available</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-white">{availableCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Ready to deploy</p>
          </div>
        </div>

        {/* Allocated Card */}
        <div className="glass-card rounded-2xl p-5 hover:border-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.08)] transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-300"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Allocated</span>
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-white">{allocatedCount}</h3>
            <p className="text-xs text-slate-500 mt-1">In active service</p>
          </div>
        </div>

        {/* Under Maintenance Card */}
        <div className="glass-card rounded-2xl p-5 hover:border-orange-500/30 hover:shadow-[0_0_20px_rgba(249,115,22,0.08)] transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all duration-300"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Maintenance</span>
            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-400 border border-orange-500/20">
              <Wrench size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-white">{maintenanceCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Service & repair</p>
          </div>
        </div>

        {/* Idle Card */}
        <div className="glass-card rounded-2xl p-5 hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.08)] transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-300"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Idle Assets</span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Coffee size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-white">{idleCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Unallocated 30+ days</p>
          </div>
        </div>

        {/* Critical Card */}
        <div className="glass-card rounded-2xl p-5 hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.08)] transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all duration-300"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Critical Health</span>
            <div className="p-2 bg-red-500/10 rounded-xl text-red-400 border border-red-500/20">
              <AlertTriangle size={18} className="animate-pulse" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-white">{criticalCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Health Score &lt; 50%</p>
          </div>
        </div>

        {/* Expiring Warranty Card */}
        <div className="glass-card rounded-2xl p-5 hover:border-pink-500/30 hover:shadow-[0_0_20px_rgba(236,72,153,0.08)] transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl group-hover:bg-pink-500/10 transition-all duration-300"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Expiring Warranty</span>
            <div className="p-2 bg-pink-500/10 rounded-xl text-pink-400 border border-pink-500/20">
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-white">{expiringWarrantyCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Expiring in &lt; 90 days</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Utilization Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Pie Chart */}
        <div className="glass-card rounded-2xl p-6 flex flex-col h-96">
          <h3 className="text-lg font-bold text-white mb-2">Asset Allocation Status</h3>
          <p className="text-xs text-slate-400 mb-6">Distribution of assets by current operational status.</p>
          
          <div className="flex-1 min-h-0 relative">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">No asset data available</div>
            )}
          </div>
          {/* Custom Legends */}
          <div className="flex justify-center gap-6 text-xs mt-4">
            {statusData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400 font-medium">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Health Bar Chart */}
        <div className="glass-card rounded-2xl p-6 flex flex-col h-96">
          <h3 className="text-lg font-bold text-white mb-2">Health Metrics Distribution</h3>
          <p className="text-xs text-slate-400 mb-6">Total assets categorized by automatic Health Score brackets.</p>
          
          <div className="flex-1 min-h-0">
            {assets.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={healthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {healthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">No asset data available</div>
            )}
          </div>
        </div>

        {/* Operational Efficiency (Utilization Indicator) */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between h-96">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Operational Intelligence</h3>
            <p className="text-xs text-slate-400">Resource allocation efficiency and overall hardware utilization.</p>
          </div>
          
          {/* Radial progress simulator */}
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Outer track */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-violet-500"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${avgUtilization * 2.51} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold text-white tracking-tight">{avgUtilization}%</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Average Util.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3.5 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Capital Cost:</span>
              <span className="font-mono text-white font-semibold">
                ${assets.reduce((sum, a) => sum + a.cost, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Active Allocations:</span>
              <span className="font-semibold text-violet-400">
                {allocatedCount} / {totalCount} Assets
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full" 
                style={{ width: `${(allocatedCount / (totalCount || 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Alerts Console */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-500/10 p-2 rounded-xl text-amber-400 border border-amber-500/20">
              <ShieldIcon size={20} className="pulse-glow" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Smart Alerts</h3>
              <p className="text-xs text-slate-400">AI anomalies and action recommendations.</p>
            </div>
          </div>
          <span className="text-xs bg-slate-800/80 px-2.5 py-1 rounded-md text-slate-400 font-mono">
            {alerts.length} Active Alerts
          </span>
        </div>

        {alerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-4 flex items-start gap-3.5 transition-all duration-300"
              >
                {alert.type === 'critical_health' && (
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-400 border border-red-500/20 shrink-0 mt-0.5">
                    <AlertTriangle size={16} />
                  </div>
                )}
                {alert.type === 'idle' && (
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20 shrink-0 mt-0.5">
                    <Coffee size={16} />
                  </div>
                )}
                {alert.type === 'warranty' && (
                  <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400 border border-pink-500/20 shrink-0 mt-0.5">
                    <ShieldAlert size={16} />
                  </div>
                )}
                {alert.type === 'overdue' && (
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20 shrink-0 mt-0.5">
                    <UserCheck size={16} />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <Link 
                      to={`/assets/${alert.assetId}`}
                      className="text-sm font-semibold text-white hover:text-violet-400 hover:underline truncate"
                    >
                      {alert.assetName}
                    </Link>
                    <span className="text-[10px] text-slate-500 font-mono uppercase font-semibold">{alert.assetId}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 bg-slate-900/10 rounded-xl border border-dashed border-slate-800/80">
            <CheckCircle size={32} className="text-emerald-500/40 mb-3" />
            <p className="text-sm font-medium text-slate-300">All systems optimal</p>
            <p className="text-xs text-slate-500 mt-0.5">No critical issues or attention triggers active.</p>
          </div>
        )}
      </div>
    </div>
  );
}
