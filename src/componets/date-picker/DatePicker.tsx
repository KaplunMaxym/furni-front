import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';

import { cn } from '@/helpers/cn';
import { parseISODate, startOfDay, toDisplayDate, toISODate } from './date';

const MONTHS_UA = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];

/** Тиждень починається з понеділка — так у календарях українською. */
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

/**
 * Мінімальна ширина календаря: сім колонок по 8 клітинок ще читаються.
 * Якщо поле ширше — календар розтягується під нього, щоб краї збігалися.
 */
const CALENDAR_MIN_WIDTH = 280;
/** Відступ від краю вікна, щоб календар не липнув до нього. */
const VIEWPORT_GAP = 8;

// ─── Календар ────────────────────────────────────────────────────────────────

interface CalendarProps {
    value: string;
    onSelect: (value: string) => void;
    min?: string;
    max?: string;
    /**
     * Кінець діапазону. Коли заданий, дні між ним і `value` підсвічуються.
     * Для звичайного вибору дати не передається — календар працює як раніше.
     */
    rangeEnd?: string;
    /** День під курсором — щоб показати діапазон ще до другого кліку. */
    hoverDate?: Date | null;
    onHoverDate?: (date: Date | null) => void;
}

const Calendar = ({ value, onSelect, min, max, rangeEnd, hoverDate, onHoverDate }: CalendarProps) => {
    const selected = parseISODate(value);
    const rangeEndDate = parseISODate(rangeEnd);
    const today = startOfDay(new Date());
    const minDate = parseISODate(min);
    const maxDate = parseISODate(max);

    const [viewDate, setViewDate] = useState<Date>(() => {
        const base = selected ?? today;
        return new Date(base.getFullYear(), base.getMonth(), 1);
    });

    // Дату могли змінити ззовні — переводимо погляд на її місяць
    useEffect(() => {
        const parsed = parseISODate(value);
        if (parsed) setViewDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
    }, [value]);

    /*
     * Межі підсвітки: другий край беремо з наведення, поки він не вибраний.
     * Без цього після першого кліку не видно, що саме зараз обирається.
     */
    const rangeTo = rangeEndDate ?? (selected && hoverDate ? hoverDate : null);
    const rangeFrom = selected;

    const [spanStart, spanEnd] = rangeFrom && rangeTo
        ? (startOfDay(rangeFrom) <= startOfDay(rangeTo)
            ? [startOfDay(rangeFrom), startOfDay(rangeTo)]
            : [startOfDay(rangeTo), startOfDay(rangeFrom)])
        : [null, null];

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    /*
     * Сітка 6×7: дні поточного місяця плюс «хвости» сусідніх.
     *
     * getDay() рахує від неділі (0), а тиждень у нас починається з понеділка —
     * звідси зсув. Кількість рядків фіксована, інакше при переході між
     * місяцями висота календаря стрибала б на один ряд.
     */
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const gridStart = new Date(year, month, 1 - startOffset);

    const cells = Array.from({ length: 42 }, (_, i) => {
        const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
        return { date, inMonth: date.getMonth() === month };
    });

    const isDisabled = (date: Date) => {
        const day = startOfDay(date);
        if (minDate && day < startOfDay(minDate)) return true;
        if (maxDate && day > startOfDay(maxDate)) return true;
        return false;
    };

    return (
        <div className="select-none">
            <div className="mb-2 flex items-center justify-between">
                <button
                    type="button"
                    aria-label="Попередній місяць"
                    onClick={() => setViewDate(new Date(year, month - 1, 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="text-sm font-medium text-foreground">
                    {MONTHS_UA[month]} {year}
                </span>

                <button
                    type="button"
                    aria-label="Наступний місяць"
                    onClick={() => setViewDate(new Date(year, month + 1, 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            <div className="grid grid-cols-7">
                {WEEKDAYS.map(day => (
                    <span key={day} className="py-1 text-center text-[11px] font-medium text-muted-foreground">
                        {day}
                    </span>
                ))}
            </div>

            <div
                className="grid grid-cols-7 gap-0.5"
                onMouseLeave={() => onHoverDate?.(null)}
            >
                {cells.map(({ date, inMonth }) => {
                    const day = startOfDay(date);
                    const isToday = day.getTime() === today.getTime();
                    const isStart = !!selected && day.getTime() === startOfDay(selected).getTime();
                    const isEnd = !!rangeEndDate && day.getTime() === startOfDay(rangeEndDate).getTime();
                    const isSelected = isStart || isEnd;
                    // Проміжні дні — заливка слабша: краї діапазону мають лишатись помітними
                    const inSpan = !!spanStart && !!spanEnd
                        && day > spanStart && day < spanEnd;
                    const disabled = isDisabled(date);

                    return (
                        <button
                            key={day.getTime()}
                            type="button"
                            disabled={disabled}
                            aria-pressed={isSelected}
                            onClick={() => onSelect(toISODate(date))}
                            onMouseEnter={() => onHoverDate?.(date)}
                            className={cn(
                                'flex h-8 items-center justify-center rounded-md text-[13px] tabular-nums',
                                'transition-colors disabled:pointer-events-none disabled:opacity-30',
                                // Дні сусідніх місяців приглушені, але клікабельні:
                                // так можна перейти на 1 число, не гортаючи місяць
                                inMonth ? 'text-foreground' : 'text-muted-foreground/50',
                                !isSelected && !inSpan && 'hover:bg-accent hover:text-accent-foreground',
                                inSpan && 'bg-primary/15',
                                isToday && !isSelected && 'ring-1 ring-inset ring-border font-medium',
                                isSelected && 'bg-primary text-primary-foreground font-medium hover:bg-primary',
                            )}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Поле з календарем ───────────────────────────────────────────────────────

export interface DateFieldProps {
    /** Значення у форматі 'YYYY-MM-DD'. Порожній рядок — дати немає. */
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    hasError?: boolean;
    /** Межі вибору, теж 'YYYY-MM-DD'. */
    min?: string;
    max?: string;
    /** Показувати хрестик очищення, коли дата задана. */
    clearable?: boolean;
    className?: string;
}

/**
 * Поле дати з випадним календарем — без прив'язки до react-hook-form.
 *
 * Календар рендериться в портал з `position: fixed`, а не поруч із полем.
 * Причина та сама, що й у меню рядка таблиці: модалка й обгортки таблиць мають
 * `overflow-auto`, а такий контейнер обрізає все абсолютно спозиційоване
 * всередині — календар просто не було б видно.
 *
 * Нативний `<input type="date">` не підійшов: його вигляд задає браузер, у
 * темній темі він лишається світлим, а порядок полів залежить від локалі
 * системи, а не від мови інтерфейсу.
 */
export const DateField = ({
    value,
    onChange,
    placeholder = 'Оберіть дату',
    disabled,
    hasError,
    min,
    max,
    clearable = true,
    className,
}: DateFieldProps) => {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const parsed = parseISODate(value);

    const place = useCallback(() => {
        const trigger = triggerRef.current;
        if (!trigger) return;

        const rect = trigger.getBoundingClientRect();

        // Календар за шириною поля — інакше вузьке поле й широкий календар
        // стоять уступом, а широке поле обривається на 280 пікселях
        const width = Math.max(rect.width, CALENDAR_MIN_WIDTH);

        const left = Math.max(
            VIEWPORT_GAP,
            Math.min(rect.left, window.innerWidth - width - VIEWPORT_GAP),
        );

        const below = rect.bottom + 4;
        const height = popoverRef.current?.offsetHeight ?? 0;
        // Не вміщається знизу — відкриваємо вгору
        const flip = height > 0 && below + height > window.innerHeight - VIEWPORT_GAP;

        setPosition({ top: flip ? rect.top - height - 4 : below, left, width });
    }, []);

    useLayoutEffect(() => {
        if (open) place();
    }, [open, place]);

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (e: MouseEvent) => {
            const target = e.target as Node;
            if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
            setOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        // Прокрутка зрушила б поле з-під календаря
        const onScrollOrResize = () => setOpen(false);

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        window.addEventListener('resize', onScrollOrResize);
        window.addEventListener('scroll', onScrollOrResize, true);

        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('resize', onScrollOrResize);
            window.removeEventListener('scroll', onScrollOrResize, true);
        };
    }, [open]);

    return (
        <div className={cn('relative', className)}>
            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => setOpen(v => !v)}
                className={cn(
                    // Ті самі класи, що в решти полів проєкту
                    'flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 text-left text-sm shadow-xs',
                    'outline-none transition-[color,box-shadow] focus-visible:ring-[3px]',
                    'disabled:pointer-events-none disabled:opacity-50',
                    hasError
                        ? 'border-destructive-foreground focus-visible:ring-destructive/40'
                        : 'border-input focus-visible:border-ring focus-visible:ring-ring/50',
                    parsed ? 'text-foreground' : 'text-muted-foreground',
                )}
            >
                <span>{parsed ? toDisplayDate(parsed) : placeholder}</span>

                {clearable && parsed && !disabled ? (
                    <span
                        role="button"
                        tabIndex={-1}
                        aria-label="Очистити дату"
                        onClick={e => {
                            // Інакше клік дійшов би до кнопки й відкрив календар
                            e.stopPropagation();
                            onChange('');
                            setOpen(false);
                        }}
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                        <X className="h-3.5 w-3.5" />
                    </span>
                ) : (
                    <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
            </button>

            {open &&
                createPortal(
                    <div
                        ref={popoverRef}
                        role="dialog"
                        aria-label="Вибір дати"
                        style={{
                            position: 'fixed',
                            top: position?.top ?? -9999,
                            left: position?.left ?? -9999,
                            width: position?.width ?? CALENDAR_MIN_WIDTH,
                        }}
                        className={cn(
                            'z-[80] rounded-md border border-input bg-popover p-3 text-popover-foreground shadow-lg',
                            // До першого вимірювання календар стоїть за межами
                            // екрана — ховаємо, щоб не блимав у куті
                            !position && 'invisible',
                        )}
                    >
                        <Calendar
                            value={value}
                            min={min}
                            max={max}
                            onSelect={next => {
                                onChange(next);
                                setOpen(false);
                            }}
                        />

                        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    onChange(toISODate(new Date()));
                                    setOpen(false);
                                }}
                                className="rounded px-2 py-1 text-xs text-foreground transition-colors hover:bg-accent"
                            >
                                Сьогодні
                            </button>

                            {clearable && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange('');
                                        setOpen(false);
                                    }}
                                    className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                >
                                    Очистити
                                </button>
                            )}
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
};

// ─── Поле діапазону дат ──────────────────────────────────────────────────────

export interface DateRangeFieldProps {
    /** Обидві межі у форматі 'YYYY-MM-DD'; порожній рядок — межі немає. */
    from: string;
    to: string;
    onChange: (from: string, to: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

/**
 * Один вибір на весь діапазон замість двох полів «з» і «по».
 *
 * Два окремі поля змушували двічі відкривати календар і самому стежити, щоб
 * початок не опинився пізніше за кінець. Тут перший клік ставить початок,
 * другий — кінець; якщо другий виявився раніше, межі міняються місцями самі.
 *
 * Поки кінець не вибраний, діапазон підсвічується за наведенням — видно, що
 * саме зараз обираєш.
 */
export const DateRangeField = ({
    from,
    to,
    onChange,
    placeholder = 'Оберіть період',
    disabled,
    className,
}: DateRangeFieldProps) => {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const fromDate = parseISODate(from);
    const toDate = parseISODate(to);

    const label = fromDate
        ? toDate
            ? `${toDisplayDate(fromDate)} — ${toDisplayDate(toDate)}`
            : `з ${toDisplayDate(fromDate)}`
        : placeholder;

    const place = useCallback(() => {
        const trigger = triggerRef.current;
        if (!trigger) return;

        const rect = trigger.getBoundingClientRect();

        // Календар за шириною поля — див. пояснення в DateField
        const width = Math.max(rect.width, CALENDAR_MIN_WIDTH);

        const left = Math.max(
            VIEWPORT_GAP,
            Math.min(rect.left, window.innerWidth - width - VIEWPORT_GAP),
        );

        const below = rect.bottom + 4;
        const height = popoverRef.current?.offsetHeight ?? 0;
        const flip = height > 0 && below + height > window.innerHeight - VIEWPORT_GAP;

        setPosition({ top: flip ? rect.top - height - 4 : below, left, width });
    }, []);

    useLayoutEffect(() => {
        if (open) place();
    }, [open, place]);

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (e: MouseEvent) => {
            const target = e.target as Node;
            if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
            setOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        const onScrollOrResize = () => setOpen(false);

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        window.addEventListener('resize', onScrollOrResize);
        window.addEventListener('scroll', onScrollOrResize, true);

        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('resize', onScrollOrResize);
            window.removeEventListener('scroll', onScrollOrResize, true);
        };
    }, [open]);

    const handleSelect = (iso: string) => {
        // Початку немає або діапазон уже повний — починаємо новий
        if (!from || to) {
            onChange(iso, '');
            return;
        }

        // Другий клік раніше за перший — це не помилка, а інший порядок вибору
        if (iso < from) {
            onChange(iso, from);
        } else {
            onChange(from, iso);
        }

        setHoverDate(null);
        setOpen(false);
    };

    const clear = () => {
        onChange('', '');
        setHoverDate(null);
        setOpen(false);
    };

    return (
        <div className={cn('relative', className)}>
            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => setOpen(v => !v)}
                className={cn(
                    'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-left text-sm shadow-xs',
                    'outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    'disabled:pointer-events-none disabled:opacity-50',
                    fromDate ? 'text-foreground' : 'text-muted-foreground',
                )}
            >
                <span className="truncate">{label}</span>

                {fromDate && !disabled ? (
                    <span
                        role="button"
                        tabIndex={-1}
                        aria-label="Очистити період"
                        onClick={e => {
                            e.stopPropagation();
                            clear();
                        }}
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                        <X className="h-3.5 w-3.5" />
                    </span>
                ) : (
                    <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
            </button>

            {open &&
                createPortal(
                    <div
                        ref={popoverRef}
                        role="dialog"
                        aria-label="Вибір періоду"
                        style={{
                            position: 'fixed',
                            top: position?.top ?? -9999,
                            left: position?.left ?? -9999,
                            width: position?.width ?? CALENDAR_MIN_WIDTH,
                        }}
                        className={cn(
                            'z-[80] rounded-md border border-input bg-popover p-3 text-popover-foreground shadow-lg',
                            !position && 'invisible',
                        )}
                    >
                        <Calendar
                            value={from}
                            rangeEnd={to}
                            hoverDate={hoverDate}
                            onHoverDate={setHoverDate}
                            onSelect={handleSelect}
                        />

                        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                            <span className="px-2 text-xs text-muted-foreground">
                                {from && !to ? 'Оберіть кінець періоду' : 'Оберіть початок періоду'}
                            </span>

                            <button
                                type="button"
                                onClick={clear}
                                className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                                Очистити
                            </button>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
};

// ─── Обгортка під react-hook-form ────────────────────────────────────────────

interface DatePickerProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    rules?: object;
    label?: string;
    placeholder?: string;
    classNameContainer?: string;
    className?: string;
    disabled?: boolean;
    min?: string;
    max?: string;
    clearable?: boolean;
}

/** Те саме поле, але підключене до форми. */
const DatePicker = <T extends FieldValues>({
    control,
    name,
    rules,
    label,
    placeholder,
    classNameContainer,
    className,
    disabled,
    min,
    max,
    clearable,
}: DatePickerProps<T>) => {
    const id = useId();

    return (
        <div className={cn('flex flex-col gap-[5px]', classNameContainer)}>
            {label && (
                <label htmlFor={id} className="pl-4 text-xs font-semibold text-foreground">
                    {label}
                </label>
            )}

            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field, fieldState }) => (
                    <DateField
                        value={field.value ?? ''}
                        onChange={next => {
                            field.onChange(next);
                            field.onBlur();
                        }}
                        placeholder={placeholder}
                        disabled={disabled}
                        hasError={!!fieldState.error}
                        min={min}
                        max={max}
                        clearable={clearable}
                        className={className}
                    />
                )}
            />
        </div>
    );
};

export default DatePicker;
