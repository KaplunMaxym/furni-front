import React, { useState } from "react";

import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import { Table } from "@/ui/table/table";
import { TrHead } from "@/ui/table/tr-head";
import { TrBody } from "@/ui/table/tr-body";
import Button from "@/ui/button/Button";
import PlusSvg from "@/assets/plusSvg";
import PageHeader from "@/ui/page-header/PageHeader";
import RowActionsCell from "@/ui/table/RowActionsCell";
import TableStateRows from "@/ui/table/TableStateRows";
import useModal from "@/hooks/useModal";
import { useConstructionStatus } from "@/screens/construction/hooks/construction-status/useConstructionStatus";
import { useConstructionStatusDelMutation } from "@/screens/construction/hooks/construction-status/useConstructionStatusMutations";
import ConstructionStatusCreateModal from "@/screens/construction/features/modals/modal-create-construction-status";
import { IConstructionStatus } from "@/screens/construction/type/construction/IConstruction";

/** Скільки колонок у таблиці — для colSpan службових рядків. */
const COLUMN_COUNT = 3;

/**
 * Довідник статусів конструкції.
 *
 * Був лише для читання: статуси заводились сідом, а на екрані стояла таблиця
 * з двох колонок без жодної дії. Тепер тут те саме, що й у статусах замовлень —
 * створення, редагування й видалення.
 */
const ConstructionStatus = () => {
    const { data: statuses, isPending } = useConstructionStatus();
    const { mutateAsync: deleteStatus } = useConstructionStatusDelMutation();

    const modalCreate = useModal();
    const [selected, setSelected] = useState<IConstructionStatus | null>(null);

    const onEdit = (item: IConstructionStatus) => {
        setSelected(item);
        modalCreate.onOpen();
    };

    const onDelete = async (id: number) => {
        await deleteStatus({ id });
    };

    const handleModalClose = () => {
        setSelected(null);
        modalCreate.onClose();
    };

    return (
        <MainLayout>
            <div className="flex flex-col gap-3 w-full">
                <PageHeader
                    title="Статуси конструкцій"
                    description="Довідник станів, через які проходить конструкція"
                    actions={
                        <Button
                            className="w-auto mx-0 py-0 h-[40px]"
                            color="greenDarkgreen"
                            onClick={modalCreate.onOpen}
                        >
                            <PlusSvg width={20} height={20} /> Створити статус
                        </Button>
                    }
                />

                <div className="w-full">
                    <Table>
                        <thead>
                        <TrHead>
                            <th>Код</th>
                            <th>Назва</th>
                            <th className="w-[120px]"></th>
                        </TrHead>
                        </thead>
                        <tbody>
                        {statuses?.map(item => (
                            <TrBody key={item.id}>
                                <td>
                                    <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                                        {item.code}
                                    </span>
                                </td>
                                <td className="font-medium text-foreground">{item.title}</td>
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
                            isEmpty={statuses?.length === 0}
                            hasFilters={false}
                            emptyLabel="Статусів конструкцій ще немає"
                        />
                        </tbody>
                    </Table>
                </div>
            </div>

            <ConstructionStatusCreateModal
                {...modalCreate}
                constructionStatus={selected}
                onClose={handleModalClose}
            />
        </MainLayout>
    );
};

export default ConstructionStatus;
