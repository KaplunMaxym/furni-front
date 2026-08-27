import React, { useMemo, useState } from 'react';
import { Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import { useProfileAccessorySimple } from '@/screens/profile-accessory/hooks/useProfileAccessorySimple';
import { useProfileAccessoryLinkMutation } from '@/screens/profile-system/hooks/useProfileAccessoryLinkMutation';
import { useProfileAccessoryUnlinkMutation } from '@/screens/profile-system/hooks/useProfileAccessoryUnlinkMutation';
import { AccessoryBillingType, AccessoryUnitType, ACCESSORY_UNIT_LABELS, IProfileAccessory } from '@/screens/profile-accessory/types/IProfileAccessory';
import { IProfileSystemAccessory } from '@/screens/profile-system/types/profile-system/IProfileSystemDetail';
import useModal, { ModalProps } from '@/hooks/useModal/useModal';
import Modal from '@/ui/Modal/Modal';

const BILLING_LABELS: Record<AccessoryBillingType, string> = {
    PER_FACADE_BASE:     'Базово',
    PER_FACADE_OPTIONAL: 'Опціонально',
};

const BILLING_STYLES: Record<AccessoryBillingType, string> = {
    PER_FACADE_BASE:     'bg-blue-50 text-blue-600',
    PER_FACADE_OPTIONAL: 'bg-amber-50 text-amber-600',
};

const decodeDecimal = (val: unknown): number => {
    if (typeof val === 'number') return val;
    if (val && typeof val === 'object' && 'd' in val) {
        const d = (val as { d: number[] }).d;
        return Array.isArray(d) && d.length > 0 ? d[0] : 0;
    }
    return 0;
};

const unitLabel = (unit: AccessoryUnitType, qty: unknown): string =>
    `${decodeDecimal(qty)} ${ACCESSORY_UNIT_LABELS[unit] ?? unit}`;

interface AccessoryRowProps {
    item: IProfileSystemAccessory;
    onUnlink: () => void;
    isUnlinking: boolean;
}

const AccessoryRow: React.FC<AccessoryRowProps> = ({ item, onUnlink, isUnlinking }) => {
    const acc = item.profileAccessory;
    const colorCode = typeof acc.color?.code === 'string' ? acc.color.code : null;
    const billing   = item.billingType as AccessoryBillingType;

    return (
        <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-react/500 hover:bg-react/400 transition-colors group">
            <div className="flex items-center gap-3 min-w-0">
                {colorCode ? (
                    <div
                        className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                        style={{ backgroundColor: colorCode }}
                    />
                ) : (
                    <div className="w-3 h-3 rounded-full shrink-0 border border-dashed border-gray-400" />
                )}
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{acc.name}</p>
                    <p className="text-xs text-gray-400 font-mono">
                        {acc.articleCode}
                        {acc.color?.name ? ` · ${acc.color.name}` : ''}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-400 tabular-nums hidden sm:block">
                    {unitLabel(acc.unit, item.quantityPerUnit)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BILLING_STYLES[billing] ?? ''}`}>
                    {BILLING_LABELS[billing] ?? billing}
                </span>
                <button
                    onClick={onUnlink}
                    disabled={isUnlinking}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:cursor-not-allowed"
                    title="Відв'язати"
                >
                    {isUnlinking
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />
                    }
                </button>
            </div>
        </div>
    );
};

type LinkAccessoryModalProps = ModalProps & {
    linkedIds: Set<number>;
    onLink: (accessoryId: number, billingType: AccessoryBillingType, qty: number) => void;
    isLinking: boolean;
};

const LinkAccessoryModal: React.FC<LinkAccessoryModalProps> = ({
                                                                   linkedIds, onLink, isLinking, ...props
                                                               }) => {
    const [search, setSearch]       = useState('');
    const [selected, setSelected]   = useState<IProfileAccessory | null>(null);
    const [billingType, setBilling] = useState<AccessoryBillingType>('PER_FACADE_BASE');
    const [qty, setQty]             = useState(1);

    const { data: accessories, isPending } = useProfileAccessorySimple();

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return (accessories ?? []).filter(
            a =>
                !linkedIds.has(a.id) &&
                (a.name.toLowerCase().includes(q) ||
                    a.articleCode.toLowerCase().includes(q) ||
                    (a.color?.name ?? '').toLowerCase().includes(q)),
        );
    }, [accessories, search, linkedIds]);

    const handleSubmit = () => {
        if (!selected) return;
        onLink(selected.id, billingType, qty);
    };

    return (
        <Modal
            {...props}
            className="flex flex-col max-w-lg mx-2 max-h-[60vh] rounded-xl overflow-hidden"
        >
            <Modal.Title className="px-5 py-4" onClose={props.onClose}>
                <div>
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                        Прив'язати аксесуар до профілю
                    </p>
                </div>
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-0 p-0 overflow-hidden">

                <div className="px-4 py-3">
                    <div className="flex items-center gap-2.5 bg-react/500 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#639922]/30 transition-all border border-react/400">
                        <Search size={14} className="text-gray-400 shrink-0" />
                        <input
                            autoFocus
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Пошук за назвою, артикулом або кольором..."
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500 text-gray-200"
                            style={{ background: 'transparent' }}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="text-gray-400 hover:text-gray-200 transition-colors"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Основний контент: список + панель */}
                <div className="flex min-h-[260px] max-h-[55vh] border-t border-react/400">

                    {/* ── Список аксесуарів ── */}
                    <div className="flex-1 overflow-y-auto px-2 py-2">
                        {isPending && (
                            <div className="flex flex-col items-center justify-center h-full gap-2 py-10">
                                <Loader2 size={20} className="animate-spin text-gray-400" />
                                <p className="text-xs text-gray-400">Завантаження...</p>
                            </div>
                        )}

                        {!isPending && filtered.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full gap-2 py-10">
                                <Search size={18} className="text-gray-500" />
                                <p className="text-sm text-gray-500 text-center">
                                    {search ? 'Нічого не знайдено' : 'Всі прив\'язані'}
                                </p>
                            </div>
                        )}

                        <div className="space-y-0.5">
                            {filtered.map(a => {
                                const isSelected = selected?.id === a.id;
                                return (
                                    <button
                                        key={a.id}
                                        onClick={() => { setSelected(a); setQty(1); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                                            isSelected
                                                ? 'bg-react/400 ring-1 ring-inset ring-react/200'
                                                : 'hover:bg-react/500'
                                        }`}
                                    >
                                        {a.color?.code ? (
                                            <div
                                                className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
                                                style={{ backgroundColor: a.color.code }}
                                            />
                                        ) : (
                                            <div className="w-3.5 h-3.5 rounded-full shrink-0 border border-dashed border-gray-500" />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-200 truncate leading-tight">
                                                {a.name}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[11px] text-gray-500 font-mono">{a.articleCode}</span>
                                                {a.color?.name && (
                                                    <>
                                                        <span className="text-gray-600">·</span>
                                                        <span className="text-[11px] text-gray-500">{a.color.name}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[11px] text-gray-500 shrink-0">
                                            {ACCESSORY_UNIT_LABELS[a.unit]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Права панель налаштувань ── */}
                    <div className={`w-52 shrink-0 border-l border-react/400 flex flex-col transition-all duration-200 ${selected ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>

                        {/* Вибраний аксесуар */}
                        <div className="px-4 pt-4 pb-3 border-b border-react/400">
                            {selected ? (
                                <div className="flex items-center gap-2">
                                    {selected.color?.code ? (
                                        <div
                                            className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                                            style={{ backgroundColor: selected.color.code }}
                                        />
                                    ) : (
                                        <div className="w-3 h-3 rounded-full shrink-0 border border-dashed border-gray-500" />
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-gray-200 truncate">{selected.name}</p>
                                        {selected.color?.name && (
                                            <p className="text-[11px] text-gray-500 truncate">{selected.color.name}</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500">Оберіть аксесуар</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 px-4 py-4 flex-1">
                            {/* Тип білінгу */}
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Тип</p>
                                <div className="flex flex-col gap-1">
                                    {(['PER_FACADE_BASE', 'PER_FACADE_OPTIONAL'] as AccessoryBillingType[]).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setBilling(type)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-left ${
                                                billingType === type
                                                    ? 'bg-react/300 text-gray-100'
                                                    : 'text-gray-400 hover:bg-react/500 hover:text-gray-200'
                                            }`}
                                        >
                                            <div className={`w-3 h-3 rounded-full border-2 shrink-0 transition-colors ${
                                                billingType === type ? 'border-gray-300 bg-gray-300' : 'border-gray-500'
                                            }`} />
                                            {BILLING_LABELS[type]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Кількість */}
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                                    К-сть / фасад
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setQty(q => Math.max(1, q - 1))}
                                        className="w-7 h-7 rounded-md bg-react/500 hover:bg-react/400 text-gray-300 font-medium text-base transition-colors flex items-center justify-center"
                                    >
                                        −
                                    </button>
                                    <span className="flex-1 text-center text-sm font-semibold tabular-nums text-gray-100">
                                        {qty}
                                    </span>
                                    <button
                                        onClick={() => setQty(q => q + 1)}
                                        className="w-7 h-7 rounded-md bg-react/500 hover:bg-react/400 text-gray-300 font-medium text-base transition-colors flex items-center justify-center"
                                    >
                                        +
                                    </button>
                                </div>
                                {selected && (
                                    <p className="text-[11px] text-gray-500 text-center">
                                        {ACCESSORY_UNIT_LABELS[selected.unit].toLowerCase()}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Кнопка підтвердження */}
                        <div className="px-3 pb-4">
                            <button
                                onClick={handleSubmit}
                                disabled={!selected || isLinking}
                                className="w-full py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                            >
                                {isLinking
                                    ? <><Loader2 size={13} className="animate-spin" /> Зберігаю...</>
                                    : <><Plus size={13} /> Прив'язати</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

interface AccessoriesSectionProps {
    profileSystemId: number;
    accessories: IProfileSystemAccessory[];
}

const AccessoriesSection: React.FC<AccessoriesSectionProps> = ({ profileSystemId, accessories = [] }) => {
    const linkModal = useModal();

    const linkMutation   = useProfileAccessoryLinkMutation(profileSystemId);
    const unlinkMutation = useProfileAccessoryUnlinkMutation(profileSystemId);

    const linkedIds = useMemo(
        () => new Set(accessories.map(a => a.profileAccessoryId)),
        [accessories],
    );

    const baseItems     = accessories.filter(a => a.billingType === 'PER_FACADE_BASE');
    const optionalItems = accessories.filter(a => a.billingType === 'PER_FACADE_OPTIONAL');

    const handleLink = (
        accessoryId: number,
        billingType: AccessoryBillingType,
        qty: number,
    ) => {
        linkMutation.mutate(
            { profileAccessoryId: accessoryId, billingType, quantityPerUnit: qty },
            { onSuccess: linkModal.onClose },
        );
    };

    const handleUnlink = (accessoryId: number) => {
        unlinkMutation.mutate({ profileAccessoryId: accessoryId });
    };

    const renderGroup = (items: IProfileSystemAccessory[], label: string) => {
        if (items.length === 0) return null;
        return (
            <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-1">{label}</p>
                {items.map(item => (
                    <AccessoryRow
                        key={item.profileAccessoryId}
                        item={item}
                        onUnlink={() => handleUnlink(item.profileAccessoryId)}
                        isUnlinking={
                            unlinkMutation.isPending &&
                            unlinkMutation.variables?.profileAccessoryId === item.profileAccessoryId
                        }
                    />
                ))}
            </div>
        );
    };

    return (
        <>
            <div className="space-y-3">
                {accessories.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-3">
                        Немає прив'язаних аксесуарів
                    </p>
                )}

                {renderGroup(baseItems,     'Базові')}
                {renderGroup(optionalItems, 'Опціональні')}

                <button
                    onClick={linkModal.onOpen}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-react/300 text-xs text-gray-400 hover:border-gray-400 hover:text-gray-600 hover:bg-react/500 transition-all mt-1"
                >
                    <Plus size={13} />
                    Прив'язати аксесуар
                </button>
            </div>

            <LinkAccessoryModal
                {...linkModal}
                linkedIds={linkedIds}
                onLink={handleLink}
                onClose={linkModal.onClose}
                isLinking={linkMutation.isPending}
            />
        </>
    );
};

export default AccessoriesSection;