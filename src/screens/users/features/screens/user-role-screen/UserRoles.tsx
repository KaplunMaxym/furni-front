import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import PlusSvg from "@/assets/plusSvg";
import Button from "@/ui/button/Button";
import {useUserRolesQuery} from "@/screens/users/hooks/role/useUserRolesQuery";
import useModal from "@/hooks/useModal";
import {IUserRoles} from "@/screens/users/types/user-roles/IUserRoles";
import React, {useState} from "react";
import {TrHead} from "@/ui/table/tr-head";
import {TrBody} from "@/ui/table/tr-body";
import { refreshIcon } from "@/assets";
import {cn} from "@/helpers/cn";
import UserRolesCreateModal from "@/screens/users/features/user-roles-modals/modal-create-user-role";
import {Table} from "@/ui/table/table";
import RowActionsCell from '@/ui/table/RowActionsCell';
import PageHeader from "@/ui/page-header/PageHeader";

const UserRoles = () => {
    const { data: dataUserRoles, isPending: isPendingUserRoles } = useUserRolesQuery();

    const modalCreateUserRole = useModal();

    const [selectedUserRole, setSelectedUserRole] = useState<IUserRoles | null>(null);

    const onEdit = (user: IUserRoles) => {
        setSelectedUserRole(user);
        modalCreateUserRole.onOpen();
    };

    const handleModalClose = () => {
        setSelectedUserRole(null);
        modalCreateUserRole.onClose();
    };

    return (
        <MainLayout>
            <div className={"flex flex-col gap-3 w-full"}>
                <PageHeader
                    title="Ролі користувачів"
                    description="Набори прав, які призначаються користувачам"
                />

                <div className={"flex gap-4 justify-end items-end"}>
                    <Button
                        className={"w-auto mx-0 py-0 h-[40px]"}
                        color={"greenDarkgreen"}
                        onClick={() => {
                            modalCreateUserRole.onOpen();
                        }}
                    >
                        <PlusSvg width={20} height={20} /> Додати роль
                    </Button>
                </div>

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    <div className="w-full">
                        <Table>
                            <thead>
                            <TrHead>
                                <th>Назва</th>
                                <th className={"w-[60px]"}></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {dataUserRoles?.roles.map((item) => (
                                <TrBody key={item.id}>
                                    <td>{item.name}</td>
                                    <td className="w-[60px]">
                                        <RowActionsCell onEdit={() => onEdit(item)} />
                                    </td>
                                </TrBody>
                            ))}
                            {isPendingUserRoles && (
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

            </div>

            <UserRolesCreateModal
                {...modalCreateUserRole}
                role={selectedUserRole}
                onClose={handleModalClose}
            />
        </MainLayout>
    )
}

export default UserRoles