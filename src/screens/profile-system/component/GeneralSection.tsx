import React, { useEffect, useState } from "react";

import { cn } from "@/helpers/cn";
import { IProfileSystemFull } from "@/screens/profile-system/types/profile-system/IProfileSystemFull";
import { IProfileSystemUpdate } from "@/screens/profile-system/types/profile-system/IProfileSystemUpdate";

interface GeneralSectionProps {
    system: IProfileSystemFull;
    isPending: boolean;
    onSave: (dto: IProfileSystemUpdate) => Promise<unknown>;
    /** Повідомляє сторінці стан збереження, щоб показати його в шапці. */
    onDirtyChange?: (isDirty: boolean) => void;
}

/** Поля рядком, як їх бачить користувач; у DTO числа розбираються при збереженні. */
interface Draft {
    title: string;
    code1C: string;
    minWidth: string;
    maxWidth: string;
    minHeight: string;
    maxHeight: string;
    lengthCorrection: string;
}

const DIMENSIONS = [
    { key: 'minWidth',  label: 'Мін. ширина'  },
    { key: 'maxWidth',  label: 'Макс. ширина' },
    { key: 'minHeight', label: 'Мін. висота'  },
    { key: 'maxHeight', label: 'Макс. висота' },
] as const;

/** Скільки чекати після останнього натиску, перш ніж зберігати. */
const AUTOSAVE_DELAY_MS = 700;

const toText = (value: number | string | null | undefined) =>
    value === null || value === undefined ? '' : String(value);

const draftFrom = (system: IProfileSystemFull): Draft => ({
    title: system.title,
    code1C: toText(system.code1C),
    minWidth: toText(system.minWidth),
    maxWidth: toText(system.maxWidth),
    minHeight: toText(system.minHeight),
    maxHeight: toText(system.maxHeight),
    // У базі лежить серед решти параметрів системи, у формі — окремим полем
    lengthCorrection: toText(system.defaultParameters?.lengthCorrection as number | undefined),
});

const FIELD_CLASS = cn(
    'h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs',
    'text-foreground placeholder:text-muted-foreground/70 outline-none',
    'transition-[color,box-shadow] focus-visible:ring-[3px]',
);

/**
 * Основна інформація про систему.
 *
 * Було: біля кожного поля олівець, який перемикав рядок у режим редагування,
 * далі «Зберегти» і «Скасувати», і кожне поле відправлялося окремим запитом.
 * Щоб виправити чотири розміри, треба було зробити дванадцять кліків.
 *
 * Стало: усі поля доступні одразу, а зміни їдуть самі — через паузу після
 * останнього натиску, як на сторінці налаштувань у проєкті dashboard. Кнопки
 * немає навмисно: вона нічого не додавала, крім ще одного кліку, бо зберігати
 * тут можна будь-коли — це довідник, а не форма з підтвердженням.
 */
const GeneralSection: React.FC<GeneralSectionProps> = ({ system, isPending, onSave, onDirtyChange }) => {
    const [draft, setDraft] = useState<Draft>(() => draftFrom(system));

    // Дані могли оновитися ззовні — беремо чернетку з них заново
    useEffect(() => setDraft(draftFrom(system)), [system]);

    const original = draftFrom(system);
    const changed = (Object.keys(original) as (keyof Draft)[]).filter(
        key => draft[key].trim() !== original[key],
    );

    const isBadNumber = (value: string) => {
        const text = value.trim();
        if (text === '') return false;
        const parsed = Number(text);
        return !Number.isFinite(parsed) || parsed < 0;
    };

    const invalid: string[] = [
        ...DIMENSIONS.filter(({ key }) => isBadNumber(draft[key])).map(d => d.key),
        ...(isBadNumber(draft.lengthCorrection) ? ['lengthCorrection'] : []),
    ];

    // Порожня назва — не «ще не ввів», а зіпсований довідник: не зберігаємо
    const isDirty = changed.length > 0 && invalid.length === 0 && draft.title.trim() !== '';

    useEffect(() => onDirtyChange?.(isDirty), [isDirty, onDirtyChange]);

    /*
     * Автозбереження із затримкою.
     *
     * Кожна зміна перезапускає таймер, тож набране в полі відправляється один
     * раз, а не по літері. Після відповіді сервера `system` збігається з
     * чернеткою, `isDirty` гасне — і повторного запиту не буде.
     */
    useEffect(() => {
        if (!isDirty) return;

        const size = (value: string) => (value.trim() === '' ? undefined : Number(value));

        const timer = setTimeout(() => {
            void onSave({
                title: draft.title.trim(),
                code1C: draft.code1C.trim(),
                // Порожній розмір означає «межі немає», а не нуль
                minWidth: size(draft.minWidth),
                maxWidth: size(draft.maxWidth),
                minHeight: size(draft.minHeight),
                maxHeight: size(draft.maxHeight),
                // Порожнє поле означає «корекції немає», а не нуль
                lengthCorrection: size(draft.lengthCorrection) ?? null,
            });
        }, AUTOSAVE_DELAY_MS);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draft, isDirty]);

    const set = (key: keyof Draft, value: string) => setDraft(prev => ({ ...prev, [key]: value }));

    return (
        <div className={cn('flex flex-col gap-5 transition-opacity', isPending && 'opacity-60')}>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className="text-xs font-medium text-muted-foreground">Назва</span>
                    <input
                        value={draft.title}
                        onChange={e => set('title', e.target.value)}
                        className={cn(
                            FIELD_CLASS,
                            draft.title.trim() === ''
                                ? 'border-destructive-foreground focus-visible:ring-destructive/40'
                                : 'border-input focus-visible:border-ring focus-visible:ring-ring/50',
                        )}
                    />
                </label>

                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">Код системи</span>
                    <p className="flex h-9 items-center rounded-md border border-input px-3 font-mono text-sm text-muted-foreground">
                        {system.code}
                    </p>
                    {/* Пояснюємо, чому поле не редагується — інакше це схоже на поламане */}
                    <span className="text-xs text-muted-foreground">
                        Незмінний: на нього спираються розкрій і програми CNC
                    </span>
                </div>

                <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">Код 1С</span>
                    <input
                        value={draft.code1C}
                        onChange={e => set('code1C', e.target.value)}
                        placeholder="Напр. 000045212"
                        className={cn(FIELD_CLASS, 'border-input font-mono focus-visible:border-ring focus-visible:ring-ring/50')}
                    />
                </label>
            </div>

            <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Габаритні межі, мм</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {DIMENSIONS.map(({ key, label }) => (
                        <label key={key} className="flex flex-col gap-1.5">
                            <span className="text-xs text-muted-foreground">{label}</span>
                            <input
                                type="number"
                                min="0"
                                inputMode="decimal"
                                value={draft[key]}
                                onChange={e => set(key, e.target.value)}
                                placeholder="—"
                                className={cn(
                                    FIELD_CLASS,
                                    invalid.includes(key)
                                        ? 'border-destructive-foreground focus-visible:ring-destructive/40'
                                        : 'border-input focus-visible:border-ring focus-visible:ring-ring/50',
                                )}
                            />
                        </label>
                    ))}
                </div>
            </div>

            {/*
                Корекція довжини стоїть тут, а не в операціях.

                Вона описує профіль, а не операцію: те саме число потрібне й
                різанню, і фрезеруванню. Поки воно лежало всередині кожної
                операції, ще й окремо для кожної сторони, змінити його треба
                було в чотирьох місцях — і забутий четвертий означав, що деталь
                ріжуть однієї довжини, а фрезерують іншої.
            */}
            <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Обробка профілю</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs text-muted-foreground">Корекція довжини, з боку</span>
                        <input
                            type="number"
                            min="0"
                            step="0.001"
                            inputMode="decimal"
                            value={draft.lengthCorrection}
                            onChange={e => set('lengthCorrection', e.target.value)}
                            placeholder="—"
                            className={cn(
                                FIELD_CLASS,
                                invalid.includes('lengthCorrection')
                                    ? 'border-destructive-foreground focus-visible:ring-destructive/40'
                                    : 'border-input focus-visible:border-ring focus-visible:ring-ring/50',
                            )}
                        />
                        <span className="text-xs text-muted-foreground">
                            Мм з кожного боку горизонталей. Діє на різання й фрезерування
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default GeneralSection;
