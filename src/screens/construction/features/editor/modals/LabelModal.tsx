'use client'

import { ModalProps } from "@/hooks/useModal/useModal";
import Modal from "@/ui/Modal/Modal";
import React, { FC, useState } from "react";
import { Button } from "@/ui/shadcn/button";
import { Download, Printer } from 'lucide-react';
import {
    downloadSingleLabel,
    generateLabelFileName,
    LabelData, printSingleLabel
} from "@/screens/construction/features/editor/utils/labelGenerator";
import { toast } from "sonner";
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

    const constructionSize = getConstructionSize(construction, detail);
    const handleBeamName = construction.handleSide ? handleSideToBeamName[construction.handleSide] : null;
    const isHandleBeam = !!handleBeamName && detail.name === handleBeamName;

    /*
     * Поля етикетки — списком, а не десятком однакових <div> у розмітці.
     * Додати рядок тепер означає додати запис, а не скопіювати блок.
     */
    const rows: Array<{ label: string; value: string } | null> = [
        { label: 'Замовлення',  value: order.orderNumber },
        { label: 'Конструкція', value: construction.constructionNo },
        { label: 'Деталь',      value: `№${detail.detailNo} · R${detail.sequence} ${detail.name}` },
        { label: 'Розмір',      value: constructionSize },
        detail.type !== DetailType.GLASS && detail.length != null
            ? { label: 'Розмір деталі', value: `${detail.length} мм` }
            : null,
        isHandleBeam && construction.handleSide
            ? { label: 'Сторона ручки', value: construction.handleSide }
            : null,
        { label: 'Дата', value: today },
    ];

    return (
        <Modal {...props} className="max-w-[920px]">
            <Modal.Title onClose={props.onClose}>
                Етикетка деталі
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-4">
                {/*
                 * Аркуш білий із чорним текстом — і в темній темі теж.
                 *
                 * Це не елемент інтерфейсу, а попередній перегляд того, що піде
                 * на принтер і в PNG, тож він має виглядати як папір. Раніше тут
                 * стояли `bg-card/600` і `text-black/500`: перший клас не існує
                 * взагалі, другий у нашій палітрі означає світло-сірий — тобто
                 * майже білий текст на майже білому аркуші.
                 *
                 * Ширина тягнеться за модалкою, а не фіксована на 210 мм.
                 * Фіксована не мала сенсу: на принтер і в PNG іде окремий
                 * елемент, який збирає `renderLabelComponent` з тих самих даних,
                 * тож розмір тутешнього аркуша ні на що не впливав — зате не
                 * влазив у модалку й обрізав QR-код праворуч.
                 */}
                <div className="rounded-lg border border-border p-4">
                    <div
                        className="flex items-start justify-between gap-8 rounded-lg p-6"
                        style={{ background: '#FFFFFF', color: '#111111' }}
                    >
                        <div className="min-w-0 flex-1">
                            <p className="mb-4 text-lg font-bold">
                                {order.client.firstName} {order.client.lastName}
                            </p>

                            {/*
                             * Сітка, а не рядки з пробілом: значення вирівняні по
                             * одній лінії, тож етикетку можна читати колонкою, не
                             * вишукуючи кожне поле після підпису різної довжини.
                             */}
                            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                                {rows.filter(Boolean).map(row => (
                                    <React.Fragment key={row!.label}>
                                        <dt className="font-semibold">{row!.label}</dt>
                                        <dd className="min-w-0 truncate">{row!.value}</dd>
                                    </React.Fragment>
                                ))}
                            </dl>
                        </div>

                        <div className="flex shrink-0 flex-col items-center gap-2">
                            <QRCodeSVG
                                value={`http://localhost:5173/order/${order.orderNumber}`}
                                size={140}
                                level="M"
                            />
                            <span className="font-mono text-sm">
                                {order.orderNumber}{construction.constructionNo}{detail.detailNo}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrintLabel}
                        disabled={isPrintingLabel}
                    >
                        <Printer size={16} />
                        {isPrintingLabel ? 'Друкування…' : 'Роздрукувати'}
                    </Button>

                    <Button type="button" onClick={downloadLabel} disabled={isDownloadingLabel}>
                        <Download size={16} />
                        {isDownloadingLabel ? 'Завантаження…' : 'Скачати PNG'}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default LabelModal;