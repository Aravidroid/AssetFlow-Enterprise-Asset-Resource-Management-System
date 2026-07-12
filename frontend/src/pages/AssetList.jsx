import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockDb } from '../mockDb';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  X,
  Sparkles, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function AssetList() {
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [healthFilter, setHealthFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '',
    category: 'IT Hardware',
    purchaseDate: '2026-07-12',
    warrantyYears: 3,
    cost: '',
    description: '',
    condition: 'Excellent' // Added Condition selector
  });

  const loadAssets = () => {
    mockDb.getAssetsAsync().then(res => setAssets(res));
  };

  useEffect(() => {
    loadAssets();
  }, []);

  // Form Submission with Optimistic Updates
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Optimistic Asset Add
    const tempId = `AF-TEMP-${Math.floor(Math.random() * 1000)}`;
    const optimisticAsset = {
      id: tempId,
      name: newAsset.name || "Unnamed Asset",
      category: newAsset.category || "IT Hardware",
      status: "Available",
      purchaseDate: newAsset.purchaseDate || "2026-07-12",
      maintenanceCount: 0,
      lastAllocatedDate: null,
      currentUser: null,
      warrantyYears: parseInt(newAsset.warrantyYears) || 2,
      cost: parseFloat(newAsset.cost) || 0,
      description: newAsset.description || "",
      condition: newAsset.condition || "Excellent",
      history: [{ date: "2026-07-12", type: "Created", note: "Asset registered (Optimistic UI)." }]
    };

    // Calculate intelligence fields
    const end = new Date("2026-07-12");
    const start = new Date(optimisticAsset.purchaseDate);
    const age = Math.max(0, end - start) / (1000 * 60 * 60 * 24 * 365.25);
    const agePenalty = Math.round(age * 2 * 10) / 10;
    let conditionPenalty = 0;
    if (optimisticAsset.condition === "Good") conditionPenalty = 5;
    else if (optimisticAsset.condition === "Fair") conditionPenalty = 10;
    else if (optimisticAsset.condition === "Poor") conditionPenalty = 20;

    const baseHealth = 100 - agePenalty - conditionPenalty;
    const healthScore = Math.max(0, Math.min(100, Math.round(baseHealth)));

    const computedOptimistic = {
      ...optimisticAsset,
      age: parseFloat(age.toFixed(2)),
      healthScore,
      healthStatus: healthScore >= 70 ? "Healthy" : healthScore >= 40 ? "Warning" : "Critical",
      healthColor: healthScore >= 70 ? "green" : healthScore >= 40 ? "yellow" : "red",
      maintenancePriority: healthScore >= 90 ? "Low" : healthScore >= 70 ? "Medium" : healthScore >= 40 ? "High" : "Critical",
      efficiency: 0,
      efficiencyLevel: "Low",
      idleDays: 0,
      isIdle: false,
      recommendation: "Operating Normally",
      warrantyDaysLeft: 365 * optimisticAsset.warrantyYears,
      isWarrantyExpired: false,
      warrantyStatusText: `${365 * optimisticAsset.warrantyYears} Days Left`,
      isMaintenanceOverdue: false,
      hasAlerts: false,
      healthBreakdown: {
        base: 100, age: parseFloat(age.toFixed(2)), agePenalty,
        maintenanceCount: 0, maintenancePenalty: 0,
        condition: optimisticAsset.condition, conditionPenalty,
        warrantyDaysLeft: 365 * optimisticAsset.warrantyYears, warrantyPenalty: 0,
        rawScore: baseHealth
      }
    };

    const previousAssets = [...assets];
    setAssets([...assets, computedOptimistic]);
    setIsAddModalOpen(false);

    // Call background async request
    mockDb.addAssetAsync(newAsset)
      .then(() => {
        loadAssets();
      })
      .catch((err) => {
        setAssets(previousAssets);
        console.error("Register failed, rolling back", err);
      });

    // Reset Form
    setNewAsset({
      name: '',
      category: 'IT Hardware',
      purchaseDate: '2026-07-12',
      warrantyYears: 3,
      cost: '',
      description: '',
      condition: 'Excellent'
    });
  };

  // Get categories for filtering dynamically
  const categories = ['All', ...new Set(assets.map(a => a.category))];

  // Filtering Logic
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.currentUser && asset.currentUser.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || asset.category === categoryFilter;
    const matchesHealth = healthFilter === 'All' || asset.healthStatus === healthFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesHealth;
  });

  // Badge Style Generators
  const getHealthBadge = (health) => {
    if (health >= 90) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Healthy ({health}%)
        </span>
      );
    } else if (health >= 70) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Healthy ({health}%)
        </span>
      );
    } else if (health >= 40) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          Warning ({health}%)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 pulse-glow">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
          Critical ({health}%)
        </span>
      );
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Available':
        return <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300">Available</span>;
      case 'Allocated':
        return <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-violet-500/15 border border-violet-500/35 text-violet-400">Allocated</span>;
      case 'Under Maintenance':
        return <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-orange-500/15 border border-orange-500/35 text-orange-400">Maintenance</span>;
      case 'Disposed':
        return <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-red-950/20 border border-red-550/30 text-red-400">Decommissioned</span>;
      default:
        return null;
    }
  };

  const getRecommendationBadge = (rec) => {
    switch(rec) {
      case 'Replace Asset':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-red-950/40 border border-red-800/45 text-red-400 flex items-center gap-1 w-max">⚠️ Replace</span>;
      case 'Repair Asset':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-orange-950/40 border border-orange-800/45 text-orange-400 flex items-center gap-1 w-max">🔧 Repair</span>;
      case 'Reallocate Asset':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-950/40 border border-amber-800/45 text-amber-400 flex items-center gap-1 w-max">🔄 Reallocate</span>;
      case 'Renew Warranty':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-pink-950/40 border border-pink-800/45 text-pink-400 flex items-center gap-1 w-max">🛡️ Renew Contract</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1 w-max">✓ Normal</span>;
    }
  };

  const getEfficiencyBadge = (eff, level) => {
    let color = "text-slate-400 bg-slate-900 border-slate-800";
    if (level === "High") {
      color = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    } else if (level === "Moderate") {
      color = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    } else if (level === "Low") {
      color = "text-red-400 bg-red-500/10 border-red-500/20";
    }
    return (
      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${color}`}>
        {eff}% ({level})
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Asset Directory
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Browse corporate resource inventory, track details, and execute states.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm cursor-pointer"
        >
          <Plus size={16} />
          Register Asset
        </button>
      </div>

      {/* Controls Bar */}
      <div className="glass-card rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search assets by name, tag, or user..."
              className="w-full glass-input pl-10 pr-4 py-2 text-sm rounded-xl text-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 p-1 rounded-xl w-full md:w-auto justify-center md:justify-start">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${viewMode === 'grid' ? 'bg-slate-800 text-violet-400' : 'text-slate-400 hover:text-white'}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${viewMode === 'list' ? 'bg-slate-800 text-violet-400' : 'text-slate-400 hover:text-white'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3.5 border-t border-slate-800 pt-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-slate-300 font-medium focus:outline-none focus:border-violet-500"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Allocated">Allocated</option>
              <option value="Under Maintenance">Maintenance</option>
              <option value="Disposed">Decommissioned</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-wider">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-slate-300 font-medium focus:outline-none focus:border-violet-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-wider">Health Status:</span>
            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-slate-300 font-medium focus:outline-none focus:border-violet-500"
            >
              <option value="All">All Health</option>
              <option value="Healthy">Healthy</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assets Display */}
      {filteredAssets.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map((asset) => (
              <div 
                key={asset.id} 
                className="glass-card hover:border-slate-700/80 hover:shadow-lg transition-all duration-300 rounded-2xl p-5 flex flex-col group"
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-850">
                      {asset.id}
                    </span>
                    <h4 className="text-base font-bold text-white mt-2 group-hover:text-violet-400 transition-colors">
                      {asset.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">{asset.category} &bull; {asset.condition}</p>
                  </div>
                  {getStatusBadge(asset.status)}
                </div>

                <p className="text-xs text-slate-400 mt-3 line-clamp-2 min-h-[2rem]">
                  {asset.description || 'No description provided.'}
                </p>

                {/* Performance indicators */}
                <div className="grid grid-cols-2 gap-3.5 border-y border-slate-850 my-4 py-3.5 text-xs">
                  <div>
                    <span className="text-slate-500 font-bold block uppercase tracking-wider text-[9px]">Intelligent Health</span>
                    <div className="mt-1">{getHealthBadge(asset.healthScore)}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block uppercase tracking-wider text-[9px]">Efficiency Score</span>
                    <div className="mt-1">{getEfficiencyBadge(asset.efficiency, asset.efficiencyLevel)}</div>
                  </div>
                </div>

                {/* Footer details */}
                <div className="flex items-center justify-between text-xs mt-auto">
                  <div>
                    {asset.status === 'Allocated' ? (
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Custodian</span>
                        <span className="text-slate-300 font-medium truncate max-w-[120px] block">{asset.currentUser}</span>
                      </div>
                    ) : asset.isIdle ? (
                      <div>
                        <span className="text-[9px] text-red-500/80 block uppercase tracking-wider font-bold">Idle State</span>
                        <span className="text-amber-500 font-semibold">{asset.idleDays} Days Idle</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Capital Cost</span>
                        <span className="text-slate-300 font-mono font-semibold">${asset.cost.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5">
                    {getRecommendationBadge(asset.recommendation)}
                    <Link 
                      to={`/assets/${asset.id}`}
                      className="text-violet-400 text-xs font-semibold flex items-center gap-1 hover:text-violet-300 mt-1"
                    >
                      Inspect Specs
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List Mode Table */
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-800/85 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    <th className="p-4">Tag</th>
                    <th className="p-4">Name / Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Health Score</th>
                    <th className="p-4">Efficiency</th>
                    <th className="p-4">Custodian / State</th>
                    <th className="p-4">Rule-Based Rec</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-xs">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-900/35 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-300">{asset.id}</td>
                      <td className="p-4">
                        <Link 
                          to={`/assets/${asset.id}`} 
                          className="font-bold text-white hover:text-violet-400 hover:underline text-sm block"
                        >
                          {asset.name}
                        </Link>
                        <span className="text-slate-500 text-xs font-medium">{asset.category} &bull; {asset.condition}</span>
                      </td>
                      <td className="p-4">{getStatusBadge(asset.status)}</td>
                      <td className="p-4">{getHealthBadge(asset.healthScore)}</td>
                      <td className="p-4">{getEfficiencyBadge(asset.efficiency, asset.efficiencyLevel)}</td>
                      <td className="p-4">
                        {asset.status === 'Allocated' ? (
                          <span className="text-slate-300 font-medium">{asset.currentUser}</span>
                        ) : asset.isIdle ? (
                          <span className="text-amber-500 font-semibold">{asset.idleDays} Days Idle</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-4">{getRecommendationBadge(asset.recommendation)}</td>
                      <td className="p-4 text-right">
                        <Link 
                          to={`/assets/${asset.id}`}
                          className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 font-semibold"
                        >
                          Inspect Specs
                          <ArrowRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-900/10 rounded-2xl border border-dashed border-slate-800">
          <AlertCircle size={40} className="text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-350">No assets match</h3>
          <p className="text-xs text-slate-500 mt-1">Adjust search strings or toggle active filter options.</p>
        </div>
      )}

      {/* Add Asset Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass w-full max-w-lg rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-violet-400" />
                <h3 className="text-lg font-bold text-white">Register Corporate Asset</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Asset Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Asset Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MacBook Pro M3, Conference Speaker"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                    <select
                      className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none"
                      value={newAsset.category}
                      onChange={(e) => setNewAsset({...newAsset, category: e.target.value})}
                    >
                      <option value="IT Hardware">IT Hardware</option>
                      <option value="Networking">Networking</option>
                      <option value="Vehicles">Vehicles</option>
                      <option value="Office Furniture">Office Furniture</option>
                      <option value="Office Equipment">Office Equipment</option>
                    </select>
                  </div>

                  {/* Condition Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Condition</label>
                    <select
                      className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none"
                      value={newAsset.condition}
                      onChange={(e) => setNewAsset({...newAsset, condition: e.target.value})}
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Purchase Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Purchase Date</label>
                    <input
                      type="date"
                      required
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                      value={newAsset.purchaseDate}
                      onChange={(e) => setNewAsset({...newAsset, purchaseDate: e.target.value})}
                    />
                  </div>

                  {/* Warranty Years */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Warranty (Years)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                      value={newAsset.warrantyYears}
                      onChange={(e) => setNewAsset({...newAsset, warrantyYears: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Capital Cost */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cost (USD)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="e.g. 1500"
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                      value={newAsset.cost}
                      onChange={(e) => setNewAsset({...newAsset, cost: e.target.value})}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    rows="3"
                    placeholder="Provide asset serial code details or location references..."
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                    value={newAsset.description}
                    onChange={(e) => setNewAsset({...newAsset, description: e.target.value})}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl shadow-lg shadow-violet-500/25 transition-all cursor-pointer"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
