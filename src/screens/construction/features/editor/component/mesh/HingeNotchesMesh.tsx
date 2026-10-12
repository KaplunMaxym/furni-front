'use client';

import {useMemo} from 'react';
import {MillDefaultParameters} from '@/screens/construction/features/editor/panels/ParametersPanel';
import {RoundedNotch} from './RoundedNotch';
import {HandleSideEnum} from "@/screens/construction/type/editor/Canvas3DAdvanced";

interface HingeNotchesMeshProps {
    frameWidth: number;
    frameHeight: number;
    beamThickness: number;
    handleSide?: HandleSideEnum;
    hasHandle?: boolean;
    millParams?: MillDefaultParameters;
}

type Notch = { pos: [number, number, number]; size: [number, number, number] };

export function HingeNotchesMesh({
                                     frameWidth, frameHeight, beamThickness,
                                     handleSide, hasHandle, millParams,
                                 }: HingeNotchesMeshProps) {
    const notches = useMemo<Notch[]>(() => {
        const ignoreHandleSide = (millParams)?.ignoreHandleSide === true;

        if (!ignoreHandleSide && !millParams) return [];

        const t      = beamThickness;
        const halfW  = frameWidth  / 2;
        const halfH  = frameHeight / 2;
        const notchDepth = t * 0.35;
        const frontZ     = t / 2;
        const result: Notch[] = [];

        /**
         * Довжини фрезерування балки: окремо ближній і дальній кінець.
         *
         * Системи зі старим спільним millLength читаються тим самим шляхом —
         * він другою ланкою. null означає, що балка не фрезерується взагалі
         * (millSides: 'none'), і зарубок бути не повинно: раніше в такому разі
         * підставлявся t * 2.5, тобто на моделі зʼявлялись неіснуючі виїмки.
         */
        const millLen = (side: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT') => {
            const sp = millParams?.[side] as
                | { millLengthStart?: number; millLengthEnd?: number; millLength?: number; millSides?: string }
                | undefined;

            const mode = sp?.millSides;
            if (mode === 'none') return null;

            const start = sp?.millLengthStart ?? sp?.millLength ?? t * 2.5;
            const end   = sp?.millLengthEnd ?? start;

            return {
                start: mode === 'end' ? null : start,
                end:   mode === 'start' ? null : end,
            };
        };

        if (ignoreHandleSide) {
            // ALU-100: зарубки фрезерування на всіх 4 балках з обох боків

            // Вертикальні балки: ближній кінець унизу, дальній угорі.
            for (const [side, beamX] of [
                ['LEFT',  -halfW + t / 2],
                ['RIGHT',  halfW - t / 2],
            ] as const) {
                const len = millLen(side);
                if (!len) continue;

                if (len.start !== null) {
                    result.push({ pos: [beamX, -halfH + len.start / 2, frontZ], size: [t * 0.75, len.start * 0.85, notchDepth] });
                }
                if (len.end !== null) {
                    result.push({ pos: [beamX, halfH - len.end / 2, frontZ], size: [t * 0.75, len.end * 0.85, notchDepth] });
                }
            }

            // Горизонтальні балки: ближній кінець ліворуч, дальній праворуч.
            for (const [side, beamY] of [
                ['TOP',     halfH - t / 2],
                ['BOTTOM', -halfH + t / 2],
            ] as const) {
                const len = millLen(side);
                if (!len) continue;

                if (len.start !== null) {
                    result.push({ pos: [-halfW + len.start / 2, beamY, frontZ], size: [len.start * 0.85, t * 0.75, notchDepth] });
                }
                if (len.end !== null) {
                    result.push({ pos: [halfW - len.end / 2, beamY, frontZ], size: [len.end * 0.85, t * 0.75, notchDepth] });
                }
            }

            return result;
        }

        // ALU-80: зарубки тільки на стороні петель

        /*
         * Фасад без ручки малюється так, ніби ручка справа.
         *
         * У такого фасада `handleSide` порожній, і раніше підставлялась ліва
         * ручка — виїмки виходили на правій стійці. Права ручка дає дзеркальну
         * картинку: фрезерується ліва стійка, а горизонталі — своїм лівим
         * кінцем. Решта розрахунку та сама, що й у звичайного півота з ручкою
         * справа, — міняється лише сторона, від якої він починається.
         */
        const effectiveHandleSide = hasHandle === false
            ? HandleSideEnum.RIGHT
            : handleSide ?? HandleSideEnum.LEFT;

        const derivedHingeSide =
            effectiveHandleSide === HandleSideEnum.LEFT   ? HandleSideEnum.RIGHT  :
                effectiveHandleSide === HandleSideEnum.RIGHT  ? HandleSideEnum.LEFT   :
                    effectiveHandleSide === HandleSideEnum.TOP    ? HandleSideEnum.BOTTOM :
                        HandleSideEnum.TOP;

        if (derivedHingeSide === HandleSideEnum.LEFT || derivedHingeSide === HandleSideEnum.RIGHT) {
            const signX       = derivedHingeSide === HandleSideEnum.RIGHT ? 1 : -1;
            const beamCenterX = signX * (halfW - t / 2);

            const vertMill = (derivedHingeSide === HandleSideEnum.LEFT
                ? millParams?.LEFT?.millLengthStart ?? millParams?.LEFT?.millLength
                : millParams?.RIGHT?.millLengthStart ?? millParams?.RIGHT?.millLength) ?? t * 2.5;
            const vertEdge = vertMill / 2;
            result.push({ pos: [beamCenterX,  halfH - vertEdge, frontZ], size: [t * 0.75, vertMill * 0.85, notchDepth] });
            result.push({ pos: [beamCenterX, -halfH + vertEdge, frontZ], size: [t * 0.75, vertMill * 0.85, notchDepth] });

            const topMill = millParams?.TOP?.millLengthStart ?? millParams?.TOP?.millLength ?? t * 2.5;
            const topEdge = topMill / 2;
            result.push({ pos: [signX * (halfW - topEdge),  halfH - t / 2, frontZ], size: [topMill * 0.85, t * 0.75, notchDepth] });

            const botMill = millParams?.BOTTOM?.millLengthStart ?? millParams?.BOTTOM?.millLength ?? t * 2.5;
            const botEdge = botMill / 2;
            result.push({ pos: [signX * (halfW - botEdge), -halfH + t / 2, frontZ], size: [botMill * 0.85, t * 0.75, notchDepth] });
        }

        if (derivedHingeSide === HandleSideEnum.TOP || derivedHingeSide === HandleSideEnum.BOTTOM) {
            const signY       = derivedHingeSide === HandleSideEnum.TOP ? 1 : -1;
            const beamCenterY = signY * (halfH - t / 2);

            const horizMill = (derivedHingeSide === HandleSideEnum.TOP
                ? millParams?.TOP?.millLengthStart ?? millParams?.TOP?.millLength
                : millParams?.BOTTOM?.millLengthStart ?? millParams?.BOTTOM?.millLength) ?? t * 2.5;
            const horizEdge = horizMill / 2;
            result.push({ pos: [-halfW + horizEdge, beamCenterY, frontZ], size: [horizMill * 0.85, t * 0.75, notchDepth] });
            result.push({ pos: [ halfW - horizEdge, beamCenterY, frontZ], size: [horizMill * 0.85, t * 0.75, notchDepth] });

            const leftMill  = millParams?.LEFT?.millLengthStart ?? millParams?.LEFT?.millLength  ?? t * 2.5;
            const leftEdge  = leftMill / 2;
            result.push({ pos: [-halfW + t / 2, signY * (halfH - leftEdge),  frontZ], size: [t * 0.75, leftMill  * 0.85, notchDepth] });

            const rightMill = millParams?.RIGHT?.millLengthStart ?? millParams?.RIGHT?.millLength ?? t * 2.5;
            const rightEdge = rightMill / 2;
            result.push({ pos: [ halfW - t / 2, signY * (halfH - rightEdge), frontZ], size: [t * 0.75, rightMill * 0.85, notchDepth] });
        }

        return result;
    }, [frameWidth, frameHeight, beamThickness, handleSide, hasHandle, millParams]);

    return <>{notches.map((n, i) => <RoundedNotch key={i} pos={n.pos} size={n.size} />)}</>;
}
