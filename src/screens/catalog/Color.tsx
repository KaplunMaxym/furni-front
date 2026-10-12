import MainLayout from '@/ui/layouts/main-layout/MainLatout';
import { useColorFilterStore } from '@/store/color/useColorFilter';
import SelectorSearch from '@/componets/select/virtualized-list/SelectorSearch';
import Button from '@/ui/button/Button';
import PlusSvg from '@/assets/plusSvg';
import { Table } from '@/ui/table/table';
import { TrHead } from '@/ui/table/tr-head';
import { TrBody } from '@/ui/table/tr-body';
import { cn } from '@/helpers/cn';
import PaginationControl from '@/componets/pagination/Pagination';
import React, { useState } from 'react';
import useModal from '@/hooks/useModal';
import { useColorQuery } from '@/screens/catalog/hooks/useColorQuery';
import { useColorDelMutation } from '@/screens/catalog/hooks/useColorDelMutation';
import { IColor } from '@/screens/catalog/types/IColor';
import ColorCreateModal from '@/screens/catalog/features/modals/modal-create-color';
import { COLOR_TYPES, COLOR_TYPE_LABELS, ColorType } from '@/screens/catalog/types/IColor';
import RowActionsCell from '@/ui/table/RowActionsCell';
import FiltersBar from '@/ui/filters/FiltersBar';
import TableStateRows from '@/ui/table/TableStateRows';
import PageHeader from "@/ui/page-header/PageHeader";
import SortableTh from '@/ui/table/SortableTh';

/** Скільки колонок у таблиці — для colSpan службових рядків. */
const COLUMN_COUNT = 4;

/**
 * Варіанти для селекта типів. Значення — те, що піде на сервер,
 * підпис — те саме, що в колонці «Типи», щоб не було двох словників.
 */
const TYPE_OPTIONS = COLOR_TYPES.map(type => ({ value: type, label: COLOR_TYPE_LABELS[type] }));

const ColorScreen = () => {
    const { data, isPending, isFetching } = useColorQuery();
    const { mutateAsync: deleteColor } = useColorDelMutation();

    const { page, setPage, limit, setLimit, search, setSearch, type, setType, resetFilters, sortBy, sortOrder, setSort } =
        useColorFilterStore();

    const hasFilters = !!search || type !== null;
    const modalCreate = useModal();

    const [selected, setSelected] = useState<IColor | null>(null);

    const meta = data?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const { totalItems, totalPages, currentPage } = meta;

    const onDelete = async (id: number) => {
        await deleteColor({ id });
    };

    const onEdit = (item: IColor) => {
        setSelected(item);
        modalCreate.onOpen();
    };

    const handleModalClose = () => {
        setSelected(null);
        modalCreate.onClose();
    };

    return (
        <MainLayout>
            <div className="flex flex-col gap-3 w-full">
                <PageHeader
                    title="Кольори"
                    description="Покриття профілів, ручок і завіс"
                />

                <FiltersBar
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Назва або код кольору"
                    hasFilters={hasFilters}
                    onReset={resetFilters}
                    action={
                        <Button
                            className="w-auto mx-0 py-0 h-[40px]"
                            color="greenDarkgreen"
                            onClick={modalCreate.onOpen}
                        >
                            <PlusSvg width={20} height={20} /> Додати колір
                        </Button>
                    }
                >
                    <SelectorSearch
                        getAndSet={[type, value => setType((value as ColorType) || null)]}
                        options={TYPE_OPTIONS}
                        optionValue="value"
                        optionLabel="label"
                        placeholder="Усі типи"
                        searchable={false}
                        allowClear
                        className="w-[180px]"
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
                                <SortableTh field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Назва</SortableTh>
                                <SortableTh field="code" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Колір</SortableTh>
                                <th>Типи</th>
                                <th className="w-[120px]"></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {data?.colors.map(item => (
                                <TrBody key={item.id}>
                                    <td>{item.name}</td>
                                    <td>
                                        {item.code ? (
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-5 h-5 rounded border border-border"
                                                    style={{ backgroundColor: item.code }}
                                                />
                                                {item.code}
                                            </div>
                                        ) : null}
                                    </td>
                                    <td>
                                        <div className="flex gap-1 flex-wrap">
                                            {item.types.length > 0
                                                ? item.types.map(t => (
                                                    <span
                                                        key={t.id}
                                                        className="px-2 py-0.5 text-xs rounded-full bg-chart-2/15 text-chart-2"
                                                    >
                                                        {COLOR_TYPE_LABELS[t.type]}
                                                    </span>
                                                ))
                                                : null
                                            }
                                        </div>
                                    </td>
                                    <td className="w-[60px]">
                                        <RowActionsCell
                                            onEdit={() => onEdit(item)}
                                            onDelete={() => onDelete(item.id)}
                                        />
                                    </td>
                                </TrBody>
                            ))}
                            <TableStateRows
                                columnCount={COLUMN_COUNT}
                                isPending={isPending}
                                isEmpty={data?.colors.length === 0}
                                hasFilters={hasFilters}
                                onReset={resetFilters}
                                emptyLabel="Кольорів ще немає"
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

            <ColorCreateModal
                {...modalCreate}
                color={selected}
                onClose={handleModalClose}
            />
        </MainLayout>
    );
};

export default ColorScreen;