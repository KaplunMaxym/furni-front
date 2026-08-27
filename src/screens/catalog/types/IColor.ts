export const COLOR_TYPES = ['PROFILE', 'HANDLE', 'HINGE'] as const;
export type ColorType = typeof COLOR_TYPES[number];

export const COLOR_TYPE_LABELS: Record<ColorType, string> = {
    PROFILE: 'Профіль',
    HANDLE: 'Ручка',
    HINGE: 'Завіса',
};

export interface IColorUsage {
    id: number;
    type: ColorType;
}

export interface IColor {
    id: number;
    name: string;
    code: string | null;
    types: IColorUsage[];
}