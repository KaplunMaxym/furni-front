import MainLayout from '@/ui/layouts/main-layout/MainLatout';
import { useProfileAccessoryDelMutation } from '@/screens/profile-accessory/hooks/useProfileAccessoryDelMutation';
import { useProfileAccessoryFilterStore } from '@/store/profile-accessory/useProfileAccessoryFilter';
import SelectorSearch from '@/componets/select/virtualized-list/SelectorSearch';
import Button from '@/ui/button/Button';
import PlusSvg from '@/assets/plusSvg';
import { Table } from '@/ui/table/table';
import { TrHead } from '@/ui/table/tr-head';
import { TrBody } from '@/ui/table/tr-body';
import { cn } from '@/helpers/cn';
import PaginationControl from '@/componets/pagination/Pagination';
import React, { useState } from 'react';
import { useProfileAccessoryQuery } from '@/screens/profile-accessory/hooks/useProfileAccessoryQuery';
import useModal from '@/hooks/useModal';
import {
    IProfileAccessory,
    ACCESSORY_UNIT_LABELS,
} from '@/screens/profile-accessory/types/IProfileAccessory';
import ProfileAccessoryCreateModal from '@/screens/profile-accessory/features/modals/modal-create-profile-accessory';
import ProfileAccessoryPricesModal from '@/screens/profile-accessory/features/modals/modal-accessory-prices';
import RowActionsCell from '@/ui/table/RowActionsCell';
import PricesCell from '@/ui/prices/PricesCell';
import { PRICE_CATEGORIES } from '@/screens/glass-fill/types/IGlassPrice';
import FiltersBar from '@/ui/filters/FiltersBar';
import TableStateRows from '@/ui/table/TableStateRows';
import { useColor } from '@/screens/catalog/hooks/useColor';
import { useProfileSystem } from '@/screens/profile-system/hooks/useProfileSystem';
import PageHeader from "@/ui/page-header/PageHeader";
import SortableTh from '@/ui/table/SortableTh';
import { Copy } from 'lucide-react';

/** Скільки колонок у таблиці — для colSpan службових рядків. */
const COLUMN_COUNT = 8;

const ProfileAccessoryScreen = () => {
    const { data, isPending, isFetching } = useProfileAccessoryQuery();
    const { mutateAsync: deleteAccessory } = useProfileAccessoryDelMutation();

    const {
        page, setPage, limit, setLimit,
        search, colorId, profileSystemId, setFilter, resetFilters, sortBy, sortOrder, setSort} = useProfileAccessoryFilterStore();

    // Тут усі кольори, а не тільки PROFILE: аксесуар може бути й завісом
    // (HINGE), і ручкою (HANDLE) — так само, як у модалці створення.
    const { data: colors } = useColor();
    const { data: profileSystems } = useProfileSystem();

    const hasFilters = !!search || colorId !== null || profileSystemId !== null;
    const modalCreate = useModal();
    const modalPrices = useModal();

    const [selected, setSelected] = useState<IProfileAccessory | null>(null);
    const [selectedForPrices, setSelectedForPrices] = useState<IProfileAccessory | null>(null);

    const meta = data?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const selectedForPricesActual = selectedForPrices
        ? data?.profileAccessories.find(m => m.id === selectedForPrices.id) ?? selectedForPrices
        : null;

    const { totalItems, totalPages, currentPage } = meta;

    const onDelete = async (id: number) => {
        await deleteAccessory({ id });
    };

    const onEdit = (item: IProfileAccessory) => {
        setSelected(item);
        modalCreate.onOpen();
    };

    /*
     * Копія: та сама форма, заповнена даними рядка, але без `id`.
     *
     * Аксесуари відрізняються здебільшого одним полем — кольором або
     * артикулом, — тож заводити кожен варіант з нуля означає щоразу
     * передруковувати назву, одиницю й код 1С.
     *
     * Ціни не копіюються: вони живуть окремими рядками на кожну категорію і
     * задаються вже після створення.
     */
    const onCopy = (item: IProfileAccessory) => {
        setSelected({ ...item, id: 0 });
        modalCreate.onOpen();
    };

    const onOpenPrices = (item: IProfileAccessory) => {
        setSelectedForPrices(item);
        modalPrices.onOpen();
    };

    const handleCreateClose = () => {
        setSelected(null);
        modalCreate.onClose();
    };

    const handlePricesClose = () => {
        setSelectedForPrices(null);
        modalPrices.onClose();
    };

    return (
        <MainLayout>
            <div className="flex flex-col gap-3 w-full">
                <PageHeader
                    title="Аксесуари"
                    description="Фурнітура, що додається до конструкції: завіси, ручки, кріплення"
                />

                <FiltersBar
                    search={search}
                    onSearchChange={value => setFilter('search', value)}
                    searchPlaceholder="Назва, артикул або код 1С"
                    hasFilters={hasFilters}
                    onReset={resetFilters}
                    action={
                        <Button
                            className="w-auto mx-0 py-0 h-[40px]"
                            color="greenDarkgreen"
                            onClick={modalCreate.onOpen}
                        >
                            <PlusSvg width={20} height={20} /> Додати аксесуар
                        </Button>
                    }
                >
                    <SelectorSearch
                        getAndSet={[
                            profileSystemId,
                            value => setFilter('profileSystemId', value ? Number(value) : null),
                        ]}
                        options={profileSystems}
                        optionValue="id"
                        optionLabel="title"
                        placeholder="Усі профільні системи"
                        allowClear
                        className="w-[220px]"
                    />

                    <SelectorSearch
                        getAndSet={[colorId, value => setFilter('colorId', value ? Number(value) : null)]}
                        options={colors}
                        optionValue="id"
                        optionLabel="name"
                        placeholder="Усі кольори"
                        allowClear
                        className="w-[200px]"
                    />
                </FiltersBar>

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    {/* Під час підвантаження показуємо старі рядки приглушено */}
                    <div
                        className={cn(
                            'w-full transition-opacity',
                            isFetching && !isPending && 'opacity-60',
                        )}
                    >
                        <Table>
                            <thead>
                            <TrHead>
                                <SortableTh field="articleCode" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Артикул</SortableTh>
                                <SortableTh field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Назва</SortableTh>
                                <SortableTh field="code1C" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Код 1С</SortableTh>
                                <th>Профіль</th>
                                <SortableTh field="color" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Колір</SortableTh>
                                <SortableTh field="unit" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Одиниця</SortableTh>
                                <th>Ціни</th>
                                <th className="w-[120px]"></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {data?.profileAccessories.map(item => (
                                <TrBody key={item.id}>
                                    <td className="font-mono text-sm">{item.articleCode}</td>
                                    <td>{item.name}</td>
                                    <td className="font-mono text-sm text-muted-foreground">{item.code1C}</td>
                                    <td>
                                        {item.systemLinks.length > 0
                                            ? item.systemLinks
                                                .map(link => link.profileSystem.title)
                                                .join(', ')
                                            : null}
                                    </td>
                                    <td>
                                        {item.color ? (
                                            <div className="flex items-center gap-2">
                                                {item.color.code && (
                                                    <div
                                                        className="w-4 h-4 rounded-full border border-border"
                                                        style={{ backgroundColor: item.color.code }}
                                                    />
                                                )}
                                                {item.color.name}
                                            </div>
                                        ) : null}
                                    </td>
                                    <td>{ACCESSORY_UNIT_LABELS[item.unit]}</td>
                                    <td>
                                        <PricesCell
                                            filled={item.prices.length}
                                            total={PRICE_CATEGORIES.length}
                                            onClick={() => onOpenPrices(item)}
                                        />
                                    </td>
                                    <td className="w-[60px]">
                                        <RowActionsCell
                                            onEdit={() => onEdit(item)}
                                            onDelete={() => onDelete(item.id)}
                                            extra={[{
                                                label: 'Копіювати',
                                                icon: <Copy className="h-4 w-4" />,
                                                onSelect: () => onCopy(item),
                                            }]}
                                        />
                                    </td>
                                </TrBody>
                            ))}
                            <TableStateRows
                                columnCount={COLUMN_COUNT}
                                isPending={isPending}
                                isEmpty={data?.profileAccessories.length === 0}
                                hasFilters={hasFilters}
                                onReset={resetFilters}
                                emptyLabel="Аксесуарів ще немає"
                            />
                            </tbody>
                        </Table>
                    </div>
                </div>

                <PaginationControl
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    totalItems={totalItems}
                    limit={limit}
                    onLimitChange={setLimit}
                    disabled={isPending}
                />
            </div>

            <ProfileAccessoryCreateModal
                {...modalCreate}
                profileAccessory={selected}
                onClose={handleCreateClose}
            />

            <ProfileAccessoryPricesModal
                {...modalPrices}
                profileAccessory={selectedForPricesActual}
                onClose={handlePricesClose}
            />
        </MainLayout>
    );
};

export default ProfileAccessoryScreen;