/** Замовлення, що увійшло в партію. */
export interface ICutBatchOrder {
    id: number;
    orderNumber: string;
    name: string | null;
}

/** Рядок списку партій — без плану розкрою: його віддає окремий запит. */
export interface ICutBatch {
    id: number;
    /** Номер партії з 1С. */
    externalId: string;
    kerf: number;
    freshBarsUsed: number;
    barsCount: number;
    /** Силка на PDF: карта розкрою, програми по прутках, наклейки. */
    pdfUrl: string | null;
    createdAt: string;
    orders: ICutBatchOrder[];
}

export interface ICutBatchPiece {
    sequence: number;
    length: number;
    constructionId: number;
    detailCode: string;
    detailId: number | null;
}

export interface ICutBatchBar {
    stockId: string | null;
    stockCopy: number | null;
    length: number;
    usedLength: number;
    remainder: number;
    pieces: ICutBatchPiece[];
}

export interface ICutBatchMaterial {
    articleCode: string;
    name: string;
    code1C: string | null;
    color: string | null;
    beamLength: number;
    kerf: number;
    wasteThreshold: number;
    detailCodes: string[];
    piecesCount: number;
    totalPieceLength: number;
    usedLength: number;
    wasteLength: number;
    stockBarsUsed: number;
    freshBarsUsed: number;
    bars: ICutBatchBar[];
}

export interface ICutBatchFreshBar {
    articleCode: string;
    code1C: string | null;
    color: string | null;
    length: number;
    quantity: number;
}

export interface ICutBatchConsumedStock {
    stockId: string;
    stockCopy: number;
    code1C: string;
    articleCode: string;
    color: string | null;
    length: number;
    usedLength: number;
    remainder: number;
}

/** Звідки взявся залишок: наш пруток, обрізок складського чи нового хлиста. */
export type CutBatchStockOrigin = 'UNTOUCHED' | 'STOCK_REMAINDER' | 'FRESH_REMAINDER';

export const CUT_BATCH_ORIGIN_LABELS: Record<CutBatchStockOrigin, string> = {
    UNTOUCHED: 'Не чіпали',
    STOCK_REMAINDER: 'Обрізок складського',
    FRESH_REMAINDER: 'Обрізок нового',
};

export interface ICutBatchStockRow {
    stockId: string | null;
    sourceStockId: string | null;
    sourceStockCopy: number | null;
    origin: CutBatchStockOrigin;
    articleCode: string;
    code1C: string | null;
    color: string | null;
    length: number;
    count: number;
    sourceLength: number | null;
}

/** План розкрою — те саме, що партія віддала в 1С. */
export interface ICutBatchPlan {
    batchId: string;
    createdAt: string;
    repeated: boolean;
    orders: Array<ICutBatchOrder & { constructionsCount: number }>;
    materials: ICutBatchMaterial[];
    consumption: {
        freshBars: ICutBatchFreshBar[];
        totalFreshBars: number;
        totalStockBars: number;
        totalPieceLength: number;
        totalUsedLength: number;
        totalWasteLength: number;
    };
    stock: {
        consumed: ICutBatchConsumedStock[];
        updated: ICutBatchStockRow[];
        scrap: ICutBatchStockRow[];
    };
    pdfUrl: string | null;
    warnings: string[];
}

/** Конструкція партії — щоб на схемі був людський номер, а не внутрішній id. */
export interface ICutBatchConstruction {
    id: number;
    constructionNo: string;
    orderId: number;
    orderNumber: string;
}

export interface ICutBatchDetails {
    id: number;
    externalId: string;
    kerf: number;
    freshBarsUsed: number;
    pdfUrl: string | null;
    createdAt: string;
    plan: ICutBatchPlan;
    constructions: ICutBatchConstruction[];
}
