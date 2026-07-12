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
  ShieldCheck,
  PlusCircle,
  UserPlus,
  PlayCircle,
  X,
  ClipboardList
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
  Tooltip 
} from 'recharts';

export default function Dashboard() {
  const [assets, setAssets] = useState([]);
  const CURRENT_DATE_STR = "2026-07-12";

  function calculateAge(purchaseDate) {
    const end = new Date(CURRENT_DATE_STR);
    const start = new Date(purchaseDate);
    const diffTime = Math.max(0, end - start);
    return diffTime / (1000 * 60 * 60 * 24 * 365.25);
  }

  // Modal control states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  // Form inputs
  const [newAsset, setNewAsset] = useState({
    name: '', category: 'IT Hardware', purchaseDate: CURRENT_DATE_STR, warrantyYears: 3, cost: '', description: '', condition: 'Excellent'
  });
  const [allocAssetId, setAllocAssetId] = useState('');
  const [allocUser, setAllocUser] = useState('');
  const [maintAssetId, setMaintAssetId] = useState('');
  const [maintNotes, setMaintNotes] = useState('');
  
  // Audit Results State
  const [auditReport, setAuditReport] = useState(null);

  const loadAssets = () => {
    mockDb.getAssetsAsync().then(res => setAssets(res));
  };

  useEffect(() => {
    loadAssets();
  }, []);

  // 1. KPI Counts
  const totalCount = assets.length;
  const availableCount = assets.filter(a => a.status === 'Available').length;
  const allocatedCount = assets.filter(a => a.status === 'Allocated').length;
  const maintenanceCount = assets.filter(a => a.status === 'Under Maintenance').length;
  
  // Refined metrics definitions:
  const criticalCount = assets.filter(a => a.healthScore < 40).length;
  const idleCount = assets.filter(a => a.isIdle).length;
  const warrantyExpiringCount = assets.filter(a => a.warrantyDaysLeft <= 30).length;
  const maintenanceDueCount = assets.filter(a => a.isMaintenanceOverdue).length;

  // 2. Enterprise Health Index (Average Health Score of all assets)
  const enterpriseHealthIndex = totalCount > 0 
    ? Math.round(assets.reduce((sum, a) => sum + a.healthScore, 0) / totalCount)
    : 100;

  // 3. Enterprise Asset Risk Score Calculation
  // Risk Score = ((Critical * 5) + (Idle * 2) + (WarrantyExpiring * 2) + (MaintDue * 3)) / Total Assets
  const riskScoreNumerator = (criticalCount * 5) + (idleCount * 2) + (warrantyExpiringCount * 2) + (maintenanceDueCount * 3);
  const rawRiskScore = totalCount > 0 ? (riskScoreNumerator / totalCount) : 0;
  const enterpriseRiskScore = Math.round(rawRiskScore * 10) / 10;

  // Risk Classification
  let riskLevel = "Low Risk";
  let riskColorText = "text-emerald-400";
  let riskDotColor = "bg-emerald-500";
  let riskBgColor = "bg-emerald-500/10 border-emerald-500/20";
  let riskRecommendation = "All systems operational. Continue standard audit intervals.";

  if (enterpriseRiskScore > 5.0) {
    riskLevel = "Critical Risk";
    riskColorText = "text-red-400";
    riskDotColor = "bg-red-500";
    riskBgColor = "bg-red-500/10 border-red-500/20";
    riskRecommendation = "Immediate action required. Discommission failed hardware, renew warranties, and log overdue services.";
  } else if (enterpriseRiskScore >= 3.0) {
    riskLevel = "High Risk";
    riskColorText = "text-orange-400";
    riskDotColor = "bg-orange-500";
    riskBgColor = "bg-orange-500/10 border-orange-500/20";
    riskRecommendation = "Schedule maintenance for critical assets and reallocate idle resources.";
  } else if (enterpriseRiskScore >= 1.5) {
    riskLevel = "Moderate Risk";
    riskColorText = "text-amber-400";
    riskDotColor = "bg-amber-500";
    riskBgColor = "bg-amber-500/10 border-amber-500/20";
    riskRecommendation = "Monitor idle devices and address warning health thresholds.";
  }

  // 4. Efficiency Metrics (Replaces Utilization)
  const averageEfficiency = totalCount > 0 
    ? Math.round(assets.reduce((sum, a) => sum + a.efficiency, 0) / totalCount)
    : 0;

  // 5. Chart 1: Status Distribution
  const statusData = [
    { name: 'Allocated', value: allocatedCount, color: '#8b5cf6' },
    { name: 'Available', value: availableCount, color: '#10b981' },
    { name: 'Under Maintenance', value: maintenanceCount, color: '#f97316' },
    { name: 'Decommissioned', value: assets.filter(a => a.status === 'Disposed').length, color: '#64748b' }
  ].filter(item => item.value > 0);

  // 6. Chart 2: Health Distribution Data
  const healthyCount = assets.filter(a => a.healthScore >= 90).length;
  const warningCount = assets.filter(a => a.healthScore >= 70 && a.healthScore < 90).length;
  const dangerCount = assets.filter(a => a.healthScore >= 40 && a.healthScore < 70).length;

  const healthData = [
    { name: 'Low Priority (90-100)', count: healthyCount, fill: '#10b981' },
    { name: 'Medium (70-89)', count: warningCount, fill: '#f59e0b' },
    { name: 'High (40-69)', count: dangerCount, fill: '#f97316' },
    { name: 'Critical (0-39)', count: criticalCount, fill: '#ef4444' },
  ];

  // 7. Rule-Based Smart Alerts calculation
  const alerts = [];
  assets.forEach(asset => {
    // Health < 40
    if (asset.healthScore < 40) {
      alerts.push({
        id: `${asset.id}-health-alert`,
        assetId: asset.id,
        assetName: asset.name,
        type: 'health',
        message: `Asset Health Score is critical (${asset.healthScore}%). Maintenance Priority: ${asset.maintenancePriority}.`,
        badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20'
      });
    }
    // Efficiency < 30%
    if (asset.efficiency < 30) {
      alerts.push({
        id: `${asset.id}-efficiency-alert`,
        assetId: asset.id,
        assetName: asset.name,
        type: 'efficiency',
        message: `Asset Efficiency is Low (${asset.efficiency}%). Current status: ${asset.status}.`,
        badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      });
    }
    // Warranty expires within 30 days
    if (asset.warrantyDaysLeft <= 30) {
      alerts.push({
        id: `${asset.id}-warranty-alert`,
        assetId: asset.id,
        assetName: asset.name,
        type: 'warranty',
        message: asset.isWarrantyExpired ? `Warranty has expired.` : `Warranty expires in ${asset.warrantyDaysLeft} days.`,
        badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20'
      });
    }
    // Maintenance overdue (>180 days)
    if (asset.isMaintenanceOverdue) {
      alerts.push({
        id: `${asset.id}-maint-alert`,
        assetId: asset.id,
        assetName: asset.name,
        type: 'maintenance',
        message: `Maintenance is overdue by ${asset.daysSinceLastMaintenance - 180} days. Last checked ${asset.daysSinceLastMaintenance} days ago.`,
        badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      });
    }
    // Asset idle (>30 days)
    if (asset.status === 'Available' && asset.isIdle) {
      alerts.push({
        id: `${asset.id}-idle-alert`,
        assetId: asset.id,
        assetName: asset.name,
        type: 'idle',
        message: `Asset has been unallocated for ${asset.idleDays} days. Recommended to reallocate or audit usage.`,
        badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
      });
    }
  });

  // 8. Executive Insights calculations
  let portfolioHealthStatus = "Critical";
  if (enterpriseHealthIndex >= 90) portfolioHealthStatus = "Excellent";
  else if (enterpriseHealthIndex >= 70) portfolioHealthStatus = "Healthy";
  else if (enterpriseHealthIndex >= 40) portfolioHealthStatus = "Warning";

  // Highest Risk Category: Category with lowest average health score
  const categoryStats = {};
  assets.forEach(a => {
    if (a.status !== 'Disposed') {
      if (!categoryStats[a.category]) {
        categoryStats[a.category] = { sumHealth: 0, count: 0 };
      }
      categoryStats[a.category].sumHealth += a.healthScore;
      categoryStats[a.category].count += 1;
    }
  });
  
  let highestRiskCategory = "None";
  let lowestAvgHealth = 101;
  Object.keys(categoryStats).forEach(cat => {
    const avg = categoryStats[cat].sumHealth / categoryStats[cat].count;
    if (avg < lowestAvgHealth) {
      lowestAvgHealth = avg;
      highestRiskCategory = cat;
    }
  });

  // Most Utilized Department
  const getDepartment = (user) => {
    if (!user) return null;
    const lower = user.toLowerCase();
    if (lower.includes('developer') || lower.includes('dev') || lower.includes('it') || lower.includes('engineer') || lower.includes('aravind')) return 'Information Technology';
    if (lower.includes('sales') || lower.includes('marketing') || lower.includes('vp') || lower.includes('sarah')) return 'Sales & Marketing';
    if (lower.includes('design') || lower.includes('emma') || lower.includes('artist')) return 'Design';
    if (lower.includes('conference') || lower.includes('hq') || lower.includes('room') || lower.includes('building')) return 'Administration';
    return 'General Operations';
  };

  const deptStats = {};
  assets.forEach(a => {
    const dept = getDepartment(a.currentUser);
    if (dept) {
      if (!deptStats[dept]) {
        deptStats[dept] = { sumEff: 0, count: 0 };
      }
      deptStats[dept].sumEff += a.efficiency;
      deptStats[dept].count += 1;
    }
  });

  let mostUtilizedDept = "None";
  let maxAvgEff = -1;
  Object.keys(deptStats).forEach(dept => {
    const avg = deptStats[dept].sumEff / deptStats[dept].count;
    if (avg > maxAvgEff) {
      maxAvgEff = avg;
      mostUtilizedDept = dept;
    }
  });

  // Assets Requiring Immediate Attention (health < 40 or maintenance overdue)
  const immediateAttentionCount = assets.filter(a => (a.healthScore < 40 || a.isMaintenanceOverdue) && a.status !== 'Disposed').length;

  // Upcoming Warranty Expirations (30 Days)
  const upcomingWarrantyExpirationsCount = assets.filter(a => a.warrantyDaysLeft > 0 && a.warrantyDaysLeft <= 30 && a.status !== 'Disposed').length;


  // Action Submissions with Optimistic State Updates
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    
    // Create temporary optimistic ID and item
    const tempId = `AF-TEMP-${Math.floor(Math.random() * 1000)}`;
    const optimisticAsset = {
      id: tempId,
      name: newAsset.name || "Unnamed Asset",
      category: newAsset.category || "IT Hardware",
      status: "Available",
      purchaseDate: newAsset.purchaseDate || CURRENT_DATE_STR,
      maintenanceCount: 0,
      lastAllocatedDate: null,
      currentUser: null,
      warrantyYears: parseInt(newAsset.warrantyYears) || 2,
      cost: parseFloat(newAsset.cost) || 0,
      description: newAsset.description || "",
      condition: newAsset.condition || "Excellent",
      history: [{ date: CURRENT_DATE_STR, type: "Created", note: "Asset registered (Optimistic UI)." }]
    };

    // Calculate intelligence fields for the optimistic entry
    const end = new Date(CURRENT_DATE_STR);
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
    setIsRegisterOpen(false);

    // Request payload in background
    mockDb.addAssetAsync(newAsset)
      .then(() => {
        loadAssets();
      })
      .catch((err) => {
        setAssets(previousAssets);
        console.error("Register failed, rolling back", err);
      });

    setNewAsset({
      name: '', category: 'IT Hardware', purchaseDate: CURRENT_DATE_STR, warrantyYears: 3, cost: '', description: '', condition: 'Excellent'
    });
  };

  const handleAllocateSubmit = (e) => {
    e.preventDefault();
    if (!allocAssetId || !allocUser.trim()) return;

    const previousAssets = [...assets];
    
    // Update local state instantly (Optimistic Update)
    const updatedAssets = assets.map(a => {
      if (a.id === allocAssetId) {
        const rawAsset = {
          ...a,
          status: "Allocated",
          currentUser: allocUser,
          lastAllocatedDate: CURRENT_DATE_STR,
          history: [...(a.history || []), { date: CURRENT_DATE_STR, type: "Allocated", note: `Allocated to ${allocUser} (Optimistic UI).` }]
        };
        
        // Recompute intelligence metrics instantly so charts and risk indexes update in real time
        const age = calculateAge(rawAsset.purchaseDate);
        const condition = rawAsset.condition || "Good";
        const agePenalty = Math.round(age * 2 * 10) / 10;
        const maintenancePenalty = rawAsset.maintenanceCount * 5;
        let conditionPenalty = 0;
        if (condition === "Good") conditionPenalty = 5;
        else if (condition === "Fair") conditionPenalty = 10;
        else if (condition === "Poor") conditionPenalty = 20;

        const purchase = new Date(rawAsset.purchaseDate);
        const warrantyEnd = new Date(purchase.setFullYear(purchase.getFullYear() + rawAsset.warrantyYears));
        const current = new Date(CURRENT_DATE_STR);
        const warrantyDaysLeft = Math.floor((warrantyEnd - current) / (1000 * 60 * 60 * 24));
        const isWarrantyExpired = warrantyDaysLeft <= 0;
        let warrantyPenalty = isWarrantyExpired ? 10 : (warrantyDaysLeft <= 30 ? 5 : 0);

        const healthScore = Math.max(0, Math.min(100, Math.round(100 - agePenalty - maintenancePenalty - conditionPenalty - warrantyPenalty)));

        // Simulate efficiency update
        const efficiency = 85;

        return {
          ...rawAsset,
          age: parseFloat(age.toFixed(2)),
          healthScore,
          healthStatus: healthScore >= 70 ? "Healthy" : healthScore >= 40 ? "Warning" : "Critical",
          healthColor: healthScore >= 70 ? "green" : healthScore >= 40 ? "yellow" : "red",
          maintenancePriority: healthScore >= 90 ? "Low" : healthScore >= 70 ? "Medium" : healthScore >= 40 ? "High" : "Critical",
          efficiency,
          efficiencyLevel: "High",
          isIdle: false,
          idleDays: 0,
          recommendation: healthScore < 40 ? "Replace Asset" : (condition === "Poor" ? "Repair Asset" : "Operating Normally"),
          warrantyDaysLeft: isWarrantyExpired ? 0 : warrantyDaysLeft,
          isWarrantyExpired,
          warrantyStatusText: isWarrantyExpired ? "Expired" : `${warrantyDaysLeft} Days Left`,
          healthBreakdown: {
            base: 100, age: parseFloat(age.toFixed(2)), agePenalty,
            maintenanceCount: rawAsset.maintenanceCount, maintenancePenalty,
            condition, conditionPenalty,
            warrantyDaysLeft: isWarrantyExpired ? 0 : warrantyDaysLeft, warrantyPenalty,
            rawScore: 100 - agePenalty - maintenancePenalty - conditionPenalty - warrantyPenalty
          }
        };
      }
      return a;
    });

    setAssets(updatedAssets);
    setIsAllocateOpen(false);

    // Background call
    mockDb.allocateAssetAsync(allocAssetId, allocUser)
      .then(() => {
        loadAssets();
      })
      .catch((err) => {
        setAssets(previousAssets);
        console.error("Allocation failed, rolling back", err);
      });

    setAllocAssetId('');
    setAllocUser('');
  };

  const handleMaintenanceSubmit = (e) => {
    e.preventDefault();
    if (!maintAssetId) return;

    const previousAssets = [...assets];

    // Optimistically log maintenance
    const updatedAssets = assets.map(a => {
      if (a.id === maintAssetId) {
        const rawAsset = {
          ...a,
          status: "Under Maintenance",
          maintenanceCount: a.maintenanceCount + 1,
          history: [...(a.history || []), { date: CURRENT_DATE_STR, type: "Maintenance", note: maintNotes || "Routine check (Optimistic UI)." }]
        };

        const age = calculateAge(rawAsset.purchaseDate);
        const condition = rawAsset.condition || "Good";
        const agePenalty = Math.round(age * 2 * 10) / 10;
        const maintenancePenalty = rawAsset.maintenanceCount * 5;
        let conditionPenalty = 0;
        if (condition === "Good") conditionPenalty = 5;
        else if (condition === "Fair") conditionPenalty = 10;
        else if (condition === "Poor") conditionPenalty = 20;

        const purchase = new Date(rawAsset.purchaseDate);
        const warrantyEnd = new Date(purchase.setFullYear(purchase.getFullYear() + rawAsset.warrantyYears));
        const current = new Date(CURRENT_DATE_STR);
        const warrantyDaysLeft = Math.floor((warrantyEnd - current) / (1000 * 60 * 60 * 24));
        const isWarrantyExpired = warrantyDaysLeft <= 0;
        let warrantyPenalty = isWarrantyExpired ? 10 : (warrantyDaysLeft <= 30 ? 5 : 0);

        const healthScore = Math.max(0, Math.min(100, Math.round(100 - agePenalty - maintenancePenalty - conditionPenalty - warrantyPenalty)));

        return {
          ...rawAsset,
          age: parseFloat(age.toFixed(2)),
          healthScore,
          healthStatus: healthScore >= 70 ? "Healthy" : healthScore >= 40 ? "Warning" : "Critical",
          healthColor: healthScore >= 70 ? "green" : healthScore >= 40 ? "yellow" : "red",
          maintenancePriority: healthScore >= 90 ? "Low" : healthScore >= 70 ? "Medium" : healthScore >= 40 ? "High" : "Critical",
          efficiency: 0,
          efficiencyLevel: "Low",
          recommendation: "Repair Asset",
          warrantyDaysLeft: isWarrantyExpired ? 0 : warrantyDaysLeft,
          isWarrantyExpired,
          warrantyStatusText: isWarrantyExpired ? "Expired" : `${warrantyDaysLeft} Days Left`,
          healthBreakdown: {
            base: 100, age: parseFloat(age.toFixed(2)), agePenalty,
            maintenanceCount: rawAsset.maintenanceCount, maintenancePenalty,
            condition, conditionPenalty,
            warrantyDaysLeft: isWarrantyExpired ? 0 : warrantyDaysLeft, warrantyPenalty,
            rawScore: 100 - agePenalty - maintenancePenalty - conditionPenalty - warrantyPenalty
          }
        };
      }
      return a;
    });

    setAssets(updatedAssets);
    setIsMaintenanceOpen(false);

    // Background Call
    mockDb.logMaintenanceAsync(maintAssetId, maintNotes)
      .then(() => {
        loadAssets();
      })
      .catch((err) => {
        setAssets(previousAssets);
        console.error("Maintenance failed, rolling back", err);
      });

    setMaintAssetId('');
    setMaintNotes('');
  };

  const handleRunAudit = () => {
    // Collect stats for compliance
    const failedAssets = assets.filter(a => a.healthScore < 40 || a.isMaintenanceOverdue);
    const complianceRate = totalCount > 0 ? Math.round(((totalCount - failedAssets.length) / totalCount) * 100) : 100;
    
    setAuditReport({
      scannedCount: totalCount,
      complianceRate,
      criticalAnomalies: criticalCount,
      overdueMaint: maintenanceDueCount,
      idleDevices: idleCount,
      warrantyIssues: warrantyExpiringCount
    });
    setIsAuditOpen(true);
  };

  // Get available assets for allocating dropdown
  const availableAssetsList = assets.filter(a => a.status === 'Available');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Executive Dashboard
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Rule-Based Resource Monitoring and Fleet Compliance Analytics.
          </p>
        </div>
        <Link 
          to="/assets" 
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm cursor-pointer"
        >
          Browse Fleet
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* TOP SECTION: Enterprise Health & Enterprise Asset Risk Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Enterprise Health Index Widget */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-3xl"></div>
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Enterprise Health Index</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Average overall health evaluation score.</p>
          </div>

          <div className="flex items-center gap-6 py-6">
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  className="stroke-violet-500" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={`${enterpriseHealthIndex * 2.51} 251`} 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold text-white tracking-tight">{enterpriseHealthIndex}%</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-xs font-semibold">Asset Fleet Rating:</span>
              <h4 className="text-lg font-bold text-white mt-0.5">
                {enterpriseHealthIndex >= 85 ? '🟢 Excellent' : enterpriseHealthIndex >= 70 ? '🟡 Satisfactory' : '🔴 At Risk'}
              </h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Determined by combining ages, condition grades, active warranties, and maintenance counts.
              </p>
            </div>
          </div>
        </div>

        {/* Enterprise Asset Risk Widget */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-7 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Enterprise Asset Risk</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Rule-Based risk rating logic.</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${riskBgColor} ${riskColorText}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${riskDotColor}`}></span>
                {riskLevel} ({enterpriseRiskScore})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
              {/* Contributing factors lists */}
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-2">Contributing Factors</span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                    <strong className="text-white">{criticalCount}</strong> Critical Assets
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                    <strong className="text-white">{idleCount}</strong> Idle Assets
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                    <strong className="text-white">{maintenanceDueCount}</strong> Maintenance Due
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                    <strong className="text-white">{warrantyExpiringCount}</strong> Warranty Expiring
                  </li>
                </ul>
              </div>
              
              {/* Recommendations box */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850 flex flex-col justify-center">
                <span className="text-[9px] text-violet-400 uppercase tracking-wider font-extrabold block">Recommended Action</span>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-medium">
                  {riskRecommendation}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Actions Panel */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Operations</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center gap-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-violet-500/30 p-4 rounded-xl text-left transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer"
          >
            <div className="p-2.5 bg-violet-600/10 rounded-xl text-violet-400 border border-violet-500/20 group-hover:bg-violet-600/25">
              <PlusCircle size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Register Asset</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Add hardware</span>
            </div>
          </button>

          <button
            onClick={() => setIsAllocateOpen(true)}
            className="flex items-center gap-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/30 p-4 rounded-xl text-left transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer"
          >
            <div className="p-2.5 bg-indigo-600/10 rounded-xl text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-600/25">
              <UserPlus size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Allocate Asset</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Assign custodian</span>
            </div>
          </button>

          <button
            onClick={() => setIsMaintenanceOpen(true)}
            className="flex items-center gap-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-orange-500/30 p-4 rounded-xl text-left transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer"
          >
            <div className="p-2.5 bg-orange-600/10 rounded-xl text-orange-400 border border-orange-500/20 group-hover:bg-orange-600/25">
              <Wrench size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Maintenance</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Log service request</span>
            </div>
          </button>

          <button
            onClick={handleRunAudit}
            className="flex items-center gap-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/30 p-4 rounded-xl text-left transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer"
          >
            <div className="p-2.5 bg-emerald-600/10 rounded-xl text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-600/25">
              <ShieldCheck size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Audit System</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Run check checks</span>
            </div>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="glass-card rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden group">
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

        <div className="glass-card rounded-2xl p-5 hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden group">
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

        <div className="glass-card rounded-2xl p-5 hover:border-orange-500/30 transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Maintenance</span>
            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-400 border border-orange-500/20">
              <Wrench size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-white">{maintenanceCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Repairing / Service</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Idle Assets</span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Coffee size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-white">{idleCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Idle for 30+ days</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 hover:border-red-500/30 transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Critical Health</span>
            <div className="p-2 bg-red-500/10 rounded-xl text-red-400 border border-red-500/20">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-white">{criticalCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Health rating &lt; 40</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 hover:border-pink-500/30 transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Expiring Warranty</span>
            <div className="p-2 bg-pink-500/10 rounded-xl text-pink-400 border border-pink-500/20">
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-white">{warrantyExpiringCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Expires within 30 days</p>
          </div>
        </div>
      </div>

      {/* Charts & Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Donut */}
        <div className="glass-card rounded-2xl p-6 flex flex-col h-96">
          <h3 className="text-lg font-bold text-white mb-2">Fleet Allocation Status</h3>
          <p className="text-xs text-slate-400 mb-6">Distribution of assets by current operational status.</p>
          
          <div className="flex-1 min-h-0 relative">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="45%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">No asset data logged</div>
            )}
          </div>
          <div className="flex justify-center gap-4 text-[10px] mt-4 flex-wrap">
            {statusData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400 font-medium">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Health distribution Bar Chart */}
        <div className="glass-card rounded-2xl p-6 flex flex-col h-96">
          <h3 className="text-lg font-bold text-white mb-2">Fleet Health Score brackets</h3>
          <p className="text-xs text-slate-400 mb-6">Total assets grouped by dynamic Health Score brackets.</p>
          
          <div className="flex-1 min-h-0">
            {assets.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={healthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {healthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">No asset data logged</div>
            )}
          </div>
        </div>

        {/* Efficiency index */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between h-96">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Fleet Efficiency Rating</h3>
            <p className="text-xs text-slate-400">Resource usage productivity calculated from historical event intervals.</p>
          </div>
          
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
                <circle cx="50" cy="50" r="40" className="stroke-violet-500" strokeWidth="8" fill="transparent" strokeDasharray={`${averageEfficiency * 2.51} 251`} strokeLinecap="round" />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold text-white tracking-tight">{averageEfficiency}%</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Average Eff.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Efficiency rating:</span>
              <span className="font-semibold text-violet-400">
                {averageEfficiency >= 70 ? 'High' : averageEfficiency >= 30 ? 'Moderate' : 'Low'}
              </span>
            </div>
            <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full" style={{ width: `${averageEfficiency}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Layout Grid: Alerts & Executive Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Smart Alerts Console */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="bg-amber-500/10 p-2 rounded-xl text-amber-400 border border-amber-500/20">
                  <ShieldCheck size={20} className="pulse-glow" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Rule-Based Smart Alerts</h3>
                  <p className="text-xs text-slate-400">Dynamic system anomalies requiring operations resolution.</p>
                </div>
              </div>
              <span className="text-xs bg-slate-800/80 px-2.5 py-1 rounded-md text-slate-400 font-mono">
                {alerts.length} Active Alerts
              </span>
            </div>

            {alerts.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {alerts.map((alert) => (
                  <div key={alert.id} className="bg-slate-905/30 border border-slate-850/80 hover:border-slate-700/80 rounded-xl p-4 flex items-start gap-3.5 transition-all duration-300">
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-400 shrink-0 mt-0.5">
                      {alert.type === 'health' && <AlertTriangle size={15} className="text-red-400" />}
                      {alert.type === 'efficiency' && <TrendingUp size={15} className="text-amber-400" />}
                      {alert.type === 'warranty' && <ShieldAlert size={15} className="text-pink-400" />}
                      {alert.type === 'maintenance' && <Wrench size={15} className="text-orange-400" />}
                      {alert.type === 'idle' && <Coffee size={15} className="text-indigo-400" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <Link to={`/assets/${alert.assetId}`} className="text-sm font-semibold text-white hover:text-violet-400 hover:underline truncate">
                          {alert.assetName}
                        </Link>
                        <span className="text-[9px] text-slate-500 font-mono uppercase font-semibold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-850">{alert.assetId}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 bg-slate-900/10 rounded-xl border border-dashed border-slate-800">
                <CheckCircle size={32} className="text-emerald-500/40 mb-3" />
                <p className="text-sm font-medium text-slate-350">All systems optimal</p>
                <p className="text-xs text-slate-500 mt-0.5">No anomalies detected.</p>
              </div>
            )}
          </div>
        </div>

        {/* Executive Insights Widget */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-5 border-b border-slate-800 pb-3">
              <div className="bg-violet-500/10 p-2 rounded-xl text-violet-400 border border-violet-500/20">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Executive Insights</h3>
                <p className="text-xs text-slate-400">Management alerts and performance indicators.</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Health insight */}
              <div className="flex justify-between items-center py-2.5 border-b border-slate-900/60">
                <span className="text-xs text-slate-400 font-medium">Asset Portfolio Health</span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="text-violet-450">{enterpriseHealthIndex}%</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase border ${
                    portfolioHealthStatus === "Excellent" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    portfolioHealthStatus === "Healthy" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    portfolioHealthStatus === "Warning" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {portfolioHealthStatus}
                  </span>
                </span>
              </div>

              {/* Risk category insight */}
              <div className="flex justify-between items-center py-2.5 border-b border-slate-900/60">
                <span className="text-xs text-slate-400 font-medium">Highest Risk Category</span>
                <span className="text-xs font-bold text-red-400 font-semibold">{highestRiskCategory}</span>
              </div>

              {/* Most Utilized Department insight */}
              <div className="flex justify-between items-center py-2.5 border-b border-slate-900/60">
                <span className="text-xs text-slate-400 font-medium">Most Utilized Department</span>
                <span className="text-xs font-bold text-white">{mostUtilizedDept}</span>
              </div>

              {/* Attention count insight */}
              <div className="flex justify-between items-center py-2.5 border-b border-slate-900/60">
                <span className="text-xs text-slate-400 font-medium">Assets Requiring Attention</span>
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  immediateAttentionCount > 0 ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-slate-400 bg-slate-900"
                }`}>
                  {immediateAttentionCount} Assets
                </span>
              </div>

              {/* Idle reallocations count insight */}
              <div className="flex justify-between items-center py-2.5 border-b border-slate-900/60">
                <span className="text-xs text-slate-400 font-medium">Idle Assets for Reallocation</span>
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  idleCount > 0 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "text-slate-405 bg-slate-900"
                }`}>
                  {idleCount} Assets
                </span>
              </div>

              {/* Expirations countdown insight */}
              <div className="flex justify-between items-center py-2.5">
                <span className="text-xs text-slate-400 font-medium">Upcoming Warranty Expirations</span>
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  upcomingWarrantyExpirationsCount > 0 ? "bg-pink-500/10 text-pink-400 border border-pink-500/20" : "text-slate-405 bg-slate-900"
                }`}>
                  {upcomingWarrantyExpirationsCount} Contract{upcomingWarrantyExpirationsCount === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ACTION 1: Register Asset Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass w-full max-w-lg rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle size={18} className="text-violet-400" />
                Register Corporate Asset
              </h3>
              <button onClick={() => setIsRegisterOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Asset Name</label>
                  <input
                    type="text" required placeholder="e.g. Dell Workstation, Office Sofa"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                    value={newAsset.name} onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                    <select
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none"
                      value={newAsset.category} onChange={(e) => setNewAsset({...newAsset, category: e.target.value})}
                    >
                      <option value="IT Hardware">IT Hardware</option>
                      <option value="Networking">Networking</option>
                      <option value="Vehicles">Vehicles</option>
                      <option value="Office Furniture">Office Furniture</option>
                      <option value="Office Equipment">Office Equipment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Condition</label>
                    <select
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none"
                      value={newAsset.condition} onChange={(e) => setNewAsset({...newAsset, condition: e.target.value})}
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Purchase Date</label>
                    <input
                      type="date" required
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                      value={newAsset.purchaseDate} onChange={(e) => setNewAsset({...newAsset, purchaseDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Warranty (Years)</label>
                    <input
                      type="number" min="0" required
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                      value={newAsset.warrantyYears} onChange={(e) => setNewAsset({...newAsset, warrantyYears: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cost (USD)</label>
                  <input
                    type="number" min="0" required placeholder="e.g. 1200"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                    value={newAsset.cost} onChange={(e) => setNewAsset({...newAsset, cost: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    rows="3" placeholder="Enter hardware serial numbers or location codes..."
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                    value={newAsset.description} onChange={(e) => setNewAsset({...newAsset, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsRegisterOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl cursor-pointer">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTION 2: Allocate Asset Modal */}
      {isAllocateOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass w-full max-w-md rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus size={18} className="text-indigo-400" />
                Allocate Corporate Resource
              </h3>
              <button onClick={() => setIsAllocateOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleAllocateSubmit} className="p-6 space-y-4">
              {availableAssetsList.length > 0 ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Available Asset</label>
                    <select
                      required className="w-full glass-input rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none"
                      value={allocAssetId} onChange={(e) => setAllocAssetId(e.target.value)}
                    >
                      <option value="">-- Choose Asset --</option>
                      {availableAssetsList.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Custodian Name</label>
                    <input
                      type="text" required placeholder="e.g. Sarah Jenkins (Design Lab)"
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                      value={allocUser} onChange={(e) => setAllocUser(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                    <button type="button" onClick={() => setIsAllocateOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-405 hover:text-white uppercase tracking-wider cursor-pointer">Cancel</button>
                    <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl cursor-pointer">Confirm Allocation</button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <AlertTriangle size={24} className="text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-350">No Available Assets</p>
                  <p className="text-xs text-slate-500 mt-1">All assets are currently Allocated or Under Maintenance.</p>
                  <button type="button" onClick={() => setIsAllocateOpen(false)} className="mt-4 px-4 py-2 bg-slate-800 text-xs text-white rounded-lg cursor-pointer">Close</button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ACTION 3: Log Maintenance Modal */}
      {isMaintenanceOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass w-full max-w-md rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Wrench size={18} className="text-orange-400" />
                Log Maintenance Request
              </h3>
              <button onClick={() => setIsMaintenanceOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleMaintenanceSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Fleet Asset</label>
                <select
                  required className="w-full glass-input rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none"
                  value={maintAssetId} onChange={(e) => setMaintAssetId(e.target.value)}
                >
                  <option value="">-- Choose Asset --</option>
                  {assets.filter(a => a.status !== 'Under Maintenance' && a.status !== 'Disposed').map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Service Check Description</label>
                <textarea
                  rows="3" required placeholder="Describe checkups, e.g., Replace system memory, regular oil rotation..."
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                  value={maintNotes} onChange={(e) => setMaintNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsMaintenanceOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-405 hover:text-white uppercase tracking-wider cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-xl cursor-pointer">Log Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTION 4: System Audit Summary Modal */}
      {isAuditOpen && auditReport && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass w-full max-w-md rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ClipboardList size={18} className="text-emerald-400" />
                Fleet Audit Results
              </h3>
              <button onClick={() => setIsAuditOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center py-4 bg-slate-950/30 rounded-xl border border-slate-900">
                <span className="text-xs text-slate-400 block uppercase tracking-wider">Compliance Index Rating</span>
                <span className="text-4xl font-extrabold text-white block mt-1.5">{auditReport.complianceRate}%</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">Fleet Scanned:</span>
                  <span className="text-white font-mono font-semibold">{auditReport.scannedCount} Assets</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">Critical Anomalies Detected:</span>
                  <span className={`font-semibold ${auditReport.criticalAnomalies > 0 ? 'text-red-400' : 'text-slate-350'}`}>{auditReport.criticalAnomalies}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">Service Checks Overdue:</span>
                  <span className={`font-semibold ${auditReport.overdueMaint > 0 ? 'text-orange-400' : 'text-slate-350'}`}>{auditReport.overdueMaint}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">Idle Devices (&gt;30d):</span>
                  <span className="text-white font-semibold">{auditReport.idleDevices}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Warranties Expired / Expiring:</span>
                  <span className="text-white font-semibold">{auditReport.warrantyIssues}</span>
                </div>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850 mt-4 text-xs text-slate-450 leading-relaxed">
                <strong>Rule-Based Audit Report:</strong> The fleet audit is verified complete. Risk factors are classified. Reallocate idle inventories and run maintenance check-ups.
              </div>
              <div className="flex justify-end pt-3 border-t border-slate-800 mt-5">
                <button onClick={() => setIsAuditOpen(false)} className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl cursor-pointer">Acknowledge Report</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
