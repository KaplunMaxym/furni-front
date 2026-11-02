'use client'

import React, {useState} from 'react';
import {PartsListProps} from "@/screens/construction/type/editor/ThreeMesh";
import LabelModal from "@/screens/construction/features/editor/modals/LabelModal";
import useModal from "@/hooks/useModal";
import {Tag, ChevronDown, Download} from "lucide-react";
import {cn} from "@/helpers/cn";
import {Button} from "@/ui/shadcn/button";
import {IConstruction} from "@/screens/construction/type/construction/IConstruction";
import {IOrder} from "@/screens/order/types/order/IOrder";
import {useConstructionDetails} from "@/screens/construction/hooks/construction-details/useConstructionDetails";
import {ConstructionDetail} from "@/screens/construction/type/construction-details/IConstructionDetail";
import {useGcode} from "@/screens/construction/hooks/gcode/useGcode";

interface PartsListPropsExtended extends PartsListProps {
    construction: IConstruction;
    order: IOrder;
    onOpenGcodeModal?: (gcode: string, fileName: string, operationId: number, operationTitle: string) => void;
    onModalStateChange?: (isOpen: boolean) => void;
}

export default function PartsList({meshes, selectedMesh, onSelectMesh, construction, order, onModalStateChange, onOpenGcodeModal}: PartsListPropsExtended): React.ReactElement {
    const [selectedDetail, setSelectedDetail] = useState<ConstructionDetail | null>(null);
    const [expandedDetailId, setExpandedDetailId] = useState<number | null>(null);
    const [loadingOperationId, setLoadingOperationId] = useState<number | null>(null);
    const labelModal = useModal();

    const { data: details = [] as ConstructionDetail[], isLoading: isLoadingDetails } = useConstructionDetails(construction.id);
    const { mutateAsync: downloadGCode } = useGcode();

    const getDetailByMeshName = (meshName: string): ConstructionDetail | undefined => {
        return details.find(detail => detail.name === meshName);
    };

    const openLabelModal = (meshName: string) => {
        const detail = getDetailByMeshName(meshName);
        if (!detail) return;
        setSelectedDetail(detail);
        onModalStateChange?.(true);
        labelModal.onOpen();
    };

    const handleOpenGcodeInModal = async (operationId: number, operationTitle: string) => {
        try {
            setLoadingOperationId(operationId);
            const response = await downloadGCode(operationId);

            const gcode = typeof response === 'string' ? response : response.code;

            if (onOpenGcodeModal) {
                onOpenGcodeModal(gcode, response.fileName, operationId, operationTitle);
            }
        } catch (error) {
            console.error('Error loading G-Code:', error);
        } finally {
            setLoadingOperationId(null);
        }
    };

    if (isLoadingDetails) {
        return (
            <div className="flex flex-1 flex-col border-t border-border p-4">
                <h2 className="mb-3 text-sm font-semibold text-foreground">Деталі конструкції</h2>
                <p className="py-8 text-center text-xs text-muted-foreground">Завантаження деталей…</p>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col border-t border-border p-4">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Деталі конструкції</h2>

            <div className="flex flex-1 flex-col gap-1.5">
                {meshes.length === 0 ? (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                        Клацніть на деталь у 3D-сцені
                    </p>
                ) : (
                    [...meshes]
                        .sort((a, b) => {
                            const detailA = getDetailByMeshName(a.name);
                            const detailB = getDetailByMeshName(b.name);
                            const noA = detailA?.detailNo ? Number(detailA.detailNo) : Infinity;
                            const noB = detailB?.detailNo ? Number(detailB.detailNo) : Infinity;
                            return noA - noB;
                        })
                        .map((mesh, idx) => {
                            const detail = getDetailByMeshName(mesh.name);
                            const isExpanded = expandedDetailId === detail?.id;
                            const isSelected = selectedMesh?.name === mesh.name;

                            return (
                                <div key={`${mesh.name}-${idx}`} className="flex flex-col gap-1">
                                    <div
                                        onClick={() => onSelectMesh(mesh)}
                                        className={cn(
                                            'flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 transition-colors',
                                            isSelected
                                                ? 'bg-primary/10 text-foreground'
                                                : 'text-foreground hover:bg-accent/60',
                                        )}
                                    >
                                        <div className="flex min-w-0 flex-1 items-center gap-2">
                                            {/* Номери були чорним текстом на темному фоні */}
                                            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">
                                                {detail?.detailNo ?? '—'}
                                            </span>

                                            {detail?.sequence && (
                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                    R{detail.sequence}
                                                </span>
                                            )}

                                            <span className="truncate text-sm">{mesh.name}</span>
                                        </div>

                                        <div className="flex shrink-0 gap-1.5">
                                            {detail && detail.operations.length > 0 && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    title="Переглянути операції"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        setExpandedDetailId(isExpanded ? null : detail.id);
                                                    }}
                                                >
                                                    <ChevronDown
                                                        size={14}
                                                        className={cn('transition-transform', isExpanded && 'rotate-180')}
                                                    />
                                                    {detail.operations.length}
                                                </Button>
                                            )}

                                            {detail?.requiresLabel && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    title={`Етикетка для ${mesh.name}`}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        openLabelModal(mesh.name);
                                                    }}
                                                >
                                                    <Tag size={14} />
                                                    Етикетка
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {detail && isExpanded && detail.operations.length > 0 && (
                                        <div className="ml-3 flex flex-col gap-1.5 border-l border-border pl-3">
                                            {detail.operations.map(operation => {
                                                const isLoading = loadingOperationId === operation.id;

                                                return (
                                                    <div
                                                        key={operation.id}
                                                        className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                                                    >
                                                        <div className="min-w-0">
                                                            <p className="truncate text-xs text-foreground">
                                                                {operation.title}
                                                            </p>
                                                            <p className="truncate text-[11px] text-muted-foreground">
                                                                {operation.type}
                                                            </p>
                                                        </div>

                                                        {operation.cncPrograms && (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                disabled={isLoading}
                                                                title={`G-code для ${operation.title}`}
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    handleOpenGcodeInModal(operation.id, operation.title);
                                                                }}
                                                            >
                                                                <Download className="h-3 w-3" />
                                                                {isLoading ? 'Завантаження…' : 'G-code'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                )}
            </div>

            {selectedDetail && (
                <LabelModal
                    {...labelModal}
                    construction={construction}
                    detail={selectedDetail}
                    order={order}
                    onClose={() => {
                        labelModal.onClose();
                        setSelectedDetail(null);
                        onModalStateChange?.(false);
                    }}
                />
            )}
        </div>
    );
}