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

        if (ignoreHandleSide) {
            // ALU-100: зарубки фрезерування на всіх 4 балках з обох боків

            const leftMill = millParams?.LEFT?.millLength ?? t * 2.5;
            const leftEdge = leftMill / 2;
            result.push({ pos: [-halfW + t / 2,  halfH - leftEdge, frontZ], size: [t * 0.75, leftMill * 0.85, notchDepth] });
            result.push({ pos: [-halfW + t / 2, -halfH + leftEdge, frontZ], size: [t * 0.75, leftMill * 0.85, notchDepth] });

            const rightMill = millParams?.RIGHT?.millLength ?? t * 2.5;
            const rightEdge = rightMill / 2;
            result.push({ pos: [halfW - t / 2,  halfH - rightEdge, frontZ], size: [t * 0.75, rightMill * 0.85, notchDepth] });
            result.push({ pos: [halfW - t / 2, -halfH + rightEdge, frontZ], size: [t * 0.75, rightMill * 0.85, notchDepth] });

            const topMill = millParams?.TOP?.millLength ?? t * 2.5;
            const topEdge = topMill / 2;
            result.push({ pos: [-halfW + topEdge, halfH - t / 2, frontZ], size: [topMill * 0.85, t * 0.75, notchDepth] });
            result.push({ pos: [ halfW - topEdge, halfH - t / 2, frontZ], size: [topMill * 0.85, t * 0.75, notchDepth] });

            const botMill = millParams?.BOTTOM?.millLength ?? t * 2.5;
            const botEdge = botMill / 2;
            result.push({ pos: [-halfW + botEdge, -halfH + t / 2, frontZ], size: [botMill * 0.85, t * 0.75, notchDepth] });
            result.push({ pos: [ halfW - botEdge, -halfH + t / 2, frontZ], size: [botMill * 0.85, t * 0.75, notchDepth] });

            return result;
        }

        // ALU-80: зарубки тільки на стороні петель
        const effectiveHandleSide = handleSide ?? HandleSideEnum.LEFT;

        const derivedHingeSide =
            effectiveHandleSide === HandleSideEnum.LEFT   ? HandleSideEnum.RIGHT  :
                effectiveHandleSide === HandleSideEnum.RIGHT  ? HandleSideEnum.LEFT   :
                    effectiveHandleSide === HandleSideEnum.TOP    ? HandleSideEnum.BOTTOM :
                        HandleSideEnum.TOP;

        if (derivedHingeSide === HandleSideEnum.LEFT || derivedHingeSide === HandleSideEnum.RIGHT) {
            const signX       = derivedHingeSide === HandleSideEnum.RIGHT ? 1 : -1;
            const beamCenterX = signX * (halfW - t / 2);

            const vertMill = (derivedHingeSide === HandleSideEnum.LEFT
                ? millParams?.LEFT?.millLength
                : millParams?.RIGHT?.millLength) ?? t * 2.5;
            const vertEdge = vertMill / 2;
            result.push({ pos: [beamCenterX,  halfH - vertEdge, frontZ], size: [t * 0.75, vertMill * 0.85, notchDepth] });
            result.push({ pos: [beamCenterX, -halfH + vertEdge, frontZ], size: [t * 0.75, vertMill * 0.85, notchDepth] });

            const topMill = millParams?.TOP?.millLength ?? t * 2.5;
            const topEdge = topMill / 2;
            result.push({ pos: [signX * (halfW - topEdge),  halfH - t / 2, frontZ], size: [topMill * 0.85, t * 0.75, notchDepth] });

            const botMill = millParams?.BOTTOM?.millLength ?? t * 2.5;
            const botEdge = botMill / 2;
            result.push({ pos: [signX * (halfW - botEdge), -halfH + t / 2, frontZ], size: [botMill * 0.85, t * 0.75, notchDepth] });
        }

        if (derivedHingeSide === HandleSideEnum.TOP || derivedHingeSide === HandleSideEnum.BOTTOM) {
            const signY       = derivedHingeSide === HandleSideEnum.TOP ? 1 : -1;
            const beamCenterY = signY * (halfH - t / 2);

            const horizMill = (derivedHingeSide === HandleSideEnum.TOP
                ? millParams?.TOP?.millLength
                : millParams?.BOTTOM?.millLength) ?? t * 2.5;
            const horizEdge = horizMill / 2;
            result.push({ pos: [-halfW + horizEdge, beamCenterY, frontZ], size: [horizMill * 0.85, t * 0.75, notchDepth] });
            result.push({ pos: [ halfW - horizEdge, beamCenterY, frontZ], size: [horizMill * 0.85, t * 0.75, notchDepth] });

            const leftMill  = millParams?.LEFT?.millLength  ?? t * 2.5;
            const leftEdge  = leftMill / 2;
            result.push({ pos: [-halfW + t / 2, signY * (halfH - leftEdge),  frontZ], size: [t * 0.75, leftMill  * 0.85, notchDepth] });

            const rightMill = millParams?.RIGHT?.millLength ?? t * 2.5;
            const rightEdge = rightMill / 2;
            result.push({ pos: [ halfW - t / 2, signY * (halfH - rightEdge), frontZ], size: [t * 0.75, rightMill * 0.85, notchDepth] });
        }

        return result;
    }, [frameWidth, frameHeight, beamThickness, handleSide, hasHandle, millParams]);

    return <>{notches.map((n, i) => <RoundedNotch key={i} pos={n.pos} size={n.size} />)}</>;
}