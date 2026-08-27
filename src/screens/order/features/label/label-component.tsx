import React from "react";
import {QRCodeSVG} from "qrcode.react";
import {LabelData} from "@/screens/construction/features/editor/utils/labelGenerator";

interface LabelComponentProps {
    data: LabelData;
}

export const LabelComponent: React.FC<LabelComponentProps> = ({ data }) => {
    const today = new Date().toLocaleDateString('uk-UA');

    return (
        <div style={{
            width: '100mm',
            height: '25mm',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '3mm',
            boxSizing: 'border-box',
            border: '1pt solid #fff',
            borderRadius: '2pt',
            background: '#fff',
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1mm',
                fontSize: '4pt',
                lineHeight: 1.1,
                marginTop: '-5pt'
            }}>
                <div style={{ fontWeight: 'bold', fontSize: '4pt' }}>
                    {data.clientName}
                </div>
                <div><b>Номер Замовлення:</b> {data.orderNumber}</div>
                <div><b>Номер Конструкції:</b> {data.constructionNumber}</div>
                <div><b>Номер Деталі:</b> {data.detailNumber}</div>
                {data.detailName && <div><b>Деталь:</b> {data.detailName}</div>}
                <div><b>Розмір:</b> {data.constructionSize}</div>
                {data.detailSize !== null && data.detailSize !== undefined && (
                    <div><b>Розмір деталі:</b> {data.detailSize}</div>
                )}
                {data.handleSide && (
                    <div><b>Сторона ручки:</b> {data.handleSide}</div>
                )}
                <div><b>Дата:</b> {today}</div>
            </div>

            <div style={{ width: '22mm', height: '22mm', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <QRCodeSVG
                    value={`http://localhost:5173/order/${data.orderNumber}`}
                    size={85}
                    level="M"
                />
                <div style={{ fontSize: '6pt' }}>{data.serialNumber}</div>
            </div>
        </div>
    );
};