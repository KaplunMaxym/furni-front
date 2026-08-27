import React, {FC, useState} from 'react';
import {ChevronDown} from 'lucide-react';
import {cn} from '@/helpers/cn';
import {IConstruction} from '@/screens/construction/type/construction/IConstruction';
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

const OrderCostBlock: FC<OrderCostBlockProps> = ({cost, constructions}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

    const toggleGroup = (id: number) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
        <div className="mb-2 rounded-xl overflow-hidden"
             style={{border: '1.5px solid #DBEAFE', boxShadow: '0 2px 8px rgba(59,130,246,0.08)'}}>

            <button
                onClick={() => setIsOpen(p => !p)}
                className="w-full flex items-center justify-between px-4 py-3 transition-colors"
                style={{
                    background: 'linear-gradient(90deg, #EFF6FF 0%, #F8FBFF 100%)',
                    borderBottom: isOpen ? '1px solid #DBEAFE' : undefined,
                }}
            >
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                         style={{background: '#3B82F6'}}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                             stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                            <path d="M2 17l10 5 10-5"/>
                            <path d="M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{color: '#1E40AF'}}>
                            Вартість замовлення
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{background: '#3B82F6', color: '#fff'}}>
                            {cost.totalUsd.toFixed(2)} $ / {cost.totalUah.toFixed(0)} ₴
                        </span>
                    </div>
                </div>
                <ChevronDown
                    size={15}
                    className={cn("transition-transform duration-200", isOpen && "rotate-180")}
                    style={{color: '#3B82F6'}}
                />
            </button>

            {isOpen && (
                <div className="p-4 space-y-3">

                    {cost.items.length > 0 && (
                        <div className="rounded-lg border-2 border-blue-300 overflow-hidden bg-white">
                            <div
                                className="px-3 py-2.5"
                                style={{background: '#1D4ED8'}}
                            >
                                <p className="text-xs font-bold text-white uppercase tracking-wide">
                                    Профілі
                                </p>
                            </div>
                            <div className="divide-y divide-blue-200">
                                {cost.items.map((item: IOrderCostItem) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between items-center px-3 py-2.5 text-xs hover:bg-blue-50 transition-colors bg-white"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="font-bold text-gray-900 truncate">
                                                {item.articleCode}
                                            </span>
                                            <span className="text-gray-500 font-medium">({item.color})</span>
                                            <span
                                                className="px-2 py-1 rounded font-bold text-xs shrink-0"
                                                style={{background: '#3B82F6', color: '#fff'}}
                                            >
                                                {item.beamsUsed} шт
                                            </span>
                                        </div>
                                        <span className="font-bold text-gray-900 shrink-0 ml-2 text-blue-600">
                                            {item.subtotalUsd.toFixed(2)} $ / {item.subtotalUah.toFixed(0)} ₴
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {cost.byConstruction?.map((group: IOrderCostConstructionGroup) => {
                        const construction = constructions?.find(c => c.id === group.constructionId);
                        const isExpanded = expandedGroups.has(group.constructionId);
                        const totalItems =
                            group.glassItems.length +
                            group.accessoryItems.length +
                            group.serviceItems.length;

                        return (
                            <div
                                key={group.constructionId}
                                className="rounded-lg border-2 border-blue-300 overflow-hidden bg-white"
                            >
                                <button
                                    onClick={() => toggleGroup(group.constructionId)}
                                    className="w-full flex items-center justify-between px-3 py-3 transition-colors hover:bg-blue-50 bg-white"
                                    style={{
                                        background: isExpanded ? '#1D4ED8' : 'white',
                                    }}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <ChevronDown
                                            size={16}
                                            className={cn(
                                                'transition-transform duration-200 shrink-0 font-bold',
                                                isExpanded ? 'rotate-180 text-white' : 'text-gray-600'
                                            )}
                                        />
                                        <span
                                            className="text-xs font-bold truncate"
                                            style={{color: isExpanded ? '#fff' : '#1E3A8A'}}
                                        >
                                              {construction
                                                  ? `Конструкція ${construction.constructionNo} · ${construction.width}×${construction.height} мм`
                                                  : `Конструкція #${group.constructionId}`}
                                        </span>
                                        {totalItems > 0 && (
                                            <span
                                                className="text-[10px] px-2 py-1 rounded font-bold shrink-0"
                                                style={{
                                                    background: isExpanded
                                                        ? 'rgba(255,255,255,0.3)'
                                                        : '#E0E7FF',
                                                    color: isExpanded ? '#fff' : '#1E3A8A',
                                                }}
                                            >
                                                {totalItems} позицій
                                            </span>
                                        )}
                                    </div>
                                    <span
                                        className="text-xs font-bold shrink-0 ml-2"
                                        style={{color: isExpanded ? '#fff' : '#1E40AF'}}
                                    >
                                        {group.subtotalUsd.toFixed(2)} $ / {group.subtotalUah.toFixed(0)} ₴
                                    </span>
                                </button>

                                {isExpanded && (
                                    <div className="divide-y divide-blue-200 bg-white">
                                        {group.glassItems.length > 0 && (
                                            <div
                                                className="px-3 py-3 space-y-1.5 border-l-4 border-purple-500 bg-white">
                                                <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wide">
                                                    🔷 Скло
                                                </p>
                                                {group.glassItems.map((item: IOrderCostGlassItem) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex justify-between text-xs text-gray-700 font-medium"
                                                    >
                                                        <span className="truncate flex-1">{item.name}</span>
                                                        <span className="shrink-0 ml-2 text-purple-600 font-bold">
                              {item.subtotalUsd.toFixed(2)} $ / {item.subtotalUah.toFixed(0)} ₴
                            </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {group.accessoryItems.length > 0 && (
                                            <div className="px-3 py-3 space-y-1.5 border-l-4 border-blue-500 bg-white">
                                                <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">
                                                    🔩 Аксесуари
                                                </p>
                                                {group.accessoryItems.map((item: IOrderCostAccessoryItem) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex justify-between text-xs text-gray-700 font-medium"
                                                    >
                                                        <span className="truncate flex-1">
                                                            {item.name}
                                                            {item.color && `(${item.color})`} × {item.quantity}
                                                        </span>
                                                        <span className="shrink-0 ml-2 text-blue-600 font-bold">
                                                            {item.subtotalUsd.toFixed(2)} $ / {item.subtotalUah.toFixed(0)} ₴
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {group.serviceItems.length > 0 && (
                                            <div
                                                className="px-3 py-3 space-y-1.5 border-l-4 border-emerald-500 bg-white">
                                                <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                                                    ✓ Послуги
                                                </p>
                                                {group.serviceItems.map((item: IOrderCostServiceItem) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex justify-between text-xs text-gray-700 font-medium"
                                                    >
                                                        <span className="truncate flex-1">{item.name}</span>
                                                        <span className="shrink-0 ml-2 text-emerald-600 font-bold">
                                                           {item.subtotalUsd.toFixed(2)} $ / {item.subtotalUah.toFixed(0)} ₴
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div
                                            className="flex justify-between px-3 py-2.5 text-xs font-bold text-white"
                                            style={{background: '#1D4ED8'}}
                                        >
                                            <span>Підсумок</span>
                                            <span>
                                                {group.subtotalUsd.toFixed(2)} $ / {group.subtotalUah.toFixed(0)} ₴
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <div className="rounded-lg border-2 border-blue-400 overflow-hidden bg-white">
                        <div className="divide-y divide-blue-200">
                            <div className="flex justify-between items-center px-4 py-3 bg-white">
                                <span className="text-sm font-bold text-gray-900">Разом</span>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">
                                        {cost.totalUsd.toFixed(2)} $ / {cost.totalUah.toFixed(0)} ₴
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center px-3 py-2 text-xs text-gray-400">
                                <span>Курс НБУ</span>
                                <span>1 $ = {cost.currencyRate.toFixed(2)} ₴</span>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default OrderCostBlock;