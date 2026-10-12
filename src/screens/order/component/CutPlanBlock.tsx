import { FC, useState } from "react";

import { cn } from "@/helpers/cn";
import { IOrderCostCutPlanBar, IOrderCostCutPlanMaterial } from "@/screens/order/types/order/IOrder";
import { IConstruction } from "@/screens/construction/type/construction/IConstruction";
import { useThemeStore } from "@/store/theme/useThemeStore";

/**
 * Кольори шматків на схемі прутка.
 *
 * Були світлі пастельні (`#B5D4F4`, `#9FE1CB`) з темним текстом — набір під
 * білу сторінку. Тепер це кольори графіків теми: на темному фоні вони видні,
 * а між собою розрізняються так само добре.
 *
 * Тут потрібні саме значення, а не класи: ширину шматка все одно рахує
 * JavaScript, і колір задається тим самим inline-стилем.
 */
const PIECE_COLORS = ['#1447E6', '#00BC7D', '#FE9A00', '#AD46FF', '#FF2057', '#52525C'];

/**
 * Залишок прутка — приглушений, щоб не сприймався як ще одна деталь.
 *
 * Ширину шматків рахує JavaScript і задає inline-стилем, тож колір тут теж
 * значення, а не клас — CSS-змінна теми до нього не дійде. Звідси дві
 * константи: на білому темно-сірий залишок виглядав би як ще одна деталь,
 * тільки чорна.
 */
const REMAINDER_COLORS = { dark: '#27272A', light: '#D4D4D8' } as const;

interface CutPlanBlockProps {
    cutPlan: IOrderCostCutPlanMaterial[];
    constructions: IConstruction[];
}

/**
 * Розкрій профілю.
 *
 * Зовнішнє згортання прибрано: блок відкривається окремою вкладкою, і перший
 * клік просто відкривав те, заради чого на вкладку й переходили.
 */
export const CutPlanBlock: FC<CutPlanBlockProps> = ({ cutPlan, constructions }) => {
    const theme = useThemeStore(state => state.theme);
    const remainderColor = REMAINDER_COLORS[theme];

    const colorMap = new Map<number, string>();
    constructions.forEach((c, i) => colorMap.set(c.id, PIECE_COLORS[i % PIECE_COLORS.length]));

    return (
        <div className="flex flex-col gap-3">
            {cutPlan.map(material => {
                const totalRemainder = material.bars.reduce((s, b) => s + b.remainder, 0);
                /*
                 * Довжину прутка беремо з розрахунку, а не 3000 «за замовчуванням»,
                 * як було: матеріали з іншою балкою малювались у невірному
                 * масштабі — шматки на 4000 мм не влазили в смугу, а залишок
                 * виходив відʼємним.
                 */
                const beamLength = material.beamLength || 3000;

                return (
                    <div
                        key={`${material.articleCode}-${material.color}`}
                        className="overflow-hidden rounded-xl border border-border bg-card"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                            <div className="flex min-w-0 items-center gap-2">
                                <span className="truncate font-mono text-sm text-foreground">
                                    {material.articleCode}
                                </span>
                                {material.color && (
                                    <span className="truncate text-sm text-muted-foreground">
                                        {material.color}
                                    </span>
                                )}
                            </div>

                            <div className="flex shrink-0 items-center gap-2 text-xs">
                                <span className="rounded bg-muted px-2 py-0.5 tabular-nums text-muted-foreground">
                                    {material.bars.length} прутків
                                </span>
                                <span className="rounded bg-muted px-2 py-0.5 tabular-nums text-muted-foreground">
                                    Відхід {totalRemainder.toFixed(0)} мм
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 p-4">
                            {material.bars.map(bar => (
                                <BarRow
                                    key={bar.barIndex}
                                    bar={bar}
                                    beamLength={beamLength}
                                    colorMap={colorMap}
                                    constructions={constructions}
                                    remainderColor={remainderColor}
                                />
                            ))}
                        </div>

                        {/* Легенда: без неї кольори шматків нічого не означають */}
                        <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border px-4 py-3">
                            {constructions.map(c => (
                                <span key={c.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span
                                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                                        style={{ background: colorMap.get(c.id) }}
                                    />
                                    Конструкція {c.constructionNo}
                                </span>
                            ))}

                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-sm border border-dashed border-border"
                                    style={{ background: remainderColor }}
                                />
                                Залишок
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

interface BarRowProps {
    bar: IOrderCostCutPlanBar;
    beamLength: number;
    colorMap: Map<number, string>;
    constructions: IConstruction[];
    remainderColor: string;
}

const BarRow: FC<BarRowProps> = ({ bar, beamLength, colorMap, constructions, remainderColor }) => {
    const [hovered, setHovered] = useState<number | null>(null);

    const totalPiecesLength = bar.pieces.reduce((sum, piece) => sum + piece.length, 0);
    const remainderPct = ((beamLength - totalPiecesLength) / beamLength) * 100;

    const hoveredPiece = bar.pieces.find(piece => piece.id === hovered) ?? null;
    const hoveredConstruction = hoveredPiece
        ? constructions.find(c => c.id === hoveredPiece.constructionId)
        : undefined;

    return (
        <div>
            <div className="mb-1.5 flex items-center gap-2 text-xs">
                <span className="font-medium text-foreground">Пруток {bar.barIndex + 1}</span>
                <span className="tabular-nums text-muted-foreground">
                    {totalPiecesLength.toFixed(0)} / {beamLength} мм
                </span>
                <span className="ml-auto tabular-nums text-muted-foreground">
                    Залишок {bar.remainder.toFixed(0)} мм
                </span>
            </div>

            {/*
              * Обгортка без `overflow-hidden` — саме заради підказки.
              *
              * Раніше вона висіла всередині смуги, а смузі потрібен
              * `overflow-hidden`, щоб шматки не вилазили за заокруглені кути.
              * Тому підказка обрізалась по верхньому краю смуги і при наведенні
              * не показувалась узагалі — а це єдине місце, де видно, яка саме
              * деталь і з якої конструкції лежить у цьому шматку.
              *
              * Тепер підказка одна на пруток і живе поверх смуги, а не в ній.
              */}
            <div className="relative">
                {hoveredPiece && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-input bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-lg">
                        <span className="font-medium text-foreground">
                            Конструкція {hoveredConstruction?.constructionNo ?? hoveredPiece.constructionId}
                        </span>
                        {' · '}
                        {hoveredPiece.detailCode}
                        {' · '}
                        <span className="tabular-nums">{hoveredPiece.length.toFixed(0)} мм</span>
                    </div>
                )}

            <div className="relative flex h-8 w-full overflow-hidden rounded-md border border-border">
                {bar.pieces.map((piece, idx) => {
                    const widthPct = (piece.length / beamLength) * 100;
                    const isHovered = hovered === piece.id;

                    return (
                        <div
                            key={piece.id}
                            onMouseEnter={() => setHovered(piece.id)}
                            onMouseLeave={() => setHovered(null)}
                            className={cn(
                                'relative flex items-center justify-center transition-[filter]',
                                idx < bar.pieces.length - 1 && 'border-r border-background/40',
                                isHovered && 'brightness-125',
                            )}
                            style={{
                                width: `${widthPct}%`,
                                background: colorMap.get(piece.constructionId) ?? remainderColor,
                            }}
                        >
                            <span className="pointer-events-none truncate px-1 text-xs font-medium tabular-nums text-white/600">
                                {piece.length.toFixed(0)}
                            </span>
                        </div>
                    );
                })}

                {bar.remainder > 0 && (
                    <div
                        className="flex min-w-[40px] items-center justify-center border-l border-dashed border-border"
                        style={{ width: `${remainderPct}%`, background: remainderColor }}
                    >
                        <span className="truncate px-1 text-xs tabular-nums text-muted-foreground">
                            {remainderPct > 2 ? bar.remainder.toFixed(0) : ''}
                        </span>
                    </div>
                )}
            </div>
            </div>
        </div>
    );
};
