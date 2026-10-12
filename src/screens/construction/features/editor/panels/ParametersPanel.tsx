'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import Button from "@/ui/button/Button";
import Input from "@/ui/input/Input";
import {ParametersPanelProps} from "@/screens/construction/type/editor/ThreeMesh";
import { toast } from "sonner";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import {
    HandleSideEnum,
    IConstruction,
    IProfileSystem,
    OperationType
} from "@/screens/construction/type/construction/IConstruction";
import { ChevronDown } from 'lucide-react';
import { cn } from "@/helpers/cn";
import {ConstructionDetail} from "@/screens/construction/type/construction-details/IConstructionDetail";
import {beamLabel, resolveDetailCode, CODE_PRIORITY} from "@/screens/construction/constants/beamConstants";
import {useConstructionDetails} from "@/screens/construction/hooks/construction-details/useConstructionDetails";
import {FocusedHoleKey} from "@/screens/construction/type/editor/FocusedHole";
import Hint from "@/ui/hint/Hint";
import {
    CONSTRUCTION_HINTS, CUT_HINTS, DRILL_EDGE_HINTS, DRILL_HANDLE_HINTS,
    HINGE_HINTS, MILL_HINTS, SHELF_BACK_GROOVE_HINTS, SHELF_PAIR_HINTS, SHELF_WIRE_HINTS,
} from "@/constants/paramHints";

function makeInputRefKey(side: string, type: string, index: number): string {
    return `${side}__${type}__${index}`;
}

interface EdgeParams {
    [key: string]: number | undefined;
    offsetY?: number;
    offsetY1?: number;
    offsetY2?: number;
    offsetZ?: number;
    countStart: number;
    countEnd: number;
}

interface HandleDrillParams {
    spacingX: number;
    offsetY: number;
}

interface SideMillParams {
    millLengthStart?: number;
    millLengthEnd?: number;
    millLength?: number;
    millSides?: 'none' | 'start' | 'end' | 'both';
    startX?: number;
    centerX?: number;
    sideX?: number;
    mirrorOffsetX?: number;
    lengthCorrection?: number;
}

interface SideDrillParams {
    edge: EdgeParams;
    handle?: HandleDrillParams;
}

interface FormValues {
    frameWidth: number;
    frameHeight: number;
    beamThickness: number;
    hasHandle?: boolean;
    handleSide?: HandleSideEnum;
    handleOffset?: number;
    handlePosition?: number;
    hingeSide?: HandleSideEnum;
    wireSide?: HandleSideEnum;
    drillParams: DrillDefaultParameters;
    millParams: MillDefaultParameters;
    cutParams: CutDefaultParameters;
    hingeParams: HingeDefaultParameters;
    operationParams: Record<string, ExtraOpParams>;
}

type ExtraOpParams = Record<string, Record<string, number | boolean>>;

interface ExtendedParametersPanelProps extends ParametersPanelProps {
    profileSystem: IProfileSystem;
    construction: IConstruction;
    drillParams?: DrillDefaultParameters;
    setDrillParams?: (params: DrillDefaultParameters) => void;
    millParams?: MillDefaultParameters;
    setMillParams?: (params: MillDefaultParameters) => void;
    cutParams?: CutDefaultParameters;
    setCutParams?: (params: CutDefaultParameters) => void;
    hingeParams?: HingeDefaultParameters;
    setHingeParams?: (params: HingeDefaultParameters) => void;
    operationParams?: Record<string, unknown>;
    setOperationParams?: (params: Record<string, unknown>) => void;
    hingeSide?: HandleSideEnum;
    setHingeSide?: (side: HandleSideEnum | undefined) => void;
    wireSide?: HandleSideEnum;
    setWireSide?: (side: HandleSideEnum | undefined) => void;
    onHoleInputFocus?: (key: FocusedHoleKey) => void;
    focusedHole?: FocusedHoleKey;
}

interface SideLengthCorrection {
    lengthCorrection?: number;
}

export interface CutDefaultParameters {
    leftAngle: number;
    rightAngle: number;
    offsetZ: number;
    sawThickness: number;
    TOP?: SideLengthCorrection;
    BOTTOM?: SideLengthCorrection;
    LEFT?: SideLengthCorrection;
    RIGHT?: SideLengthCorrection;
    FRONT?: SideLengthCorrection;
    BACK?: SideLengthCorrection;
}

export interface HingeItem {
    offsetFromStart?: number;
    offsetFromEnd?: number;
    slotWidth: number;
}

export interface HingeDefaultParameters {
    hinges: HingeItem[];
}

export interface DrillDefaultParameters {
    TOP: SideDrillParams;
    BOTTOM: SideDrillParams;
    RIGHT: SideDrillParams;
    LEFT: SideDrillParams & { handle: HandleDrillParams };
    FRONT?: SideDrillParams;
    BACK?: SideDrillParams;
}

export interface MillDefaultParameters {
    ignoreHandleSide: boolean;
    TOP: SideMillParams;
    BOTTOM: SideMillParams;
    LEFT: SideMillParams;
    RIGHT: SideMillParams;
    FRONT?: SideMillParams;
    BACK?: SideMillParams;
}

type SideKey = 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'FRONT' | 'BACK';

const FALLBACK_DRILL_PARAMS: DrillDefaultParameters = {
    TOP: {
        edge: {
            startOffsetX1: 69.5,
            startOffsetX2: 69.5,
            endOffsetX1: 55.50,
            endOffsetX2: 55.50,
            endOffsetX3: 55.50,
            offsetY: 11.2,
            offsetZ: 17.4,
            countStart: 2,
            countEnd: 3,
        },
    },
    BOTTOM: {
        edge: {
            startOffsetX1: 69.5,
            startOffsetX2: 69.5,
            startOffsetX3: 69.5,
            endOffsetX1: 55.50,
            endOffsetX2: 55.50,
            offsetY: 11.2,
            offsetZ: 17.4,
            countStart: 3,
            countEnd: 2,
        },
    },
    RIGHT: {
        edge: {
            startOffsetX1: 34,
            endOffsetX1: 34,
            offsetY: 11.2,
            offsetZ: 17.4,
            countStart: 1,
            countEnd: 1,
        },
    },
    LEFT: {
        handle: { spacingX: 128, offsetY: 10 },
        edge: {
            startOffsetX1: 34,
            startOffsetX2: 34,
            endOffsetX1: 34,
            endOffsetX2: 34,
            offsetY: 11.2,
            offsetZ: 17.4,
            countStart: 2,
            countEnd: 2,
        },
    },
};

const FALLBACK_MILL_PARAMS: MillDefaultParameters = {
    ignoreHandleSide: false,
    TOP:    { millLength: 35 },
    BOTTOM: { millLength: 35 },
    LEFT:   { millLength: 35 },
    RIGHT:  { millLength: 35 },
};

/*
 * «(мм)» з підписів прибрано: одиниця тепер стоїть у самому полі, праворуч
 * від числа. У підписі вона з'їдала місце й зникала з очей рівно тоді, коли
 * потрібна — під час набору дивляться в поле, а не над ним.
 */
/*
 * Вигляд секцій панелі.
 *
 * Було три відтінки одного кольору — `bg-accent/30` у закритої шапки,
 * `bg-accent/60` у відкритої, `bg-accent/20` у тіла — і рамка навколо кожної
 * шапки окремо. Різниця між 20, 30 і 60 відсотками прозорості на темному тлі
 * не читається взагалі: замість восьми зрозумілих блоків виходила однорідна
 * сіра каша, у якій межі секції видно не було.
 *
 * Тепер це картка з рамкою, а шапка — та сама смуга `bg-muted`, що й підписи
 * груп на решті сторінок (`SectionLabel`). Відкрита секція відрізняється не
 * відтінком, а тим, що під шапкою з'явився вміст.
 */
const SECTION_CARD = 'mb-2 overflow-hidden rounded-lg border border-border';

const SECTION_HEAD =
    'flex w-full items-center justify-between gap-3 bg-muted px-4 py-2.5 text-left ' +
    'text-xs font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-secondary';

const SECTION_BODY = 'space-y-3 border-t border-border p-4';

const MILL_EXTRA_FIELDS: Array<{ key: keyof SideMillParams & string; label: string }> = [
    { key: 'startX',        label: 'Початок, X' },
    { key: 'centerX',       label: 'Центр, X' },
    { key: 'sideX',         label: 'Від краю, X' },
    { key: 'mirrorOffsetX', label: 'Дзеркальний зсув, X' },
];

const FALLBACK_CUT_PARAMS: CutDefaultParameters = {
    leftAngle: 45,
    rightAngle: 45,
    offsetZ: 2,
    sawThickness: 1.344,
};

const FALLBACK_HINGE_PARAMS: HingeDefaultParameters = {
    hinges: [
        { offsetFromStart: 60.8, slotWidth: 44.4 },
        { offsetFromEnd: 60.8,   slotWidth: 44.4 },
    ],
};

function resolveSystemOperations(profileSystem: IProfileSystem) {
    return profileSystem.operations ?? profileSystem.operation ?? [];
}


function extractDrillParamsFromProfileSystem(profileSystem: IProfileSystem): DrillDefaultParameters {
    const drillOperation = resolveSystemOperations(profileSystem).find(
        op => op.operationType === OperationType.DRILL
    );
    if (!drillOperation?.defaultParameters) return FALLBACK_DRILL_PARAMS;
    try {
        const parsed = typeof drillOperation.defaultParameters === 'string'
            ? JSON.parse(drillOperation.defaultParameters)
            : drillOperation.defaultParameters;
        const drillSides: SideKey[] = ['TOP', 'BOTTOM', 'LEFT', 'RIGHT', 'FRONT', 'BACK'];
        if (parsed && drillSides.some(side => parsed[side])) {
            return parsed as DrillDefaultParameters;
        }
        return FALLBACK_DRILL_PARAMS;
    } catch {
        return FALLBACK_DRILL_PARAMS;
    }
}

function extractCutParamsFromProfileSystem(profileSystem: IProfileSystem): CutDefaultParameters {
    const cutOperation = resolveSystemOperations(profileSystem).find(
        op => op.operationType === OperationType.CUT
    );
    if (!cutOperation?.defaultParameters) return FALLBACK_CUT_PARAMS;
    try {
        const parsed = typeof cutOperation.defaultParameters === 'string'
            ? JSON.parse(cutOperation.defaultParameters)
            : cutOperation.defaultParameters;
        return parsed as CutDefaultParameters;
    } catch {
        return FALLBACK_CUT_PARAMS;
    }
}

function extractMillParamsFromProfileSystem(profileSystem: IProfileSystem): MillDefaultParameters {
    const millOperation = resolveSystemOperations(profileSystem).find(
        op => op.operationType === OperationType.MILL
    );
    if (!millOperation?.defaultParameters) return FALLBACK_MILL_PARAMS;
    try {
        const parsed = typeof millOperation.defaultParameters === 'string'
            ? JSON.parse(millOperation.defaultParameters)
            : millOperation.defaultParameters;

        const sides: SideKey[] = ['TOP', 'BOTTOM', 'LEFT', 'RIGHT', 'FRONT', 'BACK'];
        if (parsed && sides.some(side => parsed[side])) {
            return parsed as MillDefaultParameters;
        }
        return FALLBACK_MILL_PARAMS;
    } catch {
        return FALLBACK_MILL_PARAMS;
    }
}

function mergeMillParams(
    defaults: MillDefaultParameters,
    saved: MillDefaultParameters | undefined,
): MillDefaultParameters {
    if (!saved) return defaults;

    const merged: MillDefaultParameters = { ...defaults, ...saved };
    const sides: SideKey[] = ['TOP', 'BOTTOM', 'LEFT', 'RIGHT', 'FRONT', 'BACK'];

    for (const side of sides) {
        const base = defaults[side];
        const own = saved[side];
        if (!base && !own) continue;

        const next: SideMillParams = { ...base, ...own };

        const systemHasPair = base?.millLengthStart !== undefined;
        const savedOnlyLegacy = own?.millLength !== undefined
            && own?.millLengthStart === undefined
            && own?.millLengthEnd === undefined;

        if (systemHasPair && savedOnlyLegacy) {
            next.millLengthStart = own.millLength;
            next.millLengthEnd = own.millLength;
            delete next.millLength;
        }

        merged[side] = next;
    }

    return merged;
}

function mergeCutParams(
    defaults: CutDefaultParameters,
    saved: CutDefaultParameters | undefined,
): CutDefaultParameters {
    if (!saved) return defaults;

    const merged: CutDefaultParameters = { ...defaults, ...saved };
    const sides: SideKey[] = ['TOP', 'BOTTOM', 'LEFT', 'RIGHT', 'FRONT', 'BACK'];

    for (const side of sides) {
        const base = defaults[side];
        const own = saved[side];
        if (base || own) merged[side] = { ...base, ...own };
    }

    return merged;
}

function extractHingeParamsFromProfileSystem(profileSystem: IProfileSystem): HingeDefaultParameters {
    const hingeOperation = resolveSystemOperations(profileSystem).find(
        op => op.operationType === OperationType.HINGE_MILL
    );
    if (!hingeOperation?.defaultParameters) return FALLBACK_HINGE_PARAMS;
    try {
        const parsed = typeof hingeOperation.defaultParameters === 'string'
            ? JSON.parse(hingeOperation.defaultParameters)
            : hingeOperation.defaultParameters;
        if (parsed?.hinges?.length) return parsed as HingeDefaultParameters;
        return FALLBACK_HINGE_PARAMS;
    } catch {
        return FALLBACK_HINGE_PARAMS;
    }
}

function analyzeDrillParamsStructure(drillParams: DrillDefaultParameters, details: ConstructionDetail[]): Array<{ key: SideKey; label: string; hasOffsetY: boolean; hasOffsetY1: boolean; hasOffsetY2: boolean; hasOffsetZ: boolean; hasHandle: boolean; startCount: number; endCount: number; }> {
    const sideConfig = (Object.keys(drillParams) as SideKey[])
        .filter(k => CODE_PRIORITY[k] !== undefined)
        .sort((a, b) => (CODE_PRIORITY[a] ?? 99) - (CODE_PRIORITY[b] ?? 99))
        .map(key => ({ key: key as SideKey, label: `${beamLabel(key, details)} (${key})` }));

    return sideConfig
        .map(config => {
            const sideData = drillParams[config.key];
            if (!sideData || !sideData.edge || Object.keys(sideData.edge).length === 0) return null;

            const detail = details.find(d => resolveDetailCode(d) === config.key);
            const sequencePrefix = detail?.sequence != null ? `R${detail.sequence} ` : '';
            return {
                key: config.key,
                label: `${sequencePrefix}${config.label}`,
                sequence: detail?.sequence ?? Infinity,
                hasOffsetY:  sideData?.edge?.offsetY  !== undefined,
                hasOffsetY1: sideData?.edge?.offsetY1 !== undefined,
                hasOffsetY2: sideData?.edge?.offsetY2 !== undefined,
                hasOffsetZ:  sideData?.edge?.offsetZ !== undefined,
                hasHandle:   sideData?.handle        !== undefined,
                startCount:  sideData?.edge?.countStart ?? 0,
                endCount:    sideData?.edge?.countEnd   ?? 0,
            };
        })
        .filter(Boolean)
        .sort((a, b) => a!.sequence - b!.sequence) as Array<{
        key: SideKey;
        label: string;
        hasOffsetY: boolean;
        hasOffsetY1: boolean;
        hasOffsetY2: boolean;
        hasOffsetZ: boolean;
        hasHandle: boolean;
        startCount: number;
        endCount: number;
    }>;
}

export default function ParametersPanel({
                                            construction,
                                            frameWidth, setFrameWidth,
                                            frameHeight, setFrameHeight,
                                            beamThickness, setBeamThickness,
                                            hasHandle, setHasHandle,
                                            handleSide, setHandleSide,
                                            handleOffset, setHandleOffset,
                                            handlePosition, setHandlePosition,
                                            drillParams: externalDrillParams,
                                            setDrillParams: setExternalDrillParams,
                                            cutParams: externalCutParams,
                                            setCutParams: setExternalCutParams,
                                            millParams: externalMillParams,
                                            setMillParams: setExternalMillParams,
                                            hingeParams: externalHingeParams,
                                            operationParams: externalOperationParams,
                                            setOperationParams: setExternalOperationParams,
                                            setHingeParams: setExternalHingeParams,
                                            hingeSide,
                                            setHingeSide,
                                            wireSide,
                                            setWireSide,
                                            profileSystem,
                                            onUpdate,
                                            onHoleInputFocus,
                                            focusedHole,
                                        }: ExtendedParametersPanelProps) {
    const { data: details = [] as ConstructionDetail[] } = useConstructionDetails(construction.id);

    const resolvedInitialDrillParams = useMemo(() => {
        if (externalDrillParams) return externalDrillParams;
        return extractDrillParamsFromProfileSystem(profileSystem);
    }, []);

    const resolvedInitialMillParams = useMemo(
        () => mergeMillParams(extractMillParamsFromProfileSystem(profileSystem), externalMillParams),
        [],
    );

    const resolvedInitialCutParams = useMemo(
        () => mergeCutParams(extractCutParamsFromProfileSystem(profileSystem), externalCutParams),
        [],
    );

    const resolvedInitialHingeParams = useMemo(() => {
        if (externalHingeParams) return externalHingeParams;
        return extractHingeParamsFromProfileSystem(profileSystem);
    }, []);

    const resolvedInitialOperationParams = useMemo(() => {
        const result: Record<string, ExtraOpParams> =
            { ...((externalOperationParams ?? {}) as Record<string, ExtraOpParams>) };

        for (const op of resolveSystemOperations(profileSystem)) {
            const type = String(op.operationType);
            if (result[type]) continue;
            const raw = op.defaultParameters;
            if (raw) result[type] = (typeof raw === 'string' ? JSON.parse(raw) : raw) as ExtraOpParams;
        }
        return result;
    }, []);

    const [initialValues, setInitialValues] = React.useState<FormValues>({
        frameWidth,
        frameHeight,
        beamThickness,
        hasHandle,
        handleSide,
        handleOffset,
        handlePosition,
        hingeSide,
        wireSide,
        drillParams: resolvedInitialDrillParams,
        millParams:  resolvedInitialMillParams,
        cutParams:   resolvedInitialCutParams,
        hingeParams: resolvedInitialHingeParams,
        operationParams: resolvedInitialOperationParams,
    });

    const [expandedSections,   setExpandedSections]   = React.useState<Set<string>>(new Set());
    const [expandedDrillSides, setExpandedDrillSides] = React.useState<Set<string>>(new Set());
    const [expandedMillSides,  setExpandedMillSides]  = React.useState<Set<string>>(new Set());

    const { control, setValue, getValues } = useForm<FormValues>({
        defaultValues: {
            frameWidth,
            frameHeight,
            beamThickness,
            hasHandle,
            handleSide,
            handleOffset,
            handlePosition,
            hingeSide,
            wireSide,
            drillParams: resolvedInitialDrillParams,
            millParams:  resolvedInitialMillParams,
            cutParams:   resolvedInitialCutParams,
            hingeParams: resolvedInitialHingeParams,
            operationParams: resolvedInitialOperationParams,
        },
        mode: 'onChange',
    });

    const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

    const setInputRef = (key: string, el: HTMLInputElement | null) => {
        if (el) inputRefs.current.set(key, el);
        else    inputRefs.current.delete(key);
    };

    const watchedFrameWidth     = useWatch({ control, name: 'frameWidth' });
    const watchedFrameHeight    = useWatch({ control, name: 'frameHeight' });
    const watchedBeamThickness  = useWatch({ control, name: 'beamThickness' });
    const watchedHasHandle      = useWatch({ control, name: 'hasHandle' });
    const watchedHandleSide     = useWatch({ control, name: 'handleSide' });
    const watchedHandleOffset   = useWatch({ control, name: 'handleOffset' });
    const watchedHandlePosition = useWatch({ control, name: 'handlePosition' });
    const watchedHingeSide      = useWatch({ control, name: 'hingeSide' });
    const watchedWireSide       = useWatch({ control, name: 'wireSide' });
    const watchedDrillParams    = useWatch({ control, name: 'drillParams' });
    const watchedMillParams     = useWatch({ control, name: 'millParams' });
    const watchedCutParams      = useWatch({ control, name: 'cutParams' });
    const watchedHingeParams    = useWatch({ control, name: 'hingeParams' });
    const watchedOperationParams = useWatch({ control, name: 'operationParams' });

    const drillParamsStr  = JSON.stringify(watchedDrillParams);
    const millParamsStr   = JSON.stringify(watchedMillParams);
    const cutParamsStr    = JSON.stringify(watchedCutParams);
    const hingeParamsStr  = JSON.stringify(watchedHingeParams);
    const operationParamsStr = JSON.stringify(watchedOperationParams);

    /*
     * Корекції довжини в цій панелі немає.
     *
     * Вона описує профіль, а не окрему конструкцію, і задається один раз у
     * довіднику системи. Поле тут редагувало б копію, зроблену при створенні
     * конструкції, — а програма все одно рахується за значенням системи.
     */

    const drillSides = useMemo(
        () => analyzeDrillParamsStructure(watchedDrillParams, details),
        [drillParamsStr, details]
    );

    const initialValuesStr = JSON.stringify(initialValues);

    const hasChanges = useMemo(() => {
        const initial = JSON.parse(initialValuesStr);
        return (
            watchedFrameWidth     !== initial.frameWidth     ||
            watchedFrameHeight    !== initial.frameHeight    ||
            watchedBeamThickness  !== initial.beamThickness  ||
            watchedHasHandle      !== initial.hasHandle      ||
            watchedHandleSide     !== initial.handleSide     ||
            watchedHandleOffset   !== initial.handleOffset   ||
            watchedHandlePosition !== initial.handlePosition ||
            watchedHingeSide      !== initial.hingeSide      ||
            watchedWireSide       !== initial.wireSide       ||
            drillParamsStr  !== JSON.stringify(initial.drillParams)  ||
            millParamsStr   !== JSON.stringify(initial.millParams)   ||
            cutParamsStr    !== JSON.stringify(initial.cutParams)    ||
            hingeParamsStr  !== JSON.stringify(initial.hingeParams) ||
            operationParamsStr !== JSON.stringify(initial.operationParams)
        );
    }, [
        watchedFrameWidth, watchedFrameHeight, watchedBeamThickness,
        watchedHasHandle, watchedHandleSide, watchedHandleOffset, watchedHandlePosition,
        watchedHingeSide,
        watchedWireSide,
        drillParamsStr, millParamsStr, cutParamsStr, hingeParamsStr,
        operationParamsStr,
        initialValuesStr,
    ]);

    useEffect(() => {
        setFrameWidth(watchedFrameWidth);
        setFrameHeight(watchedFrameHeight);
        setBeamThickness(watchedBeamThickness);
        if (setHasHandle)      setHasHandle(watchedHasHandle ?? false);
        if (setHandleSide)     setHandleSide(watchedHandleSide);
        if (setHandleOffset)   setHandleOffset(watchedHandleOffset);
        if (setHandlePosition) setHandlePosition(watchedHandlePosition);
    }, [
        watchedFrameWidth, watchedFrameHeight, watchedBeamThickness,
        watchedHasHandle, watchedHandleSide, watchedHandleOffset, watchedHandlePosition,
    ]);

    useEffect(() => {
        if (setHingeSide) setHingeSide(watchedHingeSide);
    }, [watchedHingeSide]);

    useEffect(() => {
        if (setWireSide) setWireSide(watchedWireSide);
    }, [watchedWireSide]);

    useEffect(() => {
        if (setExternalCutParams)   setExternalCutParams(JSON.parse(cutParamsStr));
    }, [cutParamsStr]);

    useEffect(() => {
        if (setExternalOperationParams && operationParamsStr) {
            setExternalOperationParams(JSON.parse(operationParamsStr));
        }
    }, [operationParamsStr]);

    useEffect(() => {
        if (setExternalDrillParams) setExternalDrillParams(JSON.parse(drillParamsStr));
    }, [drillParamsStr]);

    useEffect(() => {
        if (setExternalMillParams)  setExternalMillParams(JSON.parse(millParamsStr));
    }, [millParamsStr]);

    useEffect(() => {
        if (setExternalHingeParams) setExternalHingeParams(JSON.parse(hingeParamsStr));
    }, [hingeParamsStr]);

    useEffect(() => {
        if (!focusedHole) return;

        setExpandedSections(prev => {
            const next = new Set(prev);
            next.add('drill');
            return next;
        });

        setExpandedDrillSides(prev => {
            const next = new Set(prev);
            next.add(focusedHole.side);
            return next;
        });

        const timer = setTimeout(() => {
            let refKey: string;
            if (focusedHole.type === 'handle') {
                refKey = focusedHole.index === 1
                    ? `${focusedHole.side}__handle__spacingX`
                    : `${focusedHole.side}__handle__offsetY`;
            } else {
                refKey = makeInputRefKey(focusedHole.side, focusedHole.type, focusedHole.index);
            }

            const el = inputRefs.current.get(refKey);
            if (el) {
                el.focus({ preventScroll: false });
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [focusedHole]);

    const handleSideOptions = [
        { label: 'Ліво',  value: HandleSideEnum.LEFT  },
        { label: 'Право', value: HandleSideEnum.RIGHT },
    ];

    const hingeSideOptions = [
        { label: 'Ліво',  value: HandleSideEnum.LEFT  },
        { label: 'Право', value: HandleSideEnum.RIGHT },
    ];

    const wireSideOptions = hingeSideOptions;

    const visibleSidesFor = (opType: string, sides: string[]): string[] => {
        if (opType !== OperationType.WIRE_MILL) return sides;
        if (!watchedWireSide) return sides;
        return sides.filter(side => side === watchedWireSide);
    };

    const toggleSection   = (section: string) => {
        const next = new Set(expandedSections);
        next.has(section) ? next.delete(section) : next.add(section);
        setExpandedSections(next);
    };
    const toggleDrillSide = (side: string) => {
        const next = new Set(expandedDrillSides);
        next.has(side) ? next.delete(side) : next.add(side);
        setExpandedDrillSides(next);
    };
    const toggleMillSide  = (side: string) => {
        const next = new Set(expandedMillSides);
        next.has(side) ? next.delete(side) : next.add(side);
        setExpandedMillSides(next);
    };

    const handleUpdate = async () => {
        const errors: string[] = [];
        const width  = Number(watchedFrameWidth);
        const height = Number(watchedFrameHeight);
        const beam   = Number(watchedBeamThickness);

        if (!width  || isNaN(width))  errors.push('Ширина рамки: введіть значення');
        else {
            if (width < 100)  errors.push('Ширина рамки: мінімум 100 мм');
            if (width > 3000) errors.push('Ширина рамки: максимум 3000 мм');
        }
        if (!height || isNaN(height)) errors.push('Висота рамки: введіть значення');
        else {
            if (height < 100)  errors.push('Висота рамки: мінімум 100 мм');
            if (height > 3000) errors.push('Висота рамки: максимум 3000 мм');
        }
        if (!beam || isNaN(beam)) errors.push('Товщина балки: введіть значення');
        else {
            if (beam < 5)   errors.push('Товщина балки: мінімум 5 мм');
            if (beam > 100) errors.push('Товщина балки: максимум 100 мм');
        }
        if (watchedHasHandle) {
            if (!watchedHandleSide) errors.push('Сторона ручки: оберіть сторону');
            const offset = Number(watchedHandleOffset);
            if (!isNaN(offset)) {
                if (offset < 0)    errors.push('Ширина ручки: мінімум 0 мм');
                if (offset > 1000) errors.push('Ширина ручки: максимум 1000 мм');
                const dp = String(offset).split('.')[1];
                if (dp && dp.length > 3) errors.push('Ширина ручки: максимум 3 цифри після коми');
            }
            const position = Number(watchedHandlePosition);
            if (!isNaN(position)) {
                if (position < 0)    errors.push('Позиція ручки: мінімум 0 мм');
                if (position > 2000) errors.push('Позиція ручки: максимум 2000 мм');
                const dp = String(position).split('.')[1];
                if (dp && dp.length > 3) errors.push('Позиція ручки: максимум 3 цифри після коми');
            }
        }

        if (errors.length > 0) {
            errors.forEach(error => toast.error(error, { duration: 4000 }));
            return;
        }

        try {
            await onUpdate();
            const currentValues = getValues();
            setInitialValues({
                frameWidth:     currentValues.frameWidth,
                frameHeight:    currentValues.frameHeight,
                beamThickness:  currentValues.beamThickness,
                hasHandle:      currentValues.hasHandle,
                handleSide:     currentValues.handleSide,
                handleOffset:   currentValues.handleOffset,
                handlePosition: currentValues.handlePosition,
                hingeSide:      currentValues.hingeSide,
                wireSide:       currentValues.wireSide,
                drillParams:    JSON.parse(JSON.stringify(currentValues.drillParams)),
                millParams:     JSON.parse(JSON.stringify(currentValues.millParams)),
                cutParams:      JSON.parse(JSON.stringify(currentValues.cutParams)),
                hingeParams:    JSON.parse(JSON.stringify(currentValues.hingeParams)),
                operationParams: JSON.parse(JSON.stringify(currentValues.operationParams ?? {})),
            });
            toast.success('Зміни успішно застосовані та збережені!', { duration: 3000 });
        } catch (error) {
            console.log(error);
            toast.error('Помилка при збереженні змін', { duration: 4000 });
        }
    };

    const validateDecimalPlaces = (value: number) => {
        if (value === undefined || value === null) return true;
        const dp = String(value).split('.')[1];
        if (dp && dp.length > 3) return 'Максимум 3 цифри після коми';
        return true;
    };

    const systemOperations = useMemo(
        () => profileSystem.operations ?? profileSystem.operation ?? [],
        [profileSystem],
    );

    const drillOperationTitle = useMemo(() => {
        return systemOperations.find(op => op.operationType === OperationType.DRILL)?.title
            ?? 'Параметри свердління';
    }, [profileSystem]);

    const millOperationTitle = useMemo(() => {
        return systemOperations.find(op => op.operationType === OperationType.MILL)?.title
            ?? 'Параметри фрезерування';
    }, [profileSystem]);

    const hasHingeDetail = useMemo(
        () => details.some(d => String(d.type) === 'HINGE'),
        [details],
    );

    const hingeOperationTitle = useMemo(() => {
        return systemOperations.find(op => op.operationType === OperationType.HINGE_MILL)?.title
            ?? 'Параметри завіс';
    }, [profileSystem]);

    const EXTRA_OPERATIONS: Array<{
        type: string;
        title: string;
        fields: Array<{ key: string; label: string }>;
    }> = [
        { type: 'GROOVE_MILL', title: 'Параметри пазів', fields: [
            { key: 'startX', label: 'Від початку, X' }, { key: 'width', label: 'Ширина' },
            { key: 'endOffsetX', label: 'Від кінця, X' }, { key: 'offsetX', label: 'Зсув сторони, X' },
        ]},
        { type: 'SLOT_MILL', title: 'Параметри канавок', fields: [
            { key: 'startX', label: 'Від початку, X' }, { key: 'width', label: 'Ширина' },
            { key: 'endOffsetX', label: 'Від кінця, X' }, { key: 'offsetX', label: 'Зсув сторони, X' },
        ]},
        { type: 'WIRE_MILL', title: 'Вихід дроту', fields: [
            { key: 'inset', label: 'Відступ від торця' },
        ]},
        { type: 'BACK_GROOVE', title: 'Задній паз', fields: [
            { key: 'midOffset', label: 'Середина (від кінця)' },
            { key: 'startOffset', label: 'Початок (від кінця)' },
        ]},
    ];

    /**
     * Пояснення полів для операцій боковини.
     *
     * Ключі полів однакові в кількох операціях (`startX` є і в пазі, і в
     * канавці), тож словник вибирається за типом операції, а не за ключем.
     */
    const extraHints = (type: string): Record<string, string> => {
        switch (type) {
            case 'GROOVE_MILL':
            case 'SLOT_MILL':   return SHELF_PAIR_HINTS;
            case 'WIRE_MILL':   return SHELF_WIRE_HINTS;
            case 'BACK_GROOVE': return SHELF_BACK_GROOVE_HINTS;
            default:            return {};
        }
    };

    const extraOperations = useMemo(
        () => EXTRA_OPERATIONS.filter(op =>
            systemOperations.some(o => String(o.operationType) === op.type),
        ),
        [systemOperations],
    );

    const extraParams: Record<string, ExtraOpParams> =
        (watchedOperationParams as Record<string, ExtraOpParams>) ?? {};


    const focusHole = (key: FocusedHoleKey) => onHoleInputFocus?.(key);
    const blurHole  = () => onHoleInputFocus?.(null);

    return (
        <div className="flex flex-col bg-transparent">
            <div className="p-3">
                {/*
                  * Липкий заголовок: секцій вісім, і на «Фрезеруванні» вже не
                  * видно, у якій панелі ти взагалі перебуваєш.
                  */}
                <h2 className="sticky top-0 z-10 -mx-3 -mt-3 mb-3 border-b border-border bg-card px-4 py-3 text-base font-semibold text-foreground">
                    Параметри конструкції
                </h2>

                <div className={SECTION_CARD}>
                    <button
                        onClick={() => toggleSection('dimensions')}
                        className={SECTION_HEAD}
                    >
                        <span className="flex items-center gap-2">Розміри конструкції</span>
                        <ChevronDown size={18} className={cn("transition-transform", expandedSections.has('dimensions') ? "rotate-180" : "")} />
                    </button>
                    {expandedSections.has('dimensions') && (
                        <div className={SECTION_BODY}>
                            <Input<FormValues>
                                control={control} name="frameWidth" type="number"
                                label="Ширина (X)" unit="мм" hint={CONSTRUCTION_HINTS.frameWidth}
                                rules={{ min: { value: 100, message: 'Мінімум 100 мм' }, max: { value: 3000, message: 'Максимум 3000 мм' }, validate: validateDecimalPlaces }}
                                placeholder="Введіть ширину" className="flex-1 z-0" classNameContainer="mb-0 relative z-0"
                            />
                            <Input<FormValues>
                                control={control} name="frameHeight" type="number"
                                label="Висота (Y)" unit="мм" hint={CONSTRUCTION_HINTS.frameHeight}
                                rules={{ min: { value: 100, message: 'Мінімум 100 мм' }, max: { value: 3000, message: 'Максимум 3000 мм' }, validate: validateDecimalPlaces }}
                                placeholder="Введіть висоту" className="flex-1 z-0" classNameContainer="mb-0 relative z-0"
                            />
                            <Input<FormValues>
                                control={control} name="beamThickness" type="number"
                                label="Товщина балки" unit="мм" hint={CONSTRUCTION_HINTS.beamThickness}
                                rules={{ min: { value: 5, message: 'Мінімум 5 мм' }, max: { value: 100, message: 'Максимум 100 мм' }, validate: validateDecimalPlaces }}
                                placeholder="Введіть товщину" className="flex-1 z-0" classNameContainer="mb-0 relative z-0"
                            />
                        </div>
                    )}
                </div>

                <div className={SECTION_CARD}>
                    <button
                        onClick={() => toggleSection('cutting')}
                        className={SECTION_HEAD}
                    >
                        <span className="flex items-center gap-2">Параметри різання</span>
                        <ChevronDown size={18} className={cn("transition-transform", expandedSections.has('cutting') ? "rotate-180" : "")} />
                    </button>
                    {expandedSections.has('cutting') && (
                        <div className={SECTION_BODY}>
                            <Input<FormValues>
                                control={control} name="cutParams.sawThickness" type="number" step="0.001"
                                label="Товщина пили" unit="мм" hint={CONSTRUCTION_HINTS.sawThickness}
                                rules={{ min: { value: 0.1, message: 'Мінімум 0.1 мм' }, max: { value: 10, message: 'Максимум 10 мм' }, validate: validateDecimalPlaces }}
                                placeholder="Введіть товщину" className="flex-1 z-0" classNameContainer="mb-0 relative z-0"
                            />
                            <Input<FormValues>
                                control={control} name="cutParams.offsetZ" type="number" step="0.001"
                                label="Глибина різання" unit="мм" hint={CUT_HINTS.offsetZ}
                                rules={{ min: { value: 0, message: 'Мінімум 0 мм' }, max: { value: 50, message: 'Максимум 50 мм' }, validate: validateDecimalPlaces }}
                                placeholder="2" className="flex-1 z-0" classNameContainer="mb-0 relative z-0"
                            />

                        </div>
                    )}
                </div>

                {hasHandle && (
                    <div className={SECTION_CARD}>
                        <button
                            onClick={() => toggleSection('handle')}
                            className={SECTION_HEAD}
                        >
                            <span className="flex items-center gap-2">Параметри ручки</span>
                            <ChevronDown size={18} className={cn("transition-transform", expandedSections.has('handle') ? "rotate-180" : "")} />
                        </button>
                        {expandedSections.has('handle') && (
                            <div className={SECTION_BODY}>
                                <div>
                                    <p className="mb-2 flex items-center gap-1.5 pl-4 text-xs font-semibold">
                                        Сторона ручки *
                                        <Hint title="Сторона ручки">{CONSTRUCTION_HINTS.handleSide}</Hint>
                                    </p>
                                    <SelectorSearch
                                        getAndSet={[
                                            watchedHandleSide || '',
                                            (value) => setValue('handleSide', value as HandleSideEnum)
                                        ]}
                                        options={handleSideOptions}
                                        placeholder={'Оберіть сторону'}
                                        optionValue="value"
                                        optionLabel="label"
                                        isEmptyValueDisable={true}
                                        searchable={true}
                                    />
                                </div>
                                <div className="flex flex-row gap-4">
                                    <div className="flex-1">
                                        <Input<FormValues>
                                            control={control} name="handleOffset" type="number" step="0.001"
                                            label="Ширина ручки" unit="мм" hint={CONSTRUCTION_HINTS.handleOffset}
                                            rules={{ min: { value: 0, message: 'Мінімум 0 мм' }, max: { value: 1000, message: 'Максимум 1000 мм' }, validate: validateDecimalPlaces }}
                                            placeholder="160" className="flex-1 z-0" classNameContainer="mb-0 relative z-0"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Input<FormValues>
                                            control={control} name="handlePosition" type="number" step="0.001"
                                            label="Позиція ручки" unit="мм" hint={CONSTRUCTION_HINTS.handlePosition}
                                            rules={{ min: { value: 0, message: 'Мінімум 0 мм' }, max: { value: 2000, message: 'Максимум 2000 мм' }, validate: validateDecimalPlaces }}
                                            placeholder="0" className="flex-1 z-0" classNameContainer="mb-0 relative z-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {hasHingeDetail && hingeSide && (
                    <div className={SECTION_CARD}>
                        <button
                            onClick={() => toggleSection('hinge')}
                            className={SECTION_HEAD}
                        >
                            <span className="flex items-center gap-2">{hingeOperationTitle}</span>
                            <ChevronDown size={18} className={cn("transition-transform", expandedSections.has('hinge') ? "rotate-180" : "")} />
                        </button>
                        {expandedSections.has('hinge') && (
                            <div className={SECTION_BODY}>
                                <div>
                                    <p className="mb-2 flex items-center gap-1.5 pl-4 text-xs font-semibold">
                                        Сторона завіс
                                        <Hint title="Сторона завіс">{HINGE_HINTS.hingeSide}</Hint>
                                    </p>
                                    <SelectorSearch
                                        getAndSet={[
                                            watchedHingeSide || '',
                                            (value) => setValue('hingeSide', (value as HandleSideEnum) || undefined)
                                        ]}
                                        options={hingeSideOptions}
                                        placeholder={'Без завіс'}
                                        optionValue="value"
                                        optionLabel="label"
                                        isEmptyValueDisable={false}
                                        searchable={true}
                                    />
                                </div>

                                {watchedHingeSide && (
                                    <div className="space-y-2">
                                        {watchedHingeParams.hinges.map((hinge, index) => {
                                            const label = hinge.offsetFromStart !== undefined
                                                ? `Завіса ${index + 1} — від початку`
                                                : `Завіса ${index + 1} — від кінця`;
                                            return (
                                                <div key={index} className="rounded-lg overflow-hidden">
                                                    <div className="px-3 py-2 bg-accent/20 text-muted-foreground text-sm font-semibold">
                                                        {label}
                                                    </div>
                                                    <div className="p-3 bg-card grid grid-cols-2 gap-2">
                                                        <Input<FormValues>
                                                            control={control}
                                                            name={hinge.offsetFromStart !== undefined
                                                                ? `hingeParams.hinges.${index}.offsetFromStart`
                                                                : `hingeParams.hinges.${index}.offsetFromEnd`
                                                            }
                                                            type="number" step="0.001"
                                                            label={hinge.offsetFromStart !== undefined
                                                                ? 'Відступ від початку'
                                                                : 'Відступ від кінця'
                                                            }
                                                            unit="мм"
                                                            hint={hinge.offsetFromStart !== undefined
                                                                ? HINGE_HINTS.offsetFromStart
                                                                : HINGE_HINTS.offsetFromEnd
                                                            }
                                                            rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                            className="z-0" classNameContainer="mb-0 relative z-0"
                                                        />
                                                        <Input<FormValues>
                                                            control={control}
                                                            name={`hingeParams.hinges.${index}.slotWidth`}
                                                            type="number" step="0.001"
                                                            label="Ширина завіси" unit="мм" hint={HINGE_HINTS.slotWidth}
                                                            rules={{ min: { value: 1, message: 'Мінімум 1' } }}
                                                            className="z-0" classNameContainer="mb-0 relative z-0"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Свердління */}
                <div className={SECTION_CARD}>
                    <button
                        onClick={() => toggleSection('drill')}
                        className={SECTION_HEAD}
                    >
                        <span className="flex items-center gap-2">{drillOperationTitle}</span>
                        <ChevronDown size={18} className={cn("transition-transform", expandedSections.has('drill') ? "rotate-180" : "")} />
                    </button>

                    {expandedSections.has('drill') && (
                        <div className="mt-2 space-y-2">
                            {drillSides.map(({ key, label, hasOffsetY, hasOffsetY1, hasOffsetY2, hasOffsetZ, hasHandle: sideHasHandle, startCount, endCount }) => (
                                <div key={key} className="rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => toggleDrillSide(key)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2 text-sm font-semibold transition-all",
                                            expandedDrillSides.has(key)
                                                ? "bg-accent/20 text-muted-foreground"
                                                : "bg-accent/30 text-muted-foreground hover:bg-accent/60"
                                        )}
                                    >
                                        <span>{label}</span>
                                        <ChevronDown size={15} className={cn("transition-transform", expandedDrillSides.has(key) ? "rotate-180" : "")} />
                                    </button>

                                    {expandedDrillSides.has(key) && (
                                        <div className="p-3 bg-card space-y-4">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
                                                    Крайові отвори
                                                </p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {hasOffsetY && (
                                                        <Input<FormValues>
                                                            control={control}
                                                            name={`drillParams.${key}.edge.offsetY`}
                                                            type="number" step="0.001" label="Відступ Y" unit="мм" hint={DRILL_EDGE_HINTS.offsetY}
                                                            rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                            className="z-0" classNameContainer="mb-0 relative z-0"
                                                        />
                                                    )}
                                                    {hasOffsetY1 && (
                                                        <Input<FormValues>
                                                            control={control}
                                                            name={`drillParams.${key}.edge.offsetY1`}
                                                            type="number" step="0.001" label="Відступ Y, від початку" unit="мм" hint={DRILL_EDGE_HINTS.offsetY1}
                                                            rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                            className="z-0" classNameContainer="mb-0 relative z-0"
                                                        />
                                                    )}
                                                    {hasOffsetY2 && (
                                                        <Input<FormValues>
                                                            control={control}
                                                            name={`drillParams.${key}.edge.offsetY2`}
                                                            type="number" step="0.001" label="Відступ Y, від кінця" unit="мм" hint={DRILL_EDGE_HINTS.offsetY2}
                                                            rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                            className="z-0" classNameContainer="mb-0 relative z-0"
                                                        />
                                                    )}
                                                    {hasOffsetZ && (
                                                        <Input<FormValues>
                                                            control={control}
                                                            name={`drillParams.${key}.edge.offsetZ`}
                                                            type="number" step="0.001" label="Відступ Z" unit="мм" hint={DRILL_EDGE_HINTS.offsetZ}
                                                            rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                            className="z-0" classNameContainer="mb-0 relative z-0"
                                                        />
                                                    )}
                                                    {Array.from({ length: startCount }, (_, i) => i + 1).map(i => (
                                                        <Input<FormValues>
                                                            key={`start-${i}`}
                                                            control={control}
                                                            name={`drillParams.${key}.edge.startOffsetX${i}`}
                                                            type="number" step="0.001"
                                                            label={`Відступ від початку X${i}`} unit="мм"
                                                            hint={DRILL_EDGE_HINTS[`startOffsetX${i}`]}
                                                            rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                            className="z-0" classNameContainer="mb-0 relative z-0"
                                                            inputRef={(el) => setInputRef(makeInputRefKey(key, 'start', i), el)}
                                                            onFocus={() => focusHole({ side: key, type: 'start', index: i })}
                                                            onBlur={blurHole}
                                                        />
                                                    ))}
                                                    {Array.from({ length: endCount }, (_, i) => i + 1).map(i => (
                                                        <Input<FormValues>
                                                            key={`end-${i}`}
                                                            control={control}
                                                            name={`drillParams.${key}.edge.endOffsetX${i}`}
                                                            type="number" step="0.001"
                                                            label={`Відступ від кінця X${i}`} unit="мм"
                                                            hint={DRILL_EDGE_HINTS[`endOffsetX${i}`]}
                                                            rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                            className="z-0" classNameContainer="mb-0 relative z-0"
                                                            inputRef={(el) => setInputRef(makeInputRefKey(key, 'end', i), el)}
                                                            onFocus={() => focusHole({ side: key, type: 'end', index: i })}
                                                            onBlur={blurHole}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {sideHasHandle && (
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
                                                        Отвори під ручку
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Input<FormValues>
                                                            control={control}
                                                            name={`drillParams.${key}.handle.spacingX`}
                                                            type="number" step="0.001" label="Відстань між отворами" unit="мм" hint={DRILL_HANDLE_HINTS.spacingX}
                                                            rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                            className="z-0" classNameContainer="mb-0 relative z-0"
                                                            inputRef={(el) => setInputRef(`${key}__handle__spacingX`, el)}
                                                            onFocus={() => focusHole({ side: key, type: 'handle', index: 1 })}
                                                            onBlur={blurHole}
                                                        />
                                                        <Input<FormValues>
                                                            control={control}
                                                            name={`drillParams.${key}.handle.offsetY`}
                                                            type="number" step="0.001" label="Відступ Y" unit="мм" hint={DRILL_HANDLE_HINTS.offsetY}
                                                            rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                            className="z-0" classNameContainer="mb-0 relative z-0"
                                                            inputRef={(el) => setInputRef(`${key}__handle__offsetY`, el)}
                                                            onFocus={() => focusHole({ side: key, type: 'handle', index: 2 })}
                                                            onBlur={blurHole}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Фрезерування */}
                <div className={SECTION_CARD}>
                    <button
                        onClick={() => toggleSection('mill')}
                        className={SECTION_HEAD}
                    >
                        <span className="flex items-center gap-2">{millOperationTitle}</span>
                        <ChevronDown size={18} className={cn("transition-transform", expandedSections.has('mill') ? "rotate-180" : "")} />
                    </button>

                    {expandedSections.has('mill') && (
                        <div className="mt-2 space-y-2">
                            {(Object.keys(watchedMillParams ?? {}) as SideKey[])
                                .filter(k => CODE_PRIORITY[k] !== undefined)
                                .map((key) => {
                                    const detail = details.find(d => resolveDetailCode(d) === key);
                                    return { key, sequence: detail?.sequence ?? CODE_PRIORITY[key] ?? Infinity };
                                })
                                .sort((a, b) => a.sequence - b.sequence)
                                .map(({ key }) => {
                                    if (watchedMillParams[key]?.millSides === 'none') return null;
                                    const detail = details.find(d => resolveDetailCode(d) === key);
                                    const sequencePrefix = detail?.sequence != null ? `R${detail.sequence} ` : '';
                                    return (
                                        <div key={key} className="rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => toggleMillSide(key)}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-2 text-sm font-semibold transition-all",
                                                    expandedMillSides.has(key)
                                                        ? "bg-accent/20 text-muted-foreground"
                                                        : "bg-accent/30 text-muted-foreground hover:bg-accent/60"
                                                )}
                                            >
                                                <span>{sequencePrefix}{beamLabel(key, details)} ({key})</span>
                                                <ChevronDown size={15} className={cn("transition-transform", expandedMillSides.has(key) ? "rotate-180" : "")} />
                                            </button>

                                            {expandedMillSides.has(key) && (
                                                <div className="p-3 bg-card">
                                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
                                                        Параметри фрезерування
                                                    </p>
{/* Системи зі старим спільним ключем редагують його, нові — пару. */}
                                                    {watchedMillParams[key]?.millLengthStart === undefined
                                                        && watchedMillParams[key]?.millLengthEnd === undefined ? (
                                                        <Input<FormValues>
                                                            control={control}
                                                            name={`millParams.${key}.millLength`}
                                                            type="number" step="0.001"
                                                            label="Довжина фрезерування" unit="мм" hint={MILL_HINTS.millLength}
                                                            rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                            className="z-0" classNameContainer="mb-0 relative z-0"
                                                        />
                                                    ) : (
                                                        <div className="grid grid-cols-2 gap-x-3">
                                                            <Input<FormValues>
                                                                control={control}
                                                                name={`millParams.${key}.millLengthStart`}
                                                                type="number" step="0.001"
                                                                label="Довжина, початок" unit="мм" hint={MILL_HINTS.millLengthStart}
                                                                rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                                className="z-0" classNameContainer="mb-0 relative z-0"
                                                            />
                                                            <Input<FormValues>
                                                                control={control}
                                                                name={`millParams.${key}.millLengthEnd`}
                                                                type="number" step="0.001"
                                                                label="Довжина, кінець" unit="мм" hint={MILL_HINTS.millLengthEnd}
                                                                rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                                className="z-0" classNameContainer="mb-0 relative z-0"
                                                            />
                                                        </div>
                                                    )}

                                                    {(() => {
                                                        const sideParams = watchedMillParams[key] as unknown as Record<string, unknown> | undefined;
                                                        const present = MILL_EXTRA_FIELDS.filter(f => sideParams?.[f.key] !== undefined);
                                                        if (present.length === 0) return null;

                                                        return (
                                                            // Одне поле розтягуємо на всю ширину, щоб не лишалась
                                                            // порожня колонка — як у полиці, де є лише Start X.
                                                            <div className={cn(
                                                                'grid gap-x-3 gap-y-2 mt-3',
                                                                present.length === 1 ? 'grid-cols-1' : 'grid-cols-2',
                                                            )}>
                                                                {present.map(f => (
                                                                    <Input<FormValues>
                                                                        key={f.key}
                                                                        control={control}
                                                                        name={`millParams.${key}.${f.key}`}
                                                                        type="number" step="0.001"
                                                                        label={f.label} unit="мм"
                                                                        hint={MILL_HINTS[f.key]}
                                                                        className="z-0" classNameContainer="mb-0 relative z-0"
                                                                    />
                                                                ))}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>

                {/* Операції без власної колонки параметрів (паз, канавка, дріт, задній паз) */}
                {extraOperations.map(op => {
                    const opParams = extraParams[op.type] ?? {};
                    const sides = (Object.keys(opParams) as string[])
                        .filter(k => CODE_PRIORITY[k] !== undefined)
                        .sort((a, b) => (CODE_PRIORITY[a] ?? 99) - (CODE_PRIORITY[b] ?? 99));

                    if (sides.length === 0) return null;

                    return (
                        <div key={op.type} className="mb-2">
                            <button
                                onClick={() => toggleSection(op.type)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold transition-all",
                                    expandedSections.has(op.type)
                                        ? "bg-teal-400/20 border border-teal-400/50 text-teal-300"
                                        : "bg-accent/30 border border-input text-foreground hover:bg-accent/60"
                                )}
                            >
                                <span className="flex items-center gap-2">{op.title}</span>
                                <ChevronDown size={18} className={cn("transition-transform", expandedSections.has(op.type) ? "rotate-180" : "")} />
                            </button>

                            {expandedSections.has(op.type) && (
                                <div className={cn(SECTION_BODY, "space-y-4")}>
                                    {/*
                                        Вихід дроту роблять лише на одній боковині:
                                        обираємо сторону і показуємо поля тільки для неї.
                                        Програма для лівої і правої різна, тому параметри
                                        зберігаються для обох, а виконується одна.
                                    */}
                                    {op.type === OperationType.WIRE_MILL && (
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                                                Сторона виходу дроту
                                            </p>
                                            <SelectorSearch
                                                getAndSet={[
                                                    watchedWireSide ?? '',
                                                    (value) => setValue(
                                                        'wireSide',
                                                        (value as HandleSideEnum) || undefined,
                                                        { shouldDirty: true },
                                                    ),
                                                ]}
                                                options={wireSideOptions}
                                                placeholder={'Оберіть сторону'}
                                                optionValue="value"
                                                optionLabel="label"
                                                isEmptyValueDisable={false}
                                                searchable={false}
                                            />
                                        </div>
                                    )}

                                    {visibleSidesFor(op.type, sides).map(side => (
                                        <div key={side}>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                                                {beamLabel(side, details)} ({side})
                                            </p>
                                            {/* Одне поле розтягуємо на всю ширину, щоб не лишалась порожня колонка. */}
                                            <div className={cn('grid gap-3', op.fields.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
                                                {op.fields.map(f => (
                                                    <Input<FormValues>
                                                        key={f.key}
                                                        control={control}
                                                        name={`operationParams.${op.type}.${side}.${f.key}` as never}
                                                        type="number" step="0.001"
                                                        label={f.label} unit="мм"
                                                        hint={extraHints(op.type)[f.key]}
                                                        className="z-0" classNameContainer="mb-0 relative z-0"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

            </div>

            <div className="flex-none p-3 border-t border-border bg-transparent space-y-3">
                {hasChanges && (
                    <div className="p-2.5 bg-accent/20 border border-input rounded-lg">
                        <div className="flex items-start gap-2">
                            <div className="flex-1">
                                <p className="text-muted-foreground text-xs font-semibold mb-1">Є незбережені зміни</p>
                                <p className="text-muted-foreground text-[10px]">Натисніть кнопку нижче, щоб застосувати зміни</p>
                            </div>
                        </div>
                    </div>
                )}
                <Button
                    className="min-h-[38px] text-sm"
                    color="greenDarkgreen"
                    onClick={handleUpdate}
                    disabled={!hasChanges}
                >
                    {hasChanges ? 'Застосувати зміни та зберегти' : 'Всі зміни збережені'}
                </Button>
            </div>
        </div>
    );
}