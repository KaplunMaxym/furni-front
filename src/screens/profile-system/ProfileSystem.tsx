import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import { Table } from "@/ui/table/table";
import { TrHead } from "@/ui/table/tr-head";
import { TrBody } from "@/ui/table/tr-body";
import { cn } from "@/helpers/cn";
import PaginationControl from "@/componets/pagination/Pagination";
import React, { useState } from "react";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router";

import { useProfileSystemQuery } from "@/screens/profile-system/hooks/useProfileSystemQuery";
import { useProfileSystemFilterStore } from "@/store/profile-system/useProfileSystemFilter";
import { IProfileSystem } from "@/screens/profile-system/types/profile-system/IProfileSystem";
import ProfileSystemQuickEditModal from "@/screens/profile-system/features/modals/modal-quick-edit-profile-system";
import useModal from "@/hooks/useModal";
import FiltersBar from "@/ui/filters/FiltersBar";
import TableStateRows from "@/ui/table/TableStateRows";
import RowActionsCell from "@/ui/table/RowActionsCell";
import PageHeader from "@/ui/page-header/PageHeader";
import SortableTh from '@/ui/table/SortableTh';

/** Скільки колонок у таблиці — для colSpan службових рядків. */
const COLUMN_COUNT = 8;

const ProfileSystem = () => {
    const {
        data: dataProfileSystem,
        isPending: isPendingProfileSystem,
        isFetching,
    } = useProfileSystemQuery();

    const { page, setPage, limit, setLimit, search, setSearch, resetFilters, sortBy, sortOrder, setSort } =
        useProfileSystemFilterStore();

    const navigate = useNavigate();
    const modalEdit = useModal();

    const [selected, setSelected] = useState<IProfileSystem | null>(null);

    const meta = dataProfileSystem?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const { totalItems, totalPages, currentPage } = meta;

    const onOpen = (item: IProfileSystem) => navigate(`/profile-system/${item.id}`);

    const onEdit = (item: IProfileSystem) => {
        setSelected(item);
        modalEdit.onOpen();
    };

    const handleModalClose = () => {
        setSelected(null);
        modalEdit.onClose();
    };

    return (
        <MainLayout>
            <div className={"flex flex-col gap-3 w-full"}>
                <PageHeader
                    title="Профільні системи"
                    description="Основа виробу: деталі, аксесуари, операції та габаритні межі"
                />

                <FiltersBar
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Назва, код або код 1С"
                    hasFilters={!!search}
                    onReset={resetFilters}
                />

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    {/* Під час підвантаження показуємо старі рядки приглушено */}
                    <div
                        className={cn(
                            "w-full transition-opacity",
                            isFetching && !isPendingProfileSystem && "opacity-60",
                        )}
                    >
                        <Table>
                            <thead>
                            <TrHead>
                                <SortableTh field="title" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Назва</SortableTh>
                                <SortableTh field="code" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Код</SortableTh>
                                <SortableTh field="code1C" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Код 1С</SortableTh>
                                <SortableTh field="minWidth" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Мін. ширина</SortableTh>
                                <SortableTh field="maxWidth" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Макс. ширина</SortableTh>
                                <SortableTh field="minHeight" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Мін. висота</SortableTh>
                                <SortableTh field="maxHeight" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Макс. висота</SortableTh>
                                <th className="w-[120px]"></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {dataProfileSystem?.profileSystem.map((item) => (
                                <TrBody
                                    key={item.id}
                                    className="cursor-pointer"
                                    onClick={() => onOpen(item)}
                                >
                                    <td className="font-medium text-foreground">{item.title}</td>
                                    <td>
                                        <span className="font-mono text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                                            {item.code}
                                        </span>
                                    </td>
                                    <td className="font-mono text-sm text-muted-foreground">{item.code1C}</td>
                                    <td>{item.minWidth != null ? `${item.minWidth} мм` : null}</td>
                                    <td>{item.maxWidth != null ? `${item.maxWidth} мм` : null}</td>
                                    <td>{item.minHeight != null ? `${item.minHeight} мм` : null}</td>
                                    <td>{item.maxHeight != null ? `${item.maxHeight} мм` : null}</td>
                                    <td className="w-[60px]">
                                        {/* Видалення немає навмисно: на систему спираються
                                            конструкції, деталі й програми CNC */}
                                        <RowActionsCell
                                            onEdit={() => onEdit(item)}
                                            extra={[{
                                                label: 'Відкрити систему',
                                                icon: <Eye className="h-4 w-4" />,
                                                onSelect: () => onOpen(item),
                                            }]}
                                        />
                                    </td>
                                </TrBody>
                            ))}

                            <TableStateRows
                                columnCount={COLUMN_COUNT}
                                isPending={isPendingProfileSystem}
                                isEmpty={dataProfileSystem?.profileSystem.length === 0}
                                hasFilters={!!search}
                                onReset={resetFilters}
                                emptyLabel="Профільних систем ще немає"
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
                    disabled={isPendingProfileSystem}
                />
            </div>

            <ProfileSystemQuickEditModal
                {...modalEdit}
                profileSystem={selected}
                onClose={handleModalClose}
            />
        </MainLayout>
    );
};

export default ProfileSystem;
