import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import {useGlassFillDelMutation} from "@/screens/glass-fill/hooks/useGlassFillDelMutation";
import {useGlassFillFilterStore} from "@/store/glass-fill/useGlassFillFilter";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import Button from "@/ui/button/Button";
import PlusSvg from "@/assets/plusSvg";
import {Table} from "@/ui/table/table";
import {TrHead} from "@/ui/table/tr-head";
import {TrBody} from "@/ui/table/tr-body";
import {EditSvg, refreshIcon} from "@/assets";
import ButtonDel from "@/ui/button/ButtonDel";
import {cn} from "@/helpers/cn";
import PaginationControl from "@/componets/pagination/Pagination";
import React, {useState} from "react";
import {useGlassFillQuery} from "@/screens/glass-fill/hooks/useGlassFillQuery";
import useModal from "@/hooks/useModal";
import {IGlassFill} from "@/screens/glass-fill/types/IGlassFill";
import GlassFillCreateModal from "@/screens/glass-fill/features/modals/modal-create-glass-fill";
import GlassPricesModal from "@/screens/glass-fill/features/modals/modal-glass-prices";

const GlassFill = () => {
    const { data: dataGlassFill, isPending: isPendingGlassFill } = useGlassFillQuery();
    const { mutateAsync: mutateAsyncGlassFillDel } = useGlassFillDelMutation();

    const { page, setPage, limit, setLimit } = useGlassFillFilterStore();

    const modalCreateGlassFill = useModal();
    const modalGlassPrices = useModal();

    const [selectedGlassFill, setSelectedGlassFill] = useState<IGlassFill | null>(null);
    const [selectedPricesGlassFill, setSelectedPricesGlassFill] = useState<IGlassFill | null>(null);

    const meta = dataGlassFill?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const selectedForPricesActual = selectedPricesGlassFill
        ? dataGlassFill?.glassFill.find(m => m.id === selectedPricesGlassFill.id) ?? selectedPricesGlassFill
        : null;

    const { totalPages, currentPage } = meta;

    const onDelete = async (id: number) => {
        await mutateAsyncGlassFillDel({ id });
    };

    const onEdit = (glassFill: IGlassFill) => {
        setSelectedGlassFill(glassFill);
        modalCreateGlassFill.onOpen();
    };

    const handleModalClose = () => {
        setSelectedGlassFill(null);
        modalCreateGlassFill.onClose();
    };

    const onOpenPrices = (glassFill: IGlassFill) => {
        setSelectedPricesGlassFill(glassFill);
        modalGlassPrices.onOpen();
    };

    const handlePricesModalClose = () => {
        setSelectedPricesGlassFill(null);
        modalGlassPrices.onClose();
    };

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
                    <Button
                        className={"w-auto mx-0 py-0 h-[40px]"}
                        color={"greenDarkgreen"}
                        onClick={() => {
                            modalCreateGlassFill.onOpen();
                        }}
                    >
                        <PlusSvg width={20} height={20} /> Додати заповнення
                    </Button>
                </div>

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    <div className={"overflow-x-auto w-full"}>
                        <Table>
                            <thead>
                            <TrHead>
                                <th>Тип</th>
                                <th>Товщина</th>
                                <th>Ціни</th>
                                <th className={"w-[120px]"}></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {dataGlassFill?.glassFill.map((item) => (
                                <TrBody key={item.id}>
                                    <td>{item.type}</td>
                                    <td>{item.thickness?.toString() || '-'}</td>
                                    <td>
                                        <button
                                            onClick={() => onOpenPrices(item)}
                                            className="text-xs text-[#0094D5] hover:underline"
                                        >
                                            {item.glassPrices.length > 0
                                                ? `${item.glassPrices.length} / 5 категорій`
                                                : 'Не задано'}
                                        </button>
                                    </td>
                                    <td className={"!p-0 flex flex-row g-2"}>
                                        <Button
                                            className={"min-h-[36px] w-fit"}
                                            color="greenDarkgreen"
                                            onClick={() => onEdit(item)}
                                        >
                                            <img
                                                src={EditSvg}
                                                alt={"редагувати"}
                                                className="w-4 h-4"
                                            />
                                        </Button>

                                        <ButtonDel
                                            onClick={() => onDelete(item.id)}
                                            className={"min-h-[36px]"}
                                        />
                                    </td>
                                </TrBody>
                            ))}
                            {isPendingGlassFill && (
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
                    disabled={isPendingGlassFill}
                />
            </div>

            <GlassFillCreateModal
                {...modalCreateGlassFill}
                glassFill={selectedGlassFill}
                onClose={handleModalClose}
            />

            <GlassPricesModal
                {...modalGlassPrices}
                glassFill={selectedForPricesActual}
                onClose={handlePricesModalClose}
            />

        </MainLayout>
    );
};

export default GlassFill;