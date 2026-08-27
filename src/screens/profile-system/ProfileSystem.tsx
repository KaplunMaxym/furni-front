import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import { useGlassFillFilterStore } from "@/store/glass-fill/useGlassFillFilter";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import { Table } from "@/ui/table/table";
import { TrHead } from "@/ui/table/tr-head";
import { TrBody } from "@/ui/table/tr-body";
import { refreshIcon } from "@/assets";
import { cn } from "@/helpers/cn";
import PaginationControl from "@/componets/pagination/Pagination";
import React from "react";
import { useProfileSystemQuery } from "@/screens/profile-system/hooks/useProfileSystemQuery";
import {useNavigate} from "react-router";

const ProfileSystem = () => {
    const { data: dataProfileSystem, isPending: isPendingProfileSystem } = useProfileSystemQuery();
    const { page, setPage, limit, setLimit } = useGlassFillFilterStore();
    const navigate = useNavigate();

    const meta = dataProfileSystem?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const { totalPages, currentPage } = meta;

    return (
        <MainLayout>
            <div className={"flex flex-col gap-3 w-full"}>
                <div className={"flex gap-4 justify-between items-end"}>
                    <div className={"flex flex-row gap-4"}>
                        <SelectorSearch
                            getAndSet={[limit, setLimit]}
                            searchable={false}
                            className={'w-[80px]'}
                            options={[20, 40, 60, 80]}
                        />
                    </div>
                </div>

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    <div className={"overflow-x-auto w-full"}>
                        <Table>
                            <thead>
                            <TrHead>
                                <th>Назва</th>
                                <th>Код</th>
                                <th>Мін. ширина</th>
                                <th>Макс. ширина</th>
                                <th>Мін. висота</th>
                                <th>Макс. висота</th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {dataProfileSystem?.profileSystem.map((item) => (
                                <TrBody
                                    key={item.id}
                                    className={"cursor-pointer hover:bg-green-50 transition-colors"}
                                    onClick={() => navigate(`/profile-system/${item.id}`)}
                                >
                                    <td className="font-medium text-gray-900">{item.title}</td>
                                    <td>
                                        <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                            {item.code}
                                        </span>
                                    </td>
                                    <td>{item.minWidth != null ? `${item.minWidth} мм` : '—'}</td>
                                    <td>{item.maxWidth != null ? `${item.maxWidth} мм` : '—'}</td>
                                    <td>{item.minHeight != null ? `${item.minHeight} мм` : '—'}</td>
                                    <td>{item.maxHeight != null ? `${item.maxHeight} мм` : '—'}</td>
                                </TrBody>
                            ))}
                            {isPendingProfileSystem && (
                                <TrBody>
                                    <td colSpan={6}>
                                        <div className={cn("w-full h-6 animate-spin flex justify-center")}>
                                            <img src={refreshIcon} alt={"оновлення"} />
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
                    disabled={isPendingProfileSystem}
                />
            </div>
        </MainLayout>
    );
};

export default ProfileSystem;