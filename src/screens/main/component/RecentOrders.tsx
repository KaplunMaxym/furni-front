import React from 'react';
import { Link } from 'react-router';

import { IDashboardRecentOrder } from '@/screens/main/types/IDashboard';
import { RouterEnum } from '@/config/RouterEnum';
import { Badge } from '@/ui/shadcn/badge';
import { Progress } from '@/ui/shadcn/progress';

interface RecentOrdersProps {
    orders: IDashboardRecentOrder[];
}

const RecentOrders: React.FC<RecentOrdersProps> = ({ orders }) => {
    if (!orders.length) {
        return <p className="text-sm text-muted-foreground">Замовлень ще немає.</p>;
    }

    return (
        <div className="flex flex-col divide-y divide-border">
            {orders.map(order => (
                <Link
                    key={order.id}
                    to={`${RouterEnum.ORDER}/${order.id}`}
                    className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/50"
                >
                    <span className="w-14 shrink-0 font-mono text-xs text-muted-foreground">
                        {order.orderNumber}
                    </span>

                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-card-foreground">
                            {order.name || order.client}
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                            {order.client} · {order.constructions} констр.
                            {order.status ? ` · ${order.status}` : ''}
                        </span>
                    </span>

                    {order.isCompleted ? (
                        <Badge variant="success">готове</Badge>
                    ) : (
                        <span className="flex w-24 shrink-0 items-center gap-2">
                            <Progress value={order.progress} className="h-1.5 flex-1" />
                            <span className="w-8 text-right text-[11px] text-muted-foreground">
                                {order.progress}%
                            </span>
                        </span>
                    )}
                </Link>
            ))}
        </div>
    );
};

export default RecentOrders;
