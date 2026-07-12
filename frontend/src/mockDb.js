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
    utilization: 95,
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
    utilization: 0,
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
    utilization: 82,
    history: [
      { date: "2022-09-01", type: "Created", note: "Purchased and registered." },
      { date: "2022-09-10", type: "Allocated", note: "Assigned to Sales VP." },
      { date: "2023-08-12", type: "Maintenance", note: "Regular tire rotation & service." },
      { date: "2024-08-14", type: "Maintenance", note: "Annual vehicle inspection." }
    ]
  },
  {
    id: "AF-0004",
    name: "Cisco Enterprise Router Catalyst 9300",
    category: "Networking",
    status: "Available",
    purchaseDate: "2020-03-12",
    maintenanceCount: 8,
    lastAllocatedDate: "2025-06-05",
    currentUser: null,
    warrantyYears: 5,
    cost: 4500,
    description: "Primary backbone switch router for local building network.",
    utilization: 0,
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
    utilization: 0,
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
    utilization: 0,
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
    utilization: 45,
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

// Compute intelligence modules dynamically for a raw asset
export function computeAssetIntelligence(asset) {
  const age = calculateAge(asset.purchaseDate);
  
  // 1. Health Score
  // Formula: Health = 100 - (Age * 2) - (Maintenance * 5)
  const baseHealth = 100 - (age * 2) - (asset.maintenanceCount * 5);
  const healthScore = Math.max(0, Math.min(100, Math.round(baseHealth)));
  
  // Health Status Badge Color & Maintenance Priority
  let healthStatus = "Healthy";
  let healthColor = "green"; // 'green' | 'yellow' | 'red'
  let maintenancePriority = "Low";

  if (healthScore < 30) {
    healthStatus = "Critical";
    healthColor = "red";
    maintenancePriority = "Critical";
  } else if (healthScore < 50) {
    healthStatus = "Critical";
    healthColor = "red";
    maintenancePriority = "High";
  } else if (healthScore < 70) {
    healthStatus = "Warning";
    healthColor = "yellow";
    maintenancePriority = "Medium";
  } else {
    healthStatus = "Healthy";
    healthColor = "green";
    maintenancePriority = "Low";
  }

  // 2. Operational Intelligence (Utilization, Idle status, Recommendation)
  let utilization = asset.utilization;
  if (asset.status === "Available") {
    utilization = 0;
  } else if (asset.status === "Under Maintenance") {
    utilization = 0;
  } else if (asset.status === "Allocated" && !utilization) {
    utilization = 85; // Default if allocated but none set
  }

  let idleDays = 0;
  let isIdle = false;
  if (asset.status === "Available" && asset.lastAllocatedDate) {
    idleDays = getDaysDiff(CURRENT_DATE_STR, asset.lastAllocatedDate);
    if (idleDays >= 30) {
      isIdle = true;
    }
  }

  let recommendation = "Optimal";
  if (healthScore < 35) {
    recommendation = "Dispose";
  } else if (asset.status === "Under Maintenance") {
    recommendation = "Repair";
  } else if (isIdle) {
    recommendation = "Reallocate";
  } else if (asset.status === "Available") {
    recommendation = "Allocate";
  } else if (utilization < 50) {
    recommendation = "Reallocate";
  }

  // 3. Warranty Status (Days Left / Expired)
  const purchase = new Date(asset.purchaseDate);
  const warrantyEnd = new Date(purchase.setFullYear(purchase.getFullYear() + asset.warrantyYears));
  const current = new Date(CURRENT_DATE_STR);
  const warrantyDaysLeft = Math.floor((warrantyEnd - current) / (1000 * 60 * 60 * 24));
  const isWarrantyExpired = warrantyDaysLeft <= 0;

  return {
    ...asset,
    age: parseFloat(age.toFixed(2)),
    healthScore,
    healthStatus,
    healthColor,
    maintenancePriority,
    utilization,
    idleDays,
    isIdle,
    recommendation,
    warrantyDaysLeft: isWarrantyExpired ? 0 : warrantyDaysLeft,
    isWarrantyExpired,
    warrantyStatusText: isWarrantyExpired ? "Expired" : `${warrantyDaysLeft} Days Left`
  };
}

// API methods exposed to pages
export const mockDb = {
  getAssets: () => {
    const raw = getRawAssets();
    return raw.map(computeAssetIntelligence);
  },

  getAsset: (id) => {
    const raw = getRawAssets();
    const asset = raw.find(a => a.id === id);
    if (!asset) return null;
    return computeAssetIntelligence(asset);
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
      utilization: 0,
      history: [
        { date: CURRENT_DATE_STR, type: "Created", note: "Asset created via management console." }
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
    raw[index].utilization = Math.floor(Math.random() * 25) + 75; // 75 - 98%
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
    raw[index].utilization = 0;
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
    raw[index].utilization = 0;
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
  }
};
