import React, {FC, useState} from "react";
import { useParams, useNavigate } from "react-router";
import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import Button from "@/ui/button/Button";
import {ArrowLeft, Edit2, Plus, Eye, ChevronDown, Download, Copy} from "lucide-react";
import Loading from "@/ui/loading/Loading";
import useModal from "@/hooks/useModal";
import OrderCreateModal from "@/screens/order/features/order-modals/modal-create-order";
import { useOrderDelMutation } from "@/screens/order/hooks/order/useOrderDelMutation";
import { useOrderDetails } from "@/screens/order/hooks/order/useOrderDetails";
import { formatDateTime } from "@/utils/time/formatDateTime";
import { useConstructionByOrder } from "@/screens/construction/hooks/construction/useConstructionByOrder";
import {IConstruction, IConstructionDetails} from "@/screens/construction/type/construction/IConstruction";
import { useConstructionDelMutation } from "@/screens/construction/hooks/construction/useConstructionDelMutation";
import { useOrderUpdateMutation } from "@/screens/order/hooks/order/useOrderUpdateMutation";
import { useOrderStatus } from "@/screens/order/hooks/order-status/useOrderStatus";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import { cn } from "@/helpers/cn";
import ButtonDel from "@/ui/button/ButtonDel";
import PlusSvg from "@/assets/plusSvg";
import ConstructionDetailsView from "@/screens/order/component/ConstructionDetailsView";
import {useConstructionDetailOperationCompleteMutation} from "@/screens/construction/hooks/construction-details/useConstructionDetailOperationCompleteMutation";
import {useConstructionDetailCompleteMutation} from "@/screens/construction/hooks/construction-details/useConstructionDetailCompleteMutation";
import ConstructionCreateModal from "@/screens/construction/features/modals/modal-create-update-construction/ modal-create-сonstruction";
import ConstructionDetailModal from "@/screens/construction/features/modals/construction-details-modal/construction-details-modal";
import {useGcode} from "@/screens/construction/hooks/gcode/useGcode";
import toast from "react-hot-toast";
import {useGcodeByDetail} from "@/screens/construction/hooks/gcode/useGcodeByDetail";
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import {useConstructionDetailDownloadMutation} from "@/screens/construction/hooks/construction-details/useConstructionDetailDownloadMutation";
import {
    generateBarLabelsPdf,
    generateConstructionPdf, generateSingleDetailLabelPdf,
} from "@/screens/construction/features/editor/utils/labelGenerator";
import GCodeSelectionModal from "@/screens/order/features/gcode/gcode-selection-modal";
import {
    IOrderCostAccessoryItem,
    IOrderCostConstructionGroup,
    IOrderCostGlassItem,
    IOrderCostServiceItem
} from "@/screens/order/types/order/IOrder";
import {useAuthStore} from "@/store/auth/authReducer";
import {RoleEnum} from "@/config/RoleEnum";
import {CutPlanBlock} from "@/screens/order/component/CutPlanBlock";
import OrderCostBlock from "@/screens/order/component/OrderCostBlock";
import { PRICE_CATEGORIES } from "@/screens/order/types/order/IOrderForm";
import RecalculateButton from "@/screens/order/component/RecalculateButton";
import {downloadSpecificationPdf} from "@/screens/order/component/SpecificationPdf";
import {downloadCutPlanPdf, generateCutPlanPdfBlob} from "@/screens/order/component/CutPlanPdf";
import {useBarCutGcode} from "@/screens/order/hooks/order/useBarCutGcode";

type GCodeItem = {
    operationId: number;
    operationType: string;
    operationTitle: string | null;
    code: string;
    fileName: string;
};

const OrderDetails: FC = () => {
    const { id } = useParams<{ id: string }>();
    const orderId = Number(id);
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const canSeeCost = role !== RoleEnum.STRUCTURAL_ENGINEER;

    const modalEditOrder = useModal();
    const modalConstructionDetails = useModal();
    const modalCreateOrderConstruction = useModal();
    const modalGCodeSelection = useModal();

    const [isDownloadingCutGCode, setIsDownloadingCutGCode] = useState(false);
    const [isDownloadingCutSingleGCode, setIsDownloadingCutSingleGCode] = useState(false);
    const [selectedConstructionForDetails, setSelectedConstructionForDetails] = useState<number | null>(null);
    const [selectedConstruction, setSelectedConstruction] = useState<IConstruction | null>(null);
    const [expandedConstructionDetails, setExpandedConstructionDetails] = useState<Set<number>>(new Set());
    const [selectedOrderStatus, setSelectedOrderStatus] = useState<Record<string, number>>({});
    const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
    const [isDownloadingLabels, setIsDownloadingLabels] = useState(false);
    const [isDownloadingGCode, setIsDownloadingGCode] = useState(false);
    const [expandedConstructionCost, setExpandedConstructionCost] = useState<Set<number>>(new Set());
    const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
    const [selectedPriceCategory, setSelectedPriceCategory] = useState<string>('');

    const { data: order, isPending: isPendingOrder, isError, error } = useOrderDetails(orderId);
    const { data: orderConstruction, isPending: isPendingOrderConstruction, refetch: refetchConstructions } = useConstructionByOrder(orderId);
    const { data: dataOrderStatus, isPending: isPendingOrderStatus } = useOrderStatus();

    const { mutateAsync: downloadGCode } = useGcode();
    const { mutateAsync: getBarCutGcode } = useBarCutGcode();
    const { mutateAsync: getGcodeForDetail } = useGcodeByDetail();
    const { mutateAsync: deleteOrder, isPending: isDeleting } = useOrderDelMutation();
    const { mutateAsync: deleteConstruction, isPending: isDeletingConstruction } = useConstructionDelMutation();
    const { mutateAsync: mutateAsyncUpdateOrder } = useOrderUpdateMutation();

    const { mutateAsync: completeOperation } = useConstructionDetailOperationCompleteMutation();
    const { mutateAsync: completeDetail } = useConstructionDetailCompleteMutation();
    const { mutateAsync: downloadLabelByDetail } = useConstructionDetailDownloadMutation();

    const handleBack = () => {
        navigate('/order');
    };

    const handleEdit = () => {
        modalEditOrder.onOpen();
    };

    const handleDelete = async () => {
        if (!orderId || isDeleting) return;

        try {
            await deleteOrder({ id: orderId });
            navigate('/order');
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    const handleDeleteConstruction = async (constructionId: number) => {
        if (isDeletingConstruction) return;

        try {
            await deleteConstruction({
                id: constructionId,
                orderId: orderId,
            });
            await refetchConstructions();
        } catch (error) {
            console.error("Error deleting construction:", error);
        }
    };

    const handlePriceCategoryChange = async (value: string) => {
        if (!value) return;
        try {
            await mutateAsyncUpdateOrder({ priceCategory: value, id: orderId });
        } catch (error) {
            console.error('Error updating price category:', error);
        }
    };

    const handleDownloadSpecification = () => {
        if (!order) return;
        downloadSpecificationPdf(order, orderConstruction ?? []);
    };

    const toggleConstructionCost = (constructionId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const next = new Set(expandedConstructionCost);
        if (next.has(constructionId)) {
            next.delete(constructionId);
        } else {
            next.add(constructionId);
        }
        setExpandedConstructionCost(next);
    };

    const handleEditClose = async () => {
        modalEditOrder.onClose();
    };

    const handleEditConstruction = (construction: IConstruction) => {
        setSelectedConstruction(construction);
        modalCreateOrderConstruction.onOpen();
    };

    const handleCreateConstruction = () => {
        setSelectedConstruction(null);
        modalCreateOrderConstruction.onOpen();
    };

    const getConstructionCost = (constructionId: number): IOrderCostConstructionGroup | null => {
        if (!order?.cost?.byConstruction) return null;
        return order.cost.byConstruction.find(
            (g: IOrderCostConstructionGroup) => g.constructionId === constructionId
        ) ?? null;
    };

    const handleConstructionModalClose = async () => {
        setSelectedConstruction(null);
        modalCreateOrderConstruction.onClose();
        await refetchConstructions();
    };

    const handleViewConstruction = (constructionId: number) => {
        navigate(`/construction-editor?id=${constructionId}&orderId=${orderId}`);
    };

    const toggleConstructionDetails = (constructionId: number) => {
        const newExpanded = new Set(expandedConstructionDetails);
        if (newExpanded.has(constructionId)) {
            newExpanded.delete(constructionId);
        } else {
            newExpanded.add(constructionId);
        }
        setExpandedConstructionDetails(newExpanded);
    };

    const handleDetailClick = (constructionId: number, detailId: number) => {
        setSelectedConstructionForDetails(constructionId);
        setSelectedDetailId(detailId);
        modalConstructionDetails.onOpen();
    };

    const handleCloseConstructionDetails = async () => {
        setSelectedConstructionForDetails(null);
        setSelectedDetailId(null);
        modalConstructionDetails.onClose();
        await refetchConstructions();
    };

    const handleOperationComplete = async (operationId: number, detailId: number) => {
        try {
            await completeOperation({ operationId, detailId });
            await refetchConstructions();
        } catch (error) {
            console.error('Error completing operation:', error);
        }
    };

    const handleDetailComplete = async (detailId: number) => {
        try {
            await completeDetail(detailId);
            await refetchConstructions();
        } catch (error) {
            console.error('Error completing detail:', error);
        }
    };

    const handleDownloadCutSingleGCode = async () => {
        if (!order?.cost?.cutPlan || !orderConstruction) return;

        setIsDownloadingCutSingleGCode(true);
        try {
            const zip = new JSZip();
            let barCounter = 0;
            let fileCount = 0;
            const errors: string[] = [];

            for (const material of order.cost.cutPlan) {
                for (const bar of material.bars) {
                    barCounter += 1;
                    const barFolder = `Bar_${String(barCounter).padStart(2, '0')}_${material.articleCode}`;

                    const detailPieces: Array<{ detailId: number; offset: number }> = [];
                    let prevUsedSoFar = 0;

                    for (const piece of bar.pieces) {
                        if (piece.detailId == null) {
                            errors.push(`Немає detailId для ${piece.detailCode} — потрібен перерахунок`);
                            prevUsedSoFar = Number(piece.usedSoFar);
                            continue;
                        }

                        const offset = prevUsedSoFar; // стартова X деталі на прутку
                        detailPieces.push({ detailId: piece.detailId, offset });
                        prevUsedSoFar = Number(piece.usedSoFar);
                    }

                    if (detailPieces.length === 0) continue;

                    try {
                        const { code } = await getBarCutGcode(detailPieces);
                        zip.file(
                            `${barFolder}/Bar_${String(barCounter).padStart(2, '0')}_Cut.cnc`,
                            code
                        );
                        fileCount += 1;

                        try {
                            const labelItems: Array<{ construction: IConstruction; detail: IConstructionDetails }> = [];

                            for (const piece of bar.pieces) {
                                if (piece.detailId == null) continue;
                                const construction = orderConstruction.find(c => c.id === piece.constructionId);
                                const detailObj = construction?.details?.find(d => d.id === piece.detailId);

                                if (construction && detailObj?.requiresLabel) {
                                    labelItems.push({ construction, detail: detailObj });
                                }
                            }

                            if (labelItems.length > 0) {
                                const barLabelsBlob = await generateBarLabelsPdf(order, labelItems);
                                if (barLabelsBlob) {
                                    zip.file(
                                        `${barFolder}/Bar_${String(barCounter).padStart(2, '0')}_Labels.pdf`,
                                        barLabelsBlob
                                    );
                                }
                            }
                        } catch (labelError) {
                            errors.push(`Лейбли для прутка ${barCounter}`);
                            console.error('Label error:', labelError);
                        }
                    } catch (e) {
                        errors.push(`G-code прутка ${barCounter}`);
                        console.error('Bar gcode error:', e);
                    }
                }
            }

            try {
                const cutPlanBlob = await generateCutPlanPdfBlob(order.orderNumber, order.cost.cutPlan, orderConstruction);
                zip.file(`Order_${order.orderNumber}_CutPlan.pdf`, cutPlanBlob);
            } catch (cutPlanError) {
                errors.push('PDF розкрою профілю');
                console.error('Cut plan PDF error:', cutPlanError);
            }

            if (fileCount === 0) {
                toast.error('G-code різання не знайдено', { duration: 4000, position: 'top-right' });
                return;
            }

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `Order_${order.orderNumber}_Cut_GCode.zip`);

            toast.success(
                errors.length === 0 ? 'G-code різання завантажено' : `Завантажено (${errors.length} пропущено)`,
                { duration: 3000, position: 'top-right' }
            );
        } catch (error) {
            console.error('Error downloading cut g-code:', error);
            toast.error('Помилка завантаження архіву', { duration: 4000, position: 'top-right' });
        } finally {
            setIsDownloadingCutSingleGCode(false);
        }
    };

    const handleDownloadCutGCode = async () => {
        if (!order?.cost?.cutPlan || !orderConstruction) return;

        setIsDownloadingCutGCode(true);
        try {
            const zip = new JSZip();
            let barCounter = 0;
            let fileCount = 0;
            const errors: string[] = [];

            for (const material of order.cost.cutPlan) {
                for (const bar of material.bars) {
                    barCounter += 1;
                    const barFolder = `Bar_${barCounter}_${material.articleCode}`;

                    let pieceCounter = 0;
                    for (const piece of bar.pieces) {
                        pieceCounter += 1;

                        if (piece.detailId == null) {
                            errors.push(`Немає detailId для ${piece.detailCode} (потрібен перерахунок розкрою)`);
                            continue;
                        }

                        const construction = orderConstruction.find(c => c.id === piece.constructionId);
                        const detailFolder =
                            `${barFolder}/${String(pieceCounter).padStart(2, '0')}_` +
                            `К${construction?.constructionNo ?? piece.constructionId}_${piece.detailCode}`;

                        try {
                            const { gcode } = await getGcodeForDetail(piece.detailId);
                            const cuttingGcode = gcode.filter((item: GCodeItem) => item.operationType === 'CUT');

                            if (cuttingGcode.length === 0) {
                                errors.push(`G-code різання відсутній для ${piece.detailCode}`);
                                continue;
                            }

                            cuttingGcode.forEach((item: GCodeItem) => {
                                zip.file(`${detailFolder}/${item.fileName}`, item.code);
                                fileCount += 1;
                            });

                            const detailObj = construction?.details?.find(d => d.id === piece.detailId);
                            if (construction && detailObj?.requiresLabel) {
                                try {
                                    const labelBlob = await generateSingleDetailLabelPdf(construction, order, detailObj);
                                    if (labelBlob) {
                                        zip.file(`${detailFolder}/Label_${piece.detailCode}.pdf`, labelBlob);
                                    }
                                } catch (labelError) {
                                    errors.push(`Лейбл для ${piece.detailCode}`);
                                    console.error('Label generation error:', labelError);
                                }
                            }
                        } catch (e) {
                            errors.push(`Деталь ${piece.detailCode}`);
                            console.error('GCode error:', e);
                        }
                    }
                }
            }

            try {
                const cutPlanBlob = await generateCutPlanPdfBlob(order.orderNumber, order.cost.cutPlan, orderConstruction);
                zip.file(`Order_${order.orderNumber}_CutPlan.pdf`, cutPlanBlob);
            } catch (cutPlanError) {
                errors.push('PDF розкрою профілю');
                console.error('Cut plan PDF error:', cutPlanError);
            }

            if (fileCount === 0) {
                toast.error('G-code різання не знайдено', { duration: 4000, position: 'top-right' });
                return;
            }

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `Order_${order.orderNumber}_Cut_GCode.zip`);

            toast.success(
                errors.length === 0 ? 'G-code різання завантажено' : `Завантажено (${errors.length} пропущено)`,
                { duration: 3000, position: 'top-right' }
            );
        } catch (error) {
            console.error('Error downloading cut g-code:', error);
            toast.error('Помилка завантаження архіву', { duration: 4000, position: 'top-right' });
        } finally {
            setIsDownloadingCutGCode(false);
        }
    };

    const handleDownloadLabelByDetails = async (detailId: number) => {
        try {
            await downloadLabelByDetail(detailId);
            await refetchConstructions();
        } catch (error) {
            console.error('Error completing detail:', error);
        }
    };

    const handleDownloadBarcode = async () => {
        if (!orderConstruction || !order) return;

        setIsDownloadingLabels(true);

        try {
            const zip = new JSZip();

            for (const construction of orderConstruction) {

                const pdfBlob = await generateConstructionPdf(construction, order);

                const fileName = `Construction_${construction.constructionNo}_Labels.pdf`;

                zip.file(fileName, pdfBlob);
            }

            const content = await zip.generateAsync({ type: "blob" });

            saveAs(content, `Order_${order.orderNumber}_Labels.zip`);

            toast.success("PDF лейбли згенеровані");

        } catch (error) {
            toast.error("Помилка генерації PDF");
            console.error('Error completing detail:', error);
        } finally {
            setIsDownloadingLabels(false);
        }
    };

    const handleCopyConstruction = (construction: IConstruction) => {
        setSelectedConstruction({ ...construction, id: 0 });
        modalCreateOrderConstruction.onOpen();
    };

    const handleDownloadCutPlan = async () => {
        if (!order?.cost?.cutPlan || !orderConstruction) return;
        try {
            await downloadCutPlanPdf(order.orderNumber, order.cost.cutPlan, orderConstruction);
        } catch (e) {
            toast.error("Помилка генерації PDF розкрою");
            console.error(e);
        }
    };

    const handleDownloadGCode = async (operationId: number) => {
        try {
            const { code, fileName } = await downloadGCode(operationId);

            const blob = new Blob([code], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(`G-code завантажено: ${fileName}`, {
                duration: 3000,
                position: 'top-right',
            });
        } catch (error) {
            console.error('Error downloading G-Code:', error);
            toast.error('Помилка завантаження G-Code', {
                duration: 4000,
                position: 'top-right',
            });
        }
    };

    const handleDownloadAllGCode = async (detailId: number) => {
        try {
            const { gcode } = await getGcodeForDetail(detailId);

            if (gcode.length === 0) {
                toast.error('G-code для цієї деталі відсутній', {
                    duration: 3000,
                    position: 'top-right',
                });
                return;
            }

            const zip = new JSZip();

            gcode.forEach((item: GCodeItem) => {
                zip.file(item.fileName, item.code);
            });

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `Detail_${detailId}_GCode.zip`);

            toast.success(`G-code архів завантажено (${gcode.length} файлів)`, {
                duration: 3000,
                position: 'top-right',
            });
        } catch (error) {
            console.error('Error downloading all G-Code:', error);
            toast.error('Помилка завантаження G-Code', {
                duration: 4000,
                position: 'top-right',
            });
        }
    };

    const handleStatusChange = async (statusId: number) => {
        if (!statusId) return;

        try {
            await mutateAsyncUpdateOrder({
                statusId: statusId,
                id: orderId
            });
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const handleDownloadAllOrderData = async () => {
        if (!orderConstruction) return;

        setIsDownloadingGCode(true);
        try {
            const zip = new JSZip();
            const errorDetails: string[] = [];

            for (const construction of orderConstruction) {
                for (const detail of construction.details || []) {
                    try {
                        const { gcode } = await getGcodeForDetail(detail.id);

                        if (gcode.length > 0) {
                            gcode.forEach((item: GCodeItem) => {
                                const filePath =
                                    `Construction_${construction.constructionNo}/` +
                                    `${item.fileName}`;

                                zip.file(filePath, item.code);
                            });
                        }
                    } catch (error) {
                        const errorMsg = `Detail ${detail.detailNo}`;
                        errorDetails.push(errorMsg);
                        console.error(`Error fetching G-code for ${errorMsg}:`, error);
                    }
                }
            }

            if (zip.file(/.*/).length === 0) {
                toast.error('G-code файли не знайдено', {
                    duration: 4000,
                    position: 'top-right',
                });
                return;
            }

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `Order_${order?.orderNumber}_All_GCode.zip`);

            const successMsg = errorDetails.length === 0
                ? 'Всі G-code файли завантажені'
                : `G-code завантажено (${errorDetails.length} помилок)`;

            toast.success(successMsg, {
                duration: 3000,
                position: 'top-right',
            });
        } catch (error) {
            console.error('Error downloading order data:', error);
            toast.error('Помилка завантаження архіву', {
                duration: 4000,
                position: 'top-right',
            });
        } finally {
            setIsDownloadingGCode(false);
        }
    };

    const formattedOrderStatusOptions = dataOrderStatus?.map(orderStatus => ({
        label: orderStatus.title,
        value: orderStatus.id
    })) || [];

    const getProgressColor = (progress: number) => {
        if (progress < 25) return 'bg-red/500';
        if (progress < 50) return 'bg-yellow-attentiom/50';
        if (progress < 75) return 'bg-blue/400';
        return 'bg-emerald/500';
    };

    if (isPendingOrder) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-screen">
                    <Loading />
                </div>
            </MainLayout>
        );
    }

    if (isError || !order) {
        return (
            <MainLayout>
                <div className="flex flex-col gap-4 p-4">
                    <Button
                        onClick={handleBack}
                        className="w-fit"
                        color="gray"
                    >
                        <ArrowLeft size={20} /> Назад до замовлень
                    </Button>
                    <div className="text-red-500 text-center py-8">
                        Помилка завантаження замовлення: {error?.message || 'Невідома помилка'}
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="w-full px-4">
                <div className="w-full max-w-[1800px] mx-auto flex flex-col">
                    <div className="px-4 py-2">
                        <Button
                            onClick={handleBack}
                            color="gray"
                            className="flex gap-2 w-fit ml-0"
                        >
                            <ArrowLeft size={18} />
                            Назад до замовлень
                        </Button>
                    </div>

                    <div className="flex-1 flex gap-6 overflow-hidden px-4 py-2">

                        <div className="w-100 h-[calc(100vh-200px)] flex-shrink-0">
                            <div className="bg-react/600 rounded-xl shadow-sm border border-react/500 overflow-hidden h-full flex flex-col">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Номер замовлення</span>
                                        <span className="text-sm font-bold text-blue-600">{order.orderNumber}</span>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Назва замовлення</label>
                                        <div className="bg-react/500 border border-gray-100 rounded-lg p-3">
                                            <p className="text-sm font-semibold text-gray-900">{order.name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Клієнт</label>
                                        <div className="bg-react/500 border border-gray-100 rounded-lg p-3">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {order.client.firstName} {order.client.lastName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Статус</label>
                                        {!isPendingOrderStatus ? (
                                            <SelectorSearch
                                                getAndSet={[
                                                    selectedOrderStatus[order.id] || order.status?.id || '',
                                                    (value: string | number) => handleStatusChange(Number(value))
                                                ]}
                                                options={formattedOrderStatusOptions}
                                                placeholder="Оберіть статус"
                                                optionValue="value"
                                                optionLabel="label"
                                                searchable={true}
                                                className="w-full border border-gray-100 rounded-lg"
                                            />
                                        ) : (
                                            <div className="text-gray-400 text-sm py-2">Завантаження...</div>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Цінова категорія
                                        </label>
                                        <SelectorSearch
                                            getAndSet={[
                                                selectedPriceCategory || order.priceCategory || 'REPRESENTATIVE',
                                                (value: string | number) => {
                                                    const str = String(value);
                                                    setSelectedPriceCategory(str);
                                                    handlePriceCategoryChange(str);
                                                }
                                            ]}
                                            options={PRICE_CATEGORIES}
                                            placeholder="Оберіть категорію"
                                            optionValue="value"
                                            optionLabel="label"
                                            isEmptyValueDisable={true}
                                            searchable={false}
                                            className="w-full border border-gray-100 rounded-lg"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Створено</label>
                                        <div className="bg-react/500 border border-gray-100 rounded-lg p-3">
                                            <p className="text-sm text-gray-700">
                                                {formatDateTime(order.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-1 py-2 border-t border-gray-100 bg-gray-50 flex gap-2">
                                    <Button
                                        onClick={handleEdit}
                                        color="greenDarkgreen"
                                        className="flex-1 !py-2 text-sm"
                                    >
                                        <Edit2 size={16} /> Редагувати
                                    </Button>
                                    <ButtonDel
                                        onClick={handleDelete}
                                        title={'Видалити'}
                                        className="flex-1 !py-2 text-sm"
                                    >
                                    </ButtonDel>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col min-w-0 min-h-0">
                            <div className="flex flex-row gap-2 items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Конструкції замовлення</h2>

                                <div className="flex gap-2">
                                    {!!orderConstruction?.length && (
                                        <div className="relative">
                                            <Button
                                                color="blue"
                                                className="w-auto mx-0 py-0 h-[40px] gap-1"
                                                onClick={() => setIsDownloadMenuOpen(p => !p)}
                                                disabled={isDownloadingGCode || isDownloadingLabels}
                                            >
                                                <Download size={14} />
                                                {(isDownloadingGCode || isDownloadingLabels) ? 'Завантаження...' : 'Завантажити'}
                                                <ChevronDown
                                                    size={14}
                                                    className={cn("transition-transform duration-200", isDownloadMenuOpen && "rotate-180")}
                                                />
                                            </Button>

                                            {isDownloadMenuOpen && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setIsDownloadMenuOpen(false)}
                                                    />
                                                    <div className="absolute right-0 top-[44px] z-20 bg-react/600 border border-react/500 rounded-xl shadow-lg overflow-hidden min-w-[220px]">
                                                        <button
                                                            onClick={() => {
                                                                handleDownloadAllOrderData();
                                                                setIsDownloadMenuOpen(false);
                                                            }}
                                                            disabled={isDownloadingGCode}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-react/500 transition-colors disabled:opacity-50"
                                                        >
                                                            <Download size={14} className="text-gray-400" />
                                                            G-Code всі файли
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                modalGCodeSelection.onOpen();
                                                                setIsDownloadMenuOpen(false);
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-react/500 transition-colors"
                                                        >
                                                            <Download size={14} className="text-gray-400" />
                                                            G-Code вибірково
                                                        </button>
                                                        {!!order.cost?.cutPlan?.length && (
                                                            <button
                                                                onClick={() => {
                                                                    handleDownloadCutSingleGCode();
                                                                    setIsDownloadMenuOpen(false);
                                                                }}
                                                                disabled={isDownloadingCutSingleGCode}
                                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-react/500 transition-colors disabled:opacity-50"
                                                            >
                                                                <Download size={14} className="text-gray-400" />
                                                                {isDownloadingCutSingleGCode ? 'Завантаження...' : 'G-Code різання'}
                                                            </button>
                                                        )}
                                                        {!!order.cost?.cutPlan?.length && (
                                                            <button
                                                                onClick={() => {
                                                                    handleDownloadCutGCode();
                                                                    setIsDownloadMenuOpen(false);
                                                                }}
                                                                disabled={isDownloadingCutGCode}
                                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-react/500 transition-colors disabled:opacity-50"
                                                            >
                                                                <Download size={14} className="text-gray-400" />
                                                                {isDownloadingCutGCode ? 'Завантаження...' : 'G-Code різання розбито'}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                handleDownloadSpecification();
                                                                setIsDownloadMenuOpen(false);
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-react/500 transition-colors"
                                                        >
                                                            <Download size={14} />
                                                            Специфікація (PDF)
                                                        </button>
                                                        {!!order.cost?.cutPlan?.length && (
                                                            <button
                                                                onClick={() => {
                                                                    handleDownloadCutPlan();
                                                                    setIsDownloadMenuOpen(false);
                                                                }}
                                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-react/500 transition-colors"
                                                            >
                                                                <Download size={14} className="text-gray-400" />
                                                                Розкрій профілю (PDF)
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                handleDownloadBarcode();
                                                                setIsDownloadMenuOpen(false);
                                                            }}
                                                            disabled={isDownloadingLabels}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-react/500 transition-colors disabled:opacity-50"
                                                        >
                                                            <Download size={14} className="text-gray-400" />
                                                            Лейбли (PDF)
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    <RecalculateButton orderId={order.id} />

                                    <Button
                                        className="w-auto mx-0 py-0 h-[40px]"
                                        color="greenDarkgreen"
                                        onClick={handleCreateConstruction}
                                    >
                                        <PlusSvg width={20} height={20} /> Додати конструкцію
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                {canSeeCost && order.cost && (
                                    <OrderCostBlock
                                        cost={order.cost}
                                        constructions={orderConstruction}
                                    />
                                )}

                                {order.cost?.cutPlan && order.cost.cutPlan.length > 0 && (
                                    <CutPlanBlock
                                        cutPlan={order.cost.cutPlan}
                                        constructions={orderConstruction ?? []}
                                    />
                                )}
                            </div>

                            <div className="flex-1 min-h-0 overflow-y-auto bg-react/600 rounded-xl shadow-sm">
                                {isPendingOrderConstruction ? (
                                    <div className="flex justify-center items-center h-full">
                                        <Loading />
                                    </div>
                                ) : orderConstruction && orderConstruction.length > 0 ? (
                                    <div className="divide-y divide-gray-100">
                                        {orderConstruction.map((construction: IConstruction) => (
                                            <div
                                                key={construction.id}
                                                className="border-b border-gray-100 last:border-b-0"
                                            >
                                                <button
                                                    onClick={() => toggleConstructionDetails(construction.id)}
                                                    className="w-full px-6 py-4 gap-2 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        <ChevronDown
                                                            size={20}
                                                            className={cn(
                                                                "flex-shrink-0 transition-transform duration-200",
                                                                expandedConstructionDetails.has(construction.id) ? "rotate-180" : ""
                                                            )}
                                                        />
                                                        <div className="flex-1 min-w-0 text-left">
                                                            <h3 className="text-sm font-bold text-gray-900 truncate">
                                                                Конструкція {construction.constructionNo}
                                                            </h3>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {construction.profileSystem.title} • {construction.width} × {construction.height} мм
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {canSeeCost && (() => {
                                                        const cost = getConstructionCost(construction.id);
                                                        return cost ? (
                                                            <div className="flex flex-col items-end gap-0.5 mx-4 flex-shrink-0">
                                                                <span className="text-sm font-bold text-gray-900">
                                                                    {cost.subtotalUsd.toFixed(2)} $
                                                                </span>
                                                                <span className="text-xs text-gray-400">
                                                                    {cost.subtotalUah.toFixed(0)} ₴
                                                                </span>
                                                            </div>
                                                        ) : null;
                                                    })()}

                                                    <div className="flex flex-col items-center gap-3 ml-4">
                                                        <div className="flex flex-row justify-between flex-row gap-2 items-center items-end">
                                                            <span className="text-xs font-medium text-gray-500">Прогрес</span>
                                                            <span className="text-sm font-bold text-gray-900">
                                                                {construction.progress}%
                                                            </span>
                                                        </div>
                                                        <div className="w-24 h-2 bg-react/400 rounded-full overflow-hidden">
                                                            <div
                                                                className={cn(
                                                                    "h-2 rounded-full transition-all duration-300",
                                                                    getProgressColor(Number(construction.progress))
                                                                )}
                                                                style={{ width: `${Math.min(Number(construction.progress), 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => handleViewConstruction(construction.id)}
                                                            color="blue"
                                                            className="flex-1 !py-1 text-xs"
                                                        >
                                                            <Eye size={16} />
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleEditConstruction(construction)}
                                                            color="greenDarkgreen"
                                                            className="flex-1 !py-1 text-xs"
                                                        >
                                                            <Edit2 size={16} />
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleCopyConstruction(construction)}
                                                            color="blue"
                                                            className="flex-1 !py-1 text-xs"
                                                        >
                                                            <Copy size={16} />
                                                        </Button>
                                                        <ButtonDel
                                                            onClick={() => handleDeleteConstruction(construction.id)}
                                                            className="flex-1 !py-1 text-xs"
                                                        >
                                                        </ButtonDel>
                                                    </div>
                                                </button>

                                                {expandedConstructionDetails.has(construction.id) && (
                                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                                        {canSeeCost && (() => {
                                                            const cost = getConstructionCost(construction.id);
                                                            const isExpanded = expandedConstructionCost.has(construction.id);
                                                            return cost ? (
                                                                <div className="mb-4 bg-white border border-gray-200 rounded-lg overflow-hidden">

                                                                    <button
                                                                        onClick={(e) => toggleConstructionCost(construction.id, e)}
                                                                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                                                                    >
                                                                        <span className="text-sm font-bold text-gray-700">
                                                                            Вартість конструкції
                                                                        </span>
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="text-sm font-bold text-gray-900">
                                                                                {cost.subtotalUsd.toFixed(2)} $
                                                                            </span>
                                                                            <ChevronDown
                                                                                size={16}
                                                                                className={cn(
                                                                                    "text-gray-400 transition-transform duration-200",
                                                                                    isExpanded ? "rotate-180" : ""
                                                                                )}
                                                                            />
                                                                        </div>
                                                                    </button>

                                                                    {isExpanded && (
                                                                        <div className="px-4 pb-4 space-y-3 border-t border-gray-100">

                                                                            {cost.glassItems.length > 0 && (
                                                                                <div className="pt-3">
                                                                                    <p className="text-sm font-semibold text-purple-600 mb-1.5">Скло</p>
                                                                                    {cost.glassItems.map((item: IOrderCostGlassItem) => (
                                                                                        <div key={item.id} className="flex justify-between text-sm text-gray-600 py-0.5 gap-2">
                                                                                            <span className="flex-1 min-w-0">{item.name}</span>
                                                                                            <span className="flex-shrink-0 font-medium">{item.subtotalUsd.toFixed(2)} $</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}

                                                                            {cost.accessoryItems.length > 0 && (
                                                                                <div>
                                                                                    <p className="text-sm font-semibold text-blue-600 mb-1.5">Аксесуари</p>
                                                                                    {cost.accessoryItems.map((item: IOrderCostAccessoryItem) => (
                                                                                        <div key={item.id} className="flex justify-between text-sm text-gray-600 py-0.5 gap-2">
                                                                                            <span className="flex-1 min-w-0">
                                                                                                {item.name}
                                                                                                {item.color && ` (${item.color})`}
                                                                                                {' '}× {item.quantity}
                                                                                            </span>
                                                                                            <span className="flex-shrink-0 font-medium">{item.subtotalUsd.toFixed(2)} $</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}

                                                                            {cost.serviceItems.length > 0 && (
                                                                                <div>
                                                                                    <p className="text-sm font-semibold text-green-600 mb-1.5">Послуги</p>
                                                                                    {cost.serviceItems.map((item: IOrderCostServiceItem) => (
                                                                                        <div key={item.id} className="flex justify-between text-sm text-gray-600 py-0.5 gap-2">
                                                                                            <span className="flex-1 min-w-0">{item.name}</span>
                                                                                            <span className="flex-shrink-0 font-medium">{item.subtotalUsd.toFixed(2)} $</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}

                                                                            <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2 gap-2">
                                                                                <span>Підсумок (без профілю)</span>
                                                                                <span className="flex-shrink-0">{cost.subtotalUsd.toFixed(2)} $</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : null;
                                                        })()}

                                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                                            {construction.hasHandle && (
                                                                <div className="p-3 rounded-lg flex flex-row items-center gap-2 border border-blue-100 bg-blue-50">
                                                                    <span className="text-xs text-blue-700 font-semibold">Ручка</span>
                                                                    <div className="flex gap-4 text-xs text-gray-600">
                                                                        <span>Сторона: {construction.handleSide}</span>
                                                                        {construction.handleOffset && (
                                                                            <span>Відступ: {construction.handleOffset} мм</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {construction.glassFill && (
                                                                <div className="p-3 bg-purple-50 rounded-lg flex flex-row items-center gap-2 border border-purple-100">
                                                                    <span className="text-xs text-purple-700 font-semibold">Скло</span>
                                                                    <p className="text-sm font-semibold text-gray-900">
                                                                        {construction.glassFill.type} ({construction.glassFill.thickness} мм)
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="mb-4 pt-3">
                                                            <div className="text-xs font-semibold text-gray-700 mb-3">
                                                                Деталі
                                                            </div>
                                                            <ConstructionDetailsView
                                                                constructionId={construction.id}
                                                                className="bg-white rounded-lg p-3 border border-gray-200"
                                                                onDetailClick={(detailId) => handleDetailClick(construction.id, detailId)}
                                                            />
                                                        </div>

                                                        <div className="flex gap-2 pt-3 border-t border-gray-200">
                                                            <Button
                                                                onClick={() => handleViewConstruction(construction.id)}
                                                                color="blue"
                                                                className="flex-1 !py-1.5 text-xs"
                                                            >
                                                                <Eye size={16} /> Переглянути
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleEditConstruction(construction)}
                                                                color="greenDarkgreen"
                                                                className="flex-1 !py-1.5 text-xs"
                                                            >
                                                                <Edit2 size={16} /> Редагувати
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleCopyConstruction(construction)}
                                                                color="blue"
                                                                className="flex-1 !py-1.5 text-xs"
                                                            >
                                                                <Copy size={16} /> Копіювати
                                                            </Button>
                                                            <ButtonDel
                                                                onClick={() => handleDeleteConstruction(construction.id)}
                                                                title={'Видалити'}
                                                                className="flex-1 !py-1.5 text-xs"
                                                            >
                                                            </ButtonDel>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <p className="text-gray-500 mb-4">Конструкцій ще немає</p>
                                            <Button
                                                color="greenDarkgreen"
                                                onClick={handleCreateConstruction}
                                            >
                                                <Plus size={16} /> Додати першу конструкцію
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <OrderCreateModal
                {...modalEditOrder}
                order={order}
                onClose={handleEditClose}
            />

            <ConstructionCreateModal
                {...modalCreateOrderConstruction}
                orderId={orderId}
                construction={selectedConstruction}
                onClose={handleConstructionModalClose}
            />

            <ConstructionDetailModal
                {...modalConstructionDetails}
                constructionId={selectedConstructionForDetails}
                detailId={selectedDetailId}
                orderId={orderId}
                construction={orderConstruction?.find(c => c.id === selectedConstructionForDetails)}
                onClose={handleCloseConstructionDetails}
                onOperationComplete={handleOperationComplete}
                onDetailComplete={handleDetailComplete}
                onDownloadLabelByDetails={handleDownloadLabelByDetails}
                onDownloadGCode={handleDownloadGCode}
                onDownloadAllGCode={handleDownloadAllGCode}
            />

            <GCodeSelectionModal
                {...modalGCodeSelection}
                constructions={orderConstruction}
                orderNumber={order?.orderNumber}
                getGcodeForDetail={getGcodeForDetail}
            />
        </MainLayout>
    );
};

export default OrderDetails;