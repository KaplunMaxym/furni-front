const MONTHS = [
    'січ', 'лют', 'бер', 'кві', 'тра', 'чер',
    'лип', 'сер', 'вер', 'жов', 'лис', 'гру',
];

/** «2026-09» → «вер 26». Рік показуємо, бо вікно перетинає новий рік. */
export const monthLabel = (month: string): string => {
    const [year, monthNo] = month.split('-');
    const index = Number(monthNo) - 1;

    if (Number.isNaN(index) || !MONTHS[index]) return month;

    return `${MONTHS[index]} ${year.slice(2)}`;
};

/** 1234567.5 → «1 234 568». Копійки на дашборді тільки заважають. */
export const formatMoney = (value: number): string =>
    Math.round(value).toLocaleString('uk-UA');
