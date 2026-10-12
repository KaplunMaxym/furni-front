import { FC, useEffect, useState } from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/helpers/cn';
import { Button } from '@/ui/shadcn/button';
import CurrencyToggle, {
    CURRENCY_SIGN,
    PriceCurrency,
    readPriceCurrency,
    writePriceCurrency,
} from '@/ui/prices/CurrencyToggle';
import { useLatestCurrencyRate } from '@/screens/currency-rate/hooks/useLatestCurrencyRate';
import {
    PRICE_CATEGORIES,
    PRICE_CATEGORY_LABELS,
    PriceCategoryType,
} from '@/screens/glass-fill/types/IGlassPrice';

interface PriceListEditorProps {
    /** Поточні ціни за категоріями. Відсутній ключ — ціну ще не задавали. */
    values: Partial<Record<PriceCategoryType, number>>;
    /** Зберегти одну категорію. Викликається лише для змінених. */
    onSave: (category: PriceCategoryType, price: number) => Promise<void>;
    isPending?: boolean;
    /** Одиниця, за яку ціна: «за балку», «за м²», «за шт». */
    unitLabel: string;
}

const format = (value: number | undefined) => (value === undefined ? '' : value.toFixed(2));

/**
 * Спільна ширина поля ціни й кнопки «Зберегти».
 * Кнопка стає під колонкою полів і рівняється з нею по правому краю —
 * інакше вона висить окремо від того, що зберігає.
 */
const FIELD_WIDTH = 'w-[140px]';

/**
 * Призначення цін за категоріями.
 *
 * Було: у кожному рядку олівець, який перемикав рядок у режим редагування,
 * далі галочка й хрестик. Щоб проставити пʼять категорій, доводилось зробити
 * пʼятнадцять кліків, і після кожного рядок «стрибав» між двома станами.
 *
 * Стало: усі пʼять полів одразу доступні, зміни зберігаються однією кнопкою.
 * Кнопка вмикається тільки коли є що зберігати, а поруч видно, скільки саме
 * категорій зміниться — інакше незрозуміло, чи натискання щось дасть.
 */
const PriceListEditor: FC<PriceListEditorProps> = ({ values, onSave, isPending = false, unitLabel }) => {
    const [draft, setDraft] = useState<Record<string, string>>({});
    const [savedAt, setSavedAt] = useState<number | null>(null);

    /*
     * Валюта вводу.
     *
     * У базі ціна завжди доларова — гривня тут лише спосіб її набрати. Вибір
     * запам'ятовується: прайс переносять пачкою, і перемикати валюту на
     * кожній позиції означало б клікати вдвічі більше.
     */
    const { rate } = useLatestCurrencyRate();
    const [currency, setCurrency] = useState<PriceCurrency>(readPriceCurrency);

    // Курс міг ще не завантажитись, коли з пам'яті прийшла гривня
    const effectiveCurrency: PriceCurrency = rate === null ? 'USD' : currency;
    const toUsd = (value: number) => (effectiveCurrency === 'UAH' && rate ? value / rate : value);
    const fromUsd = (value: number) => (effectiveCurrency === 'UAH' && rate ? value * rate : value);

    const changeCurrency = (next: PriceCurrency) => {
        setCurrency(next);
        writePriceCurrency(next);
    };

    /*
     * Чернетку перебудовуємо і при зміні валюти: інакше в полі лишалось би
     * доларове число під знаком гривні — тобто ціна, менша в тридцять разів,
     * яка при збереженні такою б і поїхала в базу.
     */
    useEffect(() => {
        setDraft(
            Object.fromEntries(PRICE_CATEGORIES.map(c => {
                const value = values[c];
                return [c, value === undefined ? '' : format(fromUsd(value))];
            })),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values, effectiveCurrency, rate]);

    const changed = PRICE_CATEGORIES.filter(category => {
        const next = (draft[category] ?? '').trim();
        const raw = values[category];
        const current = raw === undefined ? '' : format(fromUsd(raw));
        if (next === current) return false;
        if (next === '') return false;
        const parsed = Number(next);
        return Number.isFinite(parsed) && parsed >= 0;
    });

    const invalid = PRICE_CATEGORIES.filter(category => {
        const next = (draft[category] ?? '').trim();
        if (next === '') return false;
        const parsed = Number(next);
        return !Number.isFinite(parsed) || parsed < 0;
    });

    const save = async () => {
        for (const category of changed) {
            // Назовні віддаємо завжди долар — незалежно від того, що набрали
            await onSave(category, toUsd(Number(draft[category])));
        }
        setSavedAt(Date.now());
    };

    return (
        <div className="flex flex-col gap-4">
            <CurrencyToggle
                value={effectiveCurrency}
                onChange={changeCurrency}
                rate={rate}
                className="justify-end"
            />

            <div className="flex flex-col divide-y divide-border">
                {PRICE_CATEGORIES.map(category => {
                    const value = draft[category] ?? '';
                    const isNew = values[category] === undefined && value !== '';
                    const hasError = invalid.includes(category);

                    return (
                        <label
                            key={category}
                            className="flex items-center justify-between gap-4 py-2.5 text-sm"
                        >
                            <span className="text-foreground/80">{PRICE_CATEGORY_LABELS[category]}</span>

                            <span className="relative flex items-center">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    inputMode="decimal"
                                    value={value}
                                    onChange={e =>
                                        setDraft(prev => ({ ...prev, [category]: e.target.value }))
                                    }
                                    placeholder="—"
                                    className={cn(
                                        'h-9 rounded-md border bg-transparent pl-3 pr-7 text-right text-sm shadow-xs',
                                        FIELD_WIDTH,
                                        'text-foreground placeholder:text-muted-foreground/70 outline-none',
                                        'transition-[color,box-shadow] focus-visible:ring-[3px]',
                                        hasError
                                            ? 'border-destructive-foreground focus-visible:ring-destructive/40'
                                            : 'border-input focus-visible:border-ring focus-visible:ring-ring/50',
                                        // Нове значення підсвічуємо, поки не збережене
                                        isNew && !hasError && 'border-chart-2/60',
                                    )}
                                />
                                <span className="pointer-events-none absolute right-3 text-muted-foreground">
                                    {CURRENCY_SIGN[effectiveCurrency]}
                                </span>
                            </span>
                        </label>
                    );
                })}
            </div>

            <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                    Ціна {unitLabel}
                    {effectiveCurrency === 'UAH' && (
                        // Видно, що збережеться не те число, яке набрали
                        <span className="ml-2">у гривні, зберігається в доларах</span>
                    )}
                    {invalid.length > 0 && (
                        <span className="ml-2 text-destructive-foreground">
                            перевірте {invalid.length} знач.
                        </span>
                    )}
                </span>

                <div className="flex items-center gap-3">
                    {savedAt !== null && changed.length === 0 && (
                        <span className="flex items-center gap-1.5 text-xs text-chart-2">
                            <Check className="h-3.5 w-3.5" /> Збережено
                        </span>
                    )}

                    <Button
                        type="button"
                        onClick={save}
                        disabled={isPending || changed.length === 0 || invalid.length > 0}
                        className={FIELD_WIDTH}
                    >
                        {changed.length > 0 ? `Зберегти (${changed.length})` : 'Зберегти'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PriceListEditor;
