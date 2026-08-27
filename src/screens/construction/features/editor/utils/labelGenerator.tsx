import React from "react";
import { createRoot } from "react-dom/client";
import { jsPDF } from "jspdf";
import {LabelComponent} from "@/screens/order/features/label/label-component";
import {IConstruction, IConstructionDetails, DetailType} from "@/screens/construction/type/construction/IConstruction";
import {IOrder} from "@/screens/order/types/order/IOrder";

export interface LabelData {
    clientName: string;
    constructionSize: string;
    detailSize: number | null;
    detailName?: string;
    serialNumber: string;
    orderNumber: string;
    constructionNumber: string;
    detailNumber: string;
    handleSide?: string | null;
}

const getConstructionSize = (construction: IConstruction, detail: IConstructionDetails): string => {
    if (detail.type === DetailType.GLASS) {
        return `${Number(detail.width)} × ${Number(detail.height)} мм`;
    }
    return `${Number(construction.width)} × ${Number(construction.height)} мм`;
};

const handleSideToBeamName: Record<string, string> = {
    'LEFT':   'Ліва балка',
    'RIGHT':  'Права балка',
    'TOP':    'Верхня балка',
    'BOTTOM': 'Нижня балка',
};

export const generateConstructionPdf = async (construction: IConstruction, order: IOrder): Promise<Blob> => {
    const labelWidth = 100;
    const labelHeight = 25;

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [labelWidth, labelHeight] });

    let isFirstPage = true;

    for (const detail of construction.details || []) {
        if (!detail.requiresLabel) continue;

        const handleBeamName = construction.handleSide
            ? handleSideToBeamName[construction.handleSide]
            : null;
        const isHandleBeam = !!handleBeamName && detail.name === handleBeamName;

        const labelData: LabelData = {
            clientName: `${order.client.firstName} ${order.client.lastName}`,
            detailName: `R${detail.sequence} ${detail.name}`,
            constructionSize: getConstructionSize(construction, detail),
            detailSize: detail.type === DetailType.GLASS ? null : (detail.length ?? null),
            serialNumber: order.orderNumber + construction.constructionNo + detail.detailNo,
            detailNumber: detail.detailNo,
            orderNumber: order.orderNumber,
            constructionNumber: construction.constructionNo,
            handleSide: isHandleBeam ? (construction.handleSide ?? null) : null,
        };

        console.log(labelData)

        const element = await renderLabelComponent(labelData);
        const img = await convertLabelToImage(element);

        if (!isFirstPage) pdf.addPage([labelWidth, labelHeight]);
        pdf.addImage(img, 'PNG', 0, 0, labelWidth, labelHeight);
        isFirstPage = false;
    }

    return pdf.output('blob');
};

export const renderLabelComponent = async (data: LabelData): Promise<HTMLElement> => {
    return new Promise((resolve) => {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.width = '100mm';
        document.body.appendChild(container);

        console.log(data)

        const root = createRoot(container);
        root.render(<LabelComponent data={data} />);

        setTimeout(() => resolve(container), 300);
    });
};

export const convertLabelToImage = async (element: HTMLElement): Promise<string> => {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element, { scale: 3, backgroundColor: 'transparent' });
    document.body.removeChild(element);
    return canvas.toDataURL('image/png');
};

export const generateLabelFileName = (orderNumber: string, constructionNo: string, detailNo: string, detailName?: string): string => {
    const name = detailName ? `_${detailName.replace(/\s+/g, '_')}` : '';
    return `Label_${orderNumber}_C${constructionNo}_D${detailNo}${name}.png`;
};

export const downloadSingleLabel = async (data: LabelData, fileName: string) => {
    const element = await renderLabelComponent(data);
    const img = await convertLabelToImage(element);

    const link = document.createElement('a');
    link.href = img;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const printSingleLabel = (data: LabelData): void => {
    const today = new Date().toLocaleDateString('uk-UA');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8" />
            <title>Етикетка</title>
            <style>
                @page {
                    size: 100mm 25mm;
                    margin: 0;
                }
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                body {
                    width: 100mm;
                    height: 25mm;
                    overflow: hidden;
                    background: #fff;
                    font-family: Arial, sans-serif;
                }
                .label-wrapper {
                    width: 100mm;
                    height: 25mm;
                    display: flex;
                    align-items: center;
                    padding: 2mm;
                    gap: 3mm;
                    background: #ffffff;
                }
                .label-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 1mm;
                    font-size: 4pt;
                    color: #000;
                    overflow: hidden;
                }
                .label-info .client {
                    font-weight: bold;
                    font-size: 6pt;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .label-info .row {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .label-info .row b {
                    font-weight: bold;
                }
                .label-qr-wrapper {
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .label-qr {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 22mm;
                    height: 22mm;
                }
                .label-qr img,
                .label-qr canvas {
                    object-fit: contain;
                }
                .label-serial {
                    font-size: 5pt;
                    font-weight: bold;
                    white-space: nowrap;
                    color: #000;
                }
            </style>
        </head>
        <body>
            <div class="label-wrapper">
                <div class="label-info">
                    <div class="client">${data.clientName}</div>
                    <div class="row"><b>Номер Замовлення:</b> ${data.orderNumber}</div>
                    <div class="row"><b>Номер Конструкції:</b> ${data.constructionNumber}</div>
                    <div class="row"><b>Номер Деталі:</b> ${data.detailNumber}</div>
                    ${data.detailName ? `<div class="row"><b>Деталь:</b> ${data.detailName}</div>` : ''}
                    <div class="row"><b>Розмір:</b> ${data.constructionSize}</div>
                    ${data.detailSize ? `<div class="row"><b>Розмір деталі:</b> ${data.detailSize}</div>` : ''}
                    ${data.handleSide ? `<div class="row"><b>Сторона ручки:</b> ${data.handleSide}</div>` : ''}
                    <div class="row"><b>Дата:</b> ${today}</div>
                </div>
                ${data.serialNumber ? `
                    <div class="label-qr-wrapper">
                        <div class="label-qr" id="qr-container"></div>
                        <div class="label-serial">${data.serialNumber}</div>
                    </div>
                ` : ''}
            </div>
            ${data.serialNumber ? `
            <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
            <script>
                window.onload = function() {
                    var container = document.getElementById('qr-container');
                    var qr = new QRCode(container, {
                        text: '${data.serialNumber}',
                        width: 68,
                        height: 68,
                        colorDark: '#000000',
                        colorLight: '#ffffff',
                        correctLevel: QRCode.CorrectLevel.H
                    });
                    setTimeout(function() { window.print(); window.close(); }, 500);
                };
            </script>
            ` : `
            <script>
                window.onload = function() {
                    setTimeout(function() { window.print(); window.close(); }, 100);
                };
            </script>
            `}
        </body>
        </html>
    `);

    printWindow.document.close();
};

export const generateSingleDetailLabelPdf = async (
    construction: IConstruction,
    order: IOrder,
    detail: IConstructionDetails,
): Promise<Blob | null> => {
    if (!detail.requiresLabel) return null;

    const labelWidth = 100;
    const labelHeight = 25;

    const handleBeamName = construction.handleSide
        ? handleSideToBeamName[construction.handleSide]
        : null;
    const isHandleBeam = !!handleBeamName && detail.name === handleBeamName;

    const labelData: LabelData = {
        clientName: `${order.client.firstName} ${order.client.lastName}`,
        detailName: `R${detail.sequence} ${detail.name}`,
        constructionSize: getConstructionSize(construction, detail),
        detailSize: detail.type === DetailType.GLASS ? null : (detail.length ?? null),
        serialNumber: order.orderNumber + construction.constructionNo + detail.detailNo,
        detailNumber: detail.detailNo,
        orderNumber: order.orderNumber,
        constructionNumber: construction.constructionNo,
        handleSide: isHandleBeam ? (construction.handleSide ?? null) : null,
    };

    const element = await renderLabelComponent(labelData);
    const img = await convertLabelToImage(element);

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [labelWidth, labelHeight] });
    pdf.addImage(img, 'PNG', 0, 0, labelWidth, labelHeight);

    return pdf.output('blob');
};

export const generateBarLabelsPdf = async (
    order: IOrder,
    items: Array<{ construction: IConstruction; detail: IConstructionDetails }>,
): Promise<Blob | null> => {
    const labelWidth = 100;
    const labelHeight = 25;

    const validItems = items.filter(({ detail }) => detail.requiresLabel);
    if (validItems.length === 0) return null;

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [labelWidth, labelHeight] });
    let isFirstPage = true;

    for (const { construction, detail } of validItems) {
        const handleBeamName = construction.handleSide
            ? handleSideToBeamName[construction.handleSide]
            : null;
        const isHandleBeam = !!handleBeamName && detail.name === handleBeamName;

        const labelData: LabelData = {
            clientName: `${order.client.firstName} ${order.client.lastName}`,
            detailName: `R${detail.sequence} ${detail.name}`,
            constructionSize: getConstructionSize(construction, detail),
            detailSize: detail.type === DetailType.GLASS ? null : (detail.length ?? null),
            serialNumber: order.orderNumber + construction.constructionNo + detail.detailNo,
            detailNumber: detail.detailNo,
            orderNumber: order.orderNumber,
            constructionNumber: construction.constructionNo,
            handleSide: isHandleBeam ? (construction.handleSide ?? null) : null,
        };

        const element = await renderLabelComponent(labelData);
        const img = await convertLabelToImage(element);

        if (!isFirstPage) pdf.addPage([labelWidth, labelHeight]);
        pdf.addImage(img, 'PNG', 0, 0, labelWidth, labelHeight);
        isFirstPage = false;
    }

    return pdf.output('blob');
};

export const generateLabelForZip = async (data: LabelData): Promise<{ imageData: string; base64: string }> => {
    try {
        const element = await renderLabelComponent(data);

        const imageData = await convertLabelToImage(element);
        const base64 = imageData.split(',')[1];

        document.body.removeChild(element);

        return { imageData, base64 };
    } catch (error) {
        console.error('Помилка при генеруванні етикетки для архіву:', error);
        throw error;
    }
};