/** Дата й час партії — коротко, одним рядком, без секунд. */
export const formatBatchDateTime = (value: string): string =>
    new Date(value).toLocaleString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
