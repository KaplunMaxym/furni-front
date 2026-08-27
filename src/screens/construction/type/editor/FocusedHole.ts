export type FocusedHoleKey = {
    side: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT';
    type: 'start' | 'end' | 'handle';
    index: number;
} | null;