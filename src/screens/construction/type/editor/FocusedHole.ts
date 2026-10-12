export type FocusedHoleKey = {
    side: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'FRONT' | 'BACK';
    type: 'start' | 'end' | 'handle';
    index: number;
} | null;