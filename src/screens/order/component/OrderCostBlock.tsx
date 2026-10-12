import React, { FC, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/helpers/cn';
import Hint from '@/ui/hint/Hint';
import { useAuthStore } from '@/store/auth/authReducer';
import { isDealerRole } from '@/config/RoleEnum';
import { SectionLabel } from '@/ui/section-label/SectionLabel';
import { IConstruction } from '@/screens/construction/type/construction/IConstruction';
import {
    IOrderCost,
    IOrderCostConstructionGroup,
    IOrderCostItem,
    IOrderCostGlassItem,
    IOrderCostAccessoryItem,
    IOrderCostServiceItem,
} from '@/screens/order/types/order/IOrder';

interface OrderCostBlockProps {
    cost: IOrderCost;
    constructions?: IConstruction[];
}

/**
 * Ціна двома валютами — однаковим виглядом у всіх рядках.
 *
 * Гривня в рядках із копійками, у підсумку — округлена.
 *
 * Раніше вона всюди йшла цілою, і копійки просто зникали: рядок за 1.40 $ і
 * рядок за 1.44 $ показували однакові «58 ₴». Скласти такі рядки очима було
 * неможливо — сума не сходилась із підсумком, і виглядало це як помилка
 * розрахунку, хоч рахунок був правильний.
 *
 * У підсумку копійки навпаки зайві: там дивляться на порядок суми, а не
 * звіряють доданки.
 */
const Money: FC<{ usd: number; uah: number; className?: string; rounded?: boolean }> = ({
    usd,
    uah,
    className,
    rounded = false,
}) => (
    <span className={cn('shrink-0 whitespace-nowrap tabular-nums', className)}>
        {usd.toFixed(2)} $
        <span className="text-muted-foreground"> / {uah.toFixed(rounded ? 0 : 2)} ₴</span>
    </span>
);

/**
 * Витрата профілю двома числами.
 *
 * `beamsUsed` — скільки прутків фізично взято за розкроєм, тобто вже
 * округлення вгору: пруток або дістали зі складу, або ні. Але платить
 * замовник не за прутки, а за метраж — сума рахується як
 * `довжина деталей / довжина балки * ціна`, і це майже завжди дробове
 * число. Показувати лише ціле означало б, що сума не сходиться з
 * кількістю: три прутки поруч із ціною за 2.067.
 *
 * `beamLength` беремо з рядка вартості, а не з довідника матеріалів: у
 * довіднику довжину можуть змінити, і старе замовлення почало б показувати
 * витрату, якої в ньому не було.
 */
const BeamUsage: FC<{ item: IOrderCostItem; isDealer: boolean }> = ({ item, isDealer }) => {
    const fractional = item.beamLength > 0 ? item.totalLength / item.beamLength : 0;

    /*
     * Дилеру — лише фактична витрата.
     *
     * «1 шт» — це складський рух: скільки прутків дістали з полиці, щоб
     * нарізати його деталі. Замовника це не стосується й нічого йому не
     * пояснює: платить він за 0.615 балки, і два числа поруч читались як
     * розбіжність у рахунку. Залишок в обріз — теж внутрішня втрата заводу.
     */
    if (isDealer) {
        /*
         * Без підказки: пояснювати тут нічого. Число одне, поруч із ним ціна,
         * і зв'язок між ними очевидний. Іконка «i» була потрібна, поки поруч
         * стояли два різні числа й треба було сказати, чим вони відрізняються.
         */
        return (
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">
                {fractional.toFixed(3)} балки
            </span>
        );
    }

    return (
        <span className="inline-flex shrink-0 items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">
            {item.beamsUsed} шт
            <span className="text-muted-foreground/60">·</span>
            {fractional.toFixed(3)}
            <Hint title="Витрата профілю">
                <p>
                    <b>{item.beamsUsed} шт</b> — стільки прутків беремо зі складу за
                    розкроєм: пруток не можна взяти наполовину.
                </p>
                <p>
                    <b>{fractional.toFixed(3)}</b> — стільки балок пішло насправді:{' '}
                    {item.totalLength.toFixed(0)} мм деталей поділити на балку{' '}
                    {item.beamLength.toFixed(0)} мм. Саме за цим числом нарахована сума.
                </p>
                <p>Залишок у обріз: {item.wasteLength.toFixed(0)} мм.</p>
            </Hint>
        </span>
    );
};

/**
 * Вартість замовлення.
 *
 * Блок був зроблений під світлу тему й повністю на inline-стилях: білі
 * підкладки, градієнт `#EFF6FF`, синій `#3B82F6` під білим текстом, рамка
 * `#DBEAFE`. На темному фоні це виглядало як шматок чужого інтерфейсу, а
 * дізнатися колір із коду можна було лише вичитуючи шістнадцяткові значення.
 * Тепер усе на токенах теми.
 *
 * Зовнішнє згортання прибрано: блок і так відкривається окремою вкладкою,
 * тож перший клік просто відкривав те, заради чого на вкладку й переходили.
 */
const OrderCostBlock: FC<OrderCostBlockProps> = ({ cost, constructions }) => {
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

    const { role } = useAuthStore();
    const isDealer = isDealerRole(role);

    const toggleGroup = (id: number) =>
        setExpandedGroups(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    return (
        <div className="flex flex-col gap-3">

            {/* ── профілі ─────────────────────────────────────────────── */}
            {cost.items.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                    <SectionLabel>Профілі</SectionLabel>

                    <div className="divide-y divide-border">
                        {cost.items.map((item: IOrderCostItem) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent/40"
                            >
                                <div className="flex min-w-0 items-center gap-2">
                                    <span className="truncate font-mono text-foreground">{item.articleCode}</span>
                                    {item.color && (
                                        <span className="truncate text-muted-foreground">({item.color})</span>
                                    )}
                                    <BeamUsage item={item} isDealer={isDealer} />
                                </div>

                                <Money usd={item.subtotalUsd} uah={item.subtotalUah} className="text-foreground" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── по конструкціях ─────────────────────────────────────── */}
            {cost.byConstruction?.map((group: IOrderCostConstructionGroup) => {
                const construction = constructions?.find(c => c.id === group.constructionId);
                const isExpanded = expandedGroups.has(group.constructionId);
                const totalItems =
                    group.glassItems.length + group.accessoryItems.length + group.serviceItems.length;

                return (
                    <div
                        key={group.constructionId}
                        className="overflow-hidden rounded-xl border border-border bg-card"
                    >
                        <button
                            onClick={() => toggleGroup(group.constructionId)}
                            className="flex w-full items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
                        >
                            <div className="flex min-w-0 items-center gap-2">
                                <ChevronDown
                                    size={16}
                                    className={cn(
                                        'shrink-0 text-muted-foreground transition-transform duration-200',
                                        isExpanded && 'rotate-180',
                                    )}
                                />

                                <span className="truncate text-sm font-medium text-foreground">
                                    {construction
                                        ? `Конструкція ${construction.constructionNo} · ${construction.width}×${construction.height} мм`
                                        : `Конструкція #${group.constructionId}`}
                                </span>

                                {totalItems > 0 && (
                                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">
                                        {totalItems} позицій
                                    </span>
                                )}
                            </div>

                            <Money
                                usd={group.subtotalUsd}
                                uah={group.subtotalUah}
                                className="text-sm font-medium text-foreground"
                                rounded
                            />
                        </button>

                        {isExpanded && (
                            <div className="divide-y divide-border border-t border-border">
                                {group.glassItems.length > 0 && (
                                    <CostGroup label="Скло">
                                        {group.glassItems.map((item: IOrderCostGlassItem) => (
                                            <CostRow key={item.id} name={item.name} usd={item.subtotalUsd} uah={item.subtotalUah} />
                                        ))}
                                    </CostGroup>
                                )}

                                {group.accessoryItems.length > 0 && (
                                    <CostGroup label="Аксесуари">
                                        {group.accessoryItems.map((item: IOrderCostAccessoryItem) => (
                                            <CostRow
                                                key={item.id}
                                                name={`${item.name}${item.color ? ` (${item.color})` : ''} × ${item.quantity}`}
                                                usd={item.subtotalUsd}
                                                uah={item.subtotalUah}
                                            />
                                        ))}
                                    </CostGroup>
                                )}

                                {group.serviceItems.length > 0 && (
                                    <CostGroup label="Послуги">
                                        {group.serviceItems.map((item: IOrderCostServiceItem) => (
                                            <CostRow key={item.id} name={item.name} usd={item.subtotalUsd} uah={item.subtotalUah} />
                                        ))}
                                    </CostGroup>
                                )}

                                <div className="flex items-center justify-between gap-3 bg-accent/40 px-4 py-2.5 text-sm font-medium text-foreground">
                                    <span>Підсумок</span>
                                    <Money usd={group.subtotalUsd} uah={group.subtotalUah} rounded />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* ── разом ───────────────────────────────────────────────── */}
            <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="text-sm font-semibold text-foreground">Разом</span>
                    <Money usd={cost.totalUsd} uah={cost.totalUah} className="text-base font-semibold text-foreground" rounded />
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2 text-xs text-muted-foreground">
                    <span>Курс НБУ</span>
                    <span className="tabular-nums">1 $ = {cost.currencyRate.toFixed(2)} ₴</span>
                </div>
            </div>
        </div>
    );
};

/**
 * Група всередині розкладу конструкції.
 *
 * Кольори прибрані: фіолетовий, синій і зелений нічого не означали — це просто
 * три назви розділів, — але читалися помітніше за суми поруч. Виділяє групу
 * нейтральна підкладка підпису, тож рядки під ним видно як одне ціле.
 */
const CostGroup: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <SectionLabel>{label}</SectionLabel>
        <div className="flex flex-col gap-0.5 px-4 py-2.5">{children}</div>
    </div>
);

const CostRow: FC<{ name: string; usd: number; uah: number }> = ({ name, usd, uah }) => (
    <div className="flex justify-between gap-3 text-sm">
        <span className="min-w-0 flex-1 truncate text-muted-foreground">{name}</span>
        <Money usd={usd} uah={uah} className="text-foreground" />
    </div>
);

export default OrderCostBlock;
