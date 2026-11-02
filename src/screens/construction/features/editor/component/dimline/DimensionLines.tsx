'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    DrillDefaultParameters,
    HingeDefaultParameters,
    MillDefaultParameters,
} from '@/screens/construction/features/editor/panels/ParametersPanel';
import { FocusedHoleKey } from '@/screens/construction/type/editor/FocusedHole';
import { projectionRef } from '../../utils/projectionRef';
import { isFocused, isHandleHoleFocused, resolveHoleMeta } from '../../utils/holeUtils';
import { HandleSideEnum, LinesState, NotchLine, Pt } from '@/screens/construction/type/editor/Canvas3DAdvanced';
import { DimLine } from '@/screens/construction/features/editor/component/dimline/DimLine';

interface HingeLine {
    pt: Pt;
    label: string;
    side: 'left' | 'right';
    posLabel: string;
}

interface DimensionLinesProps {
    frameWidth: number;
    frameHeight: number;
    beamThickness: number;
    hasHandle?: boolean;
    handleSide?: HandleSideEnum;
    handleOffset?: number;
    handlePosition?: number;
    drillParams?: DrillDefaultParameters;
    millParams?: MillDefaultParameters;
    focusedHole?: FocusedHoleKey;
    onHoleHover?: (key: FocusedHoleKey) => void;
    hingeSide?: HandleSideEnum;
    hingeParams?: HingeDefaultParameters;
    hasHinge?: boolean;
    operationParams?: Record<string, unknown>;
}

function extractOffsets(
    edge: Record<string, number | undefined> | undefined,
    prefix: 'startOffsetX' | 'endOffsetX',
    count: number,
): number[] {
    if (!edge) return [];
    return Array.from({ length: count }, (_, i) => edge[`${prefix}${i + 1}`] as number).filter(v => v != null);
}

const HOLE_BASE = 26;
const HOLE_STEP = 14;

export function DimensionLines({frameWidth, frameHeight, beamThickness, hasHandle, handleSide, handleOffset, handlePosition, drillParams, millParams, focusedHole, onHoleHover, hingeSide, hingeParams, hasHinge = true, operationParams}: DimensionLinesProps) {
    const [lines, setLines] = useState<(LinesState & { hingeLines?: HingeLine[] }) | null>(null);
    const [hoveredHole, setHoveredHole] = useState<{
        pt: Pt; label: string;
        direction: 'top' | 'bottom' | 'left' | 'right';
        dynOffset: number;
    } | null>(null);
    const animFrameRef = useRef<number>(0);

    const [blinkVisible, setBlinkVisible] = useState(true);
    useEffect(() => {
        if (!focusedHole) { setBlinkVisible(true); return; }
        setBlinkVisible(true);
        const id = setInterval(() => setBlinkVisible(v => !v), 400);
        return () => clearInterval(id);
    }, [focusedHole]);

    useEffect(() => {
        const loop = () => {
            const proj = projectionRef.current;
            if (!proj) { animFrameRef.current = requestAnimationFrame(loop); return; }

            const { project, size } = proj;
            const hw = frameWidth  / 2;
            const hh = frameHeight / 2;
            const bt = beamThickness;

            const topEdge    = drillParams?.TOP?.edge;
            const bottomEdge = drillParams?.BOTTOM?.edge;
            const leftEdge   = drillParams?.LEFT?.edge;
            const rightEdge  = drillParams?.RIGHT?.edge;

            const topBeamY = hh - bt / 2;
            const ignoreHandleSide = (millParams)?.ignoreHandleSide === true;

            const topHoles: Pt[] = ignoreHandleSide
                ? [
                    ...extractOffsets(topEdge, 'startOffsetX', Number(topEdge?.countStart ?? 0)).map(ox => project(ox - hw, topBeamY)),
                    ...extractOffsets(topEdge, 'endOffsetX',   Number(topEdge?.countEnd   ?? 0)).map(ox => project(hw - ox, topBeamY)),
                ]
                : [
                    ...extractOffsets(topEdge, 'endOffsetX',   Number(topEdge?.countEnd   ?? 0)).map(ox => project(ox - hw, topBeamY)),
                    ...extractOffsets(topEdge, 'startOffsetX', Number(topEdge?.countStart ?? 0)).map(ox => project(hw - ox, topBeamY)),
                ];

            const botBeamY = -hh + bt / 2;
            const bottomHoles: Pt[] = [
                ...extractOffsets(bottomEdge, 'startOffsetX', Number(bottomEdge?.countStart ?? 0)).map(ox => project(ox - hw, botBeamY)),
                ...extractOffsets(bottomEdge, 'endOffsetX',   Number(bottomEdge?.countEnd   ?? 0)).map(ox => project(hw - ox,  botBeamY)),
            ];

            const leftBeamX = -hw + bt / 2;
            const leftHoles: Pt[] = [
                ...extractOffsets(leftEdge, 'startOffsetX', Number(leftEdge?.countStart ?? 0)).map(oy => project(leftBeamX,  hh - oy)),
                ...extractOffsets(leftEdge, 'endOffsetX',   Number(leftEdge?.countEnd   ?? 0)).map(oy => project(leftBeamX, -(hh - oy))),
            ];

            const rightBeamX = hw - bt / 2;
            const rightHoles: Pt[] = [
                ...extractOffsets(rightEdge, 'startOffsetX', Number(rightEdge?.countStart ?? 0)).map(oy => project(rightBeamX, oy - hh)),
                ...extractOffsets(rightEdge, 'endOffsetX',   Number(rightEdge?.countEnd   ?? 0)).map(oy => project(rightBeamX, hh - oy)),
            ];

            let handleHoles: Pt[] = [];
            if (hasHandle && handleSide && drillParams) {
                const hp = drillParams[handleSide as 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM']?.handle;
                if (hp && handleOffset && handleOffset > 0 && handlePosition != null) {
                    const fd = 6, fr = fd / 2;
                    const x1 = (handlePosition - handleOffset / 2) + fr + ((handleOffset - fd - hp.spacingX) / 2);
                    const x2 = (handlePosition + handleOffset / 2) - fr - ((handleOffset - fd - hp.spacingX) / 2);
                    const isV = handleSide === 'LEFT' || handleSide === 'RIGHT';
                    if (isV) {
                        const bx = handleSide === 'LEFT' ? -hw + bt / 2 : hw - bt / 2;
                        handleHoles = [project(bx, -hh + x1), project(bx, -hh + x2)];
                    } else {
                        const by = handleSide === 'TOP' ? hh - bt / 2 : -hh + bt / 2;
                        handleHoles = [project(-hw + x1, by), project(-hw + x2, by)];
                    }
                }
            }

            let handleCenter: Pt | undefined, handleStart: Pt | undefined, handleEnd: Pt | undefined;
            let handlePosStart: Pt | undefined, handlePosEnd: Pt | undefined;

            if (hasHandle && handleSide) {
                const handleWidth = handleOffset || 160;
                const isV = handleSide === 'LEFT' || handleSide === 'RIGHT';
                if (isV) {
                    const posX = handleSide === 'RIGHT' ? hw : -hw;
                    const posY = handlePosition != null ? -hh + handlePosition : 0;
                    handleCenter   = project(posX, posY);
                    handleStart    = project(posX, posY - handleWidth / 2);
                    handleEnd      = project(posX, posY + handleWidth / 2);
                    handlePosStart = project(posX, -hh);
                    handlePosEnd   = project(posX, posY);
                } else {
                    const posY = handleSide === 'TOP' ? hh : -hh;
                    const posX = handlePosition != null ? -hw + handlePosition : 0;
                    handleCenter   = project(posX, posY);
                    handleStart    = project(posX - handleWidth / 2, posY);
                    handleEnd      = project(posX + handleWidth / 2, posY);
                    handlePosStart = project(-hw, posY);
                    handlePosEnd   = project(posX, posY);
                }
            }

            const notchLines: NotchLine[] = [];

            const millFor = (slot: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT'): number | null => {
                const mp = millParams as unknown as
                    Record<string, { millSides?: string; millLength?: number; millLengthStart?: number }> | undefined;
                const sp =
                    mp?.[slot] ??
                    (slot === 'TOP'    ? mp?.BACK  : undefined) ??
                    (slot === 'BOTTOM' ? mp?.FRONT : undefined);
                if (!sp) return null;
                if ((sp.millSides ?? 'none') === 'none') return null;
                const len = Number(sp.millLengthStart ?? sp.millLength ?? 0);
                return len > 0 ? len : null;
            };

            if (millParams) {
                const ignoreHandleSide = (millParams)?.ignoreHandleSide === true;

                if (ignoreHandleSide) {
                    const leftMill  = millFor('LEFT');
                    const leftEdge  = leftMill !== null ? leftMill / 2 : 0;
                    if (leftMill !== null) notchLines.push({ pt: project(-hw + bt / 2,  hh - leftEdge),  ptStart: project(-hw + bt / 2,  hh - leftEdge - leftMill / 2),  ptEnd: project(-hw + bt / 2,  hh - leftEdge + leftMill / 2),  label: `${leftMill}мм`,  isVertical: false, anchorEnd: false });
                    if (leftMill !== null) notchLines.push({ pt: project(-hw + bt / 2, -hh + leftEdge),  ptStart: project(-hw + bt / 2, -hh + leftEdge - leftMill / 2),  ptEnd: project(-hw + bt / 2, -hh + leftEdge + leftMill / 2),  label: `${leftMill}мм`,  isVertical: false, anchorEnd: true  });

                    const rightMill = millFor('RIGHT');
                    const rightEdge = rightMill !== null ? rightMill / 2 : 0;
                    if (rightMill !== null) notchLines.push({ pt: project(hw - bt / 2,  hh - rightEdge), ptStart: project(hw - bt / 2,  hh - rightEdge - rightMill / 2), ptEnd: project(hw - bt / 2,  hh - rightEdge + rightMill / 2), label: `${rightMill}мм`, isVertical: false, anchorEnd: false });
                    if (rightMill !== null) notchLines.push({ pt: project(hw - bt / 2, -hh + rightEdge), ptStart: project(hw - bt / 2, -hh + rightEdge - rightMill / 2), ptEnd: project(hw - bt / 2, -hh + rightEdge + rightMill / 2), label: `${rightMill}мм`, isVertical: false, anchorEnd: true  });

                    const topMill = millFor('TOP');
                    const topEdge = topMill !== null ? topMill / 2 : 0;
                    if (topMill !== null) notchLines.push({ pt: project(-hw + topEdge, hh - bt / 2), ptStart: project(-hw + topEdge - topMill / 2, hh - bt / 2), ptEnd: project(-hw + topEdge + topMill / 2, hh - bt / 2), label: `${topMill}мм`, isVertical: true, anchorEnd: true  });
                    if (topMill !== null) notchLines.push({ pt: project( hw - topEdge, hh - bt / 2), ptStart: project( hw - topEdge - topMill / 2, hh - bt / 2), ptEnd: project( hw - topEdge + topMill / 2, hh - bt / 2), label: `${topMill}мм`, isVertical: true, anchorEnd: false });

                    const botMill = millFor('BOTTOM');
                    const botEdge = botMill !== null ? botMill / 2 : 0;
                    if (botMill !== null) notchLines.push({ pt: project(-hw + botEdge, -hh + bt / 2), ptStart: project(-hw + botEdge - botMill / 2, -hh + bt / 2), ptEnd: project(-hw + botEdge + botMill / 2, -hh + bt / 2), label: `${botMill}мм`, isVertical: true, anchorEnd: true  });
                    if (botMill !== null) notchLines.push({ pt: project( hw - botEdge, -hh + bt / 2), ptStart: project( hw - botEdge - botMill / 2, -hh + bt / 2), ptEnd: project( hw - botEdge + botMill / 2, -hh + bt / 2), label: `${botMill}мм`, isVertical: true, anchorEnd: false });
                } else {
                    /*
                     * Фасад без ручки — так, ніби ручка зліва.
                     *
                     * Те саме правило, що й у виїмках на моделі
                     * (`HingeNotchesMesh`). Підписи мусять стояти там само, де
                     * намальовані виїмки, — інакше розмір показує на одну
                     * стійку, а фреза йде по іншій.
                     */
                    const effectiveHandleSide = hasHandle === false
                        ? HandleSideEnum.LEFT
                        : handleSide ?? HandleSideEnum.LEFT;

                    const hingeSideLocal =
                        effectiveHandleSide === HandleSideEnum.LEFT  ? HandleSideEnum.RIGHT  :
                            effectiveHandleSide === HandleSideEnum.RIGHT ? HandleSideEnum.LEFT   :
                                effectiveHandleSide === HandleSideEnum.TOP   ? HandleSideEnum.BOTTOM :
                                    HandleSideEnum.TOP;

                    if (hingeSideLocal === HandleSideEnum.LEFT || hingeSideLocal === HandleSideEnum.RIGHT) {
                        const signX       = hingeSideLocal === HandleSideEnum.RIGHT ? 1 : -1;
                        const beamCenterX = signX * (hw - bt / 2);

                        const vertMill = millFor(hingeSideLocal === HandleSideEnum.LEFT ? 'LEFT' : 'RIGHT');
                        const vertEdge = vertMill !== null ? vertMill / 2 : 0;

                        if (vertMill !== null) if (vertMill !== null) notchLines.push({ pt: project(beamCenterX, hh - vertEdge),  ptStart: project(beamCenterX, hh - vertEdge - vertMill / 2),  ptEnd: project(beamCenterX, hh - vertEdge + vertMill / 2),  label: `${vertMill}мм`, isVertical: false, anchorEnd: false });
                        if (vertMill !== null) if (vertMill !== null) notchLines.push({ pt: project(beamCenterX, -hh + vertEdge), ptStart: project(beamCenterX, -hh + vertEdge - vertMill / 2), ptEnd: project(beamCenterX, -hh + vertEdge + vertMill / 2), label: `${vertMill}мм`, isVertical: false, anchorEnd: true  });

                        const topMill = millFor('TOP');
                        const topEdge = topMill !== null ? topMill / 2 : 0;
                        const tCenter = signX * (hw - topEdge);
                        if (topMill !== null) notchLines.push({ pt: project(tCenter, hh - bt / 2), ptStart: project(tCenter - topMill / 2, hh - bt / 2), ptEnd: project(tCenter + topMill / 2, hh - bt / 2), label: `${topMill}мм`, isVertical: true, anchorEnd: signX < 0 });

                        const botMill = millFor('BOTTOM');
                        const botEdge = botMill !== null ? botMill / 2 : 0;
                        const bCenter = signX * (hw - botEdge);
                        if (botMill !== null) notchLines.push({ pt: project(bCenter, -hh + bt / 2), ptStart: project(bCenter - botMill / 2, -hh + bt / 2), ptEnd: project(bCenter + botMill / 2, -hh + bt / 2), label: `${botMill}мм`, isVertical: true, anchorEnd: signX < 0 });
                    }

                    if (hingeSideLocal === HandleSideEnum.TOP || hingeSideLocal === HandleSideEnum.BOTTOM) {
                        const signY       = hingeSideLocal === HandleSideEnum.TOP ? 1 : -1;
                        const beamCenterY = signY * (hh - bt / 2);

                        const horizMill = millFor(hingeSideLocal === HandleSideEnum.TOP ? 'TOP' : 'BOTTOM');
                        const horizEdge = horizMill !== null ? horizMill / 2 : 0;

                        if (horizMill !== null) if (horizMill !== null) notchLines.push({ pt: project(-hw + horizEdge, beamCenterY), ptStart: project(-hw + horizEdge - horizMill / 2, beamCenterY), ptEnd: project(-hw + horizEdge + horizMill / 2, beamCenterY), label: `${horizMill}мм`, isVertical: true, anchorEnd: false });
                        if (horizMill !== null) if (horizMill !== null) notchLines.push({ pt: project(hw - horizEdge,  beamCenterY), ptStart: project(hw - horizEdge - horizMill / 2,  beamCenterY), ptEnd: project(hw - horizEdge + horizMill / 2,  beamCenterY), label: `${horizMill}мм`, isVertical: true, anchorEnd: true  });

                        const leftMill = millFor('LEFT');
                        const leftEdge = leftMill !== null ? leftMill / 2 : 0;
                        const lCenter  = signY * (hh - leftEdge);
                        if (leftMill !== null) notchLines.push({ pt: project(-hw + bt / 2, lCenter), ptStart: project(-hw + bt / 2, lCenter - leftMill / 2), ptEnd: project(-hw + bt / 2, lCenter + leftMill / 2), label: `${leftMill}мм`, isVertical: false, anchorEnd: signY < 0 });

                        const rightMill = millFor('RIGHT');
                        const rightEdge = rightMill !== null ? rightMill / 2 : 0;
                        const rCenter   = signY * (hh - rightEdge);
                        if (rightMill !== null) notchLines.push({ pt: project(hw - bt / 2, rCenter), ptStart: project(hw - bt / 2, rCenter - rightMill / 2), ptEnd: project(hw - bt / 2, rCenter + rightMill / 2), label: `${rightMill}мм`, isVertical: false, anchorEnd: signY < 0 });
                    }
                }
            }

            const grooveParams = (operationParams as Record<string, Record<string, {
                startX?: number; width?: number; endOffsetX?: number; offsetX?: number;
            }>> | undefined)?.GROOVE_MILL;

            if (grooveParams) {
                for (const side of ['LEFT', 'RIGHT'] as const) {
                    const g = grooveParams[side];
                    if (!g?.width) continue;

                    const startX     = Number(g.startX ?? 0);
                    const width      = Number(g.width ?? 0);
                    const endOffsetX = Number(g.endOffsetX ?? 0);
                    const offsetX    = Number(g.offsetX ?? 0);

                    const beamX = side === 'LEFT' ? -hw + bt / 2 : hw - bt / 2;
                    const len   = Math.abs(width);

                    const marks: Array<{ along: number; label: string; anchorEnd: boolean }> = [
                        { along: startX + width / 2 + offsetX,
                          label: `${startX}мм`, anchorEnd: false },
                        { along: frameHeight - endOffsetX + width / 2 + offsetX,
                          label: `${endOffsetX}мм`, anchorEnd: true },
                    ];

                    for (const m of marks) {
                        if (m.along <= 0 || m.along >= frameHeight) continue;
                        const y = -hh + m.along;
                        notchLines.push({
                            pt:      project(beamX, y),
                            ptStart: project(beamX, y - len / 2),
                            ptEnd:   project(beamX, y + len / 2),
                            label:   m.label,
                            isVertical: false,
                            anchorEnd: m.anchorEnd,
                        });
                    }
                }
            }

            // ── Hinge labels ─────────────────────────────────────────────────
            const hingeLines: HingeLine[] = [];

            if (hasHinge && hingeSide && hingeParams) {
                const isLeft  = hingeSide === HandleSideEnum.LEFT;
                const isRight = hingeSide === HandleSideEnum.RIGHT;

                if (isLeft || isRight) {
                    const signX       = isRight ? 1 : -1;
                    const beamCenterX = signX * (hw - bt / 2);

                    hingeParams.hinges.forEach((hinge) => {
                        const slotWidth = hinge.slotWidth ?? 44.4;
                        const startY = hinge.offsetFromStart !== undefined
                            ? hinge.offsetFromStart
                            : frameHeight - (hinge.offsetFromEnd ?? 56) - slotWidth;
                        const centerY      = startY + slotWidth / 2;
                        const sceneCenterY = -hh + centerY;

                        const posLabel = hinge.offsetFromStart !== undefined
                            ? `від низу: ${hinge.offsetFromStart}мм`
                            : `від верху: ${hinge.offsetFromEnd}мм`;

                        hingeLines.push({
                            pt:       project(beamCenterX, sceneCenterY),
                            label:    `${slotWidth}мм`,
                            side:     isRight ? 'right' : 'left',
                            posLabel,
                        });
                    });
                }
            }

            setLines({
                topLeft:  project(-hw,  hh), topRight: project(hw,  hh),
                botLeft:  project(-hw, -hh), botRight: project(hw, -hh),
                rtTopOuter: project(hw, hh - bt),
                handleCenter, handleStart, handleEnd, handlePosStart, handlePosEnd,
                topHoles, bottomHoles, leftHoles, rightHoles,
                handleHoles, notchLines,
                hingeLines,
                size,
            });

            animFrameRef.current = requestAnimationFrame(loop);
        };

        animFrameRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [frameWidth, frameHeight, beamThickness, hasHandle, handleSide, handleOffset, handlePosition, drillParams, millParams, hingeSide, hingeParams, operationParams]);

    if (!lines) return null;

    const {
        topLeft, topRight, botLeft, botRight, rtTopOuter,
        handleCenter, handleStart, handleEnd, handlePosStart, handlePosEnd,
        topHoles, bottomHoles, leftHoles, rightHoles,
        handleHoles   = [] as Pt[],
        notchLines    = [] as NotchLine[],
        hingeLines    = [] as HingeLine[],
        size,
    } = lines;

    const offset  = 36;
    const offset2 = 32;
    const offset3 = 52;
    const isVerticalHandle = handleSide === 'LEFT' || handleSide === 'RIGHT';

    const getHoverLabelPos = (pt: Pt, direction: 'top' | 'bottom' | 'left' | 'right', dynOffset: number) => {
        switch (direction) {
            case 'top':    return { x: pt.x - 30, y: pt.y - dynOffset - 22, textY: pt.y - dynOffset - 8  };
            case 'bottom': return { x: pt.x - 30, y: pt.y + dynOffset,      textY: pt.y + dynOffset + 14 };
            case 'left':   return { x: pt.x - dynOffset - 52, y: pt.y - 10, textY: pt.y + 4              };
            case 'right':  return { x: pt.x + dynOffset - 8,  y: pt.y - 10, textY: pt.y + 4              };
        }
    };

    const renderHoleMarker = (
        pt: Pt, label: string, key: string,
        direction: 'top' | 'bottom' | 'left' | 'right',
        focused: boolean,
        hoverKey: FocusedHoleKey,
        staggerIndex: number = 0,
    ) => {
        const color     = '#a78bfa';
        const r         = focused ? 6 : 3;
        const opacity   = focused ? (blinkVisible ? 1 : 0.15) : 0.8;
        const dynOffset = HOLE_BASE + staggerIndex * HOLE_STEP;

        const lineProps = {
            stroke: color, strokeWidth: focused ? 1.5 : 1,
            strokeDasharray: '3,3',
            opacity: focused ? (blinkVisible ? 0.9 : 0.1) : 0.6,
        };

        let lineEl: React.ReactElement;
        let rectX: number, rectY: number, textX: number, textY: number;
        const rectW = focused ? 52 : 44;

        switch (direction) {
            case 'top':
                lineEl = <line x1={pt.x} y1={pt.y} x2={pt.x} y2={pt.y - dynOffset} {...lineProps} />;
                rectX = pt.x - rectW / 2; rectY = pt.y - dynOffset - 18;
                textX = pt.x;             textY = pt.y - dynOffset - 6;
                break;
            case 'bottom':
                lineEl = <line x1={pt.x} y1={pt.y} x2={pt.x} y2={pt.y + dynOffset} {...lineProps} />;
                rectX = pt.x - rectW / 2; rectY = pt.y + dynOffset + 2;
                textX = pt.x;             textY = pt.y + dynOffset + 14;
                break;
            case 'left':
                lineEl = <line x1={pt.x} y1={pt.y} x2={pt.x - dynOffset} y2={pt.y} {...lineProps} />;
                rectX = pt.x - dynOffset - rectW; rectY = pt.y - 8;
                textX = pt.x - dynOffset - rectW / 2; textY = pt.y + 4;
                break;
            case 'right':
            default:
                lineEl = <line x1={pt.x} y1={pt.y} x2={pt.x + dynOffset} y2={pt.y} {...lineProps} />;
                rectX = pt.x + dynOffset; rectY = pt.y - 8;
                textX = pt.x + dynOffset + rectW / 2; textY = pt.y + 4;
                break;
        }

        return (
            <g
                key={key}
                style={{ pointerEvents: 'all', cursor: 'pointer' }}
                onMouseEnter={() => { setHoveredHole({ pt, label, direction, dynOffset }); onHoleHover?.(hoverKey); }}
                onMouseLeave={() => { setHoveredHole(null); onHoleHover?.(null); }}
            >
                {lineEl}
                {focused && (
                    <circle cx={pt.x} cy={pt.y} r={12} fill="none" stroke={color} strokeWidth={2} opacity={blinkVisible ? 0.7 : 0.1} />
                )}
                <circle cx={pt.x} cy={pt.y} r={r} fill={color} opacity={opacity} />
                <rect x={rectX} y={rectY} width={rectW} height={16} rx={3}
                      fill="rgba(10,15,30,0.85)"
                      stroke={focused ? color : 'none'}
                      strokeWidth={focused ? 1 : 0}
                />
                <text x={textX} y={textY} textAnchor="middle" fill={color}
                      fontSize={focused ? 10 : 9} fontFamily="monospace" fontWeight="700">
                    {label}
                </text>
            </g>
        );
    };

    return (
        <svg
            width={size.width} height={size.height}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 50 }}
        >
            <defs>
                {[
                    ['arr',       '#94a3b8'],
                    ['arr-blue',  '#60a5fa'],
                    ['arr-green', '#34d399'],
                    ['arr-amber', '#f59e0b'],
                    ['arr-hole',  '#a78bfa'],
                    ['arr-notch', '#34d399'],
                ].map(([id, fill]) => (
                    <React.Fragment key={id}>
                        <marker id={id}          markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                            <path d="M0,0 L6,3 L0,6 Z" fill={fill} />
                        </marker>
                        <marker id={`${id}-r`}   markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
                            <path d="M0,0 L6,3 L0,6 Z" fill={fill} />
                        </marker>
                    </React.Fragment>
                ))}
            </defs>

            {/* Beam thickness */}
            <DimLine
                x1={topRight.x + offset} y1={topRight.y}
                x2={topRight.x + offset} y2={rtTopOuter.y}
                label={`${beamThickness} мм`}
                tickFromX1={topRight.x} tickFromX2={topRight.x}
                color="#60a5fa" markerId="arr-blue" markerIdR="arr-blue-r" vertical
            />

            {/* Handle width + label */}
            {hasHandle && handleStart && handleEnd && handleCenter && (
                <g>
                    <DimLine
                        x1={isVerticalHandle ? handleStart.x + (handleSide === 'RIGHT' ? offset2 : -offset2) : handleStart.x}
                        y1={isVerticalHandle ? handleStart.y : handleStart.y - offset2}
                        x2={isVerticalHandle ? handleEnd.x   + (handleSide === 'RIGHT' ? offset2 : -offset2) : handleEnd.x}
                        y2={isVerticalHandle ? handleEnd.y   : handleEnd.y - offset2}
                        label={`${handleOffset || 160} мм`}
                        tickFromX1={isVerticalHandle ? handleStart.x : undefined}
                        tickFromX2={isVerticalHandle ? handleEnd.x   : undefined}
                        tickFromY1={!isVerticalHandle ? handleStart.y : undefined}
                        tickFromY2={!isVerticalHandle ? handleEnd.y   : undefined}
                        color="#34d399" markerId="arr-green" markerIdR="arr-green-r"
                        vertical={isVerticalHandle}
                    />
                    <circle cx={handleCenter.x} cy={handleCenter.y} r={4} fill="#34d399" opacity={0.9} />
                    <circle cx={handleCenter.x} cy={handleCenter.y} r={8} fill="none" stroke="#34d399" strokeWidth={1.5} opacity={0.5} />
                    <rect
                        x={handleSide === 'RIGHT' ? handleCenter.x + 12 : handleCenter.x - 76}
                        y={handleCenter.y - 11}
                        width={64} height={20} rx={4} fill="rgba(10,15,30,0.88)"
                    />
                    <text
                        x={handleSide === 'RIGHT' ? handleCenter.x + 44 : handleCenter.x - 44}
                        y={handleCenter.y + 4}
                        textAnchor="middle" fill="#34d399" fontSize={11} fontFamily="monospace" fontWeight="700"
                    >
                        Ручка
                    </text>
                </g>
            )}

            {/* Frame width */}
            <DimLine
                x1={topLeft.x}  y1={topLeft.y  - offset3}
                x2={topRight.x} y2={topRight.y - offset3}
                label={`${frameWidth} мм`}
                tickFromY1={topLeft.y} tickFromY2={topRight.y}
                color="#94a3b8" markerId="arr" markerIdR="arr-r"
            />

            {/* Frame height */}
            <DimLine
                x1={(hasHandle && handleSide === 'LEFT') ? topRight.x + offset3 : topLeft.x - offset3}
                y1={(hasHandle && handleSide === 'LEFT') ? topRight.y            : topLeft.y}
                x2={(hasHandle && handleSide === 'LEFT') ? botRight.x + offset3  : botLeft.x - offset3}
                y2={(hasHandle && handleSide === 'LEFT') ? botRight.y            : botLeft.y}
                label={`${frameHeight} мм`}
                tickFromX1={(hasHandle && handleSide === 'LEFT') ? topRight.x : topLeft.x}
                tickFromX2={(hasHandle && handleSide === 'LEFT') ? botRight.x : botLeft.x}
                color="#94a3b8" markerId="arr" markerIdR="arr-r" vertical
            />

            {/* Handle position offset */}
            {hasHandle && handlePosStart && handlePosEnd && handlePosition != null && (
                <DimLine
                    x1={isVerticalHandle ? handlePosStart.x + (handleSide === 'RIGHT' ? offset3 : -offset3) : handlePosStart.x}
                    y1={isVerticalHandle ? handlePosStart.y : handlePosStart.y + offset3}
                    x2={isVerticalHandle ? handlePosEnd.x   + (handleSide === 'RIGHT' ? offset3 : -offset3) : handlePosEnd.x}
                    y2={isVerticalHandle ? handlePosEnd.y   : handlePosEnd.y + offset3}
                    label={`${handlePosition} мм`}
                    tickFromX1={isVerticalHandle ? handlePosStart.x : undefined}
                    tickFromX2={isVerticalHandle ? handlePosEnd.x   : undefined}
                    tickFromY1={!isVerticalHandle ? handlePosStart.y : undefined}
                    tickFromY2={!isVerticalHandle ? handlePosEnd.y   : undefined}
                    color="#f59e0b" markerId="arr-amber" markerIdR="arr-amber-r"
                    vertical={isVerticalHandle}
                />
            )}

            {/* Top holes */}
            {topHoles.map((pt, i) => {
                const ignoreHS = (millParams)?.ignoreHandleSide === true;
                const allOffsets = ignoreHS
                    ? [
                        ...extractOffsets(drillParams?.TOP?.edge, 'startOffsetX', Number(drillParams?.TOP?.edge?.countStart ?? 0)),
                        ...extractOffsets(drillParams?.TOP?.edge, 'endOffsetX',   Number(drillParams?.TOP?.edge?.countEnd   ?? 0)),
                    ]
                    : [
                        ...extractOffsets(drillParams?.TOP?.edge, 'endOffsetX',   Number(drillParams?.TOP?.edge?.countEnd   ?? 0)),
                        ...extractOffsets(drillParams?.TOP?.edge, 'startOffsetX', Number(drillParams?.TOP?.edge?.countStart ?? 0)),
                    ];
                const label   = allOffsets[i] != null ? `${allOffsets[i]}мм` : `T${i + 1}`;
                const focused = isFocused(focusedHole ?? null, 'TOP', i, drillParams);
                const meta    = resolveHoleMeta('TOP', i, drillParams);
                return renderHoleMarker(pt, label, `th-${i}`, 'top', focused, { side: 'TOP', ...meta }, i);
            })}

            {/* Bottom holes */}
            {bottomHoles.map((pt, i) => {
                const allOffsets = [
                    ...extractOffsets(drillParams?.BOTTOM?.edge, 'startOffsetX', Number(drillParams?.BOTTOM?.edge?.countStart ?? 0)),
                    ...extractOffsets(drillParams?.BOTTOM?.edge, 'endOffsetX',   Number(drillParams?.BOTTOM?.edge?.countEnd   ?? 0)),
                ];
                const label   = allOffsets[i] != null ? `${allOffsets[i]}мм` : `B${i + 1}`;
                const focused = isFocused(focusedHole ?? null, 'BOTTOM', i, drillParams);
                const meta    = resolveHoleMeta('BOTTOM', i, drillParams);
                return renderHoleMarker(pt, label, `bh-${i}`, 'bottom', focused, { side: 'BOTTOM', ...meta }, i);
            })}

            {/* Left holes */}
            {leftHoles.map((pt, i) => {
                const allOffsets = [
                    ...extractOffsets(drillParams?.LEFT?.edge, 'startOffsetX', Number(drillParams?.LEFT?.edge?.countStart ?? 0)),
                    ...extractOffsets(drillParams?.LEFT?.edge, 'endOffsetX',   Number(drillParams?.LEFT?.edge?.countEnd   ?? 0)),
                ];
                const label   = allOffsets[i] != null ? `${allOffsets[i]}мм` : `L${i + 1}`;
                const focused = isFocused(focusedHole ?? null, 'LEFT', i, drillParams);
                const meta    = resolveHoleMeta('LEFT', i, drillParams);
                return renderHoleMarker(pt, label, `lh-${i}`, 'left', focused, { side: 'LEFT', ...meta }, i);
            })}

            {/* Right holes */}
            {rightHoles.map((pt, i) => {
                const allOffsets = [
                    ...extractOffsets(drillParams?.RIGHT?.edge, 'startOffsetX', Number(drillParams?.RIGHT?.edge?.countStart ?? 0)),
                    ...extractOffsets(drillParams?.RIGHT?.edge, 'endOffsetX',   Number(drillParams?.RIGHT?.edge?.countEnd   ?? 0)),
                ];
                const label   = allOffsets[i] != null ? `${allOffsets[i]}мм` : `R${i + 1}`;
                const focused = isFocused(focusedHole ?? null, 'RIGHT', i, drillParams);
                const meta    = resolveHoleMeta('RIGHT', i, drillParams);
                return renderHoleMarker(pt, label, `rh-${i}`, 'right', focused, { side: 'RIGHT', ...meta }, i);
            })}

            {/* Handle holes */}
            {handleHoles.map((pt, i) => {
                const isV     = handleSide === 'LEFT' || handleSide === 'RIGHT';
                const holeDir = isV
                    ? (handleSide === 'RIGHT' ? 'right' : 'left') as 'right' | 'left'
                    : (handleSide === 'TOP'   ? 'top'   : 'bottom') as 'top' | 'bottom';

                const hp = drillParams?.[handleSide as 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM']?.handle;
                let mmValue: number | null = null;
                if (hp && handleOffset && handlePosition != null) {
                    const fd = 6, fr = fd / 2;
                    const positions = handleSide === 'LEFT'
                        ? [
                            (frameHeight - handlePosition + handleOffset / 2) - fr - ((handleOffset - fd - hp.spacingX) / 2),
                            (frameHeight - handlePosition - handleOffset / 2) + fr + ((handleOffset - fd - hp.spacingX) / 2),
                        ]
                        : [
                            (handlePosition - handleOffset / 2) + fr + ((handleOffset - fd - hp.spacingX) / 2),
                            (handlePosition + handleOffset / 2) - fr - ((handleOffset - fd - hp.spacingX) / 2),
                        ];
                    mmValue = positions[i] ?? null;
                }

                const label   = mmValue != null ? `${Math.round(mmValue * 10) / 10}мм` : `H${i + 1}`;
                const focused = isHandleHoleFocused(focusedHole ?? null, handleSide as 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM', i);

                const color   = '#a78bfa';
                const r       = focused ? 6 : 3;
                const opacity = focused ? (blinkVisible ? 1 : 0.15) : 0.8;

                const sideCount = (() => {
                    if (!handleSide) return 0;
                    const e = drillParams?.[handleSide as 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM']?.edge;
                    return Number(e?.countStart ?? 0) + Number(e?.countEnd ?? 0);
                })();
                const dynOffset = HOLE_BASE + (sideCount + i) * HOLE_STEP;

                const lx = isV ? pt.x + dynOffset * (handleSide === 'RIGHT' ? 1 : -1) : pt.x;
                const ly = !isV ? (handleSide === 'TOP' ? pt.y - dynOffset : pt.y + dynOffset) : pt.y;

                return (
                    <g key={`hh-${i}`} style={{ pointerEvents: 'all', cursor: 'pointer' }}
                       onMouseEnter={() => {
                           setHoveredHole({ pt, label, direction: holeDir, dynOffset });
                           onHoleHover?.({ side: handleSide as 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM', type: 'handle', index: i + 1 });
                       }}
                       onMouseLeave={() => { setHoveredHole(null); onHoleHover?.(null); }}
                    >
                        {focused && <circle cx={pt.x} cy={pt.y} r={12} fill="none" stroke={color} strokeWidth={2} opacity={blinkVisible ? 0.7 : 0.1} />}
                        {isV
                            ? <line x1={pt.x} y1={pt.y} x2={lx} y2={pt.y} stroke={color} strokeWidth={focused ? 1.5 : 1} strokeDasharray="3,3" opacity={focused ? (blinkVisible ? 0.9 : 0.1) : 0.6} />
                            : <line x1={pt.x} y1={pt.y} x2={pt.x} y2={ly} stroke={color} strokeWidth={focused ? 1.5 : 1} strokeDasharray="3,3" opacity={focused ? (blinkVisible ? 0.9 : 0.1) : 0.6} />
                        }
                        <circle cx={pt.x} cy={pt.y} r={r} fill={color} opacity={opacity} />
                        <rect
                            x={isV ? (handleSide === 'RIGHT' ? lx : lx - 44) : pt.x - 22}
                            y={isV ? pt.y - 8 : (handleSide === 'TOP' ? ly - 18 : ly + 2)}
                            width={44} height={16} rx={3}
                            fill="rgba(10,15,30,0.85)"
                            stroke={focused ? color : 'none'} strokeWidth={focused ? 1 : 0}
                        />
                        <text
                            x={isV ? (handleSide === 'RIGHT' ? lx + 22 : lx - 22) : pt.x}
                            y={isV ? pt.y + 4 : (handleSide === 'TOP' ? ly - 6 : ly + 14)}
                            textAnchor="middle" fill={color} fontSize={focused ? 10 : 9}
                            fontFamily="monospace" fontWeight="700"
                        >{label}</text>
                    </g>
                );
            })}

            {/* Notch leaders */}
            {notchLines.map((n, i) => {
                const leaderLen  = 60;
                const edgeOffset = 8;
                const x1 = n.ptStart.x, y1 = n.ptStart.y;
                const x2 = n.ptEnd.x,   y2 = n.ptEnd.y;

                let anchorX: number, anchorY: number;
                if (n.anchorEnd) {
                    const dx = x1 - x2, dy = y1 - y2, len = Math.hypot(dx, dy);
                    anchorX = x2 + (dx / len) * edgeOffset;
                    anchorY = y2 + (dy / len) * edgeOffset;
                } else {
                    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
                    anchorX = x1 + (dx / len) * edgeOffset;
                    anchorY = y1 + (dy / len) * edgeOffset;
                }

                const frameCX = size.width  / 2;
                const frameCY = size.height / 2;

                let leaderEndX: number, leaderEndY: number;
                if (n.isVertical) {
                    leaderEndX = anchorX;
                    leaderEndY = anchorY < frameCY ? anchorY - leaderLen : anchorY + leaderLen;
                } else {
                    leaderEndX = anchorX < frameCX ? anchorX - leaderLen : anchorX + leaderLen;
                    leaderEndY = anchorY;
                }

                const labelW = 58, labelH = 18;
                let labelRectX: number, labelRectY: number, labelTextX: number, labelTextY: number;
                if (n.isVertical) {
                    const goUp = anchorY < frameCY;
                    labelRectX = leaderEndX - labelW / 2;
                    labelRectY = goUp ? leaderEndY - labelH - 2 : leaderEndY + 2;
                    labelTextX = leaderEndX;
                    labelTextY = goUp ? leaderEndY - 7 : leaderEndY + 13;
                } else {
                    const goLeft = anchorX < frameCX;
                    const pad    = 6;
                    labelRectX = goLeft ? leaderEndX - labelW - pad : leaderEndX + pad;
                    labelRectY = leaderEndY - labelH / 2;
                    labelTextX = goLeft ? leaderEndX - labelW / 2 - pad : leaderEndX + labelW / 2 + pad;
                    labelTextY = leaderEndY + 4;
                }

                return (
                    <g key={`notch-${i}`} style={{ pointerEvents: 'none' }}>
                        <circle cx={anchorX} cy={anchorY} r={3} fill="#34d399" opacity={0.9} />
                        <line x1={anchorX} y1={anchorY} x2={leaderEndX} y2={leaderEndY}
                              stroke="#34d399" strokeWidth={1} strokeDasharray="4,3" opacity={0.55} />
                        <rect x={labelRectX} y={labelRectY} width={labelW} height={labelH} rx={3}
                              fill="rgba(10,15,30,0.88)" stroke="#34d399" strokeWidth={0.5} strokeOpacity={0.5} />
                        <text x={labelTextX} y={labelTextY} textAnchor="middle"
                              fill="#34d399" fontSize={11} fontFamily="monospace" fontWeight="700">
                            {n.label}
                        </text>
                    </g>
                );
            })}

            {/* Hinge labels */}
            {hingeLines.map((h, i) => {
                const leaderLen = 60;
                const goRight   = h.side === 'right';
                const lx        = goRight ? h.pt.x + leaderLen : h.pt.x - leaderLen;
                const labelW    = 72;
                const posW      = 108;
                const color     = '#C0C0C0';

                return (
                    <g key={`hinge-label-${i}`} style={{ pointerEvents: 'none' }}>
                        {/* Anchor dot */}
                        <circle cx={h.pt.x} cy={h.pt.y} r={3} fill={color} opacity={0.9} />

                        {/* Leader line */}
                        <line
                            x1={h.pt.x} y1={h.pt.y}
                            x2={lx}     y2={h.pt.y}
                            stroke={color} strokeWidth={1} strokeDasharray="3,3" opacity={0.7}
                        />

                        {/* Length badge */}
                        <rect
                            x={goRight ? lx + 4 : lx - labelW - 4}
                            y={h.pt.y - 10}
                            width={labelW} height={18} rx={3}
                            fill="rgba(10,15,30,0.88)"
                            stroke={color} strokeWidth={0.5} strokeOpacity={0.6}
                        />
                        <text
                            x={goRight ? lx + 4 + labelW / 2 : lx - labelW / 2 - 4}
                            y={h.pt.y + 4}
                            textAnchor="middle" fill={color}
                            fontSize={10} fontFamily="monospace" fontWeight="700"
                        >
                            {h.label}
                        </text>

                        {/* Position badge */}
                        <rect
                            x={goRight ? lx + 4 : lx - posW - 4}
                            y={h.pt.y + 12}
                            width={posW} height={16} rx={3}
                            fill="rgba(10,15,30,0.75)"
                            stroke={color} strokeWidth={0.5} strokeOpacity={0.35}
                        />
                        <text
                            x={goRight ? lx + 4 + posW / 2 : lx - posW / 2 - 4}
                            y={h.pt.y + 24}
                            textAnchor="middle" fill={color}
                            fontSize={9} fontFamily="monospace" fontWeight="500" opacity={0.8}
                        >
                            {h.posLabel}
                        </text>
                    </g>
                );
            })}

            {/* Hover tooltip */}
            {hoveredHole && (() => {
                const { pt, label, direction, dynOffset } = hoveredHole;
                const pos = getHoverLabelPos(pt, direction, dynOffset);
                return (
                    <g style={{ pointerEvents: 'none' }}>
                        <circle cx={pt.x} cy={pt.y} r={6}  fill="#a78bfa" opacity={1} />
                        <circle cx={pt.x} cy={pt.y} r={10} fill="none" stroke="#a78bfa" strokeWidth={1.5} opacity={0.6} />
                        <rect x={pos.x} y={pos.y} width={60} height={20} rx={4}
                              fill="rgba(88,28,220,0.9)" stroke="#a78bfa" strokeWidth={1} />
                        <text x={pos.x + 30} y={pos.textY} textAnchor="middle"
                              fill="#ffffff" fontSize={13} fontFamily="monospace" fontWeight="700">
                            {label}
                        </text>
                    </g>
                );
            })()}
        </svg>
    );
}