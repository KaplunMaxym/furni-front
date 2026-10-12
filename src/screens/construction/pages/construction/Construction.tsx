import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import useModal from "@/hooks/useModal";
import React, { useState } from "react";
import Button from "@/ui/button/Button";
import PlusSvg from "@/assets/plusSvg";
import { Table } from "@/ui/table/table";
import { TrHead } from "@/ui/table/tr-head";
import { TrBody } from "@/ui/table/tr-body";
import { cn } from "@/helpers/cn";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import PaginationControl from "@/componets/pagination/Pagination";
import ConstructionCreateModal from "@/screens/construction/features/modals/modal-create-update-construction/ modal-create-сonstruction";
import {useConstructionDelMutation} from "@/screens/construction/hooks/construction/useConstructionDelMutation";
import {IConstruction} from "@/screens/construction/type/construction/IConstruction";
import {useConstructionQuery} from "@/screens/construction/hooks/construction/useConstructionQuery";
import {useConstructionFilterStore} from "@/store/construction/construction-fiter/useConstructionFilter";
import {formatDateTime} from "@/utils/time/formatDateTime";
import {useConstructionStatus} from "@/screens/construction/hooks/construction-status/useConstructionStatus";
import {useConstructionUpdateMutation} from "@/screens/construction/hooks/construction/useConstructionUpdateMutation";
import {Eye} from "lucide-react";
import {useNavigate} from "react-router";
import RowActionsCell from '@/ui/table/RowActionsCell';
import FiltersBar from '@/ui/filters/FiltersBar';
import TableStateRows from '@/ui/table/TableStateRows';
import {useProfileSystem} from "@/screens/profile-system/hooks/useProfileSystem";
import PageHeader from "@/ui/page-header/PageHeader";
import SortableTh from '@/ui/table/SortableTh';
import { DateRangeField } from '@/componets/date-picker/DatePicker';
import {useAuthStore} from "@/store/auth/authReducer";
import {isDealerRole} from "@/config/RoleEnum";

/** Скільки колонок у таблиці — для colSpan службових рядків. */
const COLUMN_COUNT = 9;

const Construction = () => {
    const navigate = useNavigate();

    // Для дилера список звужений до його замовлень — це видно в підписах
    const { role } = useAuthStore();
    const isDealer = isDealerRole(role);

    const {
        data: dataConstruction,
        isPending: isPendingConstruction,
        isFetching,
    } = useConstructionQuery();
    const { data: dataConstructionStatus, isPending: isPendingConstructionStatus } = useConstructionStatus();
    const { data: dataProfileSystem } = useProfileSystem();

    const { mutateAsync: mutateAsyncConstructionDel } = useConstructionDelMutation();
    const { mutateAsync: mutateAsyncUpdateConstruction } = useConstructionUpdateMutation();

    const {
        page, setPage,
        limit, setLimit,
        search, setSearch,
        status, setStatus,
        profileSystemId, setProfileSystemId,
        dateFrom, setDateFrom, dateTo, setDateTo,
        resetFilters, sortBy, sortOrder, setSort} = useConstructionFilterStore();

    const hasFilters = !!search || !!status || !!profileSystemId || !!dateFrom || !!dateTo;

    const modalCreateUser = useModal();

    const [selectedConstruction, setSelectedConstruction] = useState<IConstruction | null>(null);
    const [selectedConstructionStatus, setSelectedConstructionStatus] = useState<Record<string, number>>({});

    const meta = dataConstruction?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const { totalItems, totalPages, currentPage } = meta;

    const onView = (construction: IConstruction) => {
        navigate(`/construction-editor?id=${construction.id}&orderId=${construction.orderId}`);
    };

    const onEdit = (construction: IConstruction) => {
        setSelectedConstruction(construction);
        modalCreateUser.onOpen();
    };

    const onDelete = async (id: number, orderId: number) => {
        await mutateAsyncConstructionDel({
            id: id,
            orderId: orderId
        });
    };

    const handleModalClose = () => {
        setSelectedConstruction(null);
        modalCreateUser.onClose();
    };

    const formattedConstructionStatusOptions = dataConstructionStatus?.map(constructionStatus => ({
        label: constructionStatus.title,
        value: constructionStatus.id
    })) || [];

    const getProgressColor = (progress: number) => {
        if (progress < 25) return 'bg-red/500';
        if (progress < 50) return 'bg-yellow-attentiom/50';
        if (progress < 75) return 'bg-blue/400';
        return 'bg-emerald/500';
    };

    return (
        <MainLayout>
            <div className={"flex flex-col gap-3 w-full"}>
                <PageHeader
                    title="Конструкції"
                    // «Всіх замовлень» — неправда для дилера: список звужений до його власних
                    description={isDealer
                        ? 'Вироби ваших замовлень: розміри, профільна система, стан виготовлення'
                        : 'Вироби всіх замовлень: розміри, профільна система, стан виготовлення'}
                />

                <FiltersBar
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Номер замовлення або конструкції"
                    hasFilters={hasFilters}
                    onReset={resetFilters}
                    action={
                        <Button
                            className={"w-auto mx-0 py-0 h-[40px]"}
                            color={"greenDarkgreen"}
                            onClick={() => {
                                modalCreateUser.onOpen();
                            }}
                        >
                            <PlusSvg width={20} height={20} /> Додати конструкцію
                        </Button>
                    }
                >
                    {!isPendingConstructionStatus && formattedConstructionStatusOptions.length > 0 && (
                        <SelectorSearch
                            getAndSet={[status, (value: string) => setStatus(value || '')]}
                            className={'w-[220px]'}
                            options={formattedConstructionStatusOptions}
                            allowClear={true}
                            placeholder={'Всі статуси'}
                            optionValue="value"
                            optionLabel="label"
                            searchable={true}
                        />
                    )}

                    <SelectorSearch
                        getAndSet={[profileSystemId, (value: string) => setProfileSystemId(value || '')]}
                        className={'w-[220px]'}
                        options={dataProfileSystem}
                        allowClear={true}
                        placeholder={'Усі профільні системи'}
                        optionValue="id"
                        optionLabel="title"
                    />

                    {/* Період створення — один вибір на обидві межі */}
                    <DateRangeField
                        from={dateFrom}
                        to={dateTo}
                        onChange={(from, to) => {
                            setDateFrom(from);
                            setDateTo(to);
                        }}
                        placeholder="Період створення"
                        className="w-[280px]"
                    />
                </FiltersBar>

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    {/* Під час підвантаження показуємо старі рядки приглушено */}
                    <div
                        className={cn(
                            "w-full transition-opacity",
                            isFetching && !isPendingConstruction && "opacity-60",
                        )}
                    >
                        <Table>
                            <thead>
                            <TrHead>
                                <SortableTh field="orderNumber" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Номер замовлення</SortableTh>
                                <SortableTh field="constructionNo" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Номер конструкції</SortableTh>
                                <th>Статус</th>
                                <SortableTh field="width" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Ширина</SortableTh>
                                <SortableTh field="height" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Висота</SortableTh>
                                <SortableTh field="profileSystem" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Профільна система</SortableTh>
                                <SortableTh field="progress" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Прогрес</SortableTh>
                                <SortableTh field="createdAt" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Створено</SortableTh>
                                <th className={"w-[180px]"}></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {dataConstruction?.construction.map((item) => (
                                <TrBody
                                    key={item.id}
                                    onClick={() => onView(item)}
                                    className="cursor-pointer"
                                >
                                    <td>{item.order.orderNumber}</td>
                                    <td>{item.constructionNo}</td>
                                    <td className={'!max-w-[150px]'}>
                                        {!isPendingConstructionStatus ? (
                                            <SelectorSearch
                                                getAndSet={[
                                                    selectedConstructionStatus[item.id] || item.constructionStatus?.id || '',
                                                    async (value: number | string) => {
                                                        if (!value || value === '') return;

                                                        const numericValue = Number(value);

                                                        setSelectedConstructionStatus(prev => ({
                                                            ...prev,
                                                            [item.id]: numericValue
                                                        }));

                                                        try {
                                                            await mutateAsyncUpdateConstruction({
                                                                constructionStatusId: numericValue,
                                                                id: item.id,
                                                                orderId: item.orderId
                                                            });
                                                        } catch (error) {
                                                            console.error('Error updating order status:', error);
                                                            setSelectedConstructionStatus(prev => {
                                                                const updated = {...prev};
                                                                delete updated[item.id];
                                                                return updated;
                                                            });
                                                        }
                                                    }
                                                ]}
                                                options={formattedConstructionStatusOptions}
                                                placeholder={'Обрати статус'}
                                                optionValue="value"
                                                optionLabel="label"
                                                isEmptyValueDisable={true}
                                                searchable={true}
                                            />
                                        ) : (
                                            <span className="text-muted-foreground">Завантаження...</span>
                                        )}
                                    </td>
                                    <td>{item.width}</td>
                                    <td>{item.height}</td>
                                    <td>{item.profileSystem.title}</td>
                                    <td>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-xs text-muted-foreground font-medium">Прогрес</span>
                                            <span className="text-xs font-bold text-foreground">
                                                            {item.progress}%
                                                        </span>
                                        </div>
                                        <div className="w-full bg-react/400 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-2 rounded-full transition-all duration-300",
                                                    getProgressColor(Number(item.progress))
                                                )}
                                                style={{ width: `${Math.min(Number(item.progress), 100)}%` }}
                                            />
                                        </div>
                                    </td>
                                    <td>{formatDateTime(item.createdAt)}</td>
                                    <td className="w-[60px]">
                                        <RowActionsCell
                                            onEdit={() => onEdit(item)}
                                            onDelete={() => onDelete(item.id, item.orderId)}
                                            extra={[{
                                                label: 'Переглянути',
                                                icon: <Eye className="h-4 w-4" />,
                                                onSelect: () => onView(item),
                                            }]}
                                        />
                                    </td>
                                </TrBody>
                            ))}
                            <TableStateRows
                                columnCount={COLUMN_COUNT}
                                isPending={isPendingConstruction}
                                isEmpty={dataConstruction?.construction.length === 0}
                                hasFilters={hasFilters}
                                onReset={resetFilters}
                                emptyLabel="Конструкцій ще немає"
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
                    disabled={isPendingConstruction}
                />
            </div>

            <ConstructionCreateModal
                {...modalCreateUser}
                construction={selectedConstruction}
                onClose={handleModalClose}
            />
        </MainLayout>
    );
};

export default Construction;