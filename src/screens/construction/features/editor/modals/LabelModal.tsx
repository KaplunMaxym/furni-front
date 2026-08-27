'use client'

import { ModalProps } from "@/hooks/useModal/useModal";
import Modal from "@/ui/Modal/Modal";
import { cn } from "@/helpers/cn";
import React, { FC, useRef, useState } from "react";
import Button from "@/ui/button/Button";
import { Download, Printer } from 'lucide-react';
import {
    downloadSingleLabel,
    generateLabelFileName,
    LabelData, printSingleLabel
} from "@/screens/construction/features/editor/utils/labelGenerator";
import toast from "react-hot-toast";
import {QRCodeSVG} from "qrcode.react";
import {DetailType, IConstruction} from "@/screens/construction/type/construction/IConstruction";
import {ConstructionDetail} from "@/screens/construction/type/construction-details/IConstructionDetail";
import {IOrder} from "@/screens/order/types/order/IOrder";

type ILabelModalProps = ModalProps & {
    construction: IConstruction;
    detail: ConstructionDetail;
    order: IOrder;
}

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

const LabelModal: FC<ILabelModalProps> = ({ construction, detail, order, ...props }) => {
    const labelRef = useRef<HTMLDivElement>(null);
    const [isDownloadingLabel, setIsDownloadingLabel] = useState(false);
    const [isPrintingLabel, setIsPrintingLabel] = useState(false);
    const today = new Date().toLocaleDateString('uk-UA');

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

    const downloadLabel = async () => {
        const labelData = buildLabelData();
        if (!labelData) return;

        setIsDownloadingLabel(true);
        try {
            const fileName = generateLabelFileName(
                order.orderNumber,
                construction.constructionNo,
                detail.detailNo,
                detail.name
            );

            await downloadSingleLabel(labelData, fileName);

            toast.success('Етикетка завантажена', {
                duration: 3000,
                position: 'top-right',
            });
        } catch (error) {
            console.error('Помилка при завантаженні етикетки:', error);
            toast.error('Помилка при завантаженні етикетки', {
                duration: 4000,
                position: 'top-right',
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
                position: 'top-right',
            });
        } finally {
            setIsPrintingLabel(false);
        }
    };

    const constructionSize = getConstructionSize(construction, detail);
    const handleBeamName = construction.handleSide ? handleSideToBeamName[construction.handleSide] : null;
    const isHandleBeam = !!handleBeamName && detail.name === handleBeamName;

    return (
        <Modal
            {...props}
            className={cn(
                'flex flex-col gap-2.5 max-w-[900px] min-h-10 rounded-base-mini mx-2 overflow-y-auto max-h-dvh h-auto',
            )}
        >
            <Modal.Title className={'gap-2'} onClose={props.onClose}>
                Етикетка деталі
            </Modal.Title>

            <Modal.Body className={'flex flex-col gap-4 rounded-xl p-3'}>
                <div className="flex justify-center mb-4">
                    <div
                        ref={labelRef}
                        className="bg-white/600 rounded-[20px] p-6 shadow-lg"
                        style={{ width: '210mm', height: 'auto' }}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-bold text-black/500">
                                            {order.client.firstName} {order.client.lastName}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-bold text-black/500">Номер Замовлення:</span>
                                        <span className="text-black/500"> {order.orderNumber}</span>
                                    </div>

                                    <div>
                                        <span className="font-bold text-black/500">Номер Конструкції:</span>
                                        <span className="text-black/500"> {construction.constructionNo}</span>
                                    </div>

                                    <div>
                                        <span className="font-bold text-black/500">Номер Деталі:</span>
                                        <span className="text-black/500"> {detail.detailNo}</span>
                                    </div>

                                    <div>
                                        <span className="font-bold text-black/500">Деталь:</span>
                                        <span className="text-black/500"> R{detail.sequence} {detail.name}</span>
                                    </div>

                                    <div>
                                        <span className="font-bold text-black/500">Розмір:</span>
                                        <span className="text-black/500"> {constructionSize}</span>
                                    </div>

                                    {detail.type !== DetailType.GLASS && detail.length != null && (
                                        <div>
                                            <span className="font-bold text-black/500">Розмір деталі:</span>
                                            <span className="text-black/500"> {detail.length} мм</span>
                                        </div>
                                    )}

                                    {isHandleBeam && construction.handleSide && (
                                        <div>
                                            <span className="font-bold text-black/500">Сторона ручки:</span>
                                            <span className="text-black/500"> {construction.handleSide}</span>
                                        </div>
                                    )}

                                    <div>
                                        <span className="font-bold text-black/500">Дата:</span>
                                        <span className="text-black/500"> {today}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center bg-white p-3"
                                 style={{
                                     minHeight: '120px',
                                     minWidth: '220px',
                                     display: 'flex',
                                     alignItems: 'center',
                                     justifyContent: 'center'
                                 }}
                            >
                                <QRCodeSVG
                                    value={`http://localhost:5173/order/${order.orderNumber}`}
                                    size={140}
                                    level="M"
                                />
                                <div className="text-black/500">
                                    {order.orderNumber}{construction.constructionNo}{detail.detailNo}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        type="button"
                        onClick={handlePrintLabel}
                        disabled={isPrintingLabel}
                        color="blue"
                        className="flex-1 flex items-center justify-center gap-2"
                    >
                        <Printer size={18} />
                        {isPrintingLabel ? 'Друкування...' : 'Роздрукувати'}
                    </Button>

                    <Button
                        type="button"
                        onClick={downloadLabel}
                        disabled={isDownloadingLabel}
                        color="greenDarkgreen"
                        className="flex-1 flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        {isDownloadingLabel ? 'Завантаження...' : 'Скачати PNG'}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default LabelModal;