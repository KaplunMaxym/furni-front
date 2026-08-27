import MainLayout from '@/ui/layouts/main-layout/MainLatout';
import { useProfileMaterialDelMutation } from '@/screens/profile-material/hooks/useProfileMaterialDelMutation';
import { useProfileMaterialFilterStore } from '@/store/profile-material/useProfileMaterialFilter';
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
import { useProfileMaterialQuery } from '@/screens/profile-material/hooks/useProfileMaterialQuery';
import useModal from '@/hooks/useModal';
import { IProfileMaterial } from '@/screens/profile-material/types/IProfileMaterial';
import ProfileMaterialCreateModal from '@/screens/profile-material/features/modals/modal-create-profile-material';
import ProfileMaterialPricesModal from '@/screens/profile-material/features/modals/modal-material-prices';

const ProfileMaterialScreen = () => {
    const { data, isPending } = useProfileMaterialQuery();
    const { mutateAsync: deleteMaterial } = useProfileMaterialDelMutation();

    const { page, setPage, limit, setLimit } = useProfileMaterialFilterStore();
    const modalCreate = useModal();
    const modalPrices = useModal();

    const [selected, setSelected] = useState<IProfileMaterial | null>(null);
    const [selectedForPrices, setSelectedForPrices] = useState<IProfileMaterial | null>(null);

    const meta = data?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const selectedForPricesActual = selectedForPrices
        ? data?.profileMaterials.find(m => m.id === selectedForPrices.id) ?? selectedForPrices
        : null;

    const { totalPages, currentPage } = meta;

    const onDelete = async (id: number) => {
        await deleteMaterial({ id });
    };

    const onEdit = (item: IProfileMaterial) => {
        setSelected(item);
        modalCreate.onOpen();
    };

    const onOpenPrices = (item: IProfileMaterial) => {
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
                        <PlusSvg width={20} height={20} /> Додати матеріал
                    </Button>
                </div>

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <Table>
                            <thead>
                            <TrHead>
                                <th>Артикул</th>
                                <th>Назва</th>
                                <th>Профіль</th>
                                <th>Колір</th>
                                <th>Довжина балки</th>
                                <th>Ціни</th>
                                <th className="w-[120px]"></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {data?.profileMaterials.map(item => (
                                <TrBody key={item.id}>
                                    <td className="font-mono text-sm">{item.articleCode}</td>
                                    <td>{item.name}</td>
                                    <td>
                                        {item.systemDetails.length > 0
                                            ? [...new Map(
                                                item.systemDetails.map(sd => [
                                                    sd.profileSystemDetail.profileSystem.id,
                                                    sd.profileSystemDetail.profileSystem.title
                                                ])
                                            ).values()].join(', ')
                                            : '—'}
                                    </td>
                                    <td>
                                        {item.color ? (
                                            <div className="flex items-center gap-2">
                                                {item.color.code && (
                                                    <div
                                                        className="w-4 h-4 rounded-full border border-gray-300"
                                                        style={{ backgroundColor: item.color.code }}
                                                    />
                                                )}
                                                {item.color.name}
                                            </div>
                                        ) : '—'}
                                    </td>
                                    <td>{item.beamLength} мм</td>
                                    <td>
                                        <button
                                            onClick={() => onOpenPrices(item)}
                                            className="text-xs text-[#0094D5] hover:underline"
                                        >
                                            {item.prices.length > 0
                                                ? `${item.prices.length} / 5 категорій`
                                                : 'Не задано'}
                                        </button>
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

            <ProfileMaterialCreateModal
                {...modalCreate}
                profileMaterial={selected}
                onClose={handleCreateClose}
            />

            <ProfileMaterialPricesModal
                {...modalPrices}
                profileMaterial={selectedForPricesActual}
                onClose={handlePricesClose}
            />
        </MainLayout>
    );
};

export default ProfileMaterialScreen;