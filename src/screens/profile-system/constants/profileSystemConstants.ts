import {DetailCode, DrillEdgeParams, MillSideOption, ShelfPairParams, ShelfWireParams, ShelfBackGrooveParams, ShelfDrillParams} from "@/screens/profile-system/types/OperationDetailsType";

export const OPERATION_TYPE_LABELS: Record<string, string> = {
    CUT:         "Різання",
    MILL:        "Фрезерування",
    DRILL:       "Свердління",
    HANDLE_MILL: "Фрезерування ручки",
    MILL_DRILL:  "Фрезер + свердління",
    HINGE_MILL:  "Фрезерування завіс",
    GROOVE_MILL: "Паз боковини",
    SLOT_MILL:   "Канавка боковини",
    WIRE_MILL:   "Вихід дроту",
    BACK_GROOVE: "Задній паз",
    ASSEMBLY:    "Складання",
    OTHER:       "Інше",
};

export const DETAIL_TYPE_LABELS: Record<string, string> = {
    PROFILE: "Профіль",
    HANDLE:  "Ручка",
    GLASS:   "Скло",
    HINGE:   "Завіса",
};

export const ALL_DETAIL_CODES: DetailCode[] = ["TOP", "BOTTOM", "BACK", "FRONT", "LEFT", "RIGHT"];

export const FRAME_SIDES: DetailCode[] = ["TOP", "BOTTOM", "LEFT", "RIGHT"];

export const SHELF_SIDES: DetailCode[] = ["BACK", "FRONT", "LEFT", "RIGHT"];

export const SIDES: DetailCode[] = FRAME_SIDES;

export function sidesFromParams(params: Record<string, unknown> | null | undefined): DetailCode[] {
    const all = ALL_DETAIL_CODES;
    if (!params) return FRAME_SIDES;
    const present = all.filter((s: DetailCode) => params[s] !== undefined);
    return present.length ? present : FRAME_SIDES;
}

export const SIDE_LABELS: Record<DetailCode, string> = {
    TOP: "Верх", BOTTOM: "Низ", LEFT: "Ліво", RIGHT: "Право",
    FRONT: "Перед", BACK: "Зад",
};

export const MILL_SIDES_OPTIONS: MillSideOption[] = ["none", "start", "end", "both"];

/**
 * Значення «сторін фрезерування» людською мовою.
 *
 * У базі лишаються ті самі `none`/`start`/`end`/`both` — їх читає генератор
 * програм, і перейменування там зламало б розкрій усіх систем. Перекладаємо
 * лише те, що видно на екрані.
 */
export const MILL_SIDES_LABELS: Record<MillSideOption, string> = {
    none:  "Не фрезерувати",
    start: "Початок",
    end:   "Кінець",
    both:  "Обидва кінці",
};

/*
 * Підписи полів — українською, літери осей лишаються.
 *
 * X, Y, Z — не англійські слова, а назви осей верстата: оператор бачить їх і
 * в програмі, і на стійці, тож перекладати їх означало б розірвати зв'язок між
 * довідником і тим, що людина читає біля пили.
 */
export const EDGE_FIELDS: Array<{ key: keyof DrillEdgeParams; label: string }> = [
    { key: "startOffsetX1", label: "Отвір 1 від початку, X" },
    { key: "startOffsetX2", label: "Отвір 2 від початку, X" },
    { key: "startOffsetX3", label: "Отвір 3 від початку, X" },
    { key: "endOffsetX1",   label: "Отвір 1 від кінця, X" },
    { key: "endOffsetX2",   label: "Отвір 2 від кінця, X" },
    { key: "endOffsetX3",   label: "Отвір 3 від кінця, X" },
    { key: "offsetY",       label: "Зсув по Y" },
    { key: "offsetY1",      label: "Зсув по Y, початок" },
    { key: "offsetY2",      label: "Зсув по Y, кінець" },
    { key: "offsetZ",       label: "Зсув по Z" },
    // { key: "countStart",    label: "Скільки отворів від початку" },
    // { key: "countEnd",      label: "Скільки отворів від кінця" },
];

export const SHELF_PAIR_FIELDS: Array<{ key: keyof ShelfPairParams; label: string }> = [
    { key: "startX",     label: "Від початку, X" },
    { key: "width",      label: "Ширина" },
    { key: "endOffsetX", label: "Від кінця, X" },
    { key: "offsetX",    label: "Зсув сторони, X" },
];

export const SHELF_WIRE_FIELDS: Array<{ key: keyof ShelfWireParams; label: string }> = [
    { key: "inset", label: "Відступ від торця" },
];

export const SHELF_BACK_GROOVE_FIELDS: Array<{ key: keyof ShelfBackGrooveParams; label: string }> = [
    { key: "midOffset",   label: "Середина (від кінця)" },
    { key: "startOffset", label: "Початок (від кінця)" },
];

export const SHELF_DRILL_FIELDS: Array<{ key: keyof ShelfDrillParams; label: string }> = [
    { key: "startOffsetX", label: "Від початку, X" },
    { key: "endOffsetX",   label: "Від кінця, X" },
    { key: "startY1",      label: "Отвір 1 від початку, Y" },
    { key: "startY2",      label: "Отвір 2 від початку, Y" },
    { key: "endY1",        label: "Отвір 1 від кінця, Y" },
    { key: "endY2",        label: "Отвір 2 від кінця, Y" },
];
