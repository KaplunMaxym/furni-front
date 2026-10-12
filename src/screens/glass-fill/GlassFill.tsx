import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import {useGlassFillDelMutation} from "@/screens/glass-fill/hooks/useGlassFillDelMutation";
import {useGlassFillFilterStore} from "@/store/glass-fill/useGlassFillFilter";
import Button from "@/ui/button/Button";
import PlusSvg from "@/assets/plusSvg";
import {Table} from "@/ui/table/table";
import {TrHead} from "@/ui/table/tr-head";
import {TrBody} from "@/ui/table/tr-body";
import {cn} from "@/helpers/cn";
import PaginationControl from "@/componets/pagination/Pagination";
import React, {useState} from "react";
import {useGlassFillQuery} from "@/screens/glass-fill/hooks/useGlassFillQuery";
import useModal from "@/hooks/useModal";
import {IGlassFill} from "@/screens/glass-fill/types/IGlassFill";
import GlassFillCreateModal from "@/screens/glass-fill/features/modals/modal-create-glass-fill";
import GlassPricesModal from "@/screens/glass-fill/features/modals/modal-glass-prices";
import RowActionsCell from '@/ui/table/RowActionsCell';
import PricesCell from '@/ui/prices/PricesCell';
import { PRICE_CATEGORIES } from '@/screens/glass-fill/types/IGlassPrice';
import FiltersBar from '@/ui/filters/FiltersBar';
import TableStateRows from '@/ui/table/TableStateRows';
import PageHeader from "@/ui/page-header/PageHeader";
import SortableTh from '@/ui/table/SortableTh';

/** Скільки колонок у таблиці — для colSpan службових рядків. */
const COLUMN_COUNT = 5;

const GlassFill = () => {
    const {
        data: dataGlassFill,
        isPending: isPendingGlassFill,
        isFetching: isFetchingGlassFill,
    } = useGlassFillQuery();
    const { mutateAsync: mutateAsyncGlassFillDel } = useGlassFillDelMutation();

    const { page, setPage, limit, setLimit, search, setSearch, resetFilters, sortBy, sortOrder, setSort } =
        useGlassFillFilterStore();

    const modalCreateGlassFill = useModal();
    const modalGlassPrices = useModal();

    const [selectedGlassFill, setSelectedGlassFill] = useState<IGlassFill | null>(null);
    const [selectedPricesGlassFill, setSelectedPricesGlassFill] = useState<IGlassFill | null>(null);

    const meta = dataGlassFill?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const selectedForPricesActual = selectedPricesGlassFill
        ? dataGlassFill?.glassFill.find(m => m.id === selectedPricesGlassFill.id) ?? selectedPricesGlassFill
        : null;

    const { totalItems, totalPages, currentPage } = meta;

    const onDelete = async (id: number) => {
        await mutateAsyncGlassFillDel({ id });
    };

    const onEdit = (glassFill: IGlassFill) => {
        setSelectedGlassFill(glassFill);
        modalCreateGlassFill.onOpen();
    };

    const handleModalClose = () => {
        setSelectedGlassFill(null);
        modalCreateGlassFill.onClose();
    };

    const onOpenPrices = (glassFill: IGlassFill) => {
        setSelectedPricesGlassFill(glassFill);
        modalGlassPrices.onOpen();
    };

    const handlePricesModalClose = () => {
        setSelectedPricesGlassFill(null);
        modalGlassPrices.onClose();
    };

    return (
        <MainLayout>
            <div className={"flex flex-col gap-3 w-full"}>
                <PageHeader
                    title="Скло"
                    description="Заповнення конструкцій та ціни за квадратний метр"
                />

                <FiltersBar
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Назва скла або код 1С"
                    hasFilters={!!search}
                    onReset={resetFilters}
                    action={
                        <Button
                            className={"w-auto mx-0 py-0 h-[40px]"}
                            color={"greenDarkgreen"}
                            onClick={() => {
                                modalCreateGlassFill.onOpen();
                            }}
                        >
                            <PlusSvg width={20} height={20} /> Додати заповнення
                        </Button>
                    }
                />

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    {/* Під час підвантаження показуємо старі рядки приглушено */}
                    <div
                        className={cn(
                            'w-full transition-opacity',
                            isFetchingGlassFill && !isPendingGlassFill && 'opacity-60',
                        )}
                    >
                        <Table>
                            <thead>
                            <TrHead>
                                <SortableTh field="type" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Тип</SortableTh>
                                <SortableTh field="code1C" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Код 1С</SortableTh>
                                <SortableTh field="thickness" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Товщина</SortableTh>
                                <th>Ціни</th>
                                <th className={"w-[120px]"}></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {dataGlassFill?.glassFill.map((item) => (
                                <TrBody key={item.id}>
                                    <td>{item.type}</td>
                                    <td className="font-mono text-sm text-muted-foreground">{item.code1C}</td>
                                    <td>{item.thickness != null ? `${item.thickness} мм` : null}</td>
                                    <td>
                                        <PricesCell
                                            filled={item.glassPrices.length}
                                            total={PRICE_CATEGORIES.length}
                                            onClick={() => onOpenPrices(item)}
                                        />
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
                                isPending={isPendingGlassFill}
                                isEmpty={dataGlassFill?.glassFill.length === 0}
                                hasFilters={!!search}
                                onReset={resetFilters}
                                emptyLabel="Заповнень ще немає"
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
                    disabled={isPendingGlassFill}
                />
            </div>

            <GlassFillCreateModal
                {...modalCreateGlassFill}
                glassFill={selectedGlassFill}
                onClose={handleModalClose}
            />

            <GlassPricesModal
                {...modalGlassPrices}
                glassFill={selectedForPricesActual}
                onClose={handlePricesModalClose}
            />

        </MainLayout>
    );
};

export default GlassFill;