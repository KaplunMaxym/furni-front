/**
 * Дата й час запису журналу.
 *
 * Саме з часом, а не лише дата: за один день відправок буває десяток, і без
 * часу рядки журналу не відрізнити один від одного.
 *
 * Бек уже віддає час у київському поясі (`ConvertTimeInterceptor`), тож тут
 * нічого не перераховуємо — лише форматуємо.
 */
export const formatLogDateTime = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const pad = (part: number) => String(part).padStart(2, '0');

    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ` +
        `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

/**
 * Тривалість запиту.
 *
 * До секунди — у мілісекундах, далі в секундах: «3471 мс» читається гірше за
 * «3.5 с», а саме на довгих запитах тривалість і починає щось значити.
 */
export const formatLogDuration = (ms: number | null): string => {
    if (ms === null) return '—';
    if (ms < 1000) return `${ms} мс`;

    return `${(ms / 1000).toFixed(1)} с`;
};
