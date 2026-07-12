import React, { useState, useEffect } from 'react';
import { mockDb } from '../mockDb';
import { Check, X, ClipboardList, AlertCircle, ArrowRight } from 'lucide-react';

export default function Transfers({ userRole }) {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('requested'); // requested, approved, rejected, all

  const loadTransfers = async () => {
    try {
      const res = await mockDb.getTransfersAsync();
      setTransfers(res);
    } catch (err) {
      console.error("Failed to load transfers list", err);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  const handleApprove = async (id) => {
    setLoading(true);
    // Optimistic Update: Set transfer to approved locally
    const previousTransfers = [...transfers];
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, state: 'approved' } : t));
    
    try {
      await mockDb.approveTransferAsync(id);
      loadTransfers();
    } catch (err) {
      setTransfers(previousTransfers);
      console.error("Approval failed, rolled back", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    setLoading(true);
    // Optimistic Update: Set transfer to rejected locally
    const previousTransfers = [...transfers];
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, state: 'rejected' } : t));
    
    try {
      await mockDb.rejectTransferAsync(id);
      loadTransfers();
    } catch (err) {
      setTransfers(previousTransfers);
      console.error("Rejection failed, rolled back", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransfers = transfers.filter(t => {
    if (activeTab === 'all') return true;
    return t.state === activeTab;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Transfers & Approvals
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Review, approve, and track resource custodian transfer requests.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('requested')}
          className={`pb-3 relative cursor-pointer ${activeTab === 'requested' ? 'text-violet-400 border-b-2 border-violet-500' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Pending Requests
          {transfers.filter(t => t.state === 'requested').length > 0 && (
            <span className="ml-2 bg-violet-600/20 border border-violet-500/30 text-violet-400 px-2 py-0.5 rounded-full text-[10px]">
              {transfers.filter(t => t.state === 'requested').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`pb-3 relative cursor-pointer ${activeTab === 'approved' ? 'text-violet-400 border-b-2 border-violet-500' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Approved
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`pb-3 relative cursor-pointer ${activeTab === 'rejected' ? 'text-violet-400 border-b-2 border-violet-500' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Rejected
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 relative cursor-pointer ${activeTab === 'all' ? 'text-violet-400 border-b-2 border-violet-500' : 'text-slate-400 hover:text-slate-200'}`}
        >
          All Requests
        </button>
      </div>

      {/* Table view */}
      <div className="glass-card rounded-2xl p-6 min-h-[400px]">
        <div className="overflow-x-auto">
          {filteredTransfers.length > 0 ? (
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="pb-3 font-semibold text-slate-400">Resource</th>
                  <th className="pb-3 font-semibold text-slate-400">Transfer Path</th>
                  <th className="pb-3 font-semibold text-slate-400">Request Date</th>
                  <th className="pb-3 font-semibold text-slate-400">Status</th>
                  {activeTab === 'requested' && <th className="pb-3 font-semibold text-slate-400 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTransfers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 font-medium text-white">
                      <span className="block font-semibold">{t.assetName}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{t.assetId}</span>
                    </td>
                    <td className="py-4 text-slate-300 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{t.currentOwner}</span>
                        <ArrowRight size={12} className="text-violet-400" />
                        <span className="text-white font-semibold">{t.requestedOwner}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-400 font-mono">{t.requestDate}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        t.state === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        t.state === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                      }`}>
                        {t.state === 'approved' ? 'Approved' : t.state === 'rejected' ? 'Rejected' : 'Pending Approval'}
                      </span>
                    </td>
                    {activeTab === 'requested' && (
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(t.id)}
                            disabled={loading}
                            className="bg-emerald-600/25 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white text-emerald-400 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Approve request"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => handleReject(t.id)}
                            disabled={loading}
                            className="bg-red-600/25 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-400 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Reject request"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-xl">
              <ClipboardList size={32} className="text-slate-600 mb-3" />
              <p className="text-sm text-slate-450 font-medium">No transfer requests found</p>
              <p className="text-xs text-slate-500 mt-0.5">Approved or rejected requests will list here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
