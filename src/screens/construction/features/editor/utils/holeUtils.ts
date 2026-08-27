import { DrillDefaultParameters } from '@/screens/construction/features/editor/panels/ParametersPanel';
import { FocusedHoleKey } from '@/screens/construction/type/editor/FocusedHole';

export function resolveHoleMeta(
    side: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT',
    arrayIndex: number,
    drillParams: DrillDefaultParameters | undefined,
): { type: 'start' | 'end' | 'handle'; index: number } {
    const edge       = drillParams?.[side]?.edge;
    const countEnd   = Number(edge?.countEnd   ?? 0);
    const countStart = Number(edge?.countStart ?? 0);

    if (side === 'TOP') {
        if (arrayIndex < countEnd) return { type: 'end',   index: arrayIndex + 1 };
        return { type: 'start', index: arrayIndex - countEnd + 1 };
    } else {
        if (arrayIndex < countStart) return { type: 'start', index: arrayIndex + 1 };
        return { type: 'end', index: arrayIndex - countStart + 1 };
    }
}

export function isFocused(
    focusedHole: FocusedHoleKey,
    side: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT',
    arrayIndex: number,
    drillParams: DrillDefaultParameters | undefined,
): boolean {
    if (!focusedHole) return false;
    if (focusedHole.side !== side) return false;
    if (focusedHole.type === 'handle') return false;
    const meta = resolveHoleMeta(side, arrayIndex, drillParams);
    return focusedHole.type === meta.type && focusedHole.index === meta.index;
}

export function isHandleHoleFocused(
    focusedHole: FocusedHoleKey,
    side: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT',
    _arrayIndex: number,
): boolean {
    if (!focusedHole) return false;
    if (focusedHole.side !== side) return false;
    return focusedHole.type === 'handle';
}