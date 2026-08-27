import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import { saveAs } from 'file-saver';
import { IOrderCostCutPlanMaterial, IOrderCostCutPlanBar } from '@/screens/order/types/order/IOrder';
import { IConstruction } from '@/screens/construction/type/construction/IConstruction';

Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf', fontWeight: 'normal' },
        { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf', fontWeight: 'bold' },
    ],
});

const CONSTRUCTION_COLORS = ['#B5D4F4', '#9FE1CB', '#FAC775', '#F4C0D1', '#C0DD97', '#CECBF6'];
const BEAM_LENGTH = 3000;

const S = StyleSheet.create({
    page: {
        fontFamily: 'Roboto',
        fontSize: 8,
        padding: 16,
    },
    row: { flexDirection: 'row' },
    title: { fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
    barBlock: { marginBottom: 10, borderBottom: '0.5pt solid #DDDDDD', paddingBottom: 8 },
    barLabel: { fontSize: 7.5, marginBottom: 3, fontWeight: 'bold' },
    barTrack: {
        flexDirection: 'row',
        height: 18,
        border: '1pt solid #F97316',
        position: 'relative',
    },
    piece: {
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: '0.5pt solid #FFFFFF',
    },
    pieceText: { fontSize: 5.5, fontWeight: 'bold', color: '#1F2937' },
    remainder: {
        height: '100%',
        backgroundColor: '#FED7AA',
    },
    cutsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 3 },
    cutItem: { fontSize: 6.5, marginRight: 8, marginBottom: 1 },
    sumLine: { fontSize: 6.5, color: '#92400E', marginTop: 2 },
});

const T: React.FC<{ children: React.ReactNode; bold?: boolean; style?: Style; size?: number }> = ({
                                                                                                      children, bold, style, size = 7,
                                                                                                  }) => (
    <Text style={[{ fontFamily: 'Roboto', fontWeight: bold ? 'bold' : 'normal', fontSize: size }, ...(style ? [style] : [])]}>
        {children}
    </Text>
);

interface BarRowData {
    material: IOrderCostCutPlanMaterial;
    bar: IOrderCostCutPlanBar;
}

const BarBlock: React.FC<{
    row: BarRowData;
    colorMap: Map<number, string>;
    constructions: IConstruction[];
    cutNumberRef: { current: number };
}> = ({ row, colorMap, constructions, cutNumberRef }) => {
    const { material, bar } = row;
    const totalLen = bar.pieces.reduce((s, p) => s + p.length, 0);
    const remainderPct = (bar.remainder / BEAM_LENGTH) * 100;

    return (
        <View style={S.barBlock} wrap={false}>
            <T style={S.barLabel}>
                {`${material.articleCode}${material.color ? ' (' + material.color + ')' : ''} — Пруток ${bar.barIndex + 1}/${material.bars.length}  •  ${totalLen.toFixed(0)} / ${BEAM_LENGTH} мм`}
            </T>

            <View style={S.barTrack}>
                {bar.pieces.map((piece, idx) => {
                    const widthPct = (piece.length / BEAM_LENGTH) * 100;
                    const color = colorMap.get(piece.constructionId) ?? '#E5E7EB';
                    const construction = constructions.find(c => c.id === piece.constructionId);
                    return (
                        <View
                            key={piece.id ?? idx}
                            style={[S.piece, { width: `${widthPct}%`, backgroundColor: color }]}
                        >
                            {widthPct > 4 && (
                                <T style={S.pieceText}>
                                    {`К${construction?.constructionNo ?? piece.constructionId}/${piece.length.toFixed(0)}`}
                                </T>
                            )}
                        </View>
                    );
                })}
                {bar.remainder > 0 && (
                    <View style={[S.remainder, { width: `${remainderPct}%` }]} />
                )}
            </View>

            <View style={S.cutsRow}>
                {bar.pieces.map((piece, idx) => {
                    cutNumberRef.current += 1;
                    const construction = constructions.find(c => c.id === piece.constructionId);
                    return (
                        <T key={piece.id ?? idx} style={S.cutItem}>
                            {`${cutNumberRef.current}) К${construction?.constructionNo ?? piece.constructionId}/${piece.detailCode ?? ''} = ${piece.length.toFixed(0)} мм`}
                        </T>
                    );
                })}
            </View>

            <T style={S.sumLine}>{`Відхід: ${bar.remainder.toFixed(0)} мм`}</T>
        </View>
    );
};

const CutPlanDocument: React.FC<{
    orderNumber: string;
    cutPlan: IOrderCostCutPlanMaterial[];
    constructions: IConstruction[];
}> = ({ orderNumber, cutPlan, constructions }) => {
    const colorMap = new Map<number, string>();
    constructions.forEach((c, i) => {
        colorMap.set(c.id, CONSTRUCTION_COLORS[i % CONSTRUCTION_COLORS.length]);
    });

    const rows: BarRowData[] = [];
    cutPlan.forEach(material => material.bars.forEach(bar => rows.push({ material, bar })));

    const cutNumberRef = { current: 0 };

    return (
        <Document>
            <Page size="A4" style={S.page} wrap>
                <T style={S.title}>{`Замовлення ${orderNumber} — Розкрій профілю`}</T>
                {rows.map((row, i) => (
                    <BarBlock
                        key={i}
                        row={row}
                        colorMap={colorMap}
                        constructions={constructions}
                        cutNumberRef={cutNumberRef}
                    />
                ))}
            </Page>
        </Document>
    );
};

export async function generateCutPlanPdfBlob(
    orderNumber: string,
    cutPlan: IOrderCostCutPlanMaterial[],
    constructions: IConstruction[],
): Promise<Blob> {
    return pdf(
        <CutPlanDocument orderNumber={orderNumber} cutPlan={cutPlan} constructions={constructions} />
    ).toBlob();
}

export async function downloadCutPlanPdf(
    orderNumber: string,
    cutPlan: IOrderCostCutPlanMaterial[],
    constructions: IConstruction[],
): Promise<void> {
    const blob = await pdf(
        <CutPlanDocument orderNumber={orderNumber} cutPlan={cutPlan} constructions={constructions} />
    ).toBlob();
    saveAs(blob, `Order_${orderNumber}_CutPlan.pdf`);
}

export default CutPlanDocument;