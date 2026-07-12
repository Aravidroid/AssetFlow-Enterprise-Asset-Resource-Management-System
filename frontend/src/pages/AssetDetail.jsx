import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { mockDb, calculateAge, getDaysDiff } from '../mockDb';
import { 
  ArrowLeft, 
  QrCode, 
  Activity, 
  Calendar, 
  Wrench, 
  UserPlus, 
  UserMinus, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
  ExternalLink,
  Save,
  X
} from 'lucide-react';

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [qrUrl, setQrUrl] = useState('');
  
  // Interactive Modals/Form states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // Input states
  const [editForm, setEditForm] = useState({});
  const [allocUser, setAllocUser] = useState('');
  const [maintNotes, setMaintNotes] = useState('');
  const [transferUser, setTransferUser] = useState('');

  const loadAsset = () => {
    const data = mockDb.getAsset(id);
    if (!data) {
      navigate('/assets');
      return;
    }
    setAsset(data);
    setEditForm(data);
  };

  useEffect(() => {
    loadAsset();
  }, [id]);

  // Generate QR Code
  useEffect(() => {
    if (asset) {
      const pageUrl = `${window.location.origin}${window.location.pathname}#/assets/${asset.id}`;
      QRCode.toDataURL(pageUrl, {
        color: {
          dark: '#0f172a', // dark blue/gray
          light: '#ffffff'
        },
        width: 200,
        margin: 1.5
      }, (err, url) => {
        if (!err) setQrUrl(url);
      });
    }
  }, [asset]);

  if (!asset) return null;

  // Actions
  const handleEdit = (e) => {
    e.preventDefault();
    mockDb.updateAsset(asset.id, editForm);
    setIsEditOpen(false);
    loadAsset();
  };

  const handleAllocate = (e) => {
    e.preventDefault();
    if (!allocUser.trim()) return;
    mockDb.allocateAsset(asset.id, allocUser);
    setIsAllocateOpen(false);
    setAllocUser('');
    loadAsset();
  };

  const handleReturn = () => {
    if (window.confirm("Confirm return of this asset to inventory?")) {
      mockDb.returnAsset(asset.id);
      loadAsset();
    }
  };

  const handleMaintenance = (e) => {
    e.preventDefault();
    mockDb.logMaintenance(asset.id, maintNotes);
    setIsMaintenanceOpen(false);
    setMaintNotes('');
    loadAsset();
  };

  const handleCompleteMaintenance = () => {
    if (window.confirm("Complete maintenance and return asset to service?")) {
      mockDb.completeMaintenance(asset.id, "Available");
      loadAsset();
    }
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!transferUser.trim()) return;
    mockDb.transferAsset(asset.id, transferUser);
    setIsTransferOpen(false);
    setTransferUser('');
    loadAsset();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you absolutely sure you want to delete asset ${asset.id}?`)) {
      mockDb.deleteAsset(asset.id);
      navigate('/assets');
    }
  };

  // Styles helpers
  const getHealthColorClasses = (color) => {
    switch (color) {
      case 'green':
        return {
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/20',
          indicator: 'bg-emerald-400',
          border: 'border-emerald-500/30'
        };
      case 'yellow':
        return {
          text: 'text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/20',
          indicator: 'bg-amber-400',
          border: 'border-amber-500/30'
        };
      case 'red':
        return {
          text: 'text-red-400',
          bg: 'bg-red-500/10 border-red-500/20',
          indicator: 'bg-red-400',
          border: 'border-red-500/30'
        };
      default:
        return {
          text: 'text-slate-400',
          bg: 'bg-slate-800 border-slate-700',
          indicator: 'bg-slate-450',
          border: 'border-slate-800'
        };
    }
  };

  const currentHealthStyle = getHealthColorClasses(asset.healthColor);

  return (
    <div className="space-y-6">
      {/* Back & Title Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/assets" 
          className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 hover:-translate-x-0.5 transition-all duration-300"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold tracking-tight text-white">{asset.name}</h2>
            <span className="text-xs font-mono font-bold bg-slate-900 text-slate-400 px-2.5 py-1 rounded border border-slate-850">
              {asset.id}
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">{asset.category} &bull; Registered {new Date(asset.purchaseDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Identity & QR & Actions */}
        <div className="space-y-6 lg:col-span-1">
          {/* Identity & QR Card */}
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest self-start mb-4">Identity QR Code</h3>
            
            {qrUrl ? (
              <div className="bg-white p-3 rounded-2xl shadow-xl shadow-slate-950/40 relative group">
                <img src={qrUrl} alt="Asset Detail QR Code" className="w-40 h-40" />
                <div className="absolute inset-0 bg-slate-950/80 rounded-2xl flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <QrCode size={24} className="text-violet-400" />
                  <span className="text-[10px] text-white font-bold uppercase tracking-wider">Scan Link</span>
                </div>
              </div>
            ) : (
              <div className="w-40 h-40 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800">
                <RefreshCw className="animate-spin text-slate-600" />
              </div>
            )}
            
            <p className="text-xs text-slate-500 mt-4 max-w-[200px]">
              Scannable hardware tag. Opens this record on mobile.
            </p>

            {/* General Specs */}
            <div className="w-full text-left bg-slate-950/30 border border-slate-900/60 p-4 rounded-xl mt-6 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Asset Tag ID:</span>
                <span className="font-mono text-slate-300 font-bold">{asset.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Asset Category:</span>
                <span className="text-slate-300 font-semibold">{asset.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Capital Cost:</span>
                <span className="font-mono text-slate-300 font-semibold">${asset.cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Purchase Date:</span>
                <span className="text-slate-300 font-semibold">{asset.purchaseDate}</span>
              </div>
              <div className="border-t border-slate-900/60 pt-2.5 mt-1">
                <span className="text-slate-500 block mb-1">Description:</span>
                <p className="text-slate-400 leading-normal">{asset.description || 'No description logged.'}</p>
              </div>
            </div>
          </div>

          {/* Action Operations Area */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Operations Console</h3>
            
            <div className="grid grid-cols-1 gap-2.5">
              {/* Conditional Allocations */}
              {asset.status === 'Available' && (
                <button
                  onClick={() => setIsAllocateOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-medium py-2.5 px-4 rounded-xl shadow-lg shadow-violet-500/10 transition-all cursor-pointer text-sm"
                >
                  <UserPlus size={15} />
                  Allocate Asset
                </button>
              )}
              
              {asset.status === 'Allocated' && (
                <>
                  <button
                    onClick={handleReturn}
                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 py-2.5 px-4 rounded-xl transition-all cursor-pointer text-sm"
                  >
                    <UserMinus size={15} />
                    Return to Stock
                  </button>
                  <button
                    onClick={() => setIsTransferOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 py-2.5 px-4 rounded-xl transition-all cursor-pointer text-sm"
                  >
                    <RefreshCw size={15} />
                    Transfer Ownership
                  </button>
                </>
              )}

              {/* Maintenance Controls */}
              {asset.status !== 'Under Maintenance' ? (
                <button
                  onClick={() => setIsMaintenanceOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-orange-600/20 hover:bg-orange-600/35 border border-orange-500/20 text-orange-400 font-medium py-2.5 px-4 rounded-xl transition-all cursor-pointer text-sm"
                >
                  <Wrench size={15} />
                  Log Maintenance
                </button>
              ) : (
                <button
                  onClick={handleCompleteMaintenance}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-500/10 transition-all cursor-pointer text-sm"
                >
                  <CheckCircle size={15} />
                  Complete Repair
                </button>
              )}

              {/* General Edit & Delete */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-900">
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 py-2 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer text-xs"
                >
                  <Edit3 size={13} />
                  Edit specs
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center justify-center gap-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/15 hover:border-red-500/30 py-2 rounded-lg text-red-400 hover:text-red-300 transition-all cursor-pointer text-xs"
                >
                  <Trash2 size={13} />
                  Deregister
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Health, Operations, Timeline */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Intelligence Modules Overview Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Health Intelligence Score Card */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Health Intelligence</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Dynamically calculated logic.</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentHealthStyle.bg} ${currentHealthStyle.text}`}>
                    {asset.healthStatus}
                  </span>
                </div>

                {/* Score display */}
                <div className="flex items-baseline gap-2.5 mt-5">
                  <span className={`text-5xl font-extrabold tracking-tight ${currentHealthStyle.text}`}>{asset.healthScore}</span>
                  <span className="text-slate-500 text-sm font-bold">/ 100</span>
                </div>
              </div>

              {/* Progress Bar & Variables */}
              <div className="space-y-3 mt-6 border-t border-slate-900 pt-4">
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${asset.healthColor === 'green' ? 'bg-emerald-500' : asset.healthColor === 'yellow' ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${asset.healthScore}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] tracking-wider font-bold">Calculated Age</span>
                    <span className="text-slate-300 font-semibold">{asset.age} Years</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] tracking-wider font-bold">Total Service Logs</span>
                    <span className="text-slate-300 font-semibold">{asset.maintenanceCount} times</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs bg-slate-900/60 p-2.5 border border-slate-850 rounded-lg">
                  <span className="text-slate-400">Maintenance Priority:</span>
                  <span className={`font-bold ${asset.maintenancePriority === 'Critical' || asset.maintenancePriority === 'High' ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                    {asset.maintenancePriority}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Operational Intelligence Score Card */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Operational Intelligence</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Asset utilization & idle monitoring.</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    {asset.status}
                  </span>
                </div>

                {/* Utilization gauge */}
                <div className="flex items-baseline gap-2.5 mt-5">
                  <span className="text-5xl font-extrabold tracking-tight text-white">{asset.utilization}%</span>
                  <span className="text-slate-500 text-sm font-bold">Utilization</span>
                </div>
              </div>

              {/* Recs & Idle Days */}
              <div className="space-y-3 mt-6 border-t border-slate-900 pt-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] tracking-wider font-bold">Current Custodian</span>
                    <span className="text-slate-300 font-semibold truncate block">
                      {asset.currentUser || 'Not Assigned'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] tracking-wider font-bold">Idle Duration</span>
                    <span className={`font-semibold ${asset.isIdle ? 'text-amber-500 font-bold' : 'text-slate-300'}`}>
                      {asset.status === 'Available' ? `${asset.idleDays} Days` : 'N/A (Active)'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs bg-slate-900/60 p-2.5 border border-slate-850 rounded-lg">
                  <span className="text-slate-400">Intelligence Recommendation:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                    asset.recommendation === 'Dispose' ? 'bg-red-500/15 text-red-400' :
                    asset.recommendation === 'Reallocate' ? 'bg-amber-500/15 text-amber-400' :
                    asset.recommendation === 'Repair' ? 'bg-orange-500/15 text-orange-400' :
                    asset.recommendation === 'Allocate' ? 'bg-emerald-500/15 text-emerald-400' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {asset.recommendation}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Warranty & Lifecycle Timeline Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Warranty Status Panel (1/3rd width) */}
            <div className="glass-card rounded-2xl p-6 md:col-span-1 flex flex-col justify-between h-96">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Warranty Panel</h3>
                <p className="text-[10px] text-slate-500 mb-6">Contract status coverage.</p>

                <div className="flex flex-col items-center justify-center bg-slate-950/20 py-6 rounded-xl border border-slate-900">
                  <ShieldAlert size={36} className={`${asset.isWarrantyExpired ? 'text-red-500/60' : 'text-violet-500'} mb-3`} />
                  <span className="text-xs text-slate-400">Status</span>
                  <span className={`text-base font-bold mt-1 ${asset.isWarrantyExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                    {asset.warrantyStatusText}
                  </span>
                </div>
              </div>

              <div className="text-xs space-y-2 border-t border-slate-900 pt-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration:</span>
                  <span className="text-slate-300 font-semibold">{asset.warrantyYears} Years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Days Expired:</span>
                  <span className="font-mono text-slate-300">
                    {asset.isWarrantyExpired ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Lifecycle Timeline Track (2/3rds width) */}
            <div className="glass-card rounded-2xl p-6 md:col-span-2 flex flex-col h-96">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Lifecycle Event Trace</h3>
              <p className="text-[10px] text-slate-500 mb-5">History logs in chronologic order.</p>

              {/* Event scroll container */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                {asset.history && asset.history.length > 0 ? (
                  asset.history.map((event, index) => {
                    const isLast = index === asset.history.length - 1;
                    return (
                      <div key={index} className="flex gap-4 items-start relative">
                        {/* Timeline bar link dots */}
                        <div className="flex flex-col items-center">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center z-10 shrink-0 ${
                            event.type === 'Created' ? 'bg-violet-950 border-violet-500' :
                            event.type === 'Allocated' ? 'bg-indigo-950 border-indigo-500' :
                            event.type === 'Returned' ? 'bg-emerald-950 border-emerald-500' :
                            event.type === 'Maintenance' ? 'bg-orange-950 border-orange-500' :
                            'bg-slate-950 border-slate-500'
                          }`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0"></div>
                          </div>
                          {!isLast && (
                            <div className="w-0.5 bg-slate-800 flex-1 min-h-[30px] my-1"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 bg-slate-900/40 border border-slate-900/60 rounded-xl p-3.5 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-white uppercase tracking-wider text-[10px]">{event.type}</span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                              <Clock size={11} />
                              <span>{event.date}</span>
                            </div>
                          </div>
                          <p className="text-slate-400 mt-1.5 leading-relaxed">{event.note}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-slate-500 text-center py-6">No historical records logged.</div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Edit Specifications Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass w-full max-w-lg rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-violet-400" />
                <h3 className="text-lg font-bold text-white">Edit Asset Specifications</h3>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Asset Name</label>
                  <input
                    type="text"
                    required
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                    <select
                      className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none"
                      value={editForm.category || ''}
                      onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    >
                      <option value="IT Hardware">IT Hardware</option>
                      <option value="Networking">Networking</option>
                      <option value="Vehicles">Vehicles</option>
                      <option value="Office Furniture">Office Furniture</option>
                      <option value="Office Equipment">Office Equipment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Purchase Date</label>
                    <input
                      type="date"
                      required
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                      value={editForm.purchaseDate || ''}
                      onChange={(e) => setEditForm({...editForm, purchaseDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Warranty (Years)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                      value={editForm.warrantyYears || 0}
                      onChange={(e) => setEditForm({...editForm, warrantyYears: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cost (USD)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                      value={editForm.cost || 0}
                      onChange={(e) => setEditForm({...editForm, cost: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    rows="3"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-105 focus:outline-none"
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl shadow-lg shadow-violet-500/25 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={14} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Asset Modal */}
      {isAllocateOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass w-full max-w-sm rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <h3 className="text-base font-bold text-white">Allocate Resource</h3>
              <button onClick={() => setIsAllocateOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAllocate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Assign Custodian Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe, Server Room 3"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                  value={allocUser}
                  onChange={(e) => setAllocUser(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsAllocateOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-405 hover:text-white uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl shadow-lg cursor-pointer"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Maintenance Modal */}
      {isMaintenanceOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass w-full max-w-sm rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <h3 className="text-base font-bold text-white">Log Maintenance Request</h3>
              <button onClick={() => setIsMaintenanceOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleMaintenance} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Maintenance Notes</label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Replace keyboard keys, regular oil checks..."
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                  value={maintNotes}
                  onChange={(e) => setMaintNotes(e.target.value)}
                />
                <p className="text-[10px] text-amber-500/80 mt-2">
                  * Note: Logging maintenance increments maintenance count and reduces overall health calculations.
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsMaintenanceOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-405 hover:text-white uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-lg cursor-pointer"
                >
                  Log Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {isTransferOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass w-full max-w-sm rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <h3 className="text-base font-bold text-white">Transfer Resource Custodian</h3>
              <button onClick={() => setIsTransferOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">New Custodian Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alice Smith, Server Room 1"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                  value={transferUser}
                  onChange={(e) => setTransferUser(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-405 hover:text-white uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl shadow-lg cursor-pointer"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
