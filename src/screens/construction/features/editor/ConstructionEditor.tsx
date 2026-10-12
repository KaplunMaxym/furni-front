'use client'

import React, {useState, useCallback, useEffect, useMemo} from 'react';
import { useConstructionDetails } from '@/screens/construction/hooks/construction-details/useConstructionDetails';
import { resolveDetailCode, isHorizontalCode, CODE_PRIORITY } from '@/screens/construction/constants/beamConstants';
import { ArrowLeft } from 'lucide-react';
import Canvas3DAdvanced from './canvas/Canvas3DAdvanced';
import ParametersPanel, {
    CutDefaultParameters,
    DrillDefaultParameters, HingeDefaultParameters,
    MillDefaultParameters
} from './panels/ParametersPanel';
import PartsList from './panels/PartsList';
import GcodeModal from './modals/GcodeModal';
import { Button } from "@/ui/shadcn/button";
import PageHeader, { HeaderBadge } from "@/ui/page-header/PageHeader";
import useModal from "@/hooks/useModal";
import {
    ConstructionEditorProps,
    ConstructionMesh,
    GcodeData,
    TransformMode,
    ViewMode
} from "@/screens/construction/type/editor/ThreeMesh";
import {useConstructionUpdateMutation} from "@/screens/construction/hooks/construction/useConstructionUpdateMutation";
import {HandleSideEnum, IConstruction} from "@/screens/construction/type/construction/IConstruction";
import {FocusedHoleKey} from "@/screens/construction/type/editor/FocusedHole";

interface ConstructionEditorPropsExtended extends ConstructionEditorProps {
    onRefetch?: () => Promise<IConstruction | null>;
    /**
     * Режим перегляду: сама модель і більше нічого.
     *
     * Для дилера. Він дивиться на виріб, щоб побачити, що замовив, — а не щоб
     * правити параметри верстата. Тому зникають обидві панелі, розмірні лінії
     * і позначки отворів, а камера стає з тилу: спереду фасад — це рівна
     * площина, по якій нічого не зрозуміло.
     *
     * Це зручність, а не захист: G-code і склад деталей закриті на сервері.
     */
    readOnly?: boolean;
}

export default function ConstructionEditor({construction, order, onGoBack, onRefetch, readOnly = false}: ConstructionEditorPropsExtended): React.ReactElement {
    const [frameWidth, setFrameWidth] = useState<number>(construction.width || 523);
    const [frameHeight, setFrameHeight] = useState<number>(construction.height || 400);
    const [beamThickness, setBeamThickness] = useState<number>(construction.beamThickness || 22);
    const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

    const [hingeSide, setHingeSide] = useState<HandleSideEnum | undefined>(construction.hingeSide ?? undefined);
    const [wireSide, setWireSide] = useState<HandleSideEnum | undefined>(construction.wireSide ?? undefined);
    const [hasHandle, setHasHandle] = useState<boolean>(construction.hasHandle || false);
    const [handleSide, setHandleSide] = useState<HandleSideEnum | undefined>(construction.handleSide ?? undefined);
    const [handleOffset, setHandleOffset] = useState<number | undefined>(construction.handleOffset ? Number(construction.handleOffset) : undefined);
    const [handlePosition, setHandlePosition] = useState<number | undefined>(construction.handlePosition ? Number(construction.handlePosition) : undefined);

    const [drillParams, setDrillParams] = useState<DrillDefaultParameters | undefined>(() => {
        if (!construction.drillParams) return undefined;
        return typeof construction.drillParams === 'string'
            ? JSON.parse(construction.drillParams)
            : construction.drillParams as DrillDefaultParameters;
    });

    const [millParams, setMillParams] = useState<MillDefaultParameters | undefined>(() => {
        if (!construction.millParams) return undefined;
        return typeof construction.millParams === 'string'
            ? JSON.parse(construction.millParams)
            : construction.millParams as MillDefaultParameters;
    });

    const [cutParams, setCutParams] = useState<CutDefaultParameters | undefined>(() => {
        if (!construction.cutParams) return undefined;
        return typeof construction.cutParams === 'string'
            ? JSON.parse(construction.cutParams)
            : construction.cutParams as CutDefaultParameters;
    });

    const [operationParams, setOperationParams] = useState<Record<string, unknown> | undefined>(() => {
        if (!construction.operationParams) return undefined;
        return typeof construction.operationParams === 'string'
            ? JSON.parse(construction.operationParams)
            : construction.operationParams as Record<string, unknown>;
    });

    const [hingeParams, setHingeParams] = useState<HingeDefaultParameters | undefined>(() => {
        if (!construction.hingeParams) return undefined;
        return typeof construction.hingeParams === 'string'
            ? JSON.parse(construction.hingeParams)
            : construction.hingeParams as HingeDefaultParameters;
    });

    const [confirmedFrameWidth, setConfirmedFrameWidth] = useState<number>(construction.width || 523);
    const [confirmedFrameHeight, setConfirmedFrameHeight] = useState<number>(construction.height || 400);
    const [confirmedBeamThickness, setConfirmedBeamThickness] = useState<number>(construction.beamThickness || 22);

    const [panelKey, setPanelKey] = useState<number>(0);

    const [selectedMesh, setSelectedMesh] = useState<ConstructionMesh | null>(null);
    const [meshes, setMeshes] = useState<ConstructionMesh[]>([]);
    const [orderedMeshes, setOrderedMeshes] = useState<ConstructionMesh[]>([]);

    const [viewMode, setViewMode] = useState<ViewMode>('solid');
    const [transformMode, setTransformMode] = useState<TransformMode>('none');

    const [gcodeData, setGcodeData] = useState<GcodeData | null>(null);

    const [focusedHole, setFocusedHole] = useState<FocusedHoleKey>(null);

    const { mutateAsync: updateConstruction, isPending: isUpdating } = useConstructionUpdateMutation();

    const modalGcode = useModal();

    const handleMeshesUpdate = useCallback((updatedMeshes: ConstructionMesh[], ordered: ConstructionMesh[]) => {
        setMeshes(updatedMeshes);
        setOrderedMeshes(ordered);
    }, []);

    const handleBeamClickFromCanvas = useCallback((beamName: string | null) => {
        const mesh = beamName ? orderedMeshes.find(m => m.name === beamName) : undefined;
        if (mesh) {
            setSelectedMesh(mesh);
        }
    }, [orderedMeshes]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            const key = e.key.toLowerCase();

            if (key === 't') { e.preventDefault(); setTransformMode('translate'); }
            if (key === 'r') { e.preventDefault(); setTransformMode('rotate'); }
            if (key === 'e') { e.preventDefault(); setTransformMode('scale'); }
            if (key === 'escape') { e.preventDefault(); setTransformMode('none'); }
            if (key === 'w') { e.preventDefault(); setViewMode('wireframe'); }
            if (key === 's') { e.preventDefault(); setViewMode('solid'); }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleUpdateModel = useCallback(async (): Promise<void> => {
        try {
            await updateConstruction({
                id: construction.id,
                width: frameWidth,
                height: frameHeight,
                beamThickness: beamThickness,
                hasHandle: hasHandle,
                hingeSide: hingeSide,
                wireSide: wireSide,
                hingeParams: hingeParams,
                handleSide: handleSide,
                handleOffset: handleOffset,
                handlePosition: handlePosition,
                drillParams: drillParams,
                millParams: millParams,
                cutParams: cutParams,
                operationParams: operationParams,
                orderId: order?.id
            });

            setConfirmedFrameWidth(frameWidth);
            setConfirmedFrameHeight(frameHeight);
            setConfirmedBeamThickness(beamThickness);

            if (onRefetch) {
                const updated = await onRefetch();
                if (updated) {
                    const freshDrill = updated.drillParams
                        ? (typeof updated.drillParams === 'string' ? JSON.parse(updated.drillParams) : updated.drillParams)
                        : undefined;
                    const freshMill = updated.millParams
                        ? (typeof updated.millParams === 'string' ? JSON.parse(updated.millParams) : updated.millParams)
                        : undefined;
                    const freshCut = updated.cutParams
                        ? (typeof updated.cutParams === 'string' ? JSON.parse(updated.cutParams) : updated.cutParams)
                        : undefined;
                    const freshHinge = updated.hingeParams
                        ? (typeof updated.hingeParams === 'string' ? JSON.parse(updated.hingeParams) : updated.hingeParams)
                        : undefined;

                    if (freshDrill) setDrillParams(freshDrill);
                    if (freshMill)  setMillParams(freshMill);
                    if (freshCut)   setCutParams(freshCut);
                    if (freshHinge) setHingeParams(freshHinge);

                    if (updated.wireSide !== undefined) {
                        setWireSide(updated.wireSide ?? undefined);
                    }
                    if (updated.hingeSide !== undefined) {
                        setHingeSide(updated.hingeSide ?? undefined);
                    }

                    setPanelKey(prev => prev + 1);
                }
            }
        } catch (error) {
            console.error('Помилка при оновленні конструкції:', error);
            throw error;
        }
    }, [
        frameWidth, frameHeight, beamThickness,
        hasHandle, handleSide, handleOffset, handlePosition,
        hingeSide, wireSide, hingeParams,
        drillParams, millParams, cutParams,
        construction, updateConstruction, order, onRefetch,
    ]);

    const handleOpenGcodeFromOperation = useCallback((gcode: string, fileName: string, operationId: number, operationTitle: string) => {
        setGcodeData({
            gcode,
            fileName,
            partName: operationTitle,
            beamLength: 0,
            beamThickness: confirmedBeamThickness,
            sawThickness: 0
        });
        setIsAnyModalOpen(true);
        modalGcode.onOpen();
    }, [confirmedBeamThickness, modalGcode]);

    const handleSelectMesh = useCallback((mesh: ConstructionMesh): void => {
        setSelectedMesh(mesh);
    }, []);

    const handleGcodeModalClose = useCallback(() => {
        setIsAnyModalOpen(false);
        modalGcode.onClose();
    }, [modalGcode]);

    const { data: editorDetails = [] } = useConstructionDetails(construction.id);

    const beamLabels = useMemo(() => {
        const byCode = editorDetails
            .filter(d => d.type === 'PROFILE')
            .map(d => ({ code: resolveDetailCode(d), name: d.name }))
            .sort((a, b) => (CODE_PRIORITY[a.code] ?? 99) - (CODE_PRIORITY[b.code] ?? 99));

        const horizontal = byCode.filter(d => isHorizontalCode(d.code));
        const vertical    = byCode.filter(d => !isHorizontalCode(d.code));

        return {
            top:    horizontal[0]?.name,
            bottom: horizontal[1]?.name,
            left:   vertical.find(d => d.code === 'LEFT')?.name,
            right:  vertical.find(d => d.code === 'RIGHT')?.name,
        };
    }, [editorDetails]);

    const isShelf = useMemo(
        () => editorDetails.some(d => {
            const code = resolveDetailCode(d);
            return code === 'FRONT' || code === 'BACK';
        }),
        [editorDetails],
    );

    const hasHingeDetail = useMemo(
        () => editorDetails.some(d => String(d.type) === 'HINGE'),
        [editorDetails],
    );

    const profileSystemFileUrl = construction.profileSystem?.fileUrl;

    return (
        /*
         * Вікно цілком: і по висоті, і по ширині.
         *
         * `mt-[72px]` лишався від нерухомої шапки, якої вже немає — сторінка
         * починалася з порожньої смуги у 72 пікселі. `max-w-[1600px]` — від
         * тієї ж старої верстки: на широкому моніторі він відрізав по кілька
         * сотень пікселів з боків, і бралося це в полотна, бо панель має свої
         * фіксовані 420. Висота теж від вікна, а не `100vh - 120px` навмання.
         */
        <div className="flex h-dvh w-full flex-col gap-3 overflow-hidden p-4">
            {/* Що саме зараз відкрито — раніше на сторінці не було жодної ознаки */}
            <PageHeader
                title={`Конструкція ${construction.constructionNo}`}
                badges={
                    <>
                        {construction.profileSystem?.title && (
                            <HeaderBadge>{construction.profileSystem.title}</HeaderBadge>
                        )}
                        <HeaderBadge>
                            {confirmedFrameWidth} × {confirmedFrameHeight} мм
                        </HeaderBadge>
                        {order?.orderNumber && <HeaderBadge mono>№ {order.orderNumber}</HeaderBadge>}
                    </>
                }
                leading={
                    <Button type="button" variant="outline" onClick={onGoBack}>
                        <ArrowLeft /> До замовлення
                    </Button>
                }
            />

            <div className="relative flex flex-1 gap-3 overflow-hidden">
                {/*
                  * Панель параметрів ліворуч, полотно праворуч.
                  *
                  * Читають зліва направо: спершу «що я задаю», потім «що з
                  * цього вийшло». Коли панель стояла праворуч, погляд після
                  * кожної правки повертався назад через усю ширину екрана —
                  * а правок тут десятки поспіль.
                  */}
                {!readOnly && (
                <div className="flex w-[420px] shrink-0 flex-col overflow-y-auto rounded-xl border border-border bg-card">
                    <ParametersPanel
                        key={panelKey}
                        construction={construction}
                        profileSystem={construction.profileSystem}
                        drillParams={drillParams}
                        setDrillParams={setDrillParams}
                        millParams={millParams}
                        setMillParams={setMillParams}
                        cutParams={cutParams}
                        setCutParams={setCutParams}
                        operationParams={operationParams}
                        setOperationParams={setOperationParams}
                        hingeParams={hingeParams}
                        setHingeParams={setHingeParams}
                        frameWidth={frameWidth}
                        setFrameWidth={setFrameWidth}
                        frameHeight={frameHeight}
                        setFrameHeight={setFrameHeight}
                        beamThickness={beamThickness}
                        setBeamThickness={setBeamThickness}
                        hasHandle={hasHandle}
                        setHasHandle={setHasHandle}
                        handleSide={handleSide}
                        setHandleSide={setHandleSide}
                        handleOffset={handleOffset}
                        setHandleOffset={setHandleOffset}
                        handlePosition={handlePosition}
                        setHandlePosition={setHandlePosition}
                        onUpdate={handleUpdateModel}
                        isUpdating={isUpdating}
                        hingeSide={hingeSide}
                        setHingeSide={setHingeSide}
                        wireSide={wireSide}
                        setWireSide={setWireSide}
                        onHoleInputFocus={setFocusedHole}
                        focusedHole={focusedHole}
                    />

                    {order && (
                        <PartsList
                            meshes={orderedMeshes}
                            selectedMesh={selectedMesh}
                            onSelectMesh={handleSelectMesh}
                            onOpenGcodeModal={handleOpenGcodeFromOperation}
                            construction={construction}
                            order={order}
                            onModalStateChange={setIsAnyModalOpen}
                        />
                    )}
                </div>
                )}
                {/* Полотно темніше за панель — так модель читається на фоні */}
                <div className="relative flex-1 overflow-hidden rounded-xl border border-border bg-background">
                    <Canvas3DAdvanced
                        beamLabels={beamLabels}
                        hasHinge={hasHingeDetail}
                        isShelf={isShelf}
                        operationParams={operationParams}
                        frameWidth={confirmedFrameWidth}
                        frameHeight={confirmedFrameHeight}
                        beamThickness={confirmedBeamThickness}
                        viewMode={viewMode}
                        transformMode={transformMode}
                        onMeshesUpdate={handleMeshesUpdate}
                        // У перегляді клік по балці нічого не відкриває, тож і
                        // підсвічувати обрану нема сенсу
                        onBeamClick={readOnly ? undefined : handleBeamClickFromCanvas}
                        selectedMeshName={readOnly ? null : selectedMesh?.name || null}
                        profileSystemFileUrl={profileSystemFileUrl}
                        hasHandle={hasHandle}
                        handleSide={handleSide}
                        hingeSide={hingeSide}
                        hingeParams={hingeParams}
                        handleOffset={handleOffset}
                        handlePosition={handlePosition}
                        drillParams={drillParams}
                        cutParams={cutParams}
                        millParams={millParams}
                        hideDimensions={isAnyModalOpen || readOnly}
                        viewFromBack={readOnly}
                        focusedHole={focusedHole}
                        onHoleHover={setFocusedHole}
                    />
                </div>

            </div>

            {!readOnly && gcodeData && (
                <GcodeModal
                    {...modalGcode}
                    onClose={handleGcodeModalClose}
                    gcodeData={gcodeData}
                />
            )}
        </div>
    );
}