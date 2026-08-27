import React from 'react';
import {
    Document, Page, Text, View, StyleSheet, Font, pdf,
} from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import { saveAs } from 'file-saver';
import {
    IOrder,
    IOrderCostItem,
    IOrderCostAccessoryItem,
    IOrderCostGlassItem,
    IOrderCostServiceItem,
} from '@/screens/order/types/order/IOrder';
import { IConstruction } from '@/screens/construction/type/construction/IConstruction';
import {ACCESSORY_UNIT_LABELS, AccessoryUnitType} from "@/screens/profile-accessory/types/IProfileAccessory";
import {SERVICE_UNIT_LABELS, ServiceUnitType} from "@/screens/profile-service/types/IProfileService";

Font.register({
    family: 'Roboto',
    fonts: [
        {
            src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf',
            fontWeight: 'normal',
        },
        {
            src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf',
            fontWeight: 'bold',
        },
        {
            src: 'https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1Mu52xP.ttf',
            fontWeight: 'normal',
            fontStyle: 'italic',
        },
    ],
});

interface SpecMaterial {
    type: string;
    name: string;
    unit: string;
    qtyBase: number | string;
    qtyFact: number | string;
    price: number;
    subtotal: number;
    subtotalDiscount: number;
    facade: string;
}

interface SpecService {
    name: string;
    operation: string;
    unit: string;
    qty: number | string;
    price: number;
    subtotal: number;
    note?: string;
    facade: string;
}

interface SpecElement {
    name: string;
    height: number;
    width: number;
    schema: string;
    fillLabel: string;
    hasHandle: boolean;
    handleSide?: string | null;
    handleOffset?: number | null;
}

interface SpecData {
    number: string;
    date: string;
    organization: string;
    division: string;
    client: string;
    totalCost: string;
    product: string;
    productType: string;
    note: string;
    compilerName: string;
    clientName: string;
    frame: { height: number; width: number; qty: number; deadline?: string };
    elements: SpecElement[];
    materials: SpecMaterial[];
    profileWorkCost: string;
    services: SpecService[];
}

const S = StyleSheet.create({
    page: {
        fontFamily: 'Roboto',
        fontSize: 7,
        paddingTop: 10,
        paddingBottom: 15,
        paddingLeft: 15,
        paddingRight: 10,
    },
    row:      { flexDirection: 'row' },
    col:      { flexDirection: 'column' },
    flex1:    { flex: 1 },
    bold:     { fontWeight: 'bold' },
    italic:   { fontStyle: 'italic' },
    center:   { textAlign: 'center' },
    right:    { textAlign: 'right' },
    headerBg: { backgroundColor: '#D9D9D9' },
    lightBg:  { backgroundColor: '#F2F2F2' },
    padH3:    { paddingHorizontal: 3, paddingVertical: 2 },
    pad3:     { padding: 3 },
    // border helpers
    bAll:     { border: '0.5pt solid #000000' },
    bBottom:  { borderBottom: '0.3pt solid #CCCCCC' },
    bRight:   { borderRight: '0.3pt solid #CCCCCC' },
    bRightD:  { borderRight: '0.3pt solid #999999' },
    bTop0:    { borderTop: 'none' },
    signLine: { borderBottom: '0.5pt solid #000000', marginTop: 4, width: '75%' },
});

const fmt = (n: number): string =>
    n.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const T: React.FC<{
    children: React.ReactNode;
    bold?: boolean;
    italic?: boolean;
    center?: boolean;
    right?: boolean;
    size?: number;
    style?: Style;
}> = ({ children, bold, italic, center, right, size = 7, style }) => (
    <Text
        style={[
            {
                fontFamily: 'Roboto',
                fontWeight: bold ? 'bold' : 'normal',
                fontStyle: italic ? 'italic' : 'normal',
                fontSize: size,
                textAlign: center ? 'center' : right ? 'right' : 'left',
            },
            ...(style ? [style] : []),
        ]}
    >
        {children}
    </Text>
);

const Cell: React.FC<{
    width: number | string;
    children?: React.ReactNode;
    borderRight?: boolean;
    borderBottom?: boolean;
    style?: Style;
}> = ({ width, children, borderRight = true, borderBottom = false, style }) => (
    <View
        style={[
            S.padH3,
            { width },
            borderRight  ? S.bRight  : {},
            borderBottom ? S.bBottom : {},
            ...(style ? [style] : []),
        ]}
    >
        {children}
    </View>
);

const HeaderBlock: React.FC<{ data: SpecData }> = ({ data }) => (
    <View style={S.col}>
        {/* Logo + Title */}
        <View style={[S.row, S.bAll]}>
            <View style={[S.pad3, { width: 35, borderRight: '0.5pt solid #000000' }]}>
                <T bold size={9}>FURNI</T>
                <T size={5} style={{ color: '#666666' }}>™</T>
            </View>
            <View style={[S.flex1, S.pad3, { justifyContent: 'center' }]}>
                <T bold center size={8}>
                    {`Специфікація на НФ (вироби з профілю) №${data.number} від ${data.date}`}
                </T>
            </View>
        </View>

        {/* Two-column info */}
        <View style={[S.row, { borderLeft: '0.5pt solid #000000', borderRight: '0.5pt solid #000000', borderBottom: '0.5pt solid #000000' }]}>
            {/* Left */}
            <View style={[S.col, { width: '50%', borderRight: '0.5pt solid #000000' }]}>
                {([
                    ['Організація:', data.organization],
                    ['Замовник:',    data.client],
                    ['Виріб:',       data.product],
                ] as [string, string][]).map(([label, value], i, arr) => (
                    <View key={label} style={[S.row, i < arr.length - 1 ? S.bBottom : {}]}>
                        <Cell width={52} style={{ backgroundColor: '#F5F5F5' }}>
                            <T bold size={6.5}>{label}</T>
                        </Cell>
                        <Cell width="auto" borderRight={false}>
                            <T size={6.5}>{value}</T>
                        </Cell>
                    </View>
                ))}
            </View>
            {/* Right */}
            <View style={[S.col, { width: '50%' }]}>
                {([
                    ['Підрозділ:',  data.division,    false, false],
                    ['Вартість:',   data.totalCost,   true,  false],
                    ['Вид виробу:', data.productType, false, true],
                ] as [string, string, boolean, boolean][]).map(([label, value, b, it], i, arr) => (
                    <View key={label} style={[S.row, i < arr.length - 1 ? S.bBottom : {}]}>
                        <Cell width={52} style={{ backgroundColor: '#F5F5F5' }}>
                            <T bold size={6.5}>{label}</T>
                        </Cell>
                        <Cell width="auto" borderRight={false}>
                            <T bold={b} italic={it} size={6.5}>{value}</T>
                        </Cell>
                    </View>
                ))}
            </View>
        </View>

        {/* Frame dimensions */}
        <View style={[S.row, S.bAll, { borderTop: 'none' }]}>
            <Cell width={55} style={{ backgroundColor: '#F5F5F5', justifyContent: 'center' }}>
                <T bold size={6.5}>{'Рамковий\nпроріз:'}</T>
            </Cell>
            <View style={[S.col, S.flex1]}>
                <View style={[S.row, S.bBottom]}>
                    <Cell width={100}><T size={6.5}>{`Висота, мм: `}<T bold size={6.5}>{data.frame.height}</T></T></Cell>
                    <Cell width={90}><T size={6.5}>{`Кількість: `}<T bold size={6.5}>{data.frame.qty}</T></T></Cell>
                    <Cell width="auto" borderRight={false}><T size={6.5}>{`Виконати до:  ${data.frame.deadline ?? ''}`}</T></Cell>
                </View>
                <View style={S.row}>
                    <Cell width={100} borderRight={false}><T size={6.5}>{`Ширина, мм: `}<T bold size={6.5}>{data.frame.width}</T></T></Cell>
                </View>
            </View>
        </View>

        {/* Note */}
        <View style={[S.row, S.bAll, { borderTop: 'none' }]}>
            <Cell width={55} style={{ backgroundColor: '#F5F5F5' }}>
                <T bold size={6.5}>Примітка:</T>
            </Cell>
            <Cell width="auto" borderRight={false}>
                <T size={6.5}>{data.note}</T>
            </Cell>
        </View>
    </View>
);

const Section1: React.FC<{ elements: SpecElement[] }> = ({ elements }) => {
    const cols = [
        { label: 'Фасад рамковий', w: '35%' },
        { label: 'Висота, мм',     w: '12%' },
        { label: 'Ширина, мм',     w: '12%' },
        { label: 'Схема',          w: '12%' },
        { label: 'Примітка',       w: '29%' },
    ];
    return (
        <View style={{ marginTop: 6 }}>
            <T bold>1. Перелік елементів:</T>
            <View style={{ marginTop: 2 }}>
                <View style={[S.row, S.headerBg, S.bAll]}>
                    {cols.map((c, i) => (
                        <Cell key={c.label} width={c.w} borderRight={i < cols.length - 1}>
                            <T bold center size={6.5}>{c.label}</T>
                        </Cell>
                    ))}
                </View>
                {elements.map((el, i) => (
                    <View key={i} style={[S.row, S.bAll, S.bTop0]}>
                        <Cell width={cols[0].w}><T size={6.5}>{el.name}</T></Cell>
                        <Cell width={cols[1].w}><T center size={6.5}>{el.height}</T></Cell>
                        <Cell width={cols[2].w}><T center size={6.5}>{el.width}</T></Cell>
                        <Cell width={cols[3].w}><T bold center size={6.5}>{el.schema}</T></Cell>
                        <Cell width={cols[4].w} borderRight={false}><T size={6.5}>{el.schema}</T></Cell>
                    </View>
                ))}
            </View>
        </View>
    );
};

const Section2: React.FC<{ materials: SpecMaterial[]; profileWorkCost: string }> = ({materials, profileWorkCost}) => {
    const total = materials.reduce((s, m) => s + m.subtotalDiscount, 0);

    // col widths must sum to 100%
    // facade col added: 14%, others shrunk slightly
    const CW = { n: '4%', facade: '14%', type: '12%', name: '22%', unit: '5%', qb: '8%', qf: '8%', price: '9%', sub: '9%', subD: '9%' };

    return (
        <View style={{ marginTop: 6 }}>
            <T bold>2. Матеріали та комплектуючі рамкового фасаду:</T>
            <View style={{ marginTop: 2 }}>
                {/* Header */}
                <View style={[S.row, S.headerBg, S.bAll]}>
                    <Cell width={CW.n}>      <T bold center size={6}>№</T></Cell>
                    <Cell width={CW.facade}> <T bold center size={6}>Фасад</T></Cell>
                    <Cell width={CW.type}>   <T bold center size={6}>Вид матеріалу</T></Cell>
                    <Cell width={CW.name}>   <T bold center size={6}>Найменування матеріалів (комплектуючих)</T></Cell>
                    <Cell width={CW.unit}>   <T bold center size={6}>{'Баз.\nод.'}</T></Cell>
                    {/* Кількість — двоярусний заголовок */}
                    <View style={[{ width: '16%' }, S.bRightD]}>
                        <View style={[S.padH3, S.bBottom]}>
                            <T bold center size={6}>Кількість</T>
                        </View>
                        <View style={S.row}>
                            <Cell width="50%" style={{ paddingHorizontal: 2, paddingVertical: 1 }}>
                                <T center size={5.5}>в баз. од.</T>
                            </Cell>
                            <Cell width="50%" borderRight={false} style={{ paddingHorizontal: 2, paddingVertical: 1 }}>
                                <T center size={5.5}>в факт. од.</T>
                            </Cell>
                        </View>
                    </View>
                    <Cell width={CW.price}><T bold center size={6}>Ціна</T></Cell>
                    <Cell width={CW.sub}>  <T bold center size={6}>{'Сума без\nзнижки'}</T></Cell>
                    <Cell width={CW.subD} borderRight={false}><T bold center size={6}>{'Сума зі\nзнижкою'}</T></Cell>
                </View>

                {/* Data rows */}
                {materials.map((m, i) => (
                    <View key={i} style={[S.row, S.bAll, S.bTop0]}>
                        <Cell width={CW.n}>      <T center size={6}>{i + 1}</T></Cell>
                        <Cell width={CW.facade}> <T size={5.5}>{m.facade}</T></Cell>
                        <Cell width={CW.type}>   <T size={5.5}>{m.type}</T></Cell>
                        <Cell width={CW.name}>   <T size={5.5}>{m.name}</T></Cell>
                        <Cell width={CW.unit}>   <T center size={6}>{m.unit}</T></Cell>
                        <Cell width="8%">         <T center size={6}>{m.qtyBase}</T></Cell>
                        <Cell width="8%">         <T center size={6}>{m.qtyFact}</T></Cell>
                        <Cell width={CW.price}>  <T right size={6}>{fmt(m.price)}</T></Cell>
                        <Cell width={CW.sub}>    <T right size={6}>{fmt(m.subtotal)}</T></Cell>
                        <Cell width={CW.subD} borderRight={false}><T right size={6}>{fmt(m.subtotalDiscount)}</T></Cell>
                    </View>
                ))}

                {/* Total */}
                <View style={[S.row, S.bAll, S.bTop0, S.lightBg]}>
                    <View style={[{ width: '72%' }, S.bRight]} />
                    <Cell width="10%" style={{ borderRight: '0.3pt solid #CCCCCC' }}>
                        <T bold right size={6}>РАЗОМ:</T>
                    </Cell>
                    <Cell width="9%" style={{ borderRight: '0.3pt solid #CCCCCC' }}>
                        <T bold right size={6}>{fmt(total)}</T>
                    </Cell>
                    <Cell width="9%" borderRight={false}>
                        <T bold right size={6}>{fmt(total)}</T>
                    </Cell>
                </View>

                {/* Work cost */}
                <View style={[S.row, S.bAll, S.bTop0]}>
                    <Cell width="72%" style={{ borderRight: '0.3pt solid #CCCCCC' }}>
                        <T bold size={6}>Вартість робіт по порізці та збиранню профілю:</T>
                    </Cell>
                    <Cell width="10%" style={{ borderRight: '0.3pt solid #CCCCCC' }} />
                    <Cell width="9%"  style={{ borderRight: '0.3pt solid #CCCCCC' }} />
                    <Cell width="9%"  borderRight={false}>
                        <T right size={6}>{profileWorkCost}</T>
                    </Cell>
                </View>
            </View>
        </View>
    );
};

const Section3: React.FC<{ services: SpecService[] }> = ({ services }) => {
    const total = services.reduce((s, sv) => s + sv.subtotal, 0);
    // facade col added: 14%, others shrunk
    const cols = [
        { label: '№',                     w: '4%'  },
        { label: 'Фасад',                 w: '14%' },
        { label: 'Номенклатура',           w: '18%' },
        { label: 'Технологічна операція',  w: '22%' },
        { label: 'Од-ця\nвиміру',         w: '7%'  },
        { label: 'Кільть',                w: '7%'  },
        { label: 'Ціна',                  w: '10%' },
        { label: 'Сума',                  w: '10%' },
        { label: 'Примітка',              w: '8%'  },
    ];

    return (
        <View style={{ marginTop: 6 }}>
            <T bold>3. Додаткові послуги та обробки деталей:</T>
            <View style={{ marginTop: 2 }}>
                <View style={[S.row, S.headerBg, S.bAll]}>
                    {cols.map((c, i) => (
                        <Cell key={i} width={c.w} borderRight={i < cols.length - 1}>
                            <T bold center size={6}>{c.label}</T>
                        </Cell>
                    ))}
                </View>
                {services.map((sv, i) => (
                    <View key={i} style={[S.row, S.bAll, S.bTop0]}>
                        <Cell width={cols[0].w}><T center size={6}>{i + 1}</T></Cell>
                        <Cell width={cols[1].w}><T size={5.5}>{sv.facade}</T></Cell>
                        <Cell width={cols[2].w}><T size={5.5}>{sv.name}</T></Cell>
                        <Cell width={cols[3].w}><T size={5.5}>{sv.operation}</T></Cell>
                        <Cell width={cols[4].w}><T center size={6}>{sv.unit}</T></Cell>
                        <Cell width={cols[5].w}><T center size={6}>{sv.qty}</T></Cell>
                        <Cell width={cols[6].w}><T right size={6}>{fmt(sv.price)}</T></Cell>
                        <Cell width={cols[7].w}><T right size={6}>{fmt(sv.subtotal)}</T></Cell>
                        <Cell width={cols[8].w} borderRight={false}><T size={5.5}>{sv.note ?? ''}</T></Cell>
                    </View>
                ))}
                <View style={[S.row, S.bAll, S.bTop0, S.lightBg]}>
                    <View style={[{ width: '65%' }, S.bRight]} />
                    <Cell width="10%" style={{ borderRight: '0.3pt solid #CCCCCC' }}>
                        <T bold right size={6}>РАЗОМ:</T>
                    </Cell>
                    <Cell width="10%" style={{ borderRight: '0.3pt solid #CCCCCC' }}>
                        <T bold right size={6}>{fmt(total)}</T>
                    </Cell>
                    <Cell width="15%" borderRight={false} />
                </View>
            </View>
        </View>
    );
};

const Signatures: React.FC<{ compilerName: string; clientName: string }> = ({compilerName, clientName}) => (
    <View style={[S.row, { marginTop: 12 }]}>
        <View style={[S.col, { width: '50%' }]}>
            <T size={6.5}>Специфікацію склав(ла):</T>
            <View style={{ height: 16 }} />
            <T bold size={6.5}>{compilerName}</T>
            <View style={S.signLine} />
            <T size={6}>(підпис)</T>
        </View>
        <View style={[S.col, { width: '50%' }]}>
            <T italic size={6.5}>
                {'Внесені дані перевірив (ла), зауважень до розмірів рамкових фасадів,\nїх кількості, розмірів та способу обробки наповнення не маю:'}
            </T>
            <View style={{ height: 6 }} />
            <T bold size={6.5}>{clientName}</T>
            <View style={S.signLine} />
            <T size={6}>(підпис)</T>
        </View>
    </View>
);

const SCHEMA_W   = 72;  // facade rectangle width  (pt)
const SCHEMA_H   = 100; // facade rectangle height (pt)
const HANDLE_W   = 5;   // handle bar thickness    (pt)
const HANDLE_H   = 28;  // handle bar height       (pt)
const HANDLE_TOP = (SCHEMA_H - HANDLE_H) / 2;
const MARGIN_H   = 10;  // space for handle on each side

const FacadeCard: React.FC<{ el: SpecElement }> = ({ el }) => {
    const isLeft  = el.hasHandle && el.handleSide === 'LEFT';
    const isRight = el.hasHandle && el.handleSide === 'RIGHT';

    const handleLabel = el.hasHandle
        ? [
            `Ручка: ${el.handleSide === 'LEFT' ? 'ліво' : el.handleSide === 'RIGHT' ? 'право' : (el.handleSide ?? '')}`,
        ].filter(Boolean).join(', ')
        : 'Без ручки';

    return (
        <View style={[S.row, { alignItems: 'flex-start', paddingTop: 6 }]}>
            {/* ── Diagram ── */}
            <View
                style={{
                    position: 'relative',
                    width:  SCHEMA_W + MARGIN_H * 2,
                    height: SCHEMA_H + 10,
                    flexShrink: 0,
                }}
            >
                {/* Facade border */}
                <View
                    style={{
                        position: 'absolute',
                        left:   MARGIN_H,
                        top:    5,
                        width:  SCHEMA_W,
                        height: SCHEMA_H,
                        border: '1.5pt solid #000000',
                        padding: 5,
                    }}
                >
                    <View style={{ flex: 1, border: '0.8pt solid #888888' }} />
                </View>

                {/* Left handle knob */}
                {isLeft && (
                    <View
                        style={{
                            position: 'absolute',
                            left:   MARGIN_H - HANDLE_W + 1,
                            top:    5 + HANDLE_TOP,
                            width:  HANDLE_W + 2,
                            height: HANDLE_H,
                            backgroundColor: '#222222',
                            borderRadius: 1,
                        }}
                    />
                )}

                {/* Right handle knob */}
                {isRight && (
                    <View
                        style={{
                            position: 'absolute',
                            left:   MARGIN_H + SCHEMA_W - 3,
                            top:    5 + HANDLE_TOP,
                            width:  HANDLE_W + 2,
                            height: HANDLE_H,
                            backgroundColor: '#222222',
                            borderRadius: 1,
                        }}
                    />
                )}
            </View>

            {/* ── Text info ── */}
            <View style={[S.col, { marginLeft: 6, flex: 1, paddingTop: 6 }]}>
                <T bold size={7}>{el.name}</T>
                <T size={6.5}>{`${el.height} × ${el.width} мм`}</T>
                {el.fillLabel
                    ? el.fillLabel.split('\n').map((line, i) => (
                        <T key={i} size={6.5}>{line}</T>
                    ))
                    : null
                }
                {/* Handle badge */}
                <View style={{ marginTop: 5, flexDirection: 'row', alignItems: 'center' }}>
                    <View
                        style={{
                            width: 5, height: 5, borderRadius: 3,
                            backgroundColor: el.hasHandle ? '#222222' : '#BBBBBB',
                            marginRight: 3,
                        }}
                    />
                    <T size={6.5} italic={!el.hasHandle}
                       style={{ color: el.hasHandle ? '#111111' : '#999999' }}>
                        {handleLabel}
                    </T>
                </View>
            </View>
        </View>
    );
};

/**
 * Wraps all facade cards in a 2-column grid.
 * Pairs elements: [0,1], [2,3], …
 */
const Section4: React.FC<{ elements: SpecElement[] }> = ({ elements }) => {
    // chunk into rows of 2
    const rows: SpecElement[][] = [];
    for (let i = 0; i < elements.length; i += 2) {
        rows.push(elements.slice(i, i + 2));
    }

    return (
        <View style={{ marginTop: 4 }}>
            {rows.map((pair, ri) => (
                <View
                    key={ri}
                    style={[
                        S.row,
                        {
                            marginTop: 6,
                            borderBottom: ri < rows.length - 1 ? '0.3pt solid #DDDDDD' : 'none',
                            paddingBottom: 6,
                        },
                    ]}
                >
                    {/* Left column */}
                    <View style={{ width: '50%', paddingRight: 6, borderRight: '0.3pt solid #DDDDDD' }}>
                        <FacadeCard el={pair[0]} />
                    </View>

                    {/* Right column (may be empty for odd total) */}
                    <View style={{ width: '50%', paddingLeft: 6 }}>
                        {pair[1] ? <FacadeCard el={pair[1]} /> : null}
                    </View>
                </View>
            ))}
        </View>
    );
};

const SpecificationDocument: React.FC<{ data: SpecData }> = ({ data }) => (
    <Document>
        <Page size="A4" style={S.page}>
            <HeaderBlock data={data} />
            <Section1 elements={data.elements} />
            <Section2 materials={data.materials} profileWorkCost={data.profileWorkCost} />
            <Section3 services={data.services} />
            <Signatures compilerName={data.compilerName} clientName={data.clientName} />
        </Page>
        <Page size="A4" style={S.page}>
            <T bold size={8}>4. Схеми рамкового фасаду:</T>
            <Section4 elements={data.elements} />
            <Signatures compilerName={data.compilerName} clientName={data.clientName} />
        </Page>
    </Document>
);

export function buildSpecData(order: IOrder, constructions: IConstruction[]): SpecData {
    const cost = order.cost;

    // Helper: resolve construction name by id
    const facadeName = (constructionId: number): string => {
        const idx = constructions.findIndex(c => c.id === constructionId);
        return idx >= 0 ? `Рамка фасадна №${idx + 1}` : '—';
    };

    // Profile items have no constructionId → "Всі"
    const profileMaterials: SpecMaterial[] = (cost?.items ?? []).map((item: IOrderCostItem) => ({
        type: 'Профіль рамковий',
        name: item.articleCode + (item.color ? ` ${item.color}` : ''),
        unit: 'шт',
        qtyBase: item.beamsUsed,
        qtyFact: item.beamsUsed,
        price: item.pricePerBeam,
        subtotal: item.subtotalUah,
        subtotalDiscount: item.subtotalUah,
        facade: 'Всі',
    }));

    const accessoryMaterials: SpecMaterial[] = (cost?.accessoryItems ?? []).map((item: IOrderCostAccessoryItem) => ({
        type: 'Ролики та комплектуючі',
        name: item.name + (item.color ? ` ${item.color}` : ''),
        unit: ACCESSORY_UNIT_LABELS[item.unit as AccessoryUnitType] ?? item.unit,
        qtyBase: item.quantity,
        qtyFact: item.quantity,
        price: item.pricePerUnit,
        subtotal: item.subtotalUah,
        subtotalDiscount: item.subtotalUah,
        facade: facadeName(item.constructionId),
    }));

    const glassMaterials: SpecMaterial[] = (cost?.glassItems ?? []).map((item: IOrderCostGlassItem) => ({
        type: 'Наповнення',
        name: item.name,
        unit: 'м2',
        qtyBase: item.totalArea,
        qtyFact: item.totalArea,
        price: item.pricePerM2,
        subtotal: item.subtotalUah,
        subtotalDiscount: item.subtotalUah,
        facade: facadeName(item.constructionId),
    }));

    const services: SpecService[] = (cost?.serviceItems ?? []).map((item: IOrderCostServiceItem) => ({
        name: item.name,
        operation: item.name,
        unit: SERVICE_UNIT_LABELS[item.unit as ServiceUnitType] ?? item.unit,
        qty: item.quantity,
        price: item.pricePerUnit,
        subtotal: item.subtotalUah,
        facade: facadeName(item.constructionId),
    }));

    const elements: SpecElement[] = constructions.map((c, i) => ({
        name: `Рамка фасадна №${i + 1}`,
        height: c.height,
        width: c.width,
        schema: `Схема${i + 1}`,
        fillLabel: c.glassFill
            ? `${c.glassFill.type} ${c.glassFill.thickness} мм\n(${c.height - 5}х${c.width - 5})`
            : '',
        hasHandle:    c.hasHandle   ?? false,
        handleSide:   c.handleSide  ?? null,
        handleOffset: c.handleOffset ?? null,
    }));

    const totalUah   = cost?.totalUah ?? 0;
    const clientName = `${order.client.firstName} ${order.client.lastName}`;
    const dateStr    = new Date().toLocaleDateString('uk-UA', {
        day: 'numeric', month: 'long', year: 'numeric',
    });

    return {
        number:          order.orderNumber,
        date:            dateStr,
        organization:    'FURNI ™',
        division:        'Відділ NUOMI',
        client:          clientName,
        totalCost:       `${Math.round(totalUah).toLocaleString('uk-UA')} грн.`,
        product:         order.name,
        productType:     'Рамковий фасад',
        note:            '',
        compilerName:    clientName,
        clientName:      clientName,
        frame: {
            height:   constructions[0]?.height ?? 0,
            width:    constructions[0]?.width  ?? 0,
            qty:      constructions.length,
            deadline: '',
        },
        elements,
        materials: [...profileMaterials, ...accessoryMaterials, ...glassMaterials],
        profileWorkCost: '0,12',
        services,
    };
}

export async function downloadSpecificationPdf(
    order: IOrder,
    constructions: IConstruction[],
): Promise<void> {
    const data = buildSpecData(order, constructions);
    const blob = await pdf(<SpecificationDocument data={data} />).toBlob();
    saveAs(blob, `Специфікація_${order.orderNumber}.pdf`);
}

export async function getSpecificationPdfBlob(
    order: IOrder,
    constructions: IConstruction[],
): Promise<Blob> {
    const data = buildSpecData(order, constructions);
    return pdf(<SpecificationDocument data={data} />).toBlob();
}

export default SpecificationDocument;