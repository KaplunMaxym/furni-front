import { toast } from "sonner";

/**
 * Короткі повідомлення.
 *
 * Раніше всі три випадки викликали звичайний `toast()` і фарбували плашку
 * вручну — `#0C5132`, `#E43F3F`, `#007bff`. Через це повідомлення були
 * просто кольоровими прямокутниками: без іконки й без семантики, а кольори
 * не мали нічого спільного з темою застосунку.
 *
 * Тепер це семантичні виклики sonner, а вигляд задає `richColors` у
 * `ToastifyProvider` — один раз і однаково для всього застосунку.
 */
export const tostik = {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast.info(message),
};
