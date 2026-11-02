/** Варіант значення для налаштування-переліку. */
export interface ISettingOption {
    value: string;
    label: string;
    /** Приклад того, що зміниться — коротким рядком під вибором. */
    hint: string;
}

/**
 * Налаштування разом із описом.
 *
 * Опис приходить із бека, а не зашитий у фронт: підписи, межі й варіанти
 * живуть поруч зі значенням, тож нове налаштування з'являється на сторінці
 * без правок тут.
 */
export interface ISetting {
    key: string;
    title: string;
    description: string;
    group: string;
    type: 'number' | 'enum';
    default: string;
    value: string;
    min?: number;
    max?: number;
    options?: ISettingOption[];
}

export interface ISettingUpdate {
    settings: Array<{ key: string; value: string }>;
}
