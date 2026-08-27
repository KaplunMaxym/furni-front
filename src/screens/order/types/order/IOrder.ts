export interface IOrderCostItem {
    id: number;
    articleCode: string;
    color: string | null;
    detailCode: string;
    totalLength: number;
    beamsUsed: number;
    wasteLength: number;
    pricePerBeam: number;
    subtotalUsd: number;
    subtotalUah: number;
}

export interface IOrderCostAccessoryItem {
    id: number;
    constructionId: number;
    articleCode: string;
    name: string;
    color: string | null;
    unit: string;
    quantity: number;
    pricePerUnit: number;
    subtotalUsd: number;
    subtotalUah: number;
}

export interface IOrderCostGlassItem {
    id: number;
    constructionId: number;
    name: string;
    totalArea: number;
    pricePerM2: number;
    subtotalUsd: number;
    subtotalUah: number;
}

export interface IOrderCostServiceItem {
    id: number;
    constructionId: number;
    name: string;
    unit: string;
    quantity: number;
    pricePerUnit: number;
    subtotalUsd: number;
    subtotalUah: number;
}

export interface IOrderCostCutPlanPiece {
    id: number;
    constructionId: number;
    detailId: number | null;
    barIndex: number;
    pieceIndex: number;
    detailCode: string;
    length: number;
    usedSoFar: number;
    remainder: number;
    articleCode: string;
    color: string | null;
}

export interface IOrderCostCutPlanBar {
    barIndex: number;
    pieces: IOrderCostCutPlanPiece[];
    remainder: number;
}

export interface IOrderCostCutPlanMaterial {
    articleCode: string;
    color: string | null;
    bars: IOrderCostCutPlanBar[];
}

export interface IOrderCostConstructionGroup {
    constructionId: number;
    accessoryItems: IOrderCostAccessoryItem[];
    glassItems: IOrderCostGlassItem[];
    serviceItems: IOrderCostServiceItem[];
    subtotalUsd: number;
    subtotalUah: number;
}

export interface IOrderCost {
    id: number;
    totalUsd: number;
    totalUah: number;
    currencyRate: number;
    calculatedAt: string;
    items: IOrderCostItem[];
    accessoryItems: IOrderCostAccessoryItem[];
    glassItems: IOrderCostGlassItem[];
    serviceItems: IOrderCostServiceItem[];
    byConstruction: IOrderCostConstructionGroup[];
    cutPlan: IOrderCostCutPlanMaterial[];
}

export interface IOrder {
    id: number;
    name: string;
    orderNumber: string;
    createdAt: string;
    clientId: string;
    priceCategory: string;
    client: {
        id: number;
        firstName: string;
        lastName: string;
    };
    statusId: string;
    status: {
        id: number;
        code: string;
        title: string;
    };
    cost: IOrderCost | null;
}