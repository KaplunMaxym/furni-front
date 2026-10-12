import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import useModal from "@/hooks/useModal";
import React, { useState } from "react";
import Button from "@/ui/button/Button";
import PlusSvg from "@/assets/plusSvg";
import { Table } from "@/ui/table/table";
import { TrHead } from "@/ui/table/tr-head";
import { TrBody } from "@/ui/table/tr-body";
import { cn } from "@/helpers/cn";
import PaginationControl from "@/componets/pagination/Pagination";
import {useClientsQuery} from "@/screens/client/hooks/useClientsQuery";
import {useClientDelMutation} from "@/screens/client/hooks/useClientDelMutation";
import {useClientFilterStore} from "@/store/client/useClientFilter";
import ClientCreateModal from "@/screens/client/features/modals/modal-create-client";
import {IClient} from "@/screens/client/types/IClient";
import RowActionsCell from '@/ui/table/RowActionsCell';
import FiltersBar from '@/ui/filters/FiltersBar';
import TableStateRows from '@/ui/table/TableStateRows';
import PageHeader from "@/ui/page-header/PageHeader";
import SortableTh from '@/ui/table/SortableTh';
import DealerCreateModal from "@/screens/client/features/modals/modal-create-dealer";
import {PRICE_CATEGORIES} from "@/screens/order/types/order/IOrderForm";

/** Скільки колонок у таблиці — для colSpan службових рядків. */
const COLUMN_COUNT = 7;

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
    PRICE_CATEGORIES.map(category => [category.value, category.label]),
);

const Clients = () => {
    const { data: dataUsers, isPending: isPendingDomain, isFetching } = useClientsQuery();
    const { mutateAsync: mutateAsyncClientDel } = useClientDelMutation();

    const { page, setPage, limit, setLimit, search, setSearch, resetFilters, sortBy, sortOrder, setSort } =
        useClientFilterStore();
    const modalCreateClient = useModal();
    const modalCreateDealer = useModal();

    const [selectedClient, setSelectedClient] = useState<IClient | null>(null);

    const meta = dataUsers?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const { totalItems, totalPages, currentPage } = meta;

    const onEdit = (client: IClient) => {
        setSelectedClient(client);
        modalCreateClient.onOpen();
    };

    const onDelete = async (id: number) => {
        await mutateAsyncClientDel({ id });
    };

    const handleModalClose = () => {
        setSelectedClient(null);
        modalCreateClient.onClose();
    };

    return (
        <MainLayout>
            <div className={"flex flex-col gap-3 w-full"}>
                <PageHeader
                    title="Клієнти"
                    description="Замовники, їх контакти та коди 1С"
                />

                <FiltersBar
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="ПІБ, код 1С, пошта або телефон"
                    hasFilters={!!search}
                    onReset={resetFilters}
                    action={
                        /*
                         * Дилер — це той самий клієнт, тільки з власним входом,
                         * тож кнопка стоїть тут, а не в «Користувачах»: інакше
                         * довелося б спершу завести клієнта, потім піти в інший
                         * розділ і згадати, до кого його привʼязати.
                         */
                        <div className="flex gap-2">
                            <Button
                                className={"w-auto mx-0 py-0 h-[40px]"}
                                color={"grayGreen"}
                                onClick={() => modalCreateDealer.onOpen()}
                            >
                                <PlusSvg width={20} height={20} /> Створити дилера
                            </Button>
                            <Button
                                className={"w-auto mx-0 py-0 h-[40px]"}
                                color={"greenDarkgreen"}
                                onClick={() => {
                                    modalCreateClient.onOpen();
                                }}
                            >
                                <PlusSvg width={20} height={20} /> Додати клієнта
                            </Button>
                        </div>
                    }
                />

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    {/* Під час підвантаження показуємо старі рядки приглушено */}
                    <div
                        className={cn(
                            "w-full transition-opacity",
                            isFetching && !isPendingDomain && "opacity-60",
                        )}
                    >
                        <Table>
                            <thead>
                            <TrHead>
                                {/*
                                  * ПІБ однією колонкою.
                                  *
                                  * Ім'я, прізвище й по батькові стояли трьома
                                  * окремими колонками, і після появи категорії
                                  * та доступу таблиця розповзлася на дев'ять —
                                  * останні виїжджали за екран. Читають їх усе
                                  * одно разом, а сортування по батькові не
                                  * потрібне нікому.
                                  */}
                                <SortableTh field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>ПІБ</SortableTh>
                                <SortableTh field="code1C" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Код 1С</SortableTh>
                                <SortableTh field="email" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Пошта</SortableTh>
                                <SortableTh field="phone" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Телефон</SortableTh>
                                {/* Селекти не сортуються — це не поле, а довідник */}
                                <th>Категорія</th>
                                <th>Доступ</th>
                                <th className={"w-[120px]"}></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {dataUsers?.clients.map((item) => (
                                <TrBody key={item.id}>
                                    <td>
                                        {[item.lastName, item.firstName, item.middleName]
                                            .filter(Boolean)
                                            .join(' ')}
                                    </td>
                                    <td className="font-mono text-sm text-muted-foreground">{item.code1C}</td>
                                    <td>{item.email}</td>
                                    {/* Клітинка телефону загубилась при додаванні
                                        категорії — і всі колонки після неї
                                        показували чужі дані на один стовпець лівіше */}
                                    <td>{item.phone}</td>
                                    <td className="text-muted-foreground">
                                        {/*
                                          * Без прочерку: категорія тепер не в
                                          * усіх, і колонка з рискою в кожному
                                          * другому рядку читалась як помилка,
                                          * хоч порожньо тут — норма
                                          */}
                                        {item.priceCategory ? CATEGORY_LABELS[item.priceCategory] : ''}
                                    </td>
                                    <td>
                                        {/*
                                          * Наявність входу і є ознакою дилера — окремого
                                          * поля «це дилер» немає навмисно, воно могло б
                                          * розійтися з дійсністю
                                          */}
                                        {item.user ? (
                                            <span
                                                title={item.user.email}
                                                className="rounded-md border border-input px-2 py-0.5 text-xs text-foreground"
                                            >
                                                Дилер
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Без входу</span>
                                        )}
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
                                isPending={isPendingDomain}
                                isEmpty={dataUsers?.clients.length === 0}
                                hasFilters={!!search}
                                onReset={resetFilters}
                                emptyLabel="Клієнтів ще немає"
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
                    disabled={isPendingDomain}
                />
            </div>

            <ClientCreateModal
                {...modalCreateClient}
                client={selectedClient}
                onClose={handleModalClose}
            />

            <DealerCreateModal {...modalCreateDealer} />
        </MainLayout>
    );
};

export default Clients;