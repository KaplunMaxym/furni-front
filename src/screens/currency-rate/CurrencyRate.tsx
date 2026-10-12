import MainLayout from '@/ui/layouts/main-layout/MainLatout';
import { useCurrencyRateDelMutation } from '@/screens/currency-rate/hooks/useCurrencyRateDelMutation';
import { useCurrencyRateFilterStore } from '@/store/currency-rate/useCurrencyRateFilter';
import Button from '@/ui/button/Button';
import PlusSvg from '@/assets/plusSvg';
import { Table } from '@/ui/table/table';
import { TrHead } from '@/ui/table/tr-head';
import { TrBody } from '@/ui/table/tr-body';
import { refreshIcon } from '@/assets';
import { cn } from '@/helpers/cn';
import PaginationControl from '@/componets/pagination/Pagination';
import React, { useState } from 'react';
import { useCurrencyRateQuery } from '@/screens/currency-rate/hooks/useCurrencyRateQuery';
import useModal from '@/hooks/useModal';
import { ICurrencyRate } from '@/screens/currency-rate/type/ICurrencyRate';
import CurrencyRateCreateModal from "@/screens/currency-rate/features/modals/modal-create-currency-rate";
import RowActionsCell from '@/ui/table/RowActionsCell';
import PageHeader from "@/ui/page-header/PageHeader";
import SortableTh from '@/ui/table/SortableTh';

const CurrencyRate = () => {
    const { data, isPending } = useCurrencyRateQuery();
    const { mutateAsync: deleteCurrencyRate } = useCurrencyRateDelMutation();

    const { page, setPage, limit, setLimit, sortBy, sortOrder, setSort} = useCurrencyRateFilterStore();
    const modalCreate = useModal();

    const [selected, setSelected] = useState<ICurrencyRate | null>(null);

    const meta = data?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const { totalItems, totalPages, currentPage } = meta;

    const onDelete = async (id: number) => {
        await deleteCurrencyRate({ id });
    };

    const onEdit = (item: ICurrencyRate) => {
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
                    title="Курси валют"
                    description="Курс НБУ, за яким рахується вартість замовлень у гривні"
                />

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    <div className="w-full">
                        <Table>
                            <thead>
                            <TrHead>
                                <SortableTh field="date" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Дата</SortableTh>
                                <SortableTh field="currency" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Валюта</SortableTh>
                                <SortableTh field="rate" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Курс</SortableTh>
                                <th className="w-[120px]"></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {data?.currencyRates.map(item => (
                                <TrBody key={item.id}>
                                    <td>{new Date(item.date).toLocaleDateString('uk-UA')}</td>
                                    <td>{item.currency}</td>
                                    <td>{item.rate.toFixed(4)}</td>
                                    <td className="w-[60px]">
                                        <RowActionsCell
                                            onEdit={() => onEdit(item)}
                                            onDelete={() => onDelete(item.id)}
                                        />
                                    </td>
                                </TrBody>
                            ))}
                            {isPending && (
                                <TrBody>
                                    <td colSpan={4}>
                                        <div className={cn('w-full h-6 animate-spin flex justify-center')}>
                                            <img src={refreshIcon} alt="оновлення" />
                                        </div>
                                    </td>
                                </TrBody>
                            )}
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

            <CurrencyRateCreateModal
                {...modalCreate}
                currencyRate={selected}
                onClose={handleModalClose}
            />
        </MainLayout>
    );
};

export default CurrencyRate;