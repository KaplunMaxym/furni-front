import MainLayout from '@/ui/layouts/main-layout/MainLatout';
import { useProfileServiceDelMutation } from '@/screens/profile-service/hooks/useProfileServiceDelMutation';
import { useProfileServiceFilterStore } from '@/store/profile-service/useProfileServiceFilter';
import SelectorSearch from '@/componets/select/virtualized-list/SelectorSearch';
import Button from '@/ui/button/Button';
import PlusSvg from '@/assets/plusSvg';
import { Table } from '@/ui/table/table';
import { TrHead } from '@/ui/table/tr-head';
import { TrBody } from '@/ui/table/tr-body';
import { cn } from '@/helpers/cn';
import PaginationControl from '@/componets/pagination/Pagination';
import React, { useState } from 'react';
import { useProfileServiceQuery } from '@/screens/profile-service/hooks/useProfileServiceQuery';
import useModal from '@/hooks/useModal';
import {
    IProfileService,
    serviceConditionLabel,
    serviceUnitLabel,
} from '@/screens/profile-service/types/IProfileService';
import ProfileServiceCreateModal from '@/screens/profile-service/features/modals/modal-create-profile-service';
import RowActionsCell from '@/ui/table/RowActionsCell';
import { Badge } from '@/ui/shadcn/badge';
import FiltersBar from '@/ui/filters/FiltersBar';
import TableStateRows from '@/ui/table/TableStateRows';
import { useProfileSystem } from '@/screens/profile-system/hooks/useProfileSystem';
import PageHeader from "@/ui/page-header/PageHeader";
import SortableTh from '@/ui/table/SortableTh';

/** Скільки колонок у таблиці — для colSpan службових рядків. */
const COLUMN_COUNT = 8;

const ProfileService = () => {
    const { data, isPending, isFetching } = useProfileServiceQuery();
    const { mutateAsync: deleteProfileService } = useProfileServiceDelMutation();

    const {
        page, setPage, limit, setLimit,
        search, profileSystemId, setFilter, resetFilters, sortBy, sortOrder, setSort} = useProfileServiceFilterStore();

    const { data: profileSystems } = useProfileSystem();

    const hasFilters = !!search || profileSystemId !== null;
    const modalCreate = useModal();

    const [selected, setSelected] = useState<IProfileService | null>(null);

    const meta = data?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const { totalItems, totalPages, currentPage } = meta;

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
                <PageHeader
                    title="Послуги"
                    description="Роботи, що входять у вартість: різ, фрезерування, збирання"
                />

                <FiltersBar
                    search={search}
                    onSearchChange={value => setFilter('search', value)}
                    searchPlaceholder="Назва або код 1С"
                    hasFilters={hasFilters}
                    onReset={resetFilters}
                    action={
                        <Button
                            className="w-auto mx-0 py-0 h-[40px]"
                            color="greenDarkgreen"
                            onClick={modalCreate.onOpen}
                        >
                            <PlusSvg width={20} height={20} /> Додати послугу
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
                                <SortableTh field="code1C" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Код 1С</SortableTh>
                                <th>Профіль</th>
                                <SortableTh field="unit" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Одиниця</SortableTh>
                                <SortableTh field="pricePerUnit" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Ціна / од.</SortableTh>
                                <SortableTh field="condition" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Умова</SortableTh>
                                <th>Активна</th>
                                <th className="w-[120px]"></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {data?.profileServices.map(item => (
                                <TrBody key={item.id}>
                                    <td>{item.name}</td>
                                    <td className="font-mono text-sm text-muted-foreground">{item.code1C}</td>
                                    <td>{item.profileSystem.title}</td>
                                    <td>{serviceUnitLabel(item.unit)}</td>
                                    <td>{item.pricePerUnit.toFixed(2)} $</td>
                                    <td>{serviceConditionLabel(item.condition)}</td>
                                    <td>
                                        <Badge variant={item.isActive ? 'success' : 'secondary'}>
                                            {item.isActive ? 'Активна' : 'Вимкнена'}
                                        </Badge>
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
                                isEmpty={data?.profileServices.length === 0}
                                hasFilters={hasFilters}
                                onReset={resetFilters}
                                emptyLabel="Послуг ще немає"
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

            <ProfileServiceCreateModal
                {...modalCreate}
                profileService={selected}
                onClose={handleModalClose}
            />
        </MainLayout>
    );
};

export default ProfileService;