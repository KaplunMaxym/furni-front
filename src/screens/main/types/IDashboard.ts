export interface IDashboardKpi {
    activeOrders: number;
    activeConstructions: number;
    averageProgress: number;
    completedThisMonth: number;
    pendingDetails: number;
    clients: number;
}

export interface IDashboardMonthPoint {
    /** YYYY-MM */
    month: string;
    orders: number;
    constructions: number;
}

export interface IDashboardSystemShare {
    code: string;
    title: string;
    constructions: number;
}

export interface IDashboardWasteRow {
    articleCode: string;
    color: string | null;
    beamsUsed: number;
    usedMeters: number;
    wasteMeters: number;
    wastePercent: number;
}

export interface IDashboardRecentOrder {
    id: number;
    orderNumber: string;
    name: string | null;
    client: string;
    status: string | null;
    constructions: number;
    progress: number;
    isCompleted: boolean;
    createdAt: string;
}

export interface IDashboardAttention {
    ordersWithoutCost: Array<{ id: number; orderNumber: string; client: string }>;
    clientsWithoutCode1C: number;
    catalogWithoutCode1C: {
        materials: number;
        accessories: number;
        services: number;
        glass: number;
        systems: number;
    };
    failed1CExchanges: Array<{
        id: number;
        orderNumber: string;
        error: string | null;
        createdAt: string;
    }>;
}

export interface IDashboardOverview {
    generatedAt: string;
    kpi: IDashboardKpi;
    monthly: IDashboardMonthPoint[];
    systems: IDashboardSystemShare[];
    waste: IDashboardWasteRow[];
    recentOrders: IDashboardRecentOrder[];
}
