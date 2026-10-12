import React, { useMemo, useState } from 'react';
import { Loader2, Minus, Plus, Trash2, X } from 'lucide-react';
import { useProfileAccessorySimple } from '@/screens/profile-accessory/hooks/useProfileAccessorySimple';
import { useProfileAccessoryLinkMutation } from '@/screens/profile-system/hooks/useProfileAccessoryLinkMutation';
import { useProfileAccessoryUnlinkMutation } from '@/screens/profile-system/hooks/useProfileAccessoryUnlinkMutation';
import { AccessoryBillingType, AccessoryUnitType, ACCESSORY_UNIT_LABELS, IProfileAccessory } from '@/screens/profile-accessory/types/IProfileAccessory';
import { IProfileSystemAccessory } from '@/screens/profile-system/types/profile-system/IProfileSystemDetail';
import useModal, { ModalProps } from '@/hooks/useModal/useModal';
import Modal from '@/ui/Modal/Modal';
import SearchInput from '@/ui/input/SearchInput';
import { Button } from '@/ui/shadcn/button';
import { cn } from '@/helpers/cn';

const BILLING_LABELS: Record<AccessoryBillingType, string> = {
    PER_FACADE_BASE:     'Базово',
    PER_FACADE_OPTIONAL: 'Опціонально',
};

/** Порядок сегментів у перемикачі — базове першим, воно частіше. */
const BILLING_ORDER: AccessoryBillingType[] = ['PER_FACADE_BASE', 'PER_FACADE_OPTIONAL'];

const BILLING_STYLES: Record<AccessoryBillingType, string> = {
    PER_FACADE_BASE:     'bg-chart-1/15 text-chart-1',
    PER_FACADE_OPTIONAL: 'bg-chart-3/15 text-chart-3',
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
        <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-accent/40 hover:bg-accent/60 transition-colors group">
            <div className="flex items-center gap-3 min-w-0">
                {colorCode ? (
                    <div
                        className="w-3 h-3 rounded-full shrink-0 border border-border"
                        style={{ backgroundColor: colorCode }}
                    />
                ) : (
                    <div className="w-3 h-3 rounded-full shrink-0 border border-dashed border-input" />
                )}
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{acc.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                        {acc.articleCode}
                        {acc.color?.name ? ` · ${acc.color.name}` : ''}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground tabular-nums hidden sm:block">
                    {unitLabel(acc.unit, item.quantityPerUnit)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BILLING_STYLES[billing] ?? ''}`}>
                    {BILLING_LABELS[billing] ?? billing}
                </span>
                <button
                    onClick={onUnlink}
                    disabled={isUnlinking}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/40 text-muted-foreground hover:text-destructive-foreground disabled:cursor-not-allowed"
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
        /*
         * Одна колонка замість двох.
         *
         * Було: ліворуч список, праворуч панель на 208 px із типом, кількістю
         * і кнопкою. Панель займала половину і без вибраного аксесуара стояла
         * приглушена й непрацездатна — тобто половина вікна не робила нічого
         * більшу частину часу, а списку лишалося менше 300 px на назви,
         * артикули й кольори.
         *
         * Стало: спершу список на всю ширину, а налаштування з'являються
         * знизу після вибору — там, де вони й потрібні, і рівно тоді.
         */
        <Modal {...props} className="max-w-[520px]">
            <Modal.Title onClose={props.onClose}>
                Прив&apos;язати аксесуар
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-3">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Назва, артикул або колір"
                />

                <div className="max-h-[280px] min-h-[160px] overflow-y-auto">
                    {isPending && (
                        <div className="flex flex-col items-center justify-center gap-2 py-10">
                            <Loader2 size={20} className="animate-spin text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Завантаження…</p>
                        </div>
                    )}

                    {!isPending && filtered.length === 0 && (
                        <p className="py-10 text-center text-sm text-muted-foreground">
                            {search ? 'Нічого не знайдено' : 'Усі аксесуари вже прив\'язані'}
                        </p>
                    )}

                    <div className="space-y-0.5">
                        {filtered.map(a => {
                            const isSelected = selected?.id === a.id;

                            return (
                                <button
                                    key={a.id}
                                    onClick={() => { setSelected(a); setQty(1); }}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors',
                                        isSelected
                                            // Вибране видно кольором, а не ледь помітною рамкою
                                            ? 'bg-primary/10 text-foreground'
                                            : 'hover:bg-accent/60',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'h-3.5 w-3.5 shrink-0 rounded-full border border-border',
                                            !a.color?.code && 'border-dashed',
                                        )}
                                        style={{ backgroundColor: a.color?.code ?? 'transparent' }}
                                    />

                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium leading-tight text-foreground">
                                            {a.name}
                                        </span>
                                        <span className="block truncate text-xs text-muted-foreground">
                                            <span className="font-mono">{a.articleCode}</span>
                                            {a.color?.name ? ` · ${a.color.name}` : ''}
                                        </span>
                                    </span>

                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        {ACCESSORY_UNIT_LABELS[a.unit]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Налаштування з'являються тільки після вибору */}
                {selected && (
                    <div className="flex flex-col gap-3 border-t border-border pt-3">
                        <div className="flex items-center justify-between gap-3">
                            <p className="min-w-0 truncate text-sm font-medium text-foreground">
                                {selected.name}
                                {selected.color?.name && (
                                    <span className="text-muted-foreground"> · {selected.color.name}</span>
                                )}
                            </p>

                            <button
                                type="button"
                                onClick={() => setSelected(null)}
                                aria-label="Скасувати вибір"
                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium text-muted-foreground">Нарахування</span>

                                {/* Сегменти рівної ширини — як перемикач розділів */}
                                <div className="grid grid-flow-col auto-cols-fr gap-0.5 rounded-md bg-muted p-0.5">
                                    {BILLING_ORDER.map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            aria-pressed={billingType === type}
                                            onClick={() => setBilling(type)}
                                            className={cn(
                                                'rounded-sm px-2 py-1.5 text-xs font-medium transition-colors',
                                                billingType === type
                                                    ? 'bg-background text-foreground shadow-xs'
                                                    : 'text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            {BILLING_LABELS[type]}
                                        </button>
                                    ))}
                                </div>

                                <span className="text-xs text-muted-foreground">
                                    {billingType === 'PER_FACADE_BASE'
                                        ? 'Додається до кожного фасаду'
                                        : 'Тільки за умовою конструкції'}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Кількість на фасад, {ACCESSORY_UNIT_LABELS[selected.unit].toLowerCase()}
                                </span>

                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        aria-label="Менше"
                                        onClick={() => setQty(q => Math.max(1, q - 1))}
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                    >
                                        <Minus size={14} />
                                    </button>

                                    {/* Поле, а не тільки кнопки: 16 гвинтів набирати кліками довго */}
                                    <input
                                        type="number"
                                        min="1"
                                        value={qty}
                                        onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))}
                                        className="h-9 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 text-center text-sm tabular-nums text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    />

                                    <button
                                        type="button"
                                        aria-label="Більше"
                                        onClick={() => setQty(q => q + 1)}
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLinking}
                            className="w-full"
                        >
                            {isLinking ? (
                                <><Loader2 size={14} className="animate-spin" /> Зберігаємо…</>
                            ) : (
                                <><Plus size={14} /> Прив&apos;язати</>
                            )}
                        </Button>
                    </div>
                )}
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
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">{label}</p>
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
                    <p className="text-xs text-muted-foreground text-center py-3">
                        Немає прив'язаних аксесуарів
                    </p>
                )}

                {renderGroup(baseItems,     'Базові')}
                {renderGroup(optionalItems, 'Опціональні')}

                <button
                    onClick={linkModal.onOpen}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-ring hover:text-foreground hover:bg-accent/60 transition-all mt-1"
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