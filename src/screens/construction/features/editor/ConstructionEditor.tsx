'use client'

import React, {useState, useCallback, useEffect} from 'react';
import { ArrowLeft } from 'lucide-react';
import Canvas3DAdvanced from './canvas/Canvas3DAdvanced';
import ParametersPanel, {
    CutDefaultParameters,
    DrillDefaultParameters, HingeDefaultParameters,
    MillDefaultParameters
} from './panels/ParametersPanel';
import PartsList from './panels/PartsList';
import GcodeModal from './modals/GcodeModal';
import Button from "@/ui/button/Button";
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
}

export default function ConstructionEditor({construction, order, onGoBack, onRefetch}: ConstructionEditorPropsExtended): React.ReactElement {
    const [frameWidth, setFrameWidth] = useState<number>(construction.width || 523);
    const [frameHeight, setFrameHeight] = useState<number>(construction.height || 400);
    const [beamThickness, setBeamThickness] = useState<number>(construction.beamThickness || 22);
    const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

    const [hingeSide, setHingeSide] = useState<HandleSideEnum | undefined>(construction.hingeSide ?? undefined);
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
                hingeParams: hingeParams,
                handleSide: handleSide,
                handleOffset: handleOffset,
                handlePosition: handlePosition,
                drillParams: drillParams,
                millParams: millParams,
                cutParams: cutParams,
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
        hingeSide, hingeParams,
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

    const profileSystemFileUrl = construction.profileSystem?.fileUrl;

    return (
        <div className="w-full max-w-[1600px] mt-[72px] gap-2 flex flex-col overflow-hidden mx-auto h-[calc(100vh-120px)]">
            <div className="flex w-fit justify-start items-center">
                <Button onClick={onGoBack} className="flex items-center gap-2" color="gray">
                    <ArrowLeft size={20} /> Повернутися до замовлення
                </Button>
            </div>

            <div className="flex-1 flex relative overflow-hidden gap-4">
                <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden relative">
                    <Canvas3DAdvanced
                        frameWidth={confirmedFrameWidth}
                        frameHeight={confirmedFrameHeight}
                        beamThickness={confirmedBeamThickness}
                        viewMode={viewMode}
                        transformMode={transformMode}
                        onMeshesUpdate={handleMeshesUpdate}
                        onBeamClick={handleBeamClickFromCanvas}
                        selectedMeshName={selectedMesh?.name || null}
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
                        hideDimensions={isAnyModalOpen}
                        focusedHole={focusedHole}
                        onHoleHover={setFocusedHole}
                    />
                </div>

                <div className="w-[420px] bg-gray-800 rounded-lg border border-gray-700 overflow-y-auto flex flex-col">
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
            </div>

            {gcodeData && (
                <GcodeModal
                    {...modalGcode}
                    onClose={handleGcodeModalClose}
                    gcodeData={gcodeData}
                />
            )}
        </div>
    );
}