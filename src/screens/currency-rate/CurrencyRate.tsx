import MainLayout from '@/ui/layouts/main-layout/MainLatout';
import { useCurrencyRateDelMutation } from '@/screens/currency-rate/hooks/useCurrencyRateDelMutation';
import { useCurrencyRateFilterStore } from '@/store/currency-rate/useCurrencyRateFilter';
import SelectorSearch from '@/componets/select/virtualized-list/SelectorSearch';
import Button from '@/ui/button/Button';
import PlusSvg from '@/assets/plusSvg';
import { Table } from '@/ui/table/table';
import { TrHead } from '@/ui/table/tr-head';
import { TrBody } from '@/ui/table/tr-body';
import { EditSvg, refreshIcon } from '@/assets';
import ButtonDel from '@/ui/button/ButtonDel';
import { cn } from '@/helpers/cn';
import PaginationControl from '@/componets/pagination/Pagination';
import React, { useState } from 'react';
import { useCurrencyRateQuery } from '@/screens/currency-rate/hooks/useCurrencyRateQuery';
import useModal from '@/hooks/useModal';
import { ICurrencyRate } from '@/screens/currency-rate/type/ICurrencyRate';
import CurrencyRateCreateModal from "@/screens/currency-rate/features/modals/modal-create-currency-rate";

const CurrencyRate = () => {
    const { data, isPending } = useCurrencyRateQuery();
    const { mutateAsync: deleteCurrencyRate } = useCurrencyRateDelMutation();

    const { page, setPage, limit, setLimit } = useCurrencyRateFilterStore();
    const modalCreate = useModal();

    const [selected, setSelected] = useState<ICurrencyRate | null>(null);

    const meta = data?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const { totalPages, currentPage } = meta;

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
                <div className="flex gap-4 justify-between items-end">
                    <div className="flex flex-row gap-4">
                        <SelectorSearch
                            getAndSet={[limit, setLimit]}
                            searchable={false}
                            className="w-[80px]"
                            options={[20, 40, 60, 80]}
                        />
                    </div>
                    {/*<Button*/}
                    {/*    className="w-auto mx-0 py-0 h-[40px]"*/}
                    {/*    color="greenDarkgreen"*/}
                    {/*    onClick={modalCreate.onOpen}*/}
                    {/*>*/}
                    {/*    <PlusSvg width={20} height={20} /> Додати курс*/}
                    {/*</Button>*/}
                </div>

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <Table>
                            <thead>
                            <TrHead>
                                <th>Дата</th>
                                <th>Валюта</th>
                                <th>Курс</th>
                                <th className="w-[120px]"></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {data?.currencyRates.map(item => (
                                <TrBody key={item.id}>
                                    <td>{new Date(item.date).toLocaleDateString('uk-UA')}</td>
                                    <td>{item.currency}</td>
                                    <td>{item.rate.toFixed(4)}</td>
                                    <td className="!p-0 flex flex-row gap-2">
                                        <Button
                                            className="min-h-[36px] w-fit"
                                            color="greenDarkgreen"
                                            onClick={() => onEdit(item)}
                                        >
                                            <img
                                                src={EditSvg}
                                                alt="редагувати"
                                                className="w-4 h-4 brightness-0 invert"
                                            />
                                        </Button>
                                        <ButtonDel
                                            onClick={() => onDelete(item.id)}
                                            className="min-h-[36px]"
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