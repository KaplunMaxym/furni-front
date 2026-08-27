import MainLayout from '@/ui/layouts/main-layout/MainLatout';
import { useColorFilterStore } from '@/store/color/useColorFilter';
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
import useModal from '@/hooks/useModal';
import { useColorQuery } from '@/screens/catalog/hooks/useColorQuery';
import { useColorDelMutation } from '@/screens/catalog/hooks/useColorDelMutation';
import { IColor } from '@/screens/catalog/types/IColor';
import ColorCreateModal from '@/screens/catalog/features/modals/modal-create-color';
import { COLOR_TYPE_LABELS } from '@/screens/catalog/types/IColor';

const ColorScreen = () => {
    const { data, isPending } = useColorQuery();
    const { mutateAsync: deleteColor } = useColorDelMutation();

    const { page, setPage, limit, setLimit } = useColorFilterStore();
    const modalCreate = useModal();

    const [selected, setSelected] = useState<IColor | null>(null);

    const meta = data?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const { totalPages, currentPage } = meta;

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
                <div className="flex gap-4 justify-between items-end">
                    <div className="flex flex-row gap-4">
                        <SelectorSearch
                            getAndSet={[limit, setLimit]}
                            searchable={false}
                            className="w-[80px]"
                            options={[20, 40, 60, 80]}
                        />
                    </div>
                    <Button
                        className="w-auto mx-0 py-0 h-[40px]"
                        color="greenDarkgreen"
                        onClick={modalCreate.onOpen}
                    >
                        <PlusSvg width={20} height={20} /> Додати колір
                    </Button>
                </div>

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <Table>
                            <thead>
                            <TrHead>
                                <th>Назва</th>
                                <th>Колір</th>
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
                                                    className="w-5 h-5 rounded border border-gray-300"
                                                    style={{ backgroundColor: item.code }}
                                                />
                                                {item.code}
                                            </div>
                                        ) : '—'}
                                    </td>
                                    <td>
                                        <div className="flex gap-1 flex-wrap">
                                            {item.types.length > 0
                                                ? item.types.map(t => (
                                                    <span
                                                        key={t.id}
                                                        className="px-2 py-0.5 text-xs rounded-full bg-[#F0F4CE] text-[#596B00]"
                                                    >
                                                        {COLOR_TYPE_LABELS[t.type]}
                                                    </span>
                                                ))
                                                : '—'
                                            }
                                        </div>
                                    </td>
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

            <ColorCreateModal
                {...modalCreate}
                color={selected}
                onClose={handleModalClose}
            />
        </MainLayout>
    );
};

export default ColorScreen;