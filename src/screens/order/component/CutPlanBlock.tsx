import {IOrderCostCutPlanBar, IOrderCostCutPlanMaterial} from "@/screens/order/types/order/IOrder";
import {IConstruction} from "@/screens/construction/type/construction/IConstruction";
import {ChevronDown} from "lucide-react";
import {cn} from "@/helpers/cn";
import {FC, useState} from "react";

const CONSTRUCTION_COLORS = [
    {bg: '#B5D4F4', text: '#0C447C'},
    {bg: '#9FE1CB', text: '#085041'},
    {bg: '#FAC775', text: '#633806'},
    {bg: '#F4C0D1', text: '#72243E'},
    {bg: '#C0DD97', text: '#27500A'},
    {bg: '#CECBF6', text: '#3C3489'},
];

interface CutPlanBlockProps {
    cutPlan: IOrderCostCutPlanMaterial[];
    constructions: IConstruction[];
}

export const CutPlanBlock: FC<CutPlanBlockProps> = ({cutPlan, constructions}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const colorMap = new Map<number, { bg: string; text: string }>();
    constructions.forEach((c, i) => {
        colorMap.set(c.id, CONSTRUCTION_COLORS[i % CONSTRUCTION_COLORS.length]);
    });

    const totalBars = cutPlan.reduce((s, m) => s + m.bars.length, 0);

    return (
        <div className="mb-4 rounded-xl overflow-hidden bg-white"
             style={{border: '2px solid #F97316', boxShadow: '0 4px 12px rgba(249,115,22,0.12)'}}>
            <button
                onClick={() => setIsExpanded(p => !p)}
                className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-orange-50"
                style={{
                    background: 'white',
                    borderBottom: isExpanded ? '2px solid #F97316' : undefined,
                }}
            >
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                         style={{background: '#F97316'}}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                             stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 20h20M6 20V10l6-8 6 8v10"/>
                            <path d="M10 20v-5h4v5"/>
                        </svg>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{color: '#92400E'}}>
                            Розкрій профілю
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                              style={{background: '#F97316', color: '#fff'}}>
                            {totalBars} прутки
                        </span>
                    </div>
                </div>
                <ChevronDown
                    size={15}
                    className={cn("transition-transform duration-200", isExpanded && "rotate-180")}
                    style={{color: '#F97316'}}
                />
            </button>

            {isExpanded && (
                <div className="border-t border-orange-200 bg-white">
                    {cutPlan.map(material => {
                        const totalRemainder = material.bars.reduce((s, b) => s + b.remainder, 0);
                        const beamLength = 3000;

                        return (
                            <div key={`${material.articleCode}-${material.color}`}
                                 className="px-4 py-3 border-b border-orange-100 last:border-b-0 hover:bg-orange-50 transition-colors">

                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-gray-900">{material.articleCode}</span>
                                        {material.color && (
                                            <span className="text-xs text-gray-500">({material.color})</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-xs px-2.5 py-1 rounded font-bold"
                                              style={{background: '#F97316', color: '#fff'}}>
                                            {material.bars.length} прутки
                                        </span>
                                        <span className="text-xs px-2.5 py-1 rounded font-bold"
                                              style={{background: '#F97316', color: '#fff'}}>
                                            Відхід: {totalRemainder.toFixed(0)} мм
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {material.bars.map(bar => (
                                        <BarRow
                                            key={bar.barIndex}
                                            bar={bar}
                                            beamLength={beamLength}
                                            colorMap={colorMap}
                                            constructions={constructions}
                                        />
                                    ))}
                                </div>

                                <div className="flex gap-3 mt-3 flex-wrap">
                                    {constructions.map(c => {
                                        const color = colorMap.get(c.id);
                                        if (!color) return null;
                                        return (
                                            <div key={c.id} className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                                                     style={{background: color.bg}}/>
                                                <span className="text-xs text-gray-600 font-medium">
                                                    К-я {c.constructionNo}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                                             style={{background: '#FED7AA', border: '1px dashed #F97316'}}/>
                                        <span className="text-xs text-gray-600 font-medium">Залишок</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

interface BarRowProps {
    bar: IOrderCostCutPlanBar;
    beamLength: number;
    colorMap: Map<number, { bg: string; text: string }>;
    constructions: IConstruction[];
}

const BarRow: FC<BarRowProps> = ({bar, beamLength, colorMap, constructions}) => {
    const [hovered, setHovered] = useState<number | null>(null);

    const totalPiecesLength = bar.pieces.reduce((sum, piece) => sum + piece.length, 0);
    const remainder = beamLength - totalPiecesLength;
    const remainderPct = (remainder / beamLength) * 100;

    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2 py-1 rounded" style={{background: '#F97316', color: '#fff'}}>
                    Пруток {bar.barIndex + 1}
                </span>
                <span className="text-xs text-gray-600 font-medium">
                    {totalPiecesLength.toFixed(0)} / {beamLength} мм
                </span>
                <span className="ml-auto text-xs px-2.5 py-1 rounded font-bold">
                    Залишок: {bar.remainder.toFixed(0)} мм
                </span>
            </div>

            <div className="flex h-8 rounded-md overflow-hidden border-2"
                 style={{borderColor: '#F97316', position: 'relative', width: '100%'}}>
                {bar.pieces.map((piece, idx) => {
                    const color = colorMap.get(piece.constructionId);
                    const widthPct = (piece.length / beamLength) * 100;
                    const construction = constructions.find(c => c.id === piece.constructionId);
                    const isHovered = hovered === piece.id;

                    return (
                        <div
                            key={piece.id}
                            style={{
                                width: `${widthPct}%`,
                                background: color?.bg ?? '#e5e7eb',
                                borderRight: idx < bar.pieces.length - 1
                                    ? '1px solid rgba(255,255,255,0.8)'
                                    : undefined,
                                position: 'relative',
                                transition: 'filter 0.1s',
                                filter: isHovered ? 'brightness(0.88)' : undefined,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onMouseEnter={() => setHovered(piece.id)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            <span style={{
                                fontSize: '12px',
                                fontWeight: '700',
                                color: color?.text ?? '#374151',
                                pointerEvents: 'none',
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                padding: '0 2px',
                            }}>
                                {piece.length.toFixed(0)}
                            </span>

                            {isHovered && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '110%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: '#ffffff',
                                    border: '1px solid #F97316',
                                    borderRadius: '6px',
                                    padding: '6px 10px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                    zIndex: 20,
                                    pointerEvents: 'none',
                                    color: '#1F2937',
                                    boxShadow: '0 2px 8px rgba(249,115,22,0.15)',
                                }}>
                                    {piece.detailCode} ·
                                    К-я {construction?.constructionNo ?? piece.constructionId} · {piece.length.toFixed(0)} мм
                                </div>
                            )}
                        </div>
                    );
                })}

                {bar.remainder > 0 && (
                    <div style={{
                        width: `${remainderPct}%`,
                        background: '#FED7AA',
                        borderLeft: '1px dashed #F97316',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#92400E',
                        minWidth: '40px',
                    }}>
                        {remainderPct > 2
                            ? `${bar.remainder.toFixed(0)}`
                            : ''}
                    </div>
                )}
            </div>
        </div>
    );
};
