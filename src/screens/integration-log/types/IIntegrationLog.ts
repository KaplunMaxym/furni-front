/** Статус однієї спроби обміну. */
export const INTEGRATION_LOG_STATUSES = ['SUCCESS', 'FAILED'] as const;
export type IntegrationLogStatus = typeof INTEGRATION_LOG_STATUSES[number];

export const INTEGRATION_LOG_STATUS_LABELS: Record<IntegrationLogStatus, string> = {
    SUCCESS: 'Успішно',
    FAILED: 'Помилка',
};

/**
 * Варіанти для селекта.
 *
 * Масивом об'єктів, бо `SelectorSearch` працює зі списком і дістає з нього
 * значення й підпис за ключами — рядковий enum йому не підійде.
 */
export const INTEGRATION_LOG_STATUS_OPTIONS = INTEGRATION_LOG_STATUSES.map(value => ({
    value,
    label: INTEGRATION_LOG_STATUS_LABELS[value],
}));

export interface IIntegrationLogOrder {
    id: number;
    orderNumber: string;
    name: string | null;
}

export interface IIntegrationLogUser {
    id: number;
    name: string;
}

/** Рядок журналу — без тіла запиту: його віддає окремий запит. */
export interface IIntegrationLog {
    id: number;
    status: IntegrationLogStatus;
    /** Код відповіді 1С. Порожній, якщо до відповіді не дійшло. */
    httpStatus: number | null;
    error: string | null;
    durationMs: number | null;
    createdAt: string;
    order: IIntegrationLogOrder | null;
    user: IIntegrationLogUser | null;
}

/** Один запис разом із пакетом, що пішов у 1С, і її відповіддю. */
export interface IIntegrationLogDetails extends IIntegrationLog {
    payload: unknown;
    response: string | null;
}

/** Зведення по тому ж фільтру, що й список. */
export interface IIntegrationLogSummary {
    total: number;
    success: number;
    failed: number;
}
