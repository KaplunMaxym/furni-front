export const PRICE_CATEGORIES = [
    { label: 'Представницька', value: 'REPRESENTATIVE' },
    { label: '1 Категорія',    value: 'CATEGORY_1'     },
    { label: '2 Категорія',    value: 'CATEGORY_2'     },
    { label: '3 Категорія',    value: 'CATEGORY_3'     },
    { label: 'Роздрібна',      value: 'RETAIL'          },
];

export interface IOrderForm {
    name?: string | null;
    clientId?: number | string;
    statusId?: number | string;
    priceCategory?: string;
}