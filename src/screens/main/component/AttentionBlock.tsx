import React from 'react';
import { Link } from 'react-router';
import { Check, ChevronRight } from 'lucide-react';

import { IDashboardAttention } from '@/screens/main/types/IDashboard';
import { RouterEnum } from '@/config/RouterEnum';
import { Badge } from '@/ui/shadcn/badge';

interface AttentionBlockProps {
    attention: IDashboardAttention;
}

interface CodeGap {
    label: string;
    count: number;
    to: string;
}

/**
 * Те, що блокує роботу далі.
 *
 * Нулі не показуємо: «матеріали 0 · аксесуари 0» — це шум, через який не видно
 * справжніх проблем. Лишається тільки те, куди справді треба піти.
 */
const AttentionBlock: React.FC<AttentionBlockProps> = ({ attention }) => {
    const catalog = attention.catalogWithoutCode1C;

    const gaps: CodeGap[] = [
        { label: 'Матеріали', count: catalog.materials, to: RouterEnum.PROFILE_MATERIAL },
        { label: 'Аксесуари', count: catalog.accessories, to: RouterEnum.PROFILE_ACCESSORY },
        { label: 'Послуги', count: catalog.services, to: RouterEnum.PROFILE_SERVICE },
        { label: 'Скло', count: catalog.glass, to: RouterEnum.GLASS_FILL },
        { label: 'Системи', count: catalog.systems, to: RouterEnum.PROFILE_SYSTEM },
        { label: 'Клієнти', count: attention.clientsWithoutCode1C, to: RouterEnum.CLIENTS },
    ].filter(gap => gap.count > 0);

    const nothingToDo =
        !gaps.length &&
        !attention.ordersWithoutCost.length &&
        !attention.failed1CExchanges.length;

    if (nothingToDo) {
        return (
            <p className="flex items-center gap-2 text-sm text-chart-2">
                <Check size={16} /> Усе на місці — нічого не блокує.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-5">

            {gaps.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground">
                        Без коду 1С — обмін такі замовлення не прийме
                    </p>

                    <div className="flex flex-col">
                        {gaps.map(gap => (
                            <Link
                                key={gap.label}
                                to={gap.to}
                                className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/50"
                            >
                                <span className="text-card-foreground">{gap.label}</span>
                                <span className="flex items-center gap-1.5">
                                    <Badge variant="warning">{gap.count}</Badge>
                                    <ChevronRight size={14} className="text-muted-foreground" />
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {attention.ordersWithoutCost.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground">
                        Без розрахунку вартості — {attention.ordersWithoutCost.length}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                        {attention.ordersWithoutCost.map(order => (
                            <Link key={order.id} to={`${RouterEnum.ORDER}/${order.id}`} title={order.client}>
                                <Badge variant="outline" className="font-mono hover:bg-muted/50">
                                    {order.orderNumber}
                                </Badge>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {attention.failed1CExchanges.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground">
                        Невдалі відправки в 1С — {attention.failed1CExchanges.length}
                    </p>

                    <div className="flex flex-col gap-1">
                        {attention.failed1CExchanges.slice(0, 3).map(item => (
                            <span key={item.id} className="flex gap-2 text-[11px]">
                                <span className="shrink-0 font-mono text-destructive-foreground">
                                    {item.orderNumber}
                                </span>
                                <span className="truncate text-muted-foreground">
                                    {item.error ?? 'без опису'}
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default AttentionBlock;
