/**
 * Дата зберігається як 'YYYY-MM-DD' — той самий формат, що приймає бек.
 *
 * Розбираємо вручну, а не через `new Date(value)`: рядок з дефісами браузер
 * читає як UTC, і в часовому поясі на схід від Гринвіча 1 січня перетворюється
 * на 31 грудня. Тут же створюється локальна дата з тими самими числами.
 */
export function parseISODate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return null;
    const date = new Date(y, m - 1, d);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function toISODate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** Показуємо у звичному вигляді — 07.09.2026. */
export function toDisplayDate(date: Date): string {
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

/** Опівніч того самого дня — щоб порівнювати дати без урахування часу. */
export function startOfDay(date: Date): Date {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}
