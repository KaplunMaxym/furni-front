'use client'

import { ModalProps } from "@/hooks/useModal/useModal";
import Modal from "@/ui/Modal/Modal";
import { cn } from "@/helpers/cn";
import React, { FC, useState } from "react";
import { Check, Download, Barcode, FileCode, Printer } from "lucide-react";
import Loading from "@/ui/loading/Loading";
import { Button } from "@/ui/shadcn/button";
import { formatDateTime } from "@/utils/time/formatDateTime";
import { useConstructionDetails } from "@/screens/construction/hooks/construction-details/useConstructionDetails";
import {
    DETAIL_TYPE_LABELS,
    DetailType,
    IConstruction,
    IConstructionDetails
} from "@/screens/construction/type/construction/IConstruction";
import {
    downloadSingleLabel,
    generateLabelFileName,
    LabelData,
    printSingleLabel
} from "@/screens/construction/features/editor/utils/labelGenerator";
import {useOrderDetails} from "@/screens/order/hooks/order/useOrderDetails";
import { toast } from "sonner";
import {ConstructionDetail} from "@/screens/construction/type/construction-details/IConstructionDetail";
import { SectionLabel } from "@/ui/section-label/SectionLabel";

type IConstructionDetailModal = ModalProps & {
    constructionId: number | null;
    detailId: number | null;
    orderId?: number;
    construction?: IConstruction;
    onOperationComplete: (operationId: number, detailId: number) => Promise<void>;
    onDetailComplete: (detailId: number) => Promise<void>;
    onDownloadLabelByDetails: (detailId: number) => Promise<void>;
    onDownloadGCode: (operationId: number) => Promise<void>;
    onDownloadAllGCode: (detailId: number) => Promise<void>;
}

const ConstructionDetailModal: FC<IConstructionDetailModal> = ({constructionId, detailId, orderId, construction, onOperationComplete, onDetailComplete, onDownloadGCode, onDownloadLabelByDetails, onDownloadAllGCode, ...props}) => {
    const { data: details, isPending } = useConstructionDetails(constructionId || 0);
    const { data: order } = useOrderDetails(orderId || 0);
    const [loadingOperations, setLoadingOperations] = useState<Set<number>>(new Set());
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [isDownloadingLabel, setIsDownloadingLabel] = useState(false);
    const [isPrintingLabel, setIsPrintingLabel] = useState(false);

    const detail = details?.find(d => d.id === detailId);

    const handleOperationComplete = async (operationId: number) => {
        if (!detailId) return;
        setLoadingOperations(prev => new Set([...prev, operationId]));
        try {
            await onOperationComplete(operationId, detailId);
        } finally {
            setLoadingOperations(prev => {
                const newSet = new Set(prev);
                newSet.delete(operationId);
                return newSet;
            });
        }
    };

    const handleSideToBeamName: Record<string, string> = {
        'LEFT':   'Ліва балка',
        'RIGHT':  'Права балка',
        'TOP':    'Верхня балка',
        'BOTTOM': 'Нижня балка',
    };

    const getConstructionSize = (construction: IConstruction, detail: ConstructionDetail): string => {
        if (detail.type === DetailType.GLASS) {
            return `${Number(detail.width)} × ${Number(detail.height)} мм`;
        }
        return `${Number(construction.width)} × ${Number(construction.height)} мм`;
    };

    const buildLabelData = (): LabelData | null => {
        if (!order || !construction || !detail) return null;

        const handleBeamName = construction.handleSide
            ? handleSideToBeamName[construction.handleSide]
            : null;
        const isHandleBeam = !!handleBeamName && detail.name === handleBeamName;

        return {
            clientName: `${order.client.firstName} ${order.client.lastName}`,
            constructionSize: getConstructionSize(construction, detail),
            detailName: `R${detail.sequence} ${detail.name}`,
            constructionNumber: construction.constructionNo,
            serialNumber: `${order.orderNumber}${construction.constructionNo}${detail.detailNo}`,
            detailNumber: detail.detailNo,
            orderNumber: order.orderNumber,
            detailSize: detail.type === DetailType.GLASS ? null : (detail.length ?? null),
            handleSide: isHandleBeam ? (construction.handleSide ?? null) : null,
        };
    };

    const handleDownloadLabel = async () => {
        const labelData = buildLabelData();
        if (!labelData || !detail) return;

        setIsDownloadingLabel(true);
        try {
            const fileName = generateLabelFileName(
                order!.orderNumber,
                construction!.constructionNo,
                detail.detailNo,
                detail.name
            );

            await downloadSingleLabel(labelData, fileName);

            toast.success('Етикетка завантажена', {
                duration: 3000,
            });
        } catch (error) {
            console.error('Помилка при завантаженні етикетки:', error);
            toast.error('Помилка при завантаженні етикетки', {
                duration: 4000,
            });
        } finally {
            setIsDownloadingLabel(false);
        }
    };

    const handlePrintLabel = () => {
        const labelData = buildLabelData();
        if (!labelData) return;

        setIsPrintingLabel(true);
        try {
            printSingleLabel(labelData);
        } catch (error) {
            console.error('Помилка при друці етикетки:', error);
            toast.error('Помилка при друці етикетки', {
                duration: 4000,
            });
        } finally {
            setIsPrintingLabel(false);
        }
    };

    const handleDetailComplete = async () => {
        if (!detailId) return;
        setLoadingDetail(true);
        try {
            await onDetailComplete(detailId);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleLabelByDetailDownload = async () => {
        if (!detailId) return;
        setLoadingDetail(true);
        try {
            await onDownloadLabelByDetails(detailId);
        } finally {
            setLoadingDetail(false);
        }
    };

    if (!constructionId || !detailId) return null;

    return (
        <Modal
            {...props}
            className={cn(
                'max-w-[1000px]',
            )}
        >
            <Modal.Title className={'gap-2'} onClose={props.onClose}>
                Інформація про деталь
            </Modal.Title>

            <Modal.Body className={'flex flex-col gap-4'}>
                {isPending ? (
                    <div className="flex justify-center items-center h-48">
                        <Loading />
                    </div>
                ) : detail ? (
                    <div className="flex flex-col gap-4">
                        {/*
                          * Тип деталі й тип операції були кольоровими плашками:
                          * синя, смарагдова, жовта, червона. Колір не позначав ні
                          * стану, ні терміновості — лише те, яке слово всередині,
                          * тобто дублював сам напис і при цьому розфарбовував
                          * половину вікна. Лишився нейтральний бейдж.
                          */}
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-input px-2.5 py-0.5 text-xs text-muted-foreground">
                                    {DETAIL_TYPE_LABELS[detail.type]}
                                </span>
                                <h3 className="text-base font-semibold text-foreground">
                                    Деталь №{detail.detailNo}
                                </h3>
                                {detail.isCompleted && (
                                    <span className="flex items-center gap-1 text-xs text-chart-2">
                                        <Check size={14} /> Завершена
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span>R{detail.sequence} {detail.name}</span>

                                {detail.type === DetailType.PROFILE && detail.length != null && (
                                    <span className="tabular-nums text-foreground">{detail.length} мм</span>
                                )}
                                {detail.type === DetailType.GLASS && detail.area != null && (
                                    <span className="tabular-nums text-foreground">{detail.area} м²</span>
                                )}
                                {detail.type === DetailType.HANDLE && detail.handleOffset != null && (
                                    <span className="tabular-nums text-foreground">{detail.handleOffset} мм</span>
                                )}
                            </div>
                        </div>

                        {/*
                          * Дії однакові на вигляд, окрім головної — «Позначити
                          * завершеною». Раніше кожна мала власний колір (фіолетова,
                          * синя, індигова, смарагдова), тож жодна не читалася як
                          * основна, хоча натискають переважно її.
                          */}
                        <div className="flex flex-wrap gap-2 border-y border-border py-3">
                            <Button
                                type="button"
                                onClick={handleDetailComplete}
                                disabled={loadingDetail || detail.isCompleted}
                                variant={detail.isCompleted ? 'secondary' : 'default'}
                            >
                                <Check size={16} />
                                {detail.isCompleted ? 'Деталь завершена' : 'Позначити завершеною'}
                            </Button>

                            {detail.operations.length > 0 && (
                                <Button type="button" variant="outline" onClick={() => onDownloadAllGCode(detail.id)}>
                                    <FileCode size={16} />
                                    Весь G-Code ({detail.operations.length})
                                </Button>
                            )}

                            {detail.requiresLabel && (
                                <>
                                    <Button type="button" variant="outline" onClick={handleDownloadLabel} disabled={isDownloadingLabel}>
                                        <Barcode size={16} />
                                        {isDownloadingLabel ? 'Завантаження…' : 'Скачати етикетку'}
                                    </Button>

                                    <Button type="button" variant="outline" onClick={handlePrintLabel} disabled={isPrintingLabel}>
                                        <Printer size={16} />
                                        {isPrintingLabel ? 'Друк…' : 'Роздрукувати'}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant={detail.isDownloadLabel ? 'secondary' : 'outline'}
                                        onClick={handleLabelByDetailDownload}
                                        disabled={loadingDetail || detail.isDownloadLabel}
                                    >
                                        <Check size={16} />
                                        {detail.isDownloadLabel ? 'Етикетку завантажено' : 'Позначити етикетку'}
                                    </Button>
                                </>
                            )}
                        </div>

                        <div className="overflow-hidden rounded-lg border border-border">
                            {/* Такий самий підпис групи, як у розкладі вартості */}
                            <SectionLabel>Операції ({detail.operations.length})</SectionLabel>

                            {detail.operations.length > 0 ? (
                                <div className="flex flex-col gap-2 p-3">
                                    {detail.operations.map(operation => {
                                        const isOperationLoading = loadingOperations.has(operation.id);

                                        return (
                                            <div
                                                key={operation.id}
                                                className={cn(
                                                    'rounded-lg border border-border p-3 transition-opacity',
                                                    operation.isCompleted && 'opacity-70',
                                                )}
                                            >
                                                <div className="flex flex-wrap items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="rounded border border-input px-1.5 py-0.5 text-xs text-muted-foreground">
                                                                {operation.type}
                                                            </span>
                                                            {operation.isCompleted && (
                                                                <span className="flex items-center gap-1 text-xs text-chart-2">
                                                                    <Check size={13} /> Завершено
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mt-1 text-sm text-foreground">{operation.title}</p>
                                                    </div>

                                                    {operation.isCompleted && operation.completedAt && (
                                                        <p className="shrink-0 text-xs text-muted-foreground">
                                                            {formatDateTime(operation.completedAt)}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => onDownloadGCode(operation.id)}
                                                    >
                                                        <Download size={14} />
                                                        G-Code
                                                    </Button>

                                                    {!operation.isCompleted && (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={() => handleOperationComplete(operation.id)}
                                                            disabled={isOperationLoading}
                                                        >
                                                            <Check size={14} />
                                                            {isOperationLoading ? 'Збереження…' : 'Готово'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="p-3 text-sm text-muted-foreground">Операції не призначено</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">Деталь не знайдена</p>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ConstructionDetailModal;