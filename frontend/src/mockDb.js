// Client-side mock database simulating SQLite for the AssetFlow Prototype
// Automatically updates intelligence fields dynamically based on calculations.

const INITIAL_ASSETS = [
  {
    id: "AF-0001",
    name: "MacBook Pro M3 Max",
    category: "IT Hardware",
    status: "Allocated",
    purchaseDate: "2024-05-10",
    maintenanceCount: 2,
    lastAllocatedDate: "2026-06-01",
    currentUser: "Aravind S (Developer)",
    warrantyYears: 3,
    cost: 3500,
    description: "High-end development laptop for software engineering staff.",
    condition: "Good",
    history: [
      { date: "2024-05-10", type: "Created", note: "Asset registered in system." },
      { date: "2024-05-12", type: "Allocated", note: "Assigned to Aravind S." },
      { date: "2025-01-15", type: "Maintenance", note: "Battery replacement & cleaning." },
      { date: "2025-01-18", type: "Returned", note: "Returned to inventory after maintenance." },
      { date: "2026-06-01", type: "Allocated", note: "Re-allocated to Aravind S." }
    ]
  },
  {
    id: "AF-0002",
    name: "Dell UltraSharp 32\" 4K Monitor",
    category: "IT Hardware",
    status: "Available",
    purchaseDate: "2023-01-15",
    maintenanceCount: 1,
    lastAllocatedDate: "2026-05-10",
    currentUser: null,
    warrantyYears: 3,
    cost: 900,
    description: "4K designer monitor for editing and coding layouts.",
    condition: "Excellent",
    history: [
      { date: "2023-01-15", type: "Created", note: "Asset registered in system." },
      { date: "2023-02-01", type: "Allocated", note: "Assigned to Design Lab." },
      { date: "2026-05-10", type: "Returned", note: "Returned by Design Lab. Cleaned and stored." }
    ]
  },
  {
    id: "AF-0003",
    name: "Tesla Model Y (Company Car)",
    category: "Vehicles",
    status: "Allocated",
    purchaseDate: "2022-09-01",
    maintenanceCount: 5,
    lastAllocatedDate: "2025-10-01",
    currentUser: "Sarah Connor (Sales VP)",
    warrantyYears: 5,
    cost: 48000,
    description: "Corporate vehicle for executive business travel & sales pitches.",
    condition: "Good",
    history: [
      { date: "2022-09-01", type: "Created", note: "Purchased and registered." },
      { date: "2022-09-10", type: "Allocated", note: "Assigned to Sales VP." },
      { date: "2023-08-12", type: "Maintenance", note: "Regular tire rotation & service." },
      { date: "2024-08-14", type: "Maintenance", note: "Annual vehicle inspection." }
    ]
  },
  {
    id: "AF-0004",
    name: "Cisco Router",
    category: "Networking",
    status: "Available",
    purchaseDate: "2020-03-12",
    maintenanceCount: 8,
    lastAllocatedDate: "2025-06-05",
    currentUser: null,
    warrantyYears: 5,
    cost: 4505,
    description: "Primary backbone switch router for local building network.",
    condition: "Poor",
    history: [
      { date: "2020-03-12", type: "Created", note: "Network equipment added." },
      { date: "2020-03-20", type: "Allocated", note: "Installed in Server Rack 2A." },
      { date: "2025-06-05", type: "Returned", note: "Dismantled due to rack upgrade. Marked available." }
    ]
  },
  {
    id: "AF-0005",
    name: "Ergonomic Office Chair (Steelcase)",
    category: "Office Furniture",
    status: "Available",
    purchaseDate: "2025-02-18",
    maintenanceCount: 0,
    lastAllocatedDate: null,
    currentUser: null,
    warrantyYears: 10,
    cost: 1200,
    description: "Premium ergonomic chair supporting lumbar postures.",
    condition: "Excellent",
    history: [
      { date: "2025-02-18", type: "Created", note: "Furniture inventory added." }
    ]
  },
  {
    id: "AF-0006",
    name: "iPad Pro 12.9 (Design Team)",
    category: "IT Hardware",
    status: "Under Maintenance",
    purchaseDate: "2024-11-20",
    maintenanceCount: 3,
    lastAllocatedDate: "2026-02-15",
    currentUser: "Emma Watson (Lead Designer)",
    warrantyYears: 2,
    cost: 1400,
    description: "Apple tablet with stylus support for prototype design sketches.",
    condition: "Fair",
    history: [
      { date: "2024-11-20", type: "Created", note: "Tablet added to Design inventory." },
      { date: "2024-12-01", type: "Allocated", note: "Assigned to Emma Watson." },
      { date: "2026-06-30", type: "Maintenance", note: "Screen cracked. Sent to certified repair." }
    ]
  },
  {
    id: "AF-0007",
    name: "Conference Room Projector (Epson)",
    category: "Office Equipment",
    status: "Allocated",
    purchaseDate: "2023-08-05",
    maintenanceCount: 4,
    lastAllocatedDate: "2026-01-10",
    currentUser: "HQ Conference Room 3B",
    warrantyYears: 2,
    cost: 2200,
    description: "High-lumens laser projector for presentation room.",
    condition: "Good",
    history: [
      { date: "2023-08-05", type: "Created", note: "Equipment bought and registered." },
      { date: "2023-08-15", type: "Allocated", note: "Installed in Conference Room 3B." }
    ]
  }
];

const DB_KEY = "assetflow_db_assets";
const CURRENT_DATE_STR = "2026-07-12";

// Helper to get raw assets
function getRawAssets() {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_ASSETS));
    return INITIAL_ASSETS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_ASSETS;
  }
}

// Helper to save raw assets
function saveRawAssets(assets) {
  localStorage.setItem(DB_KEY, JSON.stringify(assets));
}

// Calculate age in decimal years from purchaseDate to 2026-07-12
export function calculateAge(purchaseDate) {
  const end = new Date(CURRENT_DATE_STR);
  const start = new Date(purchaseDate);
  const diffTime = Math.max(0, end - start);
  return diffTime / (1000 * 60 * 60 * 24 * 365.25);
}

// Calculate days between two date strings
export function getDaysDiff(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d1 - d2;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Sum past allocation durations dynamically
export function calculateAllocatedDays(history, purchaseDate) {
  const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
  let totalAllocatedDays = 0;
  let currentAllocationStartDate = null;

  sortedHistory.forEach(event => {
    if (event.type === 'Allocated') {
      if (!currentAllocationStartDate) {
        currentAllocationStartDate = new Date(event.date);
      }
    } else if (event.type === 'Returned' || event.type === 'Maintenance' || event.type === 'Disposed') {
      if (currentAllocationStartDate) {
        const endDate = new Date(event.date);
        const diffTime = Math.max(0, endDate - currentAllocationStartDate);
        const days = diffTime / (1000 * 60 * 60 * 24);
        totalAllocatedDays += days;
        currentAllocationStartDate = null;
      }
    }
  });

  // If currently active allocation
  if (currentAllocationStartDate) {
    const endDate = new Date(CURRENT_DATE_STR);
    const diffTime = Math.max(0, endDate - currentAllocationStartDate);
    const days = diffTime / (1000 * 60 * 60 * 24);
    totalAllocatedDays += days;
  }

  return Math.round(totalAllocatedDays);
}

// Compute intelligence modules dynamically for a raw asset
export function computeAssetIntelligence(asset) {
  const age = calculateAge(asset.purchaseDate);
  const condition = asset.condition || "Good";
  
  // 1. Health Score Penalties
  // Age Penalty
  const agePenalty = Math.round(age * 2 * 10) / 10;
  
  // Maintenance Penalty
  const maintenancePenalty = asset.maintenanceCount * 5;
  
  // Condition Penalty: Excellent = 0, Good = 5, Fair = 10, Poor = 20
  let conditionPenalty = 0;
  if (condition === "Good") conditionPenalty = 5;
  else if (condition === "Fair") conditionPenalty = 10;
  else if (condition === "Poor") conditionPenalty = 20;

  // Warranty Days Left
  const purchase = new Date(asset.purchaseDate);
  const warrantyEnd = new Date(purchase.setFullYear(purchase.getFullYear() + asset.warrantyYears));
  const current = new Date(CURRENT_DATE_STR);
  const warrantyDaysLeft = Math.floor((warrantyEnd - current) / (1000 * 60 * 60 * 24));
  const isWarrantyExpired = warrantyDaysLeft <= 0;

  // Warranty Penalty: Active = 0, Expires within 30 days = 5, Expired = 10
  let warrantyPenalty = 0;
  if (isWarrantyExpired) {
    warrantyPenalty = 10;
  } else if (warrantyDaysLeft <= 30) {
    warrantyPenalty = 5;
  }

  // Calculate & Clamp Health Score between 0 and 100
  const rawHealth = 100 - agePenalty - maintenancePenalty - conditionPenalty - warrantyPenalty;
  const healthScore = Math.max(0, Math.min(100, Math.round(rawHealth)));

  // Maintenance Priority based on Health Score ranges:
  // 90–100 → Low
  // 70–89 → Medium
  // 40–69 → High
  // 0–39 → Critical
  let maintenancePriority = "Low";
  let healthStatus = "Healthy";
  let healthColor = "green"; // 'green' | 'yellow' | 'red'

  if (healthScore < 40) {
    maintenancePriority = "Critical";
    healthStatus = "Critical";
    healthColor = "red";
  } else if (healthScore < 70) {
    maintenancePriority = "High";
    healthStatus = "Critical";
    healthColor = "red";
  } else if (healthScore < 90) {
    maintenancePriority = "Medium";
    healthStatus = "Warning";
    healthColor = "yellow";
  } else {
    maintenancePriority = "Low";
    healthStatus = "Healthy";
    healthColor = "green";
  }

  // 2. Efficiency Score
  // Efficiency = (Allocated Days / Total Asset Age in Days) * 100
  const totalAgeDays = Math.max(1, getDaysDiff(CURRENT_DATE_STR, asset.purchaseDate));
  const allocatedDays = Math.min(totalAgeDays, calculateAllocatedDays(asset.history || [], asset.purchaseDate));
  const efficiency = Math.max(0, Math.min(100, Math.round((allocatedDays / totalAgeDays) * 100)));

  let efficiencyLevel = "Low"; // "Low" | "Moderate" | "High"
  if (efficiency >= 70) {
    efficiencyLevel = "High";
  } else if (efficiency >= 30) {
    efficiencyLevel = "Moderate";
  } else {
    efficiencyLevel = "Low";
  }

  // 3. Dynamic Recommendations Rules
  // Precedence:
  // Health < 40 → Replace Asset
  // Condition = Poor → Repair Asset
  // Efficiency < 30% → Reallocate Asset
  // Warranty expires within 30 days → Renew Warranty
  // Otherwise → Operating Normally
  let recommendation = "Operating Normally";
  if (healthScore < 40) {
    recommendation = "Replace Asset";
  } else if (condition === "Poor") {
    recommendation = "Repair Asset";
  } else if (efficiency < 30) {
    recommendation = "Reallocate Asset";
  } else if (warrantyDaysLeft <= 30) {
    recommendation = "Renew Warranty";
  }

  // 4. Idle duration monitoring
  let idleDays = 0;
  let isIdle = false;
  if (asset.status === "Available") {
    const referenceDate = asset.lastAllocatedDate || asset.purchaseDate;
    idleDays = getDaysDiff(CURRENT_DATE_STR, referenceDate);
    if (idleDays > 30) {
      isIdle = true;
    }
  }

  // 5. Last Maintenance Date Calculation
  const maintHistory = (asset.history || []).filter(h => h.type === "Maintenance");
  const lastMaintDate = maintHistory.length > 0 ? maintHistory[maintHistory.length - 1].date : asset.purchaseDate;
  const daysSinceLastMaintenance = getDaysDiff(CURRENT_DATE_STR, lastMaintDate);
  const isMaintenanceOverdue = daysSinceLastMaintenance > 180;

  // 6. Alert criteria checks
  const hasAlerts = 
    healthScore < 40 ||
    efficiency < 30 ||
    warrantyDaysLeft <= 30 ||
    isMaintenanceOverdue ||
    isIdle;

  return {
    ...asset,
    condition,
    age: parseFloat(age.toFixed(2)),
    healthScore,
    healthStatus,
    healthColor,
    maintenancePriority,
    efficiency,
    efficiencyLevel,
    idleDays,
    isIdle,
    recommendation,
    warrantyDaysLeft: isWarrantyExpired ? 0 : warrantyDaysLeft,
    isWarrantyExpired,
    warrantyStatusText: isWarrantyExpired ? "Expired" : `${warrantyDaysLeft} Days Left`,
    daysSinceLastMaintenance,
    isMaintenanceOverdue,
    hasAlerts,
    healthBreakdown: {
      base: 100,
      age: parseFloat(age.toFixed(2)),
      agePenalty,
      maintenanceCount: asset.maintenanceCount,
      maintenancePenalty,
      condition,
      conditionPenalty,
      warrantyDaysLeft: isWarrantyExpired ? 0 : warrantyDaysLeft,
      warrantyPenalty,
      rawScore: parseFloat(rawHealth.toFixed(1))
    }
  };
}

import axios from 'axios';

// Odoo JSON-RPC API POST utility
const callOdooAPI = async (endpoint, params = {}) => {
  try {
    const response = await axios.post(endpoint, {
      jsonrpc: '2.0',
      method: 'call',
      params: params
    });
    if (response.data && response.data.result) {
      return response.data.result;
    }
    throw new Error("Odoo returned empty payload or RPC error");
  } catch (err) {
    console.warn(`Odoo endpoint ${endpoint} failed. Falling back to local state simulation.`, err);
    return null;
  }
};

// API methods exposed to pages
export const mockDb = {
  getAssets: () => {
    const raw = getRawAssets();
    return raw.map(computeAssetIntelligence);
  },

  getAssetsAsync: async () => {
    const remote = await callOdooAPI('/api/assetflow/assets');
    if (remote) {
      // Sync local storage with Odoo source-of-truth
      const synced = remote.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category,
        status: a.status,
        purchaseDate: a.purchaseDate,
        maintenanceCount: a.maintenanceCount,
        lastAllocatedDate: a.lastAllocatedDate,
        currentUser: a.currentUser,
        warrantyYears: a.warrantyYears,
        cost: a.cost,
        description: a.description,
        condition: a.condition,
        history: a.history
      }));
      localStorage.setItem(DB_KEY, JSON.stringify(synced));
      return remote;
    }
    return mockDb.getAssets();
  },

  getAsset: (id) => {
    const raw = getRawAssets();
    const asset = raw.find(a => a.id === id);
    if (!asset) return null;
    return computeAssetIntelligence(asset);
  },

  getAssetAsync: async (id) => {
    const assets = await mockDb.getAssetsAsync();
    return assets.find(a => a.id === id) || mockDb.getAsset(id);
  },

  addAsset: (assetData) => {
    const raw = getRawAssets();
    
    // Generate sequential tag
    const numericTags = raw.map(a => {
      const parts = a.id.split("-");
      return parts.length === 2 ? parseInt(parts[1]) : 0;
    });
    const maxNum = numericTags.length > 0 ? Math.max(...numericTags) : 0;
    const nextId = `AF-${String(maxNum + 1).padStart(4, "0")}`;

    const newAsset = {
      id: nextId,
      name: assetData.name || "Unnamed Asset",
      category: assetData.category || "IT Hardware",
      status: "Available",
      purchaseDate: assetData.purchaseDate || CURRENT_DATE_STR,
      maintenanceCount: 0,
      lastAllocatedDate: null,
      currentUser: null,
      warrantyYears: parseInt(assetData.warrantyYears) || 2,
      cost: parseFloat(assetData.cost) || 0,
      description: assetData.description || "",
      condition: assetData.condition || "Excellent",
      history: [
        { date: CURRENT_DATE_STR, type: "Created", note: "Asset registered in system database." }
      ]
    };

    raw.push(newAsset);
    saveRawAssets(raw);
    return computeAssetIntelligence(newAsset);
  },

  updateAsset: (id, assetData) => {
    const raw = getRawAssets();
    const index = raw.findIndex(a => a.id === id);
    if (index === -1) return null;

    raw[index] = {
      ...raw[index],
      name: assetData.name,
      category: assetData.category,
      purchaseDate: assetData.purchaseDate,
      warrantyYears: parseInt(assetData.warrantyYears) || 2,
      cost: parseFloat(assetData.cost) || 0,
      description: assetData.description,
      condition: assetData.condition,
    };

    saveRawAssets(raw);
    return computeAssetIntelligence(raw[index]);
  },

  deleteAsset: (id) => {
    let raw = getRawAssets();
    raw = raw.filter(a => a.id !== id);
    saveRawAssets(raw);
    return true;
  },

  allocateAsset: (id, user) => {
    const raw = getRawAssets();
    const index = raw.findIndex(a => a.id === id);
    if (index === -1) return null;

    raw[index].status = "Allocated";
    raw[index].currentUser = user || "Unknown User";
    raw[index].lastAllocatedDate = CURRENT_DATE_STR;
    raw[index].history.push({
      date: CURRENT_DATE_STR,
      type: "Allocated",
      note: `Allocated to ${raw[index].currentUser}.`
    });

    saveRawAssets(raw);
    return computeAssetIntelligence(raw[index]);
  },

  returnAsset: (id) => {
    const raw = getRawAssets();
    const index = raw.findIndex(a => a.id === id);
    if (index === -1) return null;

    const prevUser = raw[index].currentUser;
    raw[index].status = "Available";
    raw[index].currentUser = null;
    raw[index].history.push({
      date: CURRENT_DATE_STR,
      type: "Returned",
      note: `Returned by ${prevUser || "allocated user"}. Cleaned & checked.`
    });

    saveRawAssets(raw);
    return computeAssetIntelligence(raw[index]);
  },

  logMaintenance: (id, note) => {
    const raw = getRawAssets();
    const index = raw.findIndex(a => a.id === id);
    if (index === -1) return null;

    raw[index].status = "Under Maintenance";
    raw[index].maintenanceCount += 1;
    raw[index].history.push({
      date: CURRENT_DATE_STR,
      type: "Maintenance",
      note: note || "Routine service checks logged."
    });

    saveRawAssets(raw);
    return computeAssetIntelligence(raw[index]);
  },

  completeMaintenance: (id, targetStatus = "Available") => {
    const raw = getRawAssets();
    const index = raw.findIndex(a => a.id === id);
    if (index === -1) return null;

    raw[index].status = targetStatus;
    raw[index].history.push({
      date: CURRENT_DATE_STR,
      type: "Returned",
      note: `Maintenance completed. Returned to ${targetStatus} pool.`
    });

    saveRawAssets(raw);
    return computeAssetIntelligence(raw[index]);
  },

  transferAsset: (id, targetUser) => {
    const raw = getRawAssets();
    const index = raw.findIndex(a => a.id === id);
    if (index === -1) return null;

    const oldUser = raw[index].currentUser;
    raw[index].currentUser = targetUser;
    raw[index].status = "Allocated";
    raw[index].history.push({
      date: CURRENT_DATE_STR,
      type: "Transfer",
      note: `Transferred ownership from ${oldUser || "unassigned"} to ${targetUser}.`
    });

    saveRawAssets(raw);
    return computeAssetIntelligence(raw[index]);
  },

  disposeAsset: (id) => {
    const raw = getRawAssets();
    const index = raw.findIndex(a => a.id === id);
    if (index === -1) return null;

    raw[index].status = "Disposed";
    raw[index].currentUser = null;
    raw[index].history.push({
      date: CURRENT_DATE_STR,
      type: "Disposed",
      note: "Asset decommissioned and disposed."
    });

    saveRawAssets(raw);
    return computeAssetIntelligence(raw[index]);
  },

  // Asynchronous API Bridging wrappers targeting custom Odoo module controller endpoints
  // With simulated latency fallback to highlight the instant updates of Optimistic UI.
  addAssetAsync: async (assetData) => {
    const remote = await callOdooAPI('/api/assetflow/add_asset', { asset_data: assetData });
    if (remote) return remote;
    await new Promise(resolve => setTimeout(resolve, 1200));
    return mockDb.addAsset(assetData);
  },

  updateAssetAsync: async (id, assetData) => {
    const remote = await callOdooAPI('/api/assetflow/update_asset', { id, asset_data: assetData });
    if (remote) return remote;
    await new Promise(resolve => setTimeout(resolve, 1200));
    return mockDb.updateAsset(id, assetData);
  },

  deleteAssetAsync: async (id) => {
    const remote = await callOdooAPI('/api/assetflow/dispose', { id }); // map decommission
    if (remote) return remote;
    await new Promise(resolve => setTimeout(resolve, 1200));
    return mockDb.deleteAsset(id);
  },

  allocateAssetAsync: async (id, user) => {
    const remote = await callOdooAPI('/api/assetflow/allocate', { id, user });
    if (remote) return remote;
    await new Promise(resolve => setTimeout(resolve, 1200));
    return mockDb.allocateAsset(id, user);
  },

  returnAssetAsync: async (id) => {
    const remote = await callOdooAPI('/api/assetflow/return', { id });
    if (remote) return remote;
    await new Promise(resolve => setTimeout(resolve, 1200));
    return mockDb.returnAsset(id);
  },

  logMaintenanceAsync: async (id, note) => {
    const remote = await callOdooAPI('/api/assetflow/log_maintenance', { id, note });
    if (remote) return remote;
    await new Promise(resolve => setTimeout(resolve, 1200));
    return mockDb.logMaintenance(id, note);
  },

  completeMaintenanceAsync: async (id, targetStatus = "Available") => {
    const remote = await callOdooAPI('/api/assetflow/complete_maintenance', { id, target_status: targetStatus });
    if (remote) return remote;
    await new Promise(resolve => setTimeout(resolve, 1200));
    return mockDb.completeMaintenance(id, targetStatus);
  },

  transferAssetAsync: async (id, targetUser) => {
    const remote = await callOdooAPI('/api/assetflow/transfer', { id, target_user: targetUser });
    if (remote) return remote;
    await new Promise(resolve => setTimeout(resolve, 1200));
    return mockDb.transferAsset(id, targetUser);
  },

  disposeAssetAsync: async (id) => {
    const remote = await callOdooAPI('/api/assetflow/dispose', { id });
    if (remote) return remote;
    await new Promise(resolve => setTimeout(resolve, 1200));
    return mockDb.disposeAsset(id);
  },

  runAuditAsync: async (localStats) => {
    const remote = await callOdooAPI('/api/assetflow/run_audit');
    if (remote) return remote;
    // Fallback: wait 1.2s to simulate backend audit scan
    await new Promise(resolve => setTimeout(resolve, 1200));
    return localStats;
  },

  getTransfers: () => {
    const local = localStorage.getItem('assetflow_transfers');
    return local ? JSON.parse(local) : [];
  },

  createTransfer: (assetId, requestedOwner) => {
    const transfers = mockDb.getTransfers();
    const assets = getRawAssets();
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return null;

    const currentOwner = asset.currentUser || 'Unassigned';
    const newTransfer = {
      id: 'TR-' + Date.now(),
      assetId,
      assetName: asset.name,
      currentOwner,
      requestedOwner,
      state: 'requested',
      requestDate: CURRENT_DATE_STR
    };

    transfers.push(newTransfer);
    localStorage.setItem('assetflow_transfers', JSON.stringify(transfers));

    // Update asset history locally
    const index = assets.findIndex(a => a.id === assetId);
    assets[index].history.push({
      date: CURRENT_DATE_STR,
      type: 'Transfer Requested',
      note: `Transfer requested from ${currentOwner} to ${requestedOwner}.`
    });
    saveRawAssets(assets);

    return newTransfer;
  },

  approveTransfer: (transferId) => {
    const transfers = mockDb.getTransfers();
    const idx = transfers.findIndex(t => String(t.id) === String(transferId));
    if (idx === -1) return false;

    transfers[idx].state = 'approved';
    localStorage.setItem('assetflow_transfers', JSON.stringify(transfers));

    const { assetId, requestedOwner } = transfers[idx];
    const assets = getRawAssets();
    const assetIdx = assets.findIndex(a => a.id === assetId);
    if (assetIdx !== -1) {
      assets[assetIdx].status = 'Allocated';
      assets[assetIdx].currentUser = requestedOwner;
      assets[assetIdx].history.push({
        date: CURRENT_DATE_STR,
        type: 'Transfer Approved',
        note: `Transfer request approved. Custodian updated to ${requestedOwner}.`
      });
      saveRawAssets(assets);
    }
    return true;
  },

  rejectTransfer: (transferId) => {
    const transfers = mockDb.getTransfers();
    const idx = transfers.findIndex(t => String(t.id) === String(transferId));
    if (idx === -1) return false;

    transfers[idx].state = 'rejected';
    localStorage.setItem('assetflow_transfers', JSON.stringify(transfers));

    const { assetId, requestedOwner } = transfers[idx];
    const assets = getRawAssets();
    const assetIdx = assets.findIndex(a => a.id === assetId);
    if (assetIdx !== -1) {
      assets[assetIdx].history.push({
        date: CURRENT_DATE_STR,
        type: 'Transfer Rejected',
        note: `Transfer request to ${requestedOwner} rejected.`
      });
      saveRawAssets(assets);
    }
    return true;
  },

  getBookings: () => {
    const local = localStorage.getItem('assetflow_bookings');
    return local ? JSON.parse(local) : [];
  },

  createBooking: (bookingData) => {
    const bookings = mockDb.getBookings();
    const { assetId, bookingDate, startTime, endTime, employeeName } = bookingData;

    // Check overlap
    const conflict = bookings.find(b => 
      b.assetId === assetId && 
      b.bookingDate === bookingDate && 
      parseFloat(b.startTime) < parseFloat(endTime) && 
      parseFloat(b.endTime) > parseFloat(startTime)
    );

    if (conflict) {
      const formatTime = (t) => {
        const h = Math.floor(t);
        const m = Math.round((t % 1) * 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      };
      return {
        error: 'Conflict',
        message: `Resource is already booked on this date from ${formatTime(conflict.startTime)} to ${formatTime(conflict.endTime)}.`
      };
    }

    const assets = getRawAssets();
    const asset = assets.find(a => a.id === assetId);
    const newBooking = {
      id: 'BK-' + Date.now(),
      assetId,
      assetName: asset ? asset.name : 'Unknown Asset',
      bookingDate,
      startTime: parseFloat(startTime),
      endTime: parseFloat(endTime),
      employeeName
    };

    bookings.push(newBooking);
    localStorage.setItem('assetflow_bookings', JSON.stringify(bookings));

    // Update asset history locally
    const assetIdx = assets.findIndex(a => a.id === assetId);
    if (assetIdx !== -1) {
      const formatTime = (t) => {
        const h = Math.floor(t);
        const m = Math.round((t % 1) * 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      };
      assets[assetIdx].history.push({
        date: CURRENT_DATE_STR,
        type: 'Booking',
        note: `Booked by ${employeeName} from ${formatTime(startTime)} to ${formatTime(endTime)}.`
      });
      saveRawAssets(assets);
    }

    return newBooking;
  },

  getTransfersAsync: async () => {
    const remote = await callOdooAPI('/api/assetflow/get_transfers');
    if (remote) {
      localStorage.setItem('assetflow_transfers', JSON.stringify(remote));
      return remote;
    }
    return mockDb.getTransfers();
  },

  createTransferAsync: async (assetId, requestedOwner) => {
    const remote = await callOdooAPI('/api/assetflow/create_transfer', { asset_id: assetId, requested_owner: requestedOwner });
    if (remote) return remote;
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockDb.createTransfer(assetId, requestedOwner);
  },

  approveTransferAsync: async (transferId) => {
    const remote = await callOdooAPI('/api/assetflow/approve_transfer', { transfer_id: transferId });
    if (remote) return remote;
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockDb.approveTransfer(transferId);
  },

  rejectTransferAsync: async (transferId) => {
    const remote = await callOdooAPI('/api/assetflow/reject_transfer', { transfer_id: transferId });
    if (remote) return remote;
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockDb.rejectTransfer(transferId);
  },

  getBookingsAsync: async () => {
    const remote = await callOdooAPI('/api/assetflow/get_bookings');
    if (remote) {
      localStorage.setItem('assetflow_bookings', JSON.stringify(remote));
      return remote;
    }
    return mockDb.getBookings();
  },

  createBookingAsync: async (bookingData) => {
    const { assetId, bookingDate, startTime, endTime, employeeName } = bookingData;
    const remote = await callOdooAPI('/api/assetflow/create_booking', {
      asset_id: assetId,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      employee_name: employeeName
    });
    if (remote) {
      if (remote.error) return remote;
      return remote;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockDb.createBooking(bookingData);
  }
};
