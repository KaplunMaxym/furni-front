import { useState, useRef, useEffect, useId } from 'react';
import { FieldValues, Path, Control, Controller } from 'react-hook-form';
import { cn } from '@/helpers/cn';

const MONTHS_UA = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];

const MONTHS_UA_GENITIVE = [
    'Січня', 'Лютого', 'Березня', 'Квітня', 'Травня', 'Червня',
    'Липня', 'Серпня', 'Вересня', 'Жовтня', 'Листопада', 'Грудня',
];

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

function parseISODate(value: string): Date | null {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

function toISODate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function toDisplayDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${d}.${m}.${y}`;
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const ChevronLeft = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ChevronRight = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1.5" y="2.5" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.25" />
        <path d="M5 1V4M11 1V4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        <path d="M1.5 6.5H14.5" stroke="currentColor" strokeWidth="1.25" />
        <rect x="4" y="9" width="2" height="2" rx="0.5" fill="currentColor" />
        <rect x="7" y="9" width="2" height="2" rx="0.5" fill="currentColor" />
        <rect x="10" y="9" width="2" height="2" rx="0.5" fill="currentColor" />
    </svg>
);

// ─── Calendar dropdown ────────────────────────────────────────────────────────

interface CalendarProps {
    value: string;
    onChange: (value: string) => void;
    onClose: () => void;
    triggerWidth: number;
}

const Calendar = ({ value, onChange, onClose, triggerWidth }: CalendarProps) => {
    const selected = parseISODate(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [viewDate, setViewDate] = useState<Date>(() => {
        if (selected) return new Date(selected.getFullYear(), selected.getMonth(), 1);
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });

    // Sync viewDate when selected value changes externally
    useEffect(() => {
        const parsed = parseISODate(value);
        if (parsed) setViewDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
    }, [value]);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const handleSelect = (date: Date) => {
        onChange(toISODate(date));
        onClose();
    };

    // Build grid cells
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevMonthLastDate = new Date(year, month, 0).getDate();

    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;

    const cells: { date: Date; current: boolean }[] = [];

    for (let i = 0; i < startDow; i++) {
        cells.push({
            date: new Date(year, month - 1, prevMonthLastDate - startDow + 1 + i),
            current: false,
        });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
        cells.push({ date: new Date(year, month, d), current: true });
    }
    const endPad = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
    for (let i = 1; i <= endPad; i++) {
        cells.push({ date: new Date(year, month + 1, i), current: false });
    }

    const minWidth = Math.max(triggerWidth, 260);

    return (
        /*
         * FIX 1: background — використовуємо inline style з CSS змінними проєкту
         *         замість Tailwind dark: класів, бо вони потребують :root[dark] і
         *         можуть не спрацювати в кастомному дизайн-токені.
         * FIX 2: width — розширюємось як мінімум до ширини тригера.
         */
        <div
            role="dialog"
            aria-label="Вибір дати"
            style={{
                width: minWidth,
                // Явний фон через CSS змінні — підхоплює і light і dark тему проєкту
                background: 'var(--bg-secondary, #1e1e2e)',
                border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                borderRadius: 16,
                padding: 16,
                userSelect: 'none',
                boxSizing: 'border-box',
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <button
                    type="button"
                    onClick={prevMonth}
                    aria-label="Попередній місяць"
                    className={cn(
                        'w-8 h-8 flex items-center justify-center rounded-[8px]',
                        'border border-white/10 text-white/60',
                        'hover:bg-white/10 transition-colors duration-150',
                    )}
                >
                    <ChevronLeft />
                </button>
                <span className="text-sm font-semibold text-white">
                    {MONTHS_UA[month]} {year}
                </span>
                <button
                    type="button"
                    onClick={nextMonth}
                    aria-label="Наступний місяць"
                    className={cn(
                        'w-8 h-8 flex items-center justify-center rounded-[8px]',
                        'border border-white/10 text-white/60',
                        'hover:bg-white/10 transition-colors duration-150',
                    )}
                >
                    <ChevronRight />
                </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map((w, i) => (
                    <span
                        key={w}
                        className={cn(
                            'text-center text-[11px] font-semibold py-1',
                            i >= 5 ? 'text-red-400' : 'text-white/40',
                        )}
                    >
                        {w}
                    </span>
                ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map(({ date, current }, idx) => {
                    const dateNorm = new Date(date);
                    dateNorm.setHours(0, 0, 0, 0);
                    const isToday = dateNorm.getTime() === today.getTime();
                    const isSelected = selected
                        ? dateNorm.getTime() === selected.getTime()
                        : false;
                    const dow = date.getDay();
                    const isWeekend = dow === 0 || dow === 6;

                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelect(date)}
                            aria-label={`${date.getDate()} ${MONTHS_UA_GENITIVE[date.getMonth()]} ${date.getFullYear()}`}
                            aria-pressed={isSelected}
                            className={cn(
                                'aspect-square text-[13px] rounded-[8px] transition-colors duration-100',
                                'flex items-center justify-center',
                                // Inactive other-month days
                                !current && 'text-white/20',
                                // Current month days
                                current && !isWeekend && !isSelected && 'text-white/80',
                                current && isWeekend && !isSelected && 'text-red-400',
                                // Today
                                isToday && !isSelected && 'ring-1 ring-inset ring-blue-400 font-semibold',
                                // Selected
                                isSelected && 'bg-blue-600 text-white font-semibold',
                                // Hover
                                !isSelected && 'hover:bg-white/10',
                            )}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>

            {/* Today shortcut */}
            <div className="mt-3 pt-3 border-t border-white/10 flex justify-end">
                <button
                    type="button"
                    onClick={() => handleSelect(today)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                    Сьогодні
                </button>
            </div>
        </div>
    );
};

// ─── Main DatePicker ──────────────────────────────────────────────────────────

interface DatePickerProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    rules?: object;
    label?: string;
    placeholder?: string;
    classNameContainer?: string;
    className?: string;
    disabled?: boolean;
}

const DatePicker = <T extends FieldValues>({
                                               control,
                                               name,
                                               rules,
                                               label,
                                               placeholder = 'Оберіть дату',
                                               classNameContainer,
                                               className,
                                               disabled,
                                           }: DatePickerProps<T>) => {
    const id = useId();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open]);

    return (
        <div className={cn('w-auto', classNameContainer)} ref={containerRef}>
            {label && (
                <label htmlFor={id} className="text-xs font-semibold text-gray-600 ml-4 min-h-5">
                    {label}
                </label>
            )}

            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field, fieldState }) => {
                    const parsed = parseISODate(field.value);
                    const displayValue = parsed ? toDisplayDate(parsed) : '';
                    const triggerWidth = triggerRef.current?.offsetWidth ?? 260;

                    return (
                        <div className="relative">
                            {/* Trigger button — стилі як у Input компоненті проєкту */}
                            <button
                                id={id}
                                ref={triggerRef}
                                type="button"
                                disabled={disabled}
                                aria-haspopup="dialog"
                                aria-expanded={open}
                                onClick={() => !disabled && setOpen((v) => !v)}
                                className={cn(
                                    'px-4 min-h-[40px] w-full text-left font-medium rounded-[12px] border-2 outline-none text-base',
                                    'flex items-center justify-between gap-2',
                                    'bg-react/500 border-react/500 focus:border-react/300 duration-300',
                                    !displayValue && 'text-white/30',
                                    displayValue && 'text-white',
                                    fieldState.error && 'border-red/600 focus:border-red/500',
                                    disabled && 'opacity-50 cursor-not-allowed',
                                    className,
                                )}
                            >
                                <span>{displayValue || placeholder}</span>
                                <span className={cn('transition-colors text-white/40', open && 'text-blue-400')}>
                                    <CalendarIcon />
                                </span>
                            </button>

                            {/* Hidden input */}
                            <input type="hidden" value={field.value ?? ''} name={field.name} ref={field.ref} />

                            {/* Dropdown */}
                            {open && (
                                <div className="absolute z-50 mt-1.5 left-0">
                                    <Calendar
                                        value={field.value ?? ''}
                                        triggerWidth={triggerWidth}
                                        onChange={(val) => {
                                            field.onChange(val);
                                            field.onBlur();
                                        }}
                                        onClose={() => setOpen(false)}
                                    />
                                </div>
                            )}
                        </div>
                    );
                }}
            />
        </div>
    );
};

export default DatePicker;