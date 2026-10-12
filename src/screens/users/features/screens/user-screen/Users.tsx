import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import useModal from "@/hooks/useModal";
import React, { useState } from "react";
import Button from "@/ui/button/Button";
import PlusSvg from "@/assets/plusSvg";
import { Table } from "@/ui/table/table";
import { TrHead } from "@/ui/table/tr-head";
import { TrBody } from "@/ui/table/tr-body";
import { cn } from "@/helpers/cn";
import { refreshIcon } from "@/assets";
import { useUsersQuery } from "@/screens/users/hooks/user/useUsersQuery";
import { useUserDelMutation } from "@/screens/users/hooks/user/useUserDelMutation";
import UserCreateModal from "@/screens/users/features/user-modals/modal-create-user";
import { IUser } from "@/screens/users/types/user/IUser";
import { useUsersFilterStore } from "@/store/user/user-store/useUsersFilter";
import PaginationControl from "@/componets/pagination/Pagination";
import RowActionsCell from '@/ui/table/RowActionsCell';
import PageHeader from "@/ui/page-header/PageHeader";
import SortableTh from '@/ui/table/SortableTh';

const Users = () => {
    const { data: dataUsers, isPending: isPendingDomain } = useUsersQuery();
    const { mutateAsync: mutateAsyncUserDel } = useUserDelMutation();

    const { page, setPage, limit, setLimit, sortBy, sortOrder, setSort} = useUsersFilterStore();
    const modalCreateUser = useModal();

    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

    const meta = dataUsers?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const { totalItems, totalPages, currentPage } = meta;

    const onEdit = (user: IUser) => {
        setSelectedUser(user);
        modalCreateUser.onOpen();
    };

    const onDelete = async (id: number) => {
        await mutateAsyncUserDel({ id });
    };

    const handleModalClose = () => {
        setSelectedUser(null);
        modalCreateUser.onClose();
    };

    return (
        <MainLayout>
            <div className={"flex flex-col gap-3 w-full"}>
                <PageHeader
                    title="Користувачі"
                    description="Хто має доступ до системи та з якою роллю"
                />

                {/* Вибір кількості рядків переїхав у смугу під таблицею */}
                <div className={"flex gap-4 justify-end items-end"}>
                    <Button
                        className={"w-auto mx-0 py-0 h-[40px]"}
                        color={"greenDarkgreen"}
                        onClick={() => {
                            modalCreateUser.onOpen();
                        }}
                    >
                        <PlusSvg width={20} height={20} /> Додати користувача
                    </Button>
                </div>

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    <div className="w-full">
                        <Table>
                            <thead>
                            <TrHead>
                                <SortableTh field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Ім'я</SortableTh>
                                <SortableTh field="email" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Пошта</SortableTh>
                                <SortableTh field="role" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Роль</SortableTh>
                                <th className={"w-[120px]"}></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {dataUsers?.users.map((item) => (
                                <TrBody key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.email}</td>
                                    <td>{item.role}</td>
                                    <td className="w-[60px]">
                                        <RowActionsCell
                                            onEdit={() => onEdit(item)}
                                            onDelete={() => onDelete(item.id)}
                                        />
                                    </td>
                                </TrBody>
                            ))}
                            {isPendingDomain && (
                                <TrBody>
                                    <td colSpan={5}>
                                        <div
                                            className={cn(
                                                "w-full h-6 animate-spin flex justify-center"
                                            )}
                                        >
                                            <img
                                                src={refreshIcon}
                                                alt={"оновлення"}
                                            />
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
                    limit={Number(limit)}
                    onLimitChange={value => setLimit(String(value))}
                    disabled={isPendingDomain}
                />
            </div>

            <UserCreateModal
                {...modalCreateUser}
                user={selectedUser}
                onClose={handleModalClose}
            />
        </MainLayout>
    );
};

export default Users;