import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { mockDb } from '../mockDb';
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
  PlusCircle,
  CornerDownLeft,
  XCircle,
  HelpCircle,
  Save,
  X,
  Plus
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
    mockDb.getAssetAsync(id).then(data => {
      if (!data) {
        navigate('/assets');
        return;
      }
      setAsset(data);
      setEditForm(data);
    });
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
          dark: '#0f172a',
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

  // Actions with Optimistic UI State Updates
  const handleEditSubmit = (e) => {
    e.preventDefault();
    const previousAsset = { ...asset };
    
    // Optimistic Update
    const rawUpdated = {
      ...asset,
      name: editForm.name,
      category: editForm.category,
      purchaseDate: editForm.purchaseDate,
      warrantyYears: parseInt(editForm.warrantyYears) || 2,
      cost: parseFloat(editForm.cost) || 0,
      description: editForm.description,
      condition: editForm.condition,
    };
    
    // Simulate dynamic updates
    const end = new Date("2026-07-12");
    const start = new Date(rawUpdated.purchaseDate);
    const age = Math.max(0, end - start) / (1000 * 60 * 60 * 24 * 365.25);
    const agePenalty = Math.round(age * 2 * 10) / 10;
    const maintenancePenalty = rawUpdated.maintenanceCount * 5;
    let conditionPenalty = 0;
    if (rawUpdated.condition === "Good") conditionPenalty = 5;
    else if (rawUpdated.condition === "Fair") conditionPenalty = 10;
    else if (rawUpdated.condition === "Poor") conditionPenalty = 20;

    const purchase = new Date(rawUpdated.purchaseDate);
    const warrantyEnd = new Date(purchase.setFullYear(purchase.getFullYear() + rawUpdated.warrantyYears));
    const warrantyDaysLeft = Math.floor((warrantyEnd - end) / (1000 * 60 * 60 * 24));
    const isWarrantyExpired = warrantyDaysLeft <= 0;
    let warrantyPenalty = isWarrantyExpired ? 10 : (warrantyDaysLeft <= 30 ? 5 : 0);

    const healthScore = Math.max(0, Math.min(100, Math.round(100 - agePenalty - maintenancePenalty - conditionPenalty - warrantyPenalty)));

    setAsset({
      ...rawUpdated,
      age: parseFloat(age.toFixed(2)),
      healthScore,
      healthStatus: healthScore >= 70 ? "Healthy" : healthScore >= 40 ? "Warning" : "Critical",
      healthColor: healthScore >= 70 ? "green" : healthScore >= 40 ? "yellow" : "red",
      maintenancePriority: healthScore >= 90 ? "Low" : healthScore >= 70 ? "Medium" : healthScore >= 40 ? "High" : "Critical",
      warrantyDaysLeft: isWarrantyExpired ? 0 : warrantyDaysLeft,
      isWarrantyExpired,
      warrantyStatusText: isWarrantyExpired ? "Expired" : `${warrantyDaysLeft} Days Left`,
      healthBreakdown: {
        base: 100, age: parseFloat(age.toFixed(2)), agePenalty,
        maintenanceCount: rawUpdated.maintenanceCount, maintenancePenalty,
        condition: rawUpdated.condition, conditionPenalty,
        warrantyDaysLeft: isWarrantyExpired ? 0 : warrantyDaysLeft, warrantyPenalty,
        rawScore: 100 - agePenalty - maintenancePenalty - conditionPenalty - warrantyPenalty
      }
    });
    setIsEditOpen(false);

    mockDb.updateAssetAsync(asset.id, editForm)
      .then(() => {
        loadAsset();
      })
      .catch((err) => {
        setAsset(previousAsset);
        console.error(err);
      });
  };

  const handleAllocate = (e) => {
    e.preventDefault();
    if (!allocUser.trim()) return;

    const previousAsset = { ...asset };

    // Optimistic Update
    const rawAsset = {
      ...asset,
      status: "Allocated",
      currentUser: allocUser,
      history: [...(asset.history || []), { date: "2026-07-12", type: "Allocated", note: `Allocated to ${allocUser} (Optimistic UI).` }]
    };

    const age = calculateAge(rawAsset.purchaseDate);
    const agePenalty = Math.round(age * 2 * 10) / 10;
    const maintenancePenalty = rawAsset.maintenanceCount * 5;
    let conditionPenalty = 0;
    if (rawAsset.condition === "Good") conditionPenalty = 5;
    else if (rawAsset.condition === "Fair") conditionPenalty = 10;
    else if (rawAsset.condition === "Poor") conditionPenalty = 20;

    const purchase = new Date(rawAsset.purchaseDate);
    const warrantyEnd = new Date(purchase.setFullYear(purchase.getFullYear() + rawAsset.warrantyYears));
    const warrantyDaysLeft = Math.floor((warrantyEnd - new Date("2026-07-12")) / (1000 * 60 * 60 * 24));
    const isWarrantyExpired = warrantyDaysLeft <= 0;
    let warrantyPenalty = isWarrantyExpired ? 10 : (warrantyDaysLeft <= 30 ? 5 : 0);

    const healthScore = Math.max(0, Math.min(100, Math.round(100 - agePenalty - maintenancePenalty - conditionPenalty - warrantyPenalty)));

    setAsset({
      ...rawAsset,
      age: parseFloat(age.toFixed(2)),
      healthScore,
      healthStatus: healthScore >= 70 ? "Healthy" : healthScore >= 40 ? "Warning" : "Critical",
      healthColor: healthScore >= 70 ? "green" : healthScore >= 40 ? "yellow" : "red",
      maintenancePriority: healthScore >= 90 ? "Low" : healthScore >= 70 ? "Medium" : healthScore >= 40 ? "High" : "Critical",
      efficiency: 85,
      efficiencyLevel: "High",
      isIdle: false,
      idleDays: 0,
      recommendation: healthScore < 40 ? "Replace Asset" : (rawAsset.condition === "Poor" ? "Repair Asset" : "Operating Normally"),
      warrantyDaysLeft: isWarrantyExpired ? 0 : warrantyDaysLeft,
      isWarrantyExpired,
      warrantyStatusText: isWarrantyExpired ? "Expired" : `${warrantyDaysLeft} Days Left`,
      healthBreakdown: {
        base: 100, age: parseFloat(age.toFixed(2)), agePenalty,
        maintenanceCount: rawAsset.maintenanceCount, maintenancePenalty,
        condition: rawAsset.condition, conditionPenalty,
        warrantyDaysLeft: isWarrantyExpired ? 0 : warrantyDaysLeft, warrantyPenalty,
        rawScore: 100 - agePenalty - maintenancePenalty - conditionPenalty - warrantyPenalty
      }
    });
    setIsAllocateOpen(false);

    mockDb.allocateAssetAsync(asset.id, allocUser)
      .then(() => {
        loadAsset();
      })
      .catch((err) => {
        setAsset(previousAsset);
        console.error(err);
      });

    setAllocUser('');
  };

  const handleReturn = () => {
    if (window.confirm("Confirm return of this asset to inventory?")) {
      const previousAsset = { ...asset };

      // Optimistic Update
      const prevUser = asset.currentUser;
      const rawAsset = {
        ...asset,
        status: "Available",
        currentUser: null,
        history: [...(asset.history || []), { date: "2026-07-12", type: "Returned", note: `Returned by ${prevUser || "allocated user"}. Cleaned & checked (Optimistic UI).` }]
      };

      const age = calculateAge(rawAsset.purchaseDate);
      const agePenalty = Math.round(age * 2 * 10) / 10;
      const maintenancePenalty = rawAsset.maintenanceCount * 5;
      let conditionPenalty = 0;
      if (rawAsset.condition === "Good") conditionPenalty = 5;
      else if (rawAsset.condition === "Fair") conditionPenalty = 10;
      else if (rawAsset.condition === "Poor") conditionPenalty = 20;

      const purchase = new Date(rawAsset.purchaseDate);
      const warrantyEnd = new Date(purchase.setFullYear(purchase.getFullYear() + rawAsset.warrantyYears));
      const warrantyDaysLeft = Math.floor((warrantyEnd - new Date("2026-07-12")) / (1000 * 60 * 60 * 24));
      const isWarrantyExpired = warrantyDaysLeft <= 0;
      let warrantyPenalty = isWarrantyExpired ? 10 : (warrantyDaysLeft <= 30 ? 5 : 0);

      const healthScore = Math.max(0, Math.min(100, Math.round(100 - agePenalty - maintenancePenalty - conditionPenalty - warrantyPenalty)));

      setAsset({
        ...rawAsset,
        age: parseFloat(age.toFixed(2)),
        healthScore,
        healthStatus: healthScore >= 70 ? "Healthy" : healthScore >= 40 ? "Warning" : "Critical",
        healthColor: healthScore >= 70 ? "green" : healthScore >= 40 ? "yellow" : "red",
        maintenancePriority: healthScore >= 90 ? "Low" : healthScore >= 70 ? "Medium" : healthScore >= 40 ? "High" : "Critical",
        efficiency: 30, // lowered
        efficiencyLevel: "Moderate",
        isIdle: true,
        idleDays: 0,
        recommendation: "Allocate",
        warrantyDaysLeft: isWarrantyExpired ? 0 : warrantyDaysLeft,
        isWarrantyExpired,
        warrantyStatusText: isWarrantyExpired ? "Expired" : `${warrantyDaysLeft} Days Left`,
        healthBreakdown: {
          base: 100, age: parseFloat(age.toFixed(2)), agePenalty,
          maintenanceCount: rawAsset.maintenanceCount, maintenancePenalty,
          condition: rawAsset.condition, conditionPenalty,
          warrantyDaysLeft: isWarrantyExpired ? 0 : warrantyDaysLeft, warrantyPenalty,
          rawScore: 100 - agePenalty - maintenancePenalty - conditionPenalty - warrantyPenalty
        }
      });

      mockDb.returnAssetAsync(asset.id)
        .then(() => {
          loadAsset();
        })
        .catch((err) => {
          setAsset(previousAsset);
          console.error(err);
        });
    }
  };

  const handleMaintenance = (e) => {
    e.preventDefault();
    const previousAsset = { ...asset };

    // Optimistic Update
    const rawAsset = {
      ...asset,
      status: "Under Maintenance",
      maintenanceCount: asset.maintenanceCount + 1,
      history: [...(asset.history || []), { date: "2026-07-12", type: "Maintenance", note: maintNotes || "Service request logged (Optimistic UI)." }]
    };

    const age = calculateAge(rawAsset.purchaseDate);
    const agePenalty = Math.round(age * 2 * 10) / 10;
    const maintenancePenalty = rawAsset.maintenanceCount * 5;
    let conditionPenalty = 0;
    if (rawAsset.condition === "Good") conditionPenalty = 5;
    else if (rawAsset.condition === "Fair") conditionPenalty = 10;
    else if (rawAsset.condition === "Poor") conditionPenalty = 20;

    const purchase = new Date(rawAsset.purchaseDate);
    const warrantyEnd = new Date(purchase.setFullYear(purchase.getFullYear() + rawAsset.warrantyYears));
    const warrantyDaysLeft = Math.floor((warrantyEnd - new Date("2026-07-12")) / (1000 * 60 * 60 * 24));
    const isWarrantyExpired = warrantyDaysLeft <= 0;
    let warrantyPenalty = isWarrantyExpired ? 10 : (warrantyDaysLeft <= 30 ? 5 : 0);

    const healthScore = Math.max(0, Math.min(100, Math.round(100 - agePenalty - maintenancePenalty - conditionPenalty - warrantyPenalty)));

    setAsset({
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
        condition: rawAsset.condition, conditionPenalty,
        warrantyDaysLeft: isWarrantyExpired ? 0 : warrantyDaysLeft, warrantyPenalty,
        rawScore: 100 - agePenalty - maintenancePenalty - conditionPenalty - warrantyPenalty
      }
    });
    setIsMaintenanceOpen(false);

    mockDb.logMaintenanceAsync(asset.id, maintNotes)
      .then(() => {
        loadAsset();
      })
      .catch((err) => {
        setAsset(previousAsset);
        console.error(err);
      });

    setMaintNotes('');
  };

  const handleCompleteMaintenance = () => {
    if (window.confirm("Complete maintenance and return asset to service?")) {
      const previousAsset = { ...asset };

      // Optimistic Update
      const rawAsset = {
        ...asset,
        status: "Available",
        history: [...(asset.history || []), { date: "2026-07-12", type: "Returned", note: "Maintenance completed. Returned to Available pool (Optimistic UI)." }]
      };

      const age = calculateAge(rawAsset.purchaseDate);
      const agePenalty = Math.round(age * 2 * 10) / 10;
      const maintenancePenalty = rawAsset.maintenanceCount * 5;
      let conditionPenalty = 0;
      if (rawAsset.condition === "Good") conditionPenalty = 5;
      else if (rawAsset.condition === "Fair") conditionPenalty = 10;
      else if (rawAsset.condition === "Poor") conditionPenalty = 20;

      const purchase = new Date(rawAsset.purchaseDate);
      const warrantyEnd = new Date(purchase.setFullYear(purchase.getFullYear() + rawAsset.warrantyYears));
      const warrantyDaysLeft = Math.floor((warrantyEnd - new Date("2026-07-12")) / (1000 * 60 * 60 * 24));
      const isWarrantyExpired = warrantyDaysLeft <= 0;
      let warrantyPenalty = isWarrantyExpired ? 10 : (warrantyDaysLeft <= 30 ? 5 : 0);

      const healthScore = Math.max(0, Math.min(100, Math.round(100 - agePenalty - maintenancePenalty - conditionPenalty - warrantyPenalty)));

      setAsset({
        ...rawAsset,
        age: parseFloat(age.toFixed(2)),
        healthScore,
        healthStatus: healthScore >= 70 ? "Healthy" : healthScore >= 40 ? "Warning" : "Critical",
        healthColor: healthScore >= 70 ? "green" : healthScore >= 40 ? "yellow" : "red",
        maintenancePriority: healthScore >= 90 ? "Low" : healthScore >= 70 ? "Medium" : healthScore >= 40 ? "High" : "Critical",
        efficiency: 30,
        efficiencyLevel: "Moderate",
        isIdle: true,
        idleDays: 0,
        recommendation: "Allocate",
        warrantyDaysLeft: isWarrantyExpired ? 0 : warrantyDaysLeft,
        isWarrantyExpired,
        warrantyStatusText: isWarrantyExpired ? "Expired" : `${warrantyDaysLeft} Days Left`,
        healthBreakdown: {
          base: 100, age: parseFloat(age.toFixed(2)), agePenalty,
          maintenanceCount: rawAsset.maintenanceCount, maintenancePenalty,
          condition: rawAsset.condition, conditionPenalty,
          warrantyDaysLeft: isWarrantyExpired ? 0 : warrantyDaysLeft, warrantyPenalty,
          rawScore: 100 - agePenalty - maintenancePenalty - conditionPenalty - warrantyPenalty
        }
      });

      mockDb.completeMaintenanceAsync(asset.id, "Available")
        .then(() => {
          loadAsset();
        })
        .catch((err) => {
          setAsset(previousAsset);
          console.error(err);
        });
    }
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!transferUser.trim()) return;

    const previousAsset = { ...asset };

    // Optimistic Update
    const oldUser = asset.currentUser;
    const rawAsset = {
      ...asset,
      status: "Allocated",
      currentUser: transferUser,
      history: [...(asset.history || []), { date: "2026-07-12", type: "Transfer", note: `Transferred ownership from ${oldUser || "unassigned"} to ${transferUser} (Optimistic UI).` }]
    };

    const age = calculateAge(rawAsset.purchaseDate);
    const agePenalty = Math.round(age * 2 * 10) / 10;
    const maintenancePenalty = rawAsset.maintenanceCount * 5;
    let conditionPenalty = 0;
    if (rawAsset.condition === "Good") conditionPenalty = 5;
    else if (rawAsset.condition === "Fair") conditionPenalty = 10;
    else if (rawAsset.condition === "Poor") conditionPenalty = 20;

    const purchase = new Date(rawAsset.purchaseDate);
    const warrantyEnd = new Date(purchase.setFullYear(purchase.getFullYear() + rawAsset.warrantyYears));
    const warrantyDaysLeft = Math.floor((warrantyEnd - new Date("2026-07-12")) / (1000 * 60 * 60 * 24));
    const isWarrantyExpired = warrantyDaysLeft <= 0;
    let warrantyPenalty = isWarrantyExpired ? 10 : (warrantyDaysLeft <= 30 ? 5 : 0);

    const healthScore = Math.max(0, Math.min(100, Math.round(100 - agePenalty - maintenancePenalty - conditionPenalty - warrantyPenalty)));

    setAsset({
      ...rawAsset,
      age: parseFloat(age.toFixed(2)),
      healthScore,
      healthStatus: healthScore >= 70 ? "Healthy" : healthScore >= 40 ? "Warning" : "Critical",
      healthColor: healthScore >= 70 ? "green" : healthScore >= 40 ? "yellow" : "red",
      maintenancePriority: healthScore >= 90 ? "Low" : healthScore >= 70 ? "Medium" : healthScore >= 40 ? "High" : "Critical",
      efficiency: 85,
      efficiencyLevel: "High",
      isIdle: false,
      idleDays: 0,
      recommendation: healthScore < 40 ? "Replace Asset" : (rawAsset.condition === "Poor" ? "Repair Asset" : "Operating Normally"),
      warrantyDaysLeft: isWarrantyExpired ? 0 : warrantyDaysLeft,
      isWarrantyExpired,
      warrantyStatusText: isWarrantyExpired ? "Expired" : `${warrantyDaysLeft} Days Left`,
      healthBreakdown: {
        base: 100, age: parseFloat(age.toFixed(2)), agePenalty,
        maintenanceCount: rawAsset.maintenanceCount, maintenancePenalty,
        condition: rawAsset.condition, conditionPenalty,
        warrantyDaysLeft: isWarrantyExpired ? 0 : warrantyDaysLeft, warrantyPenalty,
        rawScore: 100 - agePenalty - maintenancePenalty - conditionPenalty - warrantyPenalty
      }
    });
    setIsTransferOpen(false);

    mockDb.transferAssetAsync(asset.id, transferUser)
      .then(() => {
        loadAsset();
      })
      .catch((err) => {
        setAsset(previousAsset);
        console.error(err);
      });

    setTransferUser('');
  };

  const handleDispose = () => {
    if (window.confirm(`Confirm decommissioning and disposal of asset ${asset.id}?`)) {
      const previousAsset = { ...asset };

      // Optimistic Update
      const rawAsset = {
        ...asset,
        status: "Disposed",
        currentUser: null,
        history: [...(asset.history || []), { date: "2026-07-12", type: "Disposed", note: "Decommissioned and disposed (Optimistic UI)." }]
      };

      const age = calculateAge(rawAsset.purchaseDate);
      const agePenalty = Math.round(age * 2 * 10) / 10;
      const maintenancePenalty = rawAsset.maintenanceCount * 5;
      let conditionPenalty = 0;
      if (rawAsset.condition === "Good") conditionPenalty = 5;
      else if (rawAsset.condition === "Fair") conditionPenalty = 10;
      else if (rawAsset.condition === "Poor") conditionPenalty = 20;

      const purchase = new Date(rawAsset.purchaseDate);
      const warrantyEnd = new Date(purchase.setFullYear(purchase.getFullYear() + rawAsset.warrantyYears));
      const warrantyDaysLeft = Math.floor((warrantyEnd - new Date("2026-07-12")) / (1000 * 60 * 60 * 24));
      const isWarrantyExpired = warrantyDaysLeft <= 0;
      let warrantyPenalty = isWarrantyExpired ? 10 : (warrantyDaysLeft <= 30 ? 5 : 0);

      const healthScore = Math.max(0, Math.min(100, Math.round(100 - agePenalty - maintenancePenalty - conditionPenalty - warrantyPenalty)));

      setAsset({
        ...rawAsset,
        age: parseFloat(age.toFixed(2)),
        healthScore,
        healthStatus: "Critical",
        healthColor: "red",
        maintenancePriority: "Critical",
        efficiency: 0,
        efficiencyLevel: "Low",
        isIdle: false,
        idleDays: 0,
        recommendation: "Replace Asset",
        warrantyDaysLeft: isWarrantyExpired ? 0 : warrantyDaysLeft,
        isWarrantyExpired,
        warrantyStatusText: isWarrantyExpired ? "Expired" : `${warrantyDaysLeft} Days Left`,
        healthBreakdown: {
          base: 100, age: parseFloat(age.toFixed(2)), agePenalty,
          maintenanceCount: rawAsset.maintenanceCount, maintenancePenalty,
          condition: rawAsset.condition, conditionPenalty,
          warrantyDaysLeft: isWarrantyExpired ? 0 : warrantyDaysLeft, warrantyPenalty,
          rawScore: 100 - agePenalty - maintenancePenalty - conditionPenalty - warrantyPenalty
        }
      });

      mockDb.disposeAssetAsync(asset.id)
        .then(() => {
          loadAsset();
        })
        .catch((err) => {
          setAsset(previousAsset);
          console.error(err);
        });
    }
  };

  // Inline dynamic calculation helper for optimistic updates
  function calculateAge(purchaseDate) {
    const end = new Date("2026-07-12");
    const start = new Date(purchaseDate);
    const diffTime = Math.max(0, end - start);
    return diffTime / (1000 * 60 * 60 * 24 * 365.25);
  }

  const handleDelete = () => {
    if (window.confirm(`Are you absolutely sure you want to delete asset ${asset.id} permanently?`)) {
      mockDb.deleteAsset(asset.id);
      navigate('/assets');
    }
  };

  // Timeline icon and color helpers
  const getTimelineEventStyles = (type) => {
    switch (type) {
      case 'Created':
        return {
          icon: PlusCircle,
          color: 'text-violet-400',
          bg: 'bg-violet-650/15 border-violet-500/30',
          badge: 'bg-violet-500/10 text-violet-400 border-violet-500/25'
        };
      case 'Allocated':
        return {
          icon: UserPlus,
          color: 'text-indigo-400',
          bg: 'bg-indigo-650/15 border-indigo-500/30',
          badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25'
        };
      case 'Returned':
        return {
          icon: CornerDownLeft,
          color: 'text-emerald-400',
          bg: 'bg-emerald-650/15 border-emerald-500/30',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
        };
      case 'Maintenance':
        return {
          icon: Wrench,
          color: 'text-orange-400',
          bg: 'bg-orange-650/15 border-orange-500/30',
          badge: 'bg-orange-500/10 text-orange-400 border-orange-500/25'
        };
      case 'Transfer':
        return {
          icon: RefreshCw,
          color: 'text-blue-400',
          bg: 'bg-blue-650/15 border-blue-500/30',
          badge: 'bg-blue-500/10 text-blue-400 border-blue-500/25'
        };
      case 'Disposed':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bg: 'bg-red-650/15 border-red-500/30',
          badge: 'bg-red-500/10 text-red-400 border-red-500/25'
        };
      default:
        return {
          icon: HelpCircle,
          color: 'text-slate-400',
          bg: 'bg-slate-800/15 border-slate-700/30',
          badge: 'bg-slate-800 text-slate-400 border-slate-750'
        };
    }
  };

  const getHealthColorClasses = (color) => {
    switch (color) {
      case 'green':
        return {
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/20',
          border: 'border-emerald-500/30'
        };
      case 'yellow':
        return {
          text: 'text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/20',
          border: 'border-amber-500/30'
        };
      case 'red':
        return {
          text: 'text-red-400',
          bg: 'bg-red-500/10 border-red-500/20',
          border: 'border-red-500/30'
        };
      default:
        return {
          text: 'text-slate-400',
          bg: 'bg-slate-800 border-slate-700',
          border: 'border-slate-800'
        };
    }
  };

  const currentHealthStyle = getHealthColorClasses(asset.healthColor);
  const bd = asset.healthBreakdown;

  const getRecommendationBadge = (rec) => {
    switch(rec) {
      case 'Replace Asset':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-950/40 border border-red-800/45 text-red-400 flex items-center gap-1 w-max">⚠️ Replace</span>;
      case 'Repair Asset':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-orange-950/40 border border-orange-800/45 text-orange-400 flex items-center gap-1 w-max">🔧 Repair</span>;
      case 'Reallocate Asset':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-950/40 border border-amber-800/45 text-amber-400 flex items-center gap-1 w-max">🔄 Reallocate</span>;
      case 'Renew Warranty':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-pink-950/40 border border-pink-800/45 text-pink-400 flex items-center gap-1 w-max">🛡️ Renew Contract</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1 w-max">✓ Normal</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/assets" 
          className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 transition-all duration-300"
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
          <p className="text-slate-400 text-xs mt-1">{asset.category} &bull; Condition: {asset.condition} &bull; Registered {new Date(asset.purchaseDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Identity Specs & Operations */}
        <div className="space-y-6 lg:col-span-1">
          {/* QR Card */}
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest self-start mb-4">Identity Code</h3>
            
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
                <RefreshCw className="animate-spin text-slate-650" />
              </div>
            )}
            
            <p className="text-[10px] text-slate-500 mt-4 max-w-[200px]">
              Scannable hardware tag. Opens this record page.
            </p>

            <div className="w-full text-left bg-slate-950/30 border border-slate-900/60 p-4 rounded-xl mt-6 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Asset Tag ID:</span>
                <span className="font-mono text-slate-350 font-bold">{asset.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="text-slate-350 font-semibold">{asset.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Initial Condition:</span>
                <span className="text-slate-355 font-semibold">{asset.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Capital Cost:</span>
                <span className="font-mono text-slate-350 font-semibold">${asset.cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Purchase Date:</span>
                <span className="text-slate-350 font-semibold">{asset.purchaseDate}</span>
              </div>
              <div className="border-t border-slate-900/60 pt-2.5 mt-1">
                <span className="text-slate-500 block mb-1">Description:</span>
                <p className="text-slate-400 leading-normal">{asset.description || 'No description logged.'}</p>
              </div>
            </div>
          </div>

          {/* Operations card */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Operations Console</h3>
            
            {asset.status === 'Disposed' ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                <XCircle className="text-red-500 mx-auto mb-2" size={24} />
                <h4 className="text-sm font-bold text-red-400">Asset Decommissioned</h4>
                <p className="text-xs text-slate-500 mt-1">This hardware has been fully disposed. No active operations permitted.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {asset.status === 'Available' && (
                  <button
                    onClick={() => setIsAllocateOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-medium py-2.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer text-sm"
                  >
                    <UserPlus size={15} />
                    Allocate Asset
                  </button>
                )}
                
                {asset.status === 'Allocated' && (
                  <>
                    <button
                      onClick={handleReturn}
                      className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-205 border border-slate-700 py-2.5 px-4 rounded-xl transition-all cursor-pointer text-sm"
                    >
                      <UserMinus size={15} />
                      Return to Stock
                    </button>
                    <button
                      onClick={() => setIsTransferOpen(true)}
                      className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-205 border border-slate-700 py-2.5 px-4 rounded-xl transition-all cursor-pointer text-sm"
                    >
                      <RefreshCw size={15} />
                      Transfer Custodian
                    </button>
                  </>
                )}

                {asset.status !== 'Under Maintenance' ? (
                  <button
                    onClick={() => setIsMaintenanceOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-orange-650/20 hover:bg-orange-650/35 border border-orange-500/20 text-orange-400 font-medium py-2.5 px-4 rounded-xl transition-all cursor-pointer text-sm"
                  >
                    <Wrench size={15} />
                    Log Maintenance
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteMaintenance}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer text-sm"
                  >
                    <CheckCircle size={15} />
                    Complete Maintenance
                  </button>
                )}

                {/* Dispose Button */}
                <button
                  onClick={handleDispose}
                  className="w-full flex items-center justify-center gap-2 bg-red-950/20 hover:bg-red-950/45 border border-red-500/15 text-red-400 font-medium py-2.5 px-4 rounded-xl transition-all cursor-pointer text-sm"
                >
                  <XCircle size={15} />
                  Decommission / Dispose
                </button>

                {/* Edit & Delete */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-900">
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 py-2 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer text-xs"
                  >
                    <Edit3 size={13} />
                    Edit Specs
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center justify-center gap-1.5 bg-red-950/10 hover:bg-red-950/20 border border-red-950/30 py-2 rounded-lg text-red-500 hover:text-red-400 transition-all cursor-pointer text-xs"
                  >
                    <Trash2 size={13} />
                    Delete Asset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Calculations breakdowns */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Top intelligence card row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Health Score breakdown card */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Intelligent Health</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Dynamic arithmetic breakdown.</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentHealthStyle.bg} ${currentHealthStyle.text}`}>
                    Priority: {asset.maintenancePriority}
                  </span>
                </div>

                <div className="flex items-baseline gap-2.5 mt-5">
                  <span className={`text-5xl font-extrabold tracking-tight ${currentHealthStyle.text}`}>{asset.healthScore}</span>
                  <span className="text-slate-500 text-sm font-bold">/ 100</span>
                </div>
              </div>

              {/* Dynamic Health Score calculation breakdown */}
              <div className="space-y-2.5 mt-6 border-t border-slate-900 pt-4 text-xs">
                <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Dynamic Score Calculation</span>
                
                <div className="space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-900 font-mono text-[11px] text-slate-350">
                  <div className="flex justify-between">
                    <span>Base Health Value</span>
                    <span className="text-white">+100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Age Penalty ({bd.age} yrs × 2)</span>
                    <span className="text-red-400">-{bd.agePenalty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maintenance ({bd.maintenanceCount} logs × 5)</span>
                    <span className="text-red-400">-{bd.maintenancePenalty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Condition ({bd.condition} Grade)</span>
                    <span className="text-red-400">-{bd.conditionPenalty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Warranty ({bd.warrantyDaysLeft}d remaining)</span>
                    <span className="text-red-400">-{bd.warrantyPenalty}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-1.5 mt-1 flex justify-between font-bold text-white">
                    <span>Final Clamped Score</span>
                    <span className={currentHealthStyle.text}>{asset.healthScore}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Efficiency Score Card */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Intelligent Efficiency</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Asset usage metrics tracker.</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    asset.efficiencyLevel === "High" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" :
                    asset.efficiencyLevel === "Moderate" ? "bg-amber-500/10 text-amber-400 border border-amber-500/25" :
                    "bg-red-500/10 text-red-400 border border-red-500/25"
                  }`}>
                    {asset.efficiencyLevel}
                  </span>
                </div>

                <div className="flex items-baseline gap-2.5 mt-5">
                  <span className="text-5xl font-extrabold tracking-tight text-white">{asset.efficiency}%</span>
                  <span className="text-slate-500 text-sm font-bold">Efficiency</span>
                </div>
              </div>

              {/* Progress bar and details */}
              <div className="space-y-3 mt-6 border-t border-slate-900 pt-4 text-xs">
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      asset.efficiencyLevel === "High" ? "bg-emerald-500" :
                      asset.efficiencyLevel === "Moderate" ? "bg-amber-500" :
                      "bg-red-500"
                    }`}
                    style={{ width: `${asset.efficiency}%` }}
                  ></div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 leading-normal">
                  <p><strong>Efficiency Formula:</strong></p>
                  <code className="text-[10px] block p-2 bg-slate-950/40 rounded-lg text-slate-300 font-mono text-center">
                    (Allocated Days / Total Age in Days) * 100
                  </code>
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-900 text-[11px]">
                    <div>
                      <span className="text-slate-500 block uppercase text-[9px] font-bold">Custodian</span>
                      <span className="text-slate-300 font-semibold">{asset.currentUser || 'Unassigned stock'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[9px] font-bold">Idle State</span>
                      <span className="text-slate-300 font-semibold">{asset.status === 'Available' ? `${asset.idleDays} Days` : 'N/A (Active)'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Recommendations, Warranty, Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Recommendations & Warranty Panel */}
            <div className="glass-card rounded-2xl p-6 md:col-span-1 flex flex-col justify-between h-[420px]">
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Recommendation</h3>
                  <p className="text-[10px] text-slate-500 mb-2.5">Rule-Based suggestions.</p>
                  {getRecommendationBadge(asset.recommendation)}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Warranty Panel</h3>
                  <p className="text-[10px] text-slate-500 mb-3.5">Contract status coverage.</p>
                  
                  <div className="flex flex-col items-center justify-center bg-slate-950/20 py-4 rounded-xl border border-slate-900">
                    <ShieldAlert size={28} className={`${asset.isWarrantyExpired ? 'text-red-500/60' : 'text-violet-500'} mb-2`} />
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Status</span>
                    <span className={`text-sm font-bold mt-0.5 ${asset.isWarrantyExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                      {asset.warrantyStatusText}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs space-y-2 border-t border-slate-900 pt-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Contract Duration:</span>
                  <span className="text-slate-300 font-semibold">{asset.warrantyYears} Years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contract Expired:</span>
                  <span className="text-slate-300 font-semibold font-mono">{asset.isWarrantyExpired ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Lifecycle Timeline Track */}
            <div className="glass-card rounded-2xl p-6 md:col-span-2 flex flex-col h-[420px]">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Lifecycle Event Trace</h3>
              <p className="text-[10px] text-slate-500 mb-5">History log events in chronologic order.</p>

              {/* Timeline Container */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-5">
                {asset.history && asset.history.length > 0 ? (
                  asset.history.map((event, index) => {
                    const isLast = index === asset.history.length - 1;
                    const style = getTimelineEventStyles(event.type);
                    const Icon = style.icon;

                    return (
                      <div key={index} className="flex gap-4 items-start relative">
                        {/* Dot indicator and timeline thread */}
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center z-10 shrink-0 ${style.bg} ${style.color}`}>
                            <Icon size={14} />
                          </div>
                          {!isLast && (
                            <div className="w-0.5 bg-slate-800 flex-1 min-h-[40px] my-1"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 bg-slate-900/40 border border-slate-900/60 rounded-xl p-3.5 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${style.badge}`}>
                              {event.type}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                              <Clock size={11} />
                              <span>{event.date}</span>
                            </div>
                          </div>
                          <p className="text-slate-400 mt-2 leading-relaxed">{event.note}</p>
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
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 size={18} className="text-violet-400" />
                Edit Asset Specifications
              </h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={20} /></button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Asset Name</label>
                  <input
                    type="text" required
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-105 focus:outline-none"
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
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Condition</label>
                    <select
                      className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none"
                      value={editForm.condition || ''}
                      onChange={(e) => setEditForm({...editForm, condition: e.target.value})}
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
                      value={editForm.purchaseDate || ''}
                      onChange={(e) => setEditForm({...editForm, purchaseDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Warranty (Years)</label>
                    <input
                      type="number" min="0" required
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                      value={editForm.warrantyYears || 0}
                      onChange={(e) => setEditForm({...editForm, warrantyYears: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cost (USD)</label>
                    <input
                      type="number" min="0" required
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
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl cursor-pointer flex items-center gap-1.5"><Save size={14} />Save Changes</button>
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
              <button onClick={() => setIsAllocateOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleAllocate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Custodian Name</label>
                <input
                  type="text" required placeholder="e.g. John Doe, Server Room 3"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                  value={allocUser} onChange={(e) => setAllocUser(e.target.value)}
                />
              </div>
              <div className="flex gap-3 justify-end pt-3">
                <button type="button" onClick={() => setIsAllocateOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-405 hover:text-white uppercase tracking-wider rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl cursor-pointer">Confirm Allocation</button>
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
              <button onClick={() => setIsMaintenanceOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleMaintenance} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Maintenance Notes</label>
                <textarea
                  rows="3" required placeholder="e.g. Replace keyboard keys, regular oil checks..."
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                  value={maintNotes} onChange={(e) => setMaintNotes(e.target.value)}
                />
                <p className="text-[10px] text-amber-500/80 mt-2">
                  * Note: Logging maintenance increments maintenance count and reduces overall health score.
                </p>
              </div>
              <div className="flex gap-3 justify-end pt-3">
                <button type="button" onClick={() => setIsMaintenanceOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-405 hover:text-white uppercase tracking-wider rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-xl cursor-pointer">Log Request</button>
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
              <button onClick={() => setIsTransferOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleTransfer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">New Custodian Name</label>
                <input
                  type="text" required placeholder="e.g. Alice Smith, Server Room 1"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                  value={transferUser} onChange={(e) => setTransferUser(e.target.value)}
                />
              </div>
              <div className="flex gap-3 justify-end pt-3">
                <button type="button" onClick={() => setIsTransferOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-405 hover:text-white uppercase tracking-wider rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl cursor-pointer">Confirm Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
