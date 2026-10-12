export const BEAM_NAMES = {
    TOP: 'Верхня балка',
    BOTTOM: 'Нижня балка',
    LEFT: 'Ліва балка',
    RIGHT: 'Права балка'
} as const;

export type BeamName = typeof BEAM_NAMES[keyof typeof BEAM_NAMES];

export function getBeamNames(): BeamName[] {
    return Object.values(BEAM_NAMES);
}

export function isHorizontalBeam(beamName: string): boolean {
    return beamName === BEAM_NAMES.TOP || beamName === BEAM_NAMES.BOTTOM;
}

export function isVerticalBeam(beamName: string): boolean {
    return beamName === BEAM_NAMES.LEFT || beamName === BEAM_NAMES.RIGHT;
}

export const MODEL_TO_BEAM_NAME_MAP: Record<string, string> = {
    'Нижня_балка': BEAM_NAMES.BOTTOM,
    'Верхня_балка': BEAM_NAMES.TOP,
    'Права_балка':  BEAM_NAMES.RIGHT,
    'Ліва_балка':   BEAM_NAMES.LEFT,
};

export const BEAM_COLORS: Record<string, number> = {
    [BEAM_NAMES.TOP]:    0xC0C0C0,
    [BEAM_NAMES.BOTTOM]: 0xC0C0C0,
    [BEAM_NAMES.LEFT]:   0xD0D0D0,
    [BEAM_NAMES.RIGHT]:  0xD0D0D0,
};

export const PART_PRIORITY: Record<string, number> = {
    [BEAM_NAMES.TOP]:    1,
    [BEAM_NAMES.LEFT]:   2,
    [BEAM_NAMES.BOTTOM]: 3,
    [BEAM_NAMES.RIGHT]:  4,
    'Стекло':            0,
};

export type DetailCode = 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'FRONT' | 'BACK';

const LEGACY_NAME_TO_CODE: Record<string, DetailCode> = {
    [BEAM_NAMES.TOP]: 'TOP',
    [BEAM_NAMES.BOTTOM]: 'BOTTOM',
    [BEAM_NAMES.LEFT]: 'LEFT',
    [BEAM_NAMES.RIGHT]: 'RIGHT',
};

export function resolveDetailCode(detail: { code?: string | null; name?: string | null } | null | undefined): string {
    if (detail?.code) return detail.code;
    const name = detail?.name ?? '';
    return LEGACY_NAME_TO_CODE[name] ?? name;
}

export function isHorizontalCode(code: string): boolean {
    return code === 'TOP' || code === 'BOTTOM' || code === 'FRONT' || code === 'BACK';
}

export function isVerticalCode(code: string): boolean {
    return code === 'LEFT' || code === 'RIGHT';
}

export function beamLabel(code: string, details?: Array<{ code?: string | null; name?: string | null }>): string {
    const found = details?.find(d => resolveDetailCode(d) === code);
    if (found?.name) return found.name;
    return DEFAULT_CODE_LABELS[code] ?? code;
}

export const DEFAULT_CODE_LABELS: Record<string, string> = {
    TOP: BEAM_NAMES.TOP,
    BOTTOM: BEAM_NAMES.BOTTOM,
    LEFT: BEAM_NAMES.LEFT,
    RIGHT: BEAM_NAMES.RIGHT,
    FRONT: 'Передня рамка',
    BACK: 'Задня рамка',
};

export const CODE_PRIORITY: Record<string, number> = {
    TOP: 1, BACK: 1,
    LEFT: 2,
    BOTTOM: 3, FRONT: 3,
    RIGHT: 4,
    GLASS: 5, HANDLE: 6, HINGE: 7,
};

export const CODE_COLORS: Record<string, number> = {
    TOP: 0xC0C0C0, BOTTOM: 0xC0C0C0, BACK: 0xC0C0C0, FRONT: 0xC0C0C0,
    LEFT: 0xD0D0D0, RIGHT: 0xD0D0D0,
};

/**
 * Полиця — та сама чотирибічна рамка, але лежить горизонтально.
 * Поворот на -90° навколо X: локальний +Y (задня рамка) йде вглиб сцени,
 * локальний +Z стає «вгору». Константа спільна для 3D-групи і для
 * проєкції розмірних ліній, щоб вони не розʼїхались.
 */
export const SHELF_ROTATION: [number, number, number] = [-Math.PI / 2, 0, 0];
