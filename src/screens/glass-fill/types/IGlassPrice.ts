export const PRICE_CATEGORIES = [
    'REPRESENTATIVE',
    'CATEGORY_1',
    'CATEGORY_2',
    'CATEGORY_3',
    'RETAIL',
] as const;

export type PriceCategoryType = typeof PRICE_CATEGORIES[number];

export const PRICE_CATEGORY_LABELS: Record<PriceCategoryType, string> = {
    REPRESENTATIVE: 'Представницька',
    CATEGORY_1: 'Категорія 1',
    CATEGORY_2: 'Категорія 2',
    CATEGORY_3: 'Категорія 3',
    RETAIL: 'Роздрібна',
};

export interface IGlassPrice {
    id: number;
    glassFillId: number;
    category: PriceCategoryType;
    pricePerM2: number;
}