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