import React, { useState, useEffect } from 'react';
import { mockDb } from '../mockDb';
import { Calendar, User, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Bookings({ userRole }) {
  const [assets, setAssets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    assetId: '',
    bookingDate: '2026-07-12',
    startTime: '10.0',
    endTime: '11.0',
    employeeName: 'Aravind'
  });
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const assetsList = await mockDb.getAssetsAsync();
      setAssets(assetsList.filter(a => a.status !== 'Disposed'));
      
      const bookingsList = await mockDb.getBookingsAsync();
      setBookings(bookingsList);
    } catch (err) {
      console.error("Failed to load booking details", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (parseFloat(formData.startTime) >= parseFloat(formData.endTime)) {
      setErrorMsg('Start time must be strictly before end time.');
      setLoading(false);
      return;
    }

    try {
      const res = await mockDb.createBookingAsync(formData);
      if (res && res.error) {
        setErrorMsg(res.message || 'Conflict detected. Resource is booked.');
      } else {
        setSuccessMsg(`Successfully booked! Timeline updated.`);
        setFormData(prev => ({ ...prev, assetId: '' }));
        loadData();
      }
    } catch (err) {
      setErrorMsg('Server communication error.');
    } finally {
      setLoading(false);
    }
  };

  const formatHour = (val) => {
    const h = Math.floor(val);
    const m = Math.round((val % 1) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const timeOptions = [
    { label: '08:00', value: '8.0' },
    { label: '09:00', value: '9.0' },
    { label: '10:00', value: '10.0' },
    { label: '11:00', value: '11.0' },
    { label: '12:00', value: '12.0' },
    { label: '13:00', value: '13.0' },
    { label: '14:00', value: '14.0' },
    { label: '15:00', value: '15.0' },
    { label: '16:00', value: '16.0' },
    { label: '17:00', value: '17.0' },
    { label: '18:00', value: '18.0' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Resource Bookings
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Reserve corporate assets and validate booking overlaps in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Booking Form Card */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-5 relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-3xl"></div>
          
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Schedule Booking</h3>

          {errorMsg && (
            <div className="mb-5 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={16} />
              <div>
                <span className="text-xs font-bold text-red-400 block">Booking Conflict Warning</span>
                <p className="text-[11px] text-slate-450 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3">
              <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={16} />
              <div>
                <span className="text-xs font-bold text-emerald-400 block">Booking Confirmed</span>
                <p className="text-[11px] text-slate-450 mt-0.5">{successMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Asset / Resource</label>
              <select
                required
                className="w-full glass-input rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none bg-slate-950"
                value={formData.assetId}
                onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
              >
                <option value="">-- Choose Asset --</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Booking Date</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                  value={formData.bookingDate}
                  onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Start Time</label>
                <select
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none bg-slate-950"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                >
                  {timeOptions.slice(0, -1).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">End Time</label>
                <select
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none bg-slate-950"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                >
                  {timeOptions.slice(1).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Employee Name</label>
              <input
                type="text"
                required
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                placeholder="e.g. Sarah Jenkins"
                value={formData.employeeName}
                onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg cursor-pointer text-xs uppercase tracking-wider"
            >
              {loading ? 'Validating Conflicts...' : 'Schedule Booking'}
            </button>
          </form>
        </div>

        {/* Bookings List Card */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-7 flex flex-col min-h-[400px]">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Current Bookings Registry</h3>
          
          <div className="flex-1 overflow-x-auto">
            {bookings.length > 0 ? (
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="pb-3 font-semibold text-slate-400">Resource</th>
                    <th className="pb-3 font-semibold text-slate-400">Date</th>
                    <th className="pb-3 font-semibold text-slate-400">Time Range</th>
                    <th className="pb-3 font-semibold text-slate-400">Booked By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 font-medium text-white">
                        <span className="block font-semibold">{b.assetName}</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{b.assetId}</span>
                      </td>
                      <td className="py-3.5 text-slate-300 font-mono">{b.bookingDate}</td>
                      <td className="py-3.5">
                        <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-violet-400 font-semibold font-mono text-[11px]">
                          {formatHour(b.startTime)} - {formatHour(b.endTime)}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-300 font-medium">{b.employeeName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-xl">
                <Calendar size={32} className="text-slate-600 mb-3" />
                <p className="text-sm text-slate-350 font-medium">No bookings registered</p>
                <p className="text-xs text-slate-500 mt-0.5">Use the form to schedule a booking.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
