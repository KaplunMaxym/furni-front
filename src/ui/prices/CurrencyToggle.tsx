import { FC } from 'react';

import { cn } from '@/helpers/cn';

export type PriceCurrency = 'USD' | 'UAH';

/** Де запам'ятовуємо вибір — щоб він не скидався між позиціями й сеансами. */
const STORAGE_KEY = 'furni:price-input-currency';

export const readPriceCurrency = (): PriceCurrency =>
    localStorage.getItem(STORAGE_KEY) === 'UAH' ? 'UAH' : 'USD';

export const writePriceCurrency = (currency: PriceCurrency) =>
    localStorage.setItem(STORAGE_KEY, currency);

/** Символ валюти для підпису в полі. */
export const CURRENCY_SIGN: Record<PriceCurrency, string> = {
    USD: '$',
    UAH: '₴',
};

interface CurrencyToggleProps {
    value: PriceCurrency;
    onChange: (currency: PriceCurrency) => void;
    /** Курс, за яким переводимо. `null` — курсу в довіднику ще немає. */
    rate: number | null;
    className?: string;
}

/**
 * У якій валюті набирати ціну.
 *
 * У базі ціна завжди в доларах — так її дає постачальник, і так вона не
 * «пливе» від кожного руху курсу. Але прайс на руках буває і гривневий, і
 * перераховувати кожен рядок у голові — вірний спосіб помилитись на порядок.
 *
 * Перемикач міняє тільки валюту вводу: набране в гривні ділиться на поточний
 * курс, і в базу лягає долар. Тобто це калькулятор у полі, а не друге місце
 * зберігання ціни.
 *
 * Без курсу в довіднику гривня недоступна: ділити нема на що, а мовчки взяти
 * одиницю означало б записати гривневу суму як доларову.
 */
const CurrencyToggle: FC<CurrencyToggleProps> = ({ value, onChange, rate, className }) => {
    const isUahDisabled = rate === null;

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <div className="flex overflow-hidden rounded-md border border-input">
                {(['USD', 'UAH'] as const).map(currency => {
                    const isActive = value === currency;
                    const isDisabled = currency === 'UAH' && isUahDisabled;

                    return (
                        <button
                            key={currency}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => onChange(currency)}
                            title={isDisabled ? 'У довіднику ще немає курсу' : undefined}
                            className={cn(
                                'px-2.5 py-1 text-xs font-medium transition-colors',
                                isActive
                                    ? 'bg-secondary text-foreground'
                                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                                isDisabled && 'cursor-not-allowed opacity-40 hover:bg-transparent',
                            )}
                        >
                            {CURRENCY_SIGN[currency]}
                        </button>
                    );
                })}
            </div>

            {/* Курс поруч: без нього незрозуміло, за яким числом переводить */}
            {rate !== null && (
                <span className="text-xs tabular-nums text-muted-foreground">
                    1 $ = {rate.toFixed(2)} ₴
                </span>
            )}
        </div>
    );
};

export default CurrencyToggle;
