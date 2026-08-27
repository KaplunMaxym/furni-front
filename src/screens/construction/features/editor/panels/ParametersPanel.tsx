'use client'

import React, { useEffect, useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import Button from "@/ui/button/Button";
import Input from "@/ui/input/Input";
import {ParametersPanelProps} from "@/screens/construction/type/editor/ThreeMesh";
import toast from "react-hot-toast";
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
import {useConstructionDetails} from "@/screens/construction/hooks/construction-details/useConstructionDetails";
import {FocusedHoleKey} from "@/screens/construction/type/editor/FocusedHole";

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
    millLength: number;
    millSides?: 'none' | 'start' | 'end' | 'both';
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
    drillParams: DrillDefaultParameters;
    millParams: MillDefaultParameters;
    cutParams: CutDefaultParameters;
    hingeParams: HingeDefaultParameters;
}

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
    hingeSide?: HandleSideEnum;
    setHingeSide?: (side: HandleSideEnum | undefined) => void;
    onHoleInputFocus?: (key: FocusedHoleKey) => void;
    focusedHole?: FocusedHoleKey;
}

export interface CutDefaultParameters {
    leftAngle: number;
    rightAngle: number;
    offsetZ: number;
    sawThickness: number;
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
}

export interface MillDefaultParameters {
    ignoreHandleSide: boolean;
    TOP: SideMillParams;
    BOTTOM: SideMillParams;
    LEFT: SideMillParams;
    RIGHT: SideMillParams;
}

const NAME_TO_SIDE_KEY: Record<string, 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT'> = {
    'Верхня балка': 'TOP',
    'Нижня балка':  'BOTTOM',
    'Ліва балка':   'LEFT',
    'Права балка':  'RIGHT',
};

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

const MILL_SIDE_LABELS: Record<'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT', string> = {
    TOP:    'Верхня балка (TOP)',
    BOTTOM: 'Нижня балка (BOTTOM)',
    LEFT:   'Ліва балка (LEFT)',
    RIGHT:  'Права балка (RIGHT)',
};

function extractDrillParamsFromProfileSystem(profileSystem: IProfileSystem): DrillDefaultParameters {
    const drillOperation = profileSystem.operation?.find(
        op => op.operationType === OperationType.DRILL
    );
    if (!drillOperation?.defaultParameters) return FALLBACK_DRILL_PARAMS;
    try {
        const parsed = typeof drillOperation.defaultParameters === 'string'
            ? JSON.parse(drillOperation.defaultParameters)
            : drillOperation.defaultParameters;
        if (parsed?.TOP?.edge && parsed?.BOTTOM?.edge && parsed?.LEFT?.edge && parsed?.RIGHT?.edge) {
            return parsed as DrillDefaultParameters;
        }
        return FALLBACK_DRILL_PARAMS;
    } catch {
        return FALLBACK_DRILL_PARAMS;
    }
}

function extractCutParamsFromProfileSystem(profileSystem: IProfileSystem): CutDefaultParameters {
    const cutOperation = profileSystem.operation?.find(
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
    const millOperation = profileSystem.operation?.find(
        op => op.operationType === OperationType.MILL
    );
    if (!millOperation?.defaultParameters) return FALLBACK_MILL_PARAMS;
    try {
        const parsed = typeof millOperation.defaultParameters === 'string'
            ? JSON.parse(millOperation.defaultParameters)
            : millOperation.defaultParameters;
        if (parsed?.TOP && parsed?.BOTTOM && parsed?.LEFT && parsed?.RIGHT) {
            return parsed as MillDefaultParameters;
        }
        return FALLBACK_MILL_PARAMS;
    } catch {
        return FALLBACK_MILL_PARAMS;
    }
}

function extractHingeParamsFromProfileSystem(profileSystem: IProfileSystem): HingeDefaultParameters {
    const hingeOperation = profileSystem.operation?.find(
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

function analyzeDrillParamsStructure(drillParams: DrillDefaultParameters, details: ConstructionDetail[]): Array<{ key: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT'; label: string; hasOffsetY: boolean; hasOffsetY1: boolean; hasOffsetY2: boolean; hasOffsetZ: boolean; hasHandle: boolean; startCount: number; endCount: number; }> {
    const sideConfig = [
        { key: 'TOP' as const,    label: 'Верхня балка (TOP)' },
        { key: 'BOTTOM' as const, label: 'Нижня балка (BOTTOM)' },
        { key: 'LEFT' as const,   label: 'Ліва балка (LEFT)' },
        { key: 'RIGHT' as const,  label: 'Права балка (RIGHT)' },
    ];

    return sideConfig
        .map(config => {
            const sideData = drillParams[config.key];
            if (!sideData || !sideData.edge || Object.keys(sideData.edge).length === 0) return null;

            const detail = details.find(d => NAME_TO_SIDE_KEY[d.name] === config.key);
            const sequencePrefix = detail?.sequence != null ? `R${detail.sequence} ` : '';
            return {
                key: config.key,
                label: `${sequencePrefix}${config.label}`,
                sequence: detail?.sequence ?? Infinity,
                // Старий формат: одне offsetY на весь edge (напр. ALU-80).
                hasOffsetY:  sideData?.edge?.offsetY  !== undefined,
                // Новий формат: окремо для start- та end-групи отворів (напр. PIN-TYPE).
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
        key: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT';
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
                                            setHingeParams: setExternalHingeParams,
                                            hingeSide,
                                            setHingeSide,
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

    const resolvedInitialMillParams = useMemo(() => {
        if (externalMillParams) return externalMillParams;
        return extractMillParamsFromProfileSystem(profileSystem);
    }, []);

    const resolvedInitialCutParams = useMemo(() => {
        if (externalCutParams) return externalCutParams;
        return extractCutParamsFromProfileSystem(profileSystem);
    }, []);

    const resolvedInitialHingeParams = useMemo(() => {
        if (externalHingeParams) return externalHingeParams;
        return extractHingeParamsFromProfileSystem(profileSystem);
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
        drillParams: resolvedInitialDrillParams,
        millParams:  resolvedInitialMillParams,
        cutParams:   resolvedInitialCutParams,
        hingeParams: resolvedInitialHingeParams,
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
            drillParams: resolvedInitialDrillParams,
            millParams:  resolvedInitialMillParams,
            cutParams:   resolvedInitialCutParams,
            hingeParams: resolvedInitialHingeParams,
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
    const watchedDrillParams    = useWatch({ control, name: 'drillParams' });
    const watchedMillParams     = useWatch({ control, name: 'millParams' });
    const watchedCutParams      = useWatch({ control, name: 'cutParams' });
    const watchedHingeParams    = useWatch({ control, name: 'hingeParams' });

    const drillParamsStr  = JSON.stringify(watchedDrillParams);
    const millParamsStr   = JSON.stringify(watchedMillParams);
    const cutParamsStr    = JSON.stringify(watchedCutParams);
    const hingeParamsStr  = JSON.stringify(watchedHingeParams);

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
            drillParamsStr  !== JSON.stringify(initial.drillParams)  ||
            millParamsStr   !== JSON.stringify(initial.millParams)   ||
            cutParamsStr    !== JSON.stringify(initial.cutParams)    ||
            hingeParamsStr  !== JSON.stringify(initial.hingeParams)
        );
    }, [
        watchedFrameWidth, watchedFrameHeight, watchedBeamThickness,
        watchedHasHandle, watchedHandleSide, watchedHandleOffset, watchedHandlePosition,
        watchedHingeSide,
        drillParamsStr, millParamsStr, cutParamsStr, hingeParamsStr,
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
        if (setExternalCutParams)   setExternalCutParams(JSON.parse(cutParamsStr));
    }, [cutParamsStr]);

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
            errors.forEach(error => toast.error(error, { duration: 4000, position: 'top-right' }));
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
                drillParams:    JSON.parse(JSON.stringify(currentValues.drillParams)),
                millParams:     JSON.parse(JSON.stringify(currentValues.millParams)),
                cutParams:      JSON.parse(JSON.stringify(currentValues.cutParams)),
                hingeParams:    JSON.parse(JSON.stringify(currentValues.hingeParams)),
            });
            toast.success('Зміни успішно застосовані та збережені!', { duration: 3000, position: 'top-right' });
        } catch (error) {
            console.log(error);
            toast.error('Помилка при збереженні змін', { duration: 4000, position: 'top-right' });
        }
    };

    const validateDecimalPlaces = (value: number) => {
        if (value === undefined || value === null) return true;
        const dp = String(value).split('.')[1];
        if (dp && dp.length > 3) return 'Максимум 3 цифри після коми';
        return true;
    };

    const drillOperationTitle = useMemo(() => {
        return profileSystem.operation?.find(op => op.operationType === OperationType.DRILL)?.title
            ?? 'Параметри свердління';
    }, [profileSystem]);

    const millOperationTitle = useMemo(() => {
        return profileSystem.operation?.find(op => op.operationType === OperationType.MILL)?.title
            ?? 'Параметри фрезерування';
    }, [profileSystem]);

    const hingeOperationTitle = useMemo(() => {
        return profileSystem.operation?.find(op => op.operationType === OperationType.HINGE_MILL)?.title
            ?? 'Параметри завіс';
    }, [profileSystem]);

    const focusHole = (key: FocusedHoleKey) => onHoleInputFocus?.(key);
    const blurHole  = () => onHoleInputFocus?.(null);

    return (
        <div className="flex flex-col bg-react/400">
            <div className="p-3">
                <h2 className="text-blue-400 z-10 font-bold text-lg mb-2 top-0">
                    Параметри рамки
                </h2>

                <div className="mb-2">
                    <button
                        onClick={() => toggleSection('dimensions')}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold transition-all",
                            expandedSections.has('dimensions')
                                ? "bg-green-400/20 border border-green-400/50 text-green-400"
                                : "bg-gray-700/30 border border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                        )}
                    >
                        <span className="flex items-center gap-2">Розміри рамки</span>
                        <ChevronDown size={18} className={cn("transition-transform", expandedSections.has('dimensions') ? "rotate-180" : "")} />
                    </button>
                    {expandedSections.has('dimensions') && (
                        <div className="mt-2 p-3 bg-gray-700/20 rounded-lg space-y-3">
                            <Input<FormValues>
                                control={control} name="frameWidth" type="number"
                                label="Ширина (мм) (X):"
                                rules={{ min: { value: 100, message: 'Мінімум 100 мм' }, max: { value: 3000, message: 'Максимум 3000 мм' }, validate: validateDecimalPlaces }}
                                placeholder="Введіть ширину" className="flex-1 z-0" classNameContainer="mb-0 relative z-0"
                            />
                            <Input<FormValues>
                                control={control} name="frameHeight" type="number"
                                label="Висота (мм) (Y):"
                                rules={{ min: { value: 100, message: 'Мінімум 100 мм' }, max: { value: 3000, message: 'Максимум 3000 мм' }, validate: validateDecimalPlaces }}
                                placeholder="Введіть висоту" className="flex-1 z-0" classNameContainer="mb-0 relative z-0"
                            />
                            <Input<FormValues>
                                control={control} name="beamThickness" type="number"
                                label="Товщина балки (мм):"
                                rules={{ min: { value: 5, message: 'Мінімум 5 мм' }, max: { value: 100, message: 'Максимум 100 мм' }, validate: validateDecimalPlaces }}
                                placeholder="Введіть товщину" className="flex-1 z-0" classNameContainer="mb-0 relative z-0"
                            />
                        </div>
                    )}
                </div>

                <div className="mb-2">
                    <button
                        onClick={() => toggleSection('cutting')}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold transition-all",
                            expandedSections.has('cutting')
                                ? "bg-green-400/20 border border-green-400/50 text-green-400"
                                : "bg-gray-700/30 border border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                        )}
                    >
                        <span className="flex items-center gap-2">Параметри різання</span>
                        <ChevronDown size={18} className={cn("transition-transform", expandedSections.has('cutting') ? "rotate-180" : "")} />
                    </button>
                    {expandedSections.has('cutting') && (
                        <div className="mt-2 p-3 bg-gray-700/20 rounded-lg space-y-3">
                            <Input<FormValues>
                                control={control} name="cutParams.sawThickness" type="number" step="0.001"
                                label="Товщина пили (мм):"
                                rules={{ min: { value: 0.1, message: 'Мінімум 0.1 мм' }, max: { value: 10, message: 'Максимум 10 мм' }, validate: validateDecimalPlaces }}
                                placeholder="Введіть товщину" className="flex-1 z-0" classNameContainer="mb-0 relative z-0"
                            />
                            <Input<FormValues>
                                control={control} name="cutParams.offsetZ" type="number" step="0.001"
                                label="Глибина різання offsetZ (мм):"
                                rules={{ min: { value: 0, message: 'Мінімум 0 мм' }, max: { value: 50, message: 'Максимум 50 мм' }, validate: validateDecimalPlaces }}
                                placeholder="2" className="flex-1 z-0" classNameContainer="mb-0 relative z-0"
                            />
                        </div>
                    )}
                </div>

                {hasHandle && (
                    <div className="mb-2">
                        <button
                            onClick={() => toggleSection('handle')}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold transition-all",
                                expandedSections.has('handle')
                                    ? "bg-green-400/20 border border-green-400/50 text-green-400"
                                    : "bg-gray-700/30 border border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                            )}
                        >
                            <span className="flex items-center gap-2">Параметри ручки</span>
                            <ChevronDown size={18} className={cn("transition-transform", expandedSections.has('handle') ? "rotate-180" : "")} />
                        </button>
                        {expandedSections.has('handle') && (
                            <div className="mt-2 p-3 bg-gray-700/20 rounded-lg space-y-3">
                                <div>
                                    <p className="text-xs font-semibold pl-4 mb-2">Сторона ручки *</p>
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
                                            label="Ширина ручки (мм):"
                                            rules={{ min: { value: 0, message: 'Мінімум 0 мм' }, max: { value: 1000, message: 'Максимум 1000 мм' }, validate: validateDecimalPlaces }}
                                            placeholder="160" className="flex-1 z-0" classNameContainer="mb-0 relative z-0"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Input<FormValues>
                                            control={control} name="handlePosition" type="number" step="0.001"
                                            label="Позиція ручки (мм):"
                                            rules={{ min: { value: 0, message: 'Мінімум 0 мм' }, max: { value: 2000, message: 'Максимум 2000 мм' }, validate: validateDecimalPlaces }}
                                            placeholder="0" className="flex-1 z-0" classNameContainer="mb-0 relative z-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {hingeSide && (
                    <div className="mb-2">
                        <button
                            onClick={() => toggleSection('hinge')}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold transition-all",
                                expandedSections.has('hinge')
                                    ? "bg-purple-400/20 border border-purple-400/50 text-purple-400"
                                    : "bg-gray-700/30 border border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                            )}
                        >
                            <span className="flex items-center gap-2">{hingeOperationTitle}</span>
                            <ChevronDown size={18} className={cn("transition-transform", expandedSections.has('hinge') ? "rotate-180" : "")} />
                        </button>
                        {expandedSections.has('hinge') && (
                            <div className="mt-2 p-3 bg-gray-700/20 rounded-lg space-y-3">
                                <div>
                                    <p className="text-xs font-semibold pl-4 mb-2">Сторона завіс</p>
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
                                                    <div className="px-3 py-2 bg-purple-500/10 text-purple-300 text-sm font-semibold">
                                                        {label}
                                                    </div>
                                                    <div className="p-3 bg-gray-800/40 grid grid-cols-2 gap-2">
                                                        <Input<FormValues>
                                                            control={control}
                                                            name={hinge.offsetFromStart !== undefined
                                                                ? `hingeParams.hinges.${index}.offsetFromStart`
                                                                : `hingeParams.hinges.${index}.offsetFromEnd`
                                                            }
                                                            type="number" step="0.001"
                                                            label={hinge.offsetFromStart !== undefined
                                                                ? 'Відступ від початку (мм)'
                                                                : 'Відступ від кінця (мм)'
                                                            }
                                                            rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                            className="z-0" classNameContainer="mb-0 relative z-0"
                                                        />
                                                        <Input<FormValues>
                                                            control={control}
                                                            name={`hingeParams.hinges.${index}.slotWidth`}
                                                            type="number" step="0.001"
                                                            label="Ширина завіси (мм)"
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
                <div className="mb-2">
                    <button
                        onClick={() => toggleSection('drill')}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold transition-all",
                            expandedSections.has('drill')
                                ? "bg-blue-400/20 border border-blue-400/50 text-blue-400"
                                : "bg-gray-700/30 border border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                        )}
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
                                                ? "bg-blue-500/10 text-blue-300"
                                                : "bg-gray-700/30 text-gray-400 hover:bg-gray-700/50"
                                        )}
                                    >
                                        <span>{label}</span>
                                        <ChevronDown size={15} className={cn("transition-transform", expandedDrillSides.has(key) ? "rotate-180" : "")} />
                                    </button>

                                    {expandedDrillSides.has(key) && (
                                        <div className="p-3 bg-gray-800/40 space-y-4">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
                                                    Крайові отвори
                                                </p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {hasOffsetY && (
                                                        <Input<FormValues>
                                                            control={control}
                                                            name={`drillParams.${key}.edge.offsetY`}
                                                            type="number" step="0.001" label="Відступ Y (мм)"
                                                            rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                            className="z-0" classNameContainer="mb-0 relative z-0"
                                                        />
                                                    )}
                                                    {hasOffsetY1 && (
                                                        <Input<FormValues>
                                                            control={control}
                                                            name={`drillParams.${key}.edge.offsetY1`}
                                                            type="number" step="0.001" label="Відступ Y, від початку (мм)"
                                                            rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                            className="z-0" classNameContainer="mb-0 relative z-0"
                                                        />
                                                    )}
                                                    {hasOffsetY2 && (
                                                        <Input<FormValues>
                                                            control={control}
                                                            name={`drillParams.${key}.edge.offsetY2`}
                                                            type="number" step="0.001" label="Відступ Y, від кінця (мм)"
                                                            rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                            className="z-0" classNameContainer="mb-0 relative z-0"
                                                        />
                                                    )}
                                                    {hasOffsetZ && (
                                                        <Input<FormValues>
                                                            control={control}
                                                            name={`drillParams.${key}.edge.offsetZ`}
                                                            type="number" step="0.001" label="Відступ Z (мм)"
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
                                                            label={`Відступ від початку X${i} (мм)`}
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
                                                            label={`Відступ від кінця X${i} (мм)`}
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
                                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
                                                        Отвори під ручку
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Input<FormValues>
                                                            control={control}
                                                            name={`drillParams.${key}.handle.spacingX`}
                                                            type="number" step="0.001" label="Відстань між отворами (мм)"
                                                            rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                            className="z-0" classNameContainer="mb-0 relative z-0"
                                                            inputRef={(el) => setInputRef(`${key}__handle__spacingX`, el)}
                                                            onFocus={() => focusHole({ side: key, type: 'handle', index: 1 })}
                                                            onBlur={blurHole}
                                                        />
                                                        <Input<FormValues>
                                                            control={control}
                                                            name={`drillParams.${key}.handle.offsetY`}
                                                            type="number" step="0.001" label="Відступ Y (мм)"
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
                <div className="mb-2">
                    <button
                        onClick={() => toggleSection('mill')}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold transition-all",
                            expandedSections.has('mill')
                                ? "bg-orange-400/20 border border-orange-400/50 text-orange-400"
                                : "bg-gray-700/30 border border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                        )}
                    >
                        <span className="flex items-center gap-2">{millOperationTitle}</span>
                        <ChevronDown size={18} className={cn("transition-transform", expandedSections.has('mill') ? "rotate-180" : "")} />
                    </button>

                    {expandedSections.has('mill') && (
                        <div className="mt-2 space-y-2">
                            {(['TOP', 'BOTTOM', 'LEFT', 'RIGHT'] as const)
                                .map((key) => {
                                    const detail = details.find(d => NAME_TO_SIDE_KEY[d.name] === key);
                                    return { key, sequence: detail?.sequence ?? Infinity };
                                })
                                .sort((a, b) => a.sequence - b.sequence)
                                .map(({ key }) => {
                                    if (watchedMillParams[key]?.millSides === 'none') return null;
                                    const detail = details.find(d => NAME_TO_SIDE_KEY[d.name] === key);
                                    const sequencePrefix = detail?.sequence != null ? `R${detail.sequence} ` : '';
                                    return (
                                        <div key={key} className="rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => toggleMillSide(key)}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-2 text-sm font-semibold transition-all",
                                                    expandedMillSides.has(key)
                                                        ? "bg-orange-500/10 text-orange-300"
                                                        : "bg-gray-700/30 text-gray-400 hover:bg-gray-700/50"
                                                )}
                                            >
                                                <span>{sequencePrefix}{MILL_SIDE_LABELS[key]}</span>
                                                <ChevronDown size={15} className={cn("transition-transform", expandedMillSides.has(key) ? "rotate-180" : "")} />
                                            </button>

                                            {expandedMillSides.has(key) && (
                                                <div className="p-3 bg-gray-800/40">
                                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
                                                        Параметри фрезерування
                                                    </p>
                                                    <Input<FormValues>
                                                        control={control}
                                                        name={`millParams.${key}.millLength`}
                                                        type="number" step="0.001"
                                                        label="Довжина фрезерування (мм)"
                                                        rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                        className="z-0" classNameContainer="mb-0 relative z-0"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-none p-3 border-t border-gray-700 bg-react/400 space-y-3">
                {hasChanges && (
                    <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <div className="flex items-start gap-2">
                            <div className="flex-1">
                                <p className="text-yellow-500 text-xs font-semibold mb-1">Є незбережені зміни</p>
                                <p className="text-yellow-400/80 text-[10px]">Натисніть кнопку нижче, щоб застосувати зміни</p>
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