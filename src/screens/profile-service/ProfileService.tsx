import MainLayout from '@/ui/layouts/main-layout/MainLatout';
import { useProfileServiceDelMutation } from '@/screens/profile-service/hooks/useProfileServiceDelMutation';
import { useProfileServiceFilterStore } from '@/store/profile-service/useProfileServiceFilter';
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
import { useProfileServiceQuery } from '@/screens/profile-service/hooks/useProfileServiceQuery';
import useModal from '@/hooks/useModal';
import { IProfileService } from '@/screens/profile-service/types/IProfileService';
import ProfileServiceCreateModal from '@/screens/profile-service/features/modals/modal-create-profile-service';

const ProfileService = () => {
    const { data, isPending } = useProfileServiceQuery();
    const { mutateAsync: deleteProfileService } = useProfileServiceDelMutation();

    const { page, setPage, limit, setLimit } = useProfileServiceFilterStore();
    const modalCreate = useModal();

    const [selected, setSelected] = useState<IProfileService | null>(null);

    const meta = data?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const { totalPages, currentPage } = meta;

    const onDelete = async (id: number) => {
        await deleteProfileService({ id });
    };

    const onEdit = (item: IProfileService) => {
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
                        <PlusSvg width={20} height={20} /> Додати послугу
                    </Button>
                </div>

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <Table>
                            <thead>
                            <TrHead>
                                <th>Назва</th>
                                <th>Профіль</th>
                                <th>Одиниця</th>
                                <th>Ціна / од.</th>
                                <th>Умова</th>
                                <th>Активна</th>
                                <th className="w-[120px]"></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {data?.profileServices.map(item => (
                                <TrBody key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.profileSystem.title}</td>
                                    <td>{item.unit}</td>
                                    <td>{item.pricePerUnit.toFixed(2)} $</td>
                                    <td>{item.condition || '—'}</td>
                                    <td>{item.isActive ? '✓' : '—'}</td>
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
                                    <td colSpan={6}>
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

            <ProfileServiceCreateModal
                {...modalCreate}
                profileService={selected}
                onClose={handleModalClose}
            />
        </MainLayout>
    );
};

export default ProfileService;