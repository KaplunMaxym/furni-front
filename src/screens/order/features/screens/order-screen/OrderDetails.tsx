import React, {FC, useState} from "react";
import { useParams, useNavigate } from "react-router";
import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import Button from "@/ui/button/Button";
import { Button as UiButton } from "@/ui/shadcn/button";
import PageHeader, { HeaderBadge, SectionHeading } from "@/ui/page-header/PageHeader";
import { SectionLabel } from "@/ui/section-label/SectionLabel";
import {
    ArrowLeft, ChevronDown, Copy, Download, Edit2, Eye, Info, Loader2,
    type LucideIcon, Plus, Scissors, SquareStack, Trash2, Wallet,
} from "lucide-react";
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
import RowActionsCell from "@/ui/table/RowActionsCell";
import PlusSvg from "@/assets/plusSvg";
import ConstructionDetailsView from "@/screens/order/component/ConstructionDetailsView";
import {useConstructionDetailOperationCompleteMutation} from "@/screens/construction/hooks/construction-details/useConstructionDetailOperationCompleteMutation";
import {useConstructionDetailCompleteMutation} from "@/screens/construction/hooks/construction-details/useConstructionDetailCompleteMutation";
import ConstructionCreateModal from "@/screens/construction/features/modals/modal-create-update-construction/ modal-create-сonstruction";
import ConstructionDetailModal from "@/screens/construction/features/modals/construction-details-modal/construction-details-modal";
import {useGcode} from "@/screens/construction/hooks/gcode/useGcode";
import { toast } from "sonner";
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
import {isDealerRole, RoleEnum} from "@/config/RoleEnum";
import {CutPlanBlock} from "@/screens/order/component/CutPlanBlock";
import OrderCostBlock from "@/screens/order/component/OrderCostBlock";
import { PRICE_CATEGORIES } from "@/screens/order/types/order/IOrderForm";
import RecalculateButton from "@/screens/order/component/RecalculateButton";
import {downloadSpecificationPdf} from "@/screens/order/component/SpecificationPdf";
import {downloadCutPlanPdf, generateCutPlanPdfBlob} from "@/screens/order/component/CutPlanPdf";
import {useBarCutGcode} from "@/screens/order/hooks/order/useBarCutGcode";

type SectionId = 'general' | 'constructions' | 'cost' | 'cut';

/**
 * Групи в розкладі вартості конструкції.
 *
 * Кольору в підписах немає навмисно. Фіолетовий, синій і зелений нічого не
 * означали — це просто три назви розділів, — але тягнули на себе увагу
 * сильніше за самі суми, заради яких сюди й дивляться.
 */
const COST_GROUPS = [
    { key: 'glassItems',     label: 'Скло'      },
    { key: 'accessoryItems', label: 'Аксесуари' },
    { key: 'serviceItems',   label: 'Послуги'   },
] as const;

/** Незмінне значення виглядає як поле — так ряд не перекошується. */
const READONLY_FIELD =
    'flex h-9 items-center truncate rounded-md border border-input px-3 text-sm text-muted-foreground';

/**
 * Рядок підсумку: підпис ліворуч, значення праворуч.
 *
 * Чотирма колонками це читалося погано: підписи різної довжини («Конструкцій»
 * і «Курс НБУ») не вирівнювалися, а числа губилися під ними. Рядками око йде
 * зверху вниз по одній колонці значень.
 */
const SummaryRow: FC<{ label: string; value: string; hint?: string; strong?: boolean }> = ({
    label,
    value,
    hint,
    strong,
}) => (
    <div className="flex items-baseline justify-between gap-3 py-2">
        <span className="text-sm text-muted-foreground">{label}</span>

        <span className="flex items-baseline gap-2 whitespace-nowrap">
            <span className={cn('tabular-nums text-foreground', strong ? 'text-base font-semibold' : 'text-sm')}>
                {value}
            </span>
            {hint && <span className="text-xs tabular-nums text-muted-foreground">{hint}</span>}
        </span>
    </div>
);

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

    /*
     * Дилер бачить ціну повністю — вона порахована за його категорією, і саме
     * заради неї він сюди й заходить. Закрите для нього інше: усе виробниче.
     * Розкрій балок, склад деталей, вивантаження G-code і специфікації, обмін
     * із 1С — це внутрішня кухня заводу; дилеру вона нічого не пояснює про
     * його замовлення, зате показує, з чого й за скільки воно робиться.
     */
    const isDealer = isDealerRole(role);

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
    const [section, setSection] = useState<SectionId>('constructions');

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
                toast.error('G-code різання не знайдено', { duration: 4000 });
                return;
            }

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `Order_${order.orderNumber}_Cut_GCode.zip`);

            toast.success(
                errors.length === 0 ? 'G-code різання завантажено' : `Завантажено (${errors.length} пропущено)`,
                { duration: 3000 }
            );
        } catch (error) {
            console.error('Error downloading cut g-code:', error);
            toast.error('Помилка завантаження архіву', { duration: 4000 });
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
                toast.error('G-code різання не знайдено', { duration: 4000 });
                return;
            }

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `Order_${order.orderNumber}_Cut_GCode.zip`);

            toast.success(
                errors.length === 0 ? 'G-code різання завантажено' : `Завантажено (${errors.length} пропущено)`,
                { duration: 3000 }
            );
        } catch (error) {
            console.error('Error downloading cut g-code:', error);
            toast.error('Помилка завантаження архіву', { duration: 4000 });
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
            });
        } catch (error) {
            console.error('Error downloading G-Code:', error);
            toast.error('Помилка завантаження G-Code', {
                duration: 4000,
            });
        }
    };

    const handleDownloadAllGCode = async (detailId: number) => {
        try {
            const { gcode } = await getGcodeForDetail(detailId);

            if (gcode.length === 0) {
                toast.error('G-code для цієї деталі відсутній', {
                    duration: 3000,
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
            });
        } catch (error) {
            console.error('Error downloading all G-Code:', error);
            toast.error('Помилка завантаження G-Code', {
                duration: 4000,
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
            });
        } catch (error) {
            console.error('Error downloading order data:', error);
            toast.error('Помилка завантаження архіву', {
                duration: 4000,
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

    /*
     * Пункти меню завантажень одним списком.
     *
     * Було шість майже однакових <button> по п'ятнадцять рядків кожна —
     * додати сьомий пункт означало скопіювати ще один такий блок.
     */
    /*
     * Пункти меню завантаження.
     *
     * Раніше два з них підміняли свій напис на «Завантаження…», але меню
     * закривається на кліку — цього напису ніхто не бачив. Пункт тепер завжди
     * називається однаково, а хід завантаження показує сама кнопка.
     */
    const downloadActions: Array<{ label: string; onSelect: () => void }> = [
        { label: 'G-Code, усі файли', onSelect: handleDownloadAllOrderData },
        { label: 'G-Code, вибірково', onSelect: modalGCodeSelection.onOpen },
        ...(order?.cost?.cutPlan?.length ? [
            { label: 'G-Code різання', onSelect: handleDownloadCutSingleGCode },
            { label: 'G-Code різання, розбито', onSelect: handleDownloadCutGCode },
        ] : []),
        { label: 'Специфікація (PDF)', onSelect: handleDownloadSpecification },
        ...(order?.cost?.cutPlan?.length
            ? [{ label: 'Розкрій профілю (PDF)', onSelect: handleDownloadCutPlan }]
            : []),
        { label: 'Лейбли (PDF)', onSelect: handleDownloadBarcode },
    ];

    // Будь-яке з завантажень тримає кнопку зайнятою — паралельно їх не запускають
    const isDownloading =
        isDownloadingGCode || isDownloadingLabels || isDownloadingCutGCode || isDownloadingCutSingleGCode;

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
                    <UiButton type="button" variant="outline" className="w-fit" onClick={handleBack}>
                        <ArrowLeft /> Назад до замовлень
                    </UiButton>
                    <div className="py-8 text-center text-sm text-destructive-foreground">
                        Помилка завантаження замовлення: {error?.message || 'Невідома помилка'}
                    </div>
                </div>
            </MainLayout>
        );
    }

    const constructions = orderConstruction ?? [];

    /*
     * Замовлення взяте в роботу в 1С.
     *
     * Бек після цього відхиляє будь-яку зміну замовлення й конструкцій, тож
     * кнопки, які це роблять, зі сторінки зникають: лишити їх означало б
     * пропонувати дію, що завжди закінчується помилкою.
     */
    const isLocked = order?.isLockedBy1C === true;
    const cutPlan = order.cost?.cutPlan ?? [];

    /*
     * `hint` — короткий рядок під назвою в боковому меню (скільки чого).
     * `description` — пояснення над самим розділом: що це і навіщо. Це різні
     * тексти навмисно: «3 шт» доречне в меню, але як підзаголовок нічого не каже.
     */
    const sections: Array<{
        id: SectionId;
        label: string;
        hint: string;
        description: string;
        icon: LucideIcon;
    }> = [
        {
            id: 'general',
            label: 'Основна інформація',
            /*
             * Дилер і є замовник — згадувати клієнта в його ж інтерфейсі
             * дивно: поле з клієнтом для нього приховане, а категорію він
             * не бачить узагалі.
             */
            hint: isDealer ? 'Статус, підсумок' : 'Клієнт, статус, підсумок',
            description: isDealer
                ? 'Стан замовлення й підсумкові числа'
                : 'Замовник, стан замовлення й підсумкові числа',
            icon: Info,
        },
        {
            id: 'constructions',
            label: 'Конструкції',
            hint: constructions.length ? `${constructions.length} шт` : 'Ще немає',
            // Ні складу деталей, ні файлів для верстата дилер не бачить —
            // обіцяти їх у підписі означало б відправити його шукати неіснуюче
            description: isDealer
                ? 'Вироби замовлення: розміри, скло, колір і вартість'
                : 'Вироби замовлення, їх деталі та файли для виробництва',
            icon: SquareStack,
        },
        ...(canSeeCost && order.cost ? [{
            id: 'cost' as const,
            label: 'Вартість',
            hint: `${order.cost.totalUsd.toFixed(2)} $`,
            description: isDealer
                ? 'З чого складається ваша ціна: профілі, скло, аксесуари, послуги'
                : 'З чого складається ціна: профілі, скло, аксесуари, послуги',
            icon: Wallet,
        }] : []),
        // Розкрій зʼявляється лише після перерахунку — порожньої вкладки не буде
        ...(cutPlan.length && !isDealer ? [{
            id: 'cut' as const,
            label: 'Розкрій профілю',
            /*
             * Тут була довжина `cutPlan` — а це список матеріалів, не прутків.
             * На одному артикулі підпис читався «1 балок» незалежно від того,
             * скільки прутків насправді пішло. Рахуємо самі прутки.
             */
            hint: `${cutPlan.reduce((s, m) => s + m.bars.length, 0)} прутків`,
            description: 'Як деталі розкладені по балках і скільки лишається обрізків',
            icon: Scissors,
        }] : []),
    ];

    // Розділ міг зникнути (перерахунок прибрав розкрій) — не лишаємо порожнечу
    const activeSection = sections.some(s => s.id === section) ? section : 'constructions';
    const activeMeta = sections.find(item => item.id === activeSection);

    return (
        <MainLayout>
            <div className="flex w-full flex-col gap-4">

                {/*
                  * Назва, номер, клієнт і статус — одним рядком.
                  * Номер у плашці з підписом «№»: без нього «000001» доводилось
                  * розгадувати — номер це, кількість чи код.
                  */}
                <PageHeader
                    title={order.name}
                    badges={
                        <>
                            <HeaderBadge mono>№ {order.orderNumber}</HeaderBadge>
                            <HeaderBadge>
                                {order.client.firstName} {order.client.lastName}
                            </HeaderBadge>
                            {order.status?.title && <HeaderBadge>{order.status.title}</HeaderBadge>}
                            {isLocked && (
                                <span className="shrink-0 rounded-md border border-chart-3/40 bg-chart-3/15 px-2 py-0.5 text-xs text-chart-3">
                                    У роботі — редагування закрите
                                </span>
                            )}
                        </>
                    }
                    leading={
                        <UiButton type="button" variant="outline" onClick={handleBack}>
                            <ArrowLeft /> Повернутися
                        </UiButton>
                    }
                />

                {/*
                  * Розділи ліворуч, вміст праворуч — та сама розкладка, що на
                  * сторінці профільної системи: колонка на 240 px і картка поруч.
                  */}
                <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
                    <div className="h-fit rounded-xl border border-border bg-card p-2">
                        {/* На вузькому екрані меню лягає рядком над вмістом */}
                        <div className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
                            {sections.map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setSection(item.id)}
                                    className={cn(
                                        'flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors lg:w-full',
                                        item.id === activeSection
                                            ? 'bg-primary/10 text-foreground'
                                            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                                    )}
                                >
                                    <item.icon className="h-4 w-4 shrink-0" />
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-medium">{item.label}</span>
                                        <span className="hidden truncate text-xs text-muted-foreground lg:block">
                                            {item.hint}
                                        </span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex min-w-0 flex-col gap-4">
                        {/* Який саме розділ відкрито — раніше про це казало лише меню ліворуч */}
                        {activeMeta && (
                            <SectionHeading title={activeMeta.label} description={activeMeta.description} />
                        )}

                        {activeSection === 'general' && (
                            <div className="flex flex-col gap-4">
                                {/*
                                  * Картка з шапкою — щоб цей блок і «Підсумок» під ним
                                  * читалися як два розділи, а не як плита полів і
                                  * підписана таблиця під нею.
                                  */}
                                <div className="overflow-hidden rounded-xl border border-border bg-card">
                                    <SectionLabel>Про замовлення</SectionLabel>

                                    <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
                                        {/*
                                          * Клієнт і дата в тій самій рамці, що й селекти.
                                          * Голим текстом поруч із полями вони висіли на
                                          * іншій висоті, і ряд виглядав перекошеним.
                                          */}
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-medium text-muted-foreground">Клієнт</span>
                                            <p className={READONLY_FIELD}>
                                                {order.client.firstName} {order.client.lastName}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-medium text-muted-foreground">Статус</span>
                                            {isPendingOrderStatus ? (
                                                <p className={READONLY_FIELD}>Завантаження…</p>
                                            ) : (
                                                <SelectorSearch
                                                    getAndSet={[
                                                        selectedOrderStatus[order.id] || order.status?.id || '',
                                                        (value: string | number) => handleStatusChange(Number(value)),
                                                    ]}
                                                    options={formattedOrderStatusOptions}
                                                    placeholder="Оберіть статус"
                                                    optionValue="value"
                                                    optionLabel="label"
                                                    searchable
                                                />
                                            )}
                                        </div>

                                        {/*
                                          * Категорія — внутрішня домовленість
                                          * із клієнтом, а не властивість
                                          * замовлення, яку йому показують.
                                          * Сервер її дилеру й не віддає, тож
                                          * без цієї умови селект стояв би
                                          * порожній і мовчки пропонував би
                                          * змінити те, чого дилер не бачить.
                                          */}
                                        {!isDealer && (
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-medium text-muted-foreground">Цінова категорія</span>
                                            <SelectorSearch
                                                getAndSet={[
                                                    selectedPriceCategory || order.priceCategory || 'REPRESENTATIVE',
                                                    (value: string | number) => {
                                                        const str = String(value);
                                                        setSelectedPriceCategory(str);
                                                        handlePriceCategoryChange(str);
                                                    },
                                                ]}
                                                options={PRICE_CATEGORIES}
                                                placeholder="Оберіть категорію"
                                                optionValue="value"
                                                optionLabel="label"
                                                isEmptyValueDisable
                                                searchable={false}
                                            />
                                        </div>
                                        )}

                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-medium text-muted-foreground">Створено</span>
                                            <p className={READONLY_FIELD}>{formatDateTime(order.createdAt)}</p>
                                        </div>
                                    </div>

                                    {/*
                                      * «Редагувати» і «Видалити» стосуються самого
                                      * замовлення, тож живуть тут, поруч з його полями,
                                      * а не в ряду дій над конструкціями.
                                      */}
                                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-4 py-3">
                                        {isLocked ? (
                                            <p className="text-sm text-muted-foreground">
                                                Замовлення в роботі: редагування й видалення закриті,
                                                поки виробниче завдання не скасують
                                            </p>
                                        ) : (
                                            <>
                                                <Button onClick={handleEdit} color="grayGreen" className="w-auto mx-0 h-9">
                                                    <Edit2 size={16} /> Редагувати
                                                </Button>
                                                <Button onClick={handleDelete} color="red" className="w-auto mx-0 h-9" disabled={isDeleting}>
                                                    <Trash2 size={16} /> Видалити
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/*
                                  * Підсумок замовлення.
                                  *
                                  * Без нього вкладка складалася б із чотирьох полів і
                                  * порожнечі, а числа, заради яких сюди й заходять,
                                  * лежали б аж у «Вартості».
                                  */}
                                {canSeeCost && order.cost && (
                                    <div className="overflow-hidden rounded-xl border border-border bg-card">
                                        <SectionLabel>Підсумок</SectionLabel>

                                        <div className="divide-y divide-border px-4 py-1">
                                            <SummaryRow label="Конструкцій" value={`${constructions.length}`} />
                                            {/*
                                              * Прутки — те, що беремо зі складу; балки — те,
                                              * за що платимо. Числа різні (пруток ріжуть не
                                              * до кінця), тож показуємо обидва: інакше сума
                                              * не сходиться з кількістю.
                                              */}
                                            {(() => {
                                                const beams = order.cost.items.reduce(
                                                    (s, i) => s + (i.beamLength > 0 ? i.totalLength / i.beamLength : 0),
                                                    0,
                                                );

                                                /*
                                                 * Дилеру — тільки те, за що він платить.
                                                 *
                                                 * Прутки — складський рух заводу, і поруч
                                                 * із дробовим числом вони читались як
                                                 * розбіжність у рахунку.
                                                 */
                                                if (isDealer) {
                                                    return (
                                                        <SummaryRow
                                                            label="Профілів"
                                                            value={`${beams.toFixed(3)} балок`}
                                                        />
                                                    );
                                                }

                                                return (
                                                    <SummaryRow
                                                        label="Профілів"
                                                        value={`${order.cost.items.reduce((s, i) => s + i.beamsUsed, 0)} прутків`}
                                                        hint={`${beams.toFixed(3)} балок за розрахунком`}
                                                    />
                                                );
                                            })()}
                                            <SummaryRow
                                                label="Курс НБУ"
                                                value={`1 $ = ${order.cost.currencyRate.toFixed(2)} ₴`}
                                            />
                                            {/* Головне число — останнім і крупнішим */}
                                            <SummaryRow
                                                label="Разом"
                                                value={`${order.cost.totalUsd.toFixed(2)} $`}
                                                hint={`${order.cost.totalUah.toFixed(0)} ₴`}
                                                strong
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeSection === 'cost' && canSeeCost && order.cost && (
                            <OrderCostBlock cost={order.cost} constructions={orderConstruction} />
                        )}

                        {activeSection === 'cut' && (
                            <CutPlanBlock cutPlan={cutPlan} constructions={constructions} />
                        )}

                        {activeSection === 'constructions' && (
                            <div className="flex flex-col gap-3">
                                {/* Дії над конструкціями видно лише в цьому розділі */}
                                <div className="flex flex-wrap justify-end gap-2">
                                {!!constructions.length && !isDealer && (
                                    <div className="relative">
                                        {/* Сусіди в ряду — на кнопці з набору dashboard, тож і ця на ній */}
                                        <UiButton
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsDownloadMenuOpen(p => !p)}
                                            disabled={isDownloading}
                                        >
                                            {/* Спінер підміняє іконку — ширина кнопки не змінюється */}
                                            {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
                                            {isDownloading ? 'Завантаження…' : 'Завантажити'}
                                            <ChevronDown
                                                className={cn('transition-transform duration-200', isDownloadMenuOpen && 'rotate-180')}
                                            />
                                        </UiButton>

                                        {isDownloadMenuOpen && (
                                            <>
                                                {/* Перехоплює клік повз меню, щоб закрити його */}
                                                <div className="fixed inset-0 z-[60]" onClick={() => setIsDownloadMenuOpen(false)} />

                                                <div className="absolute right-0 top-11 z-[61] min-w-[240px] overflow-hidden rounded-md border border-input bg-popover p-1 text-popover-foreground shadow-lg">
                                                    {downloadActions.map(action => (
                                                        <button
                                                            key={action.label}
                                                            onClick={() => {
                                                                setIsDownloadMenuOpen(false);
                                                                action.onSelect();
                                                            }}
                                                            className="flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                                                        >
                                                            <Download size={14} className="shrink-0 opacity-70" />
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/*
                                  * Специфікація — єдине, що дилер вивантажує.
                                  *
                                  * Меню «Завантажити» для нього закрите: там
                                  * G-code, розкрій і лейбли — файли для верстата
                                  * й цеху. А специфікація описує сам виріб і
                                  * його ціну, тобто саме те, з чим дилер іде до
                                  * свого замовника. Окремою кнопкою, а не
                                  * пунктом меню: пункт був би там один.
                                  */}
                                {!!constructions.length && isDealer && (
                                    <UiButton
                                        type="button"
                                        variant="outline"
                                        onClick={handleDownloadSpecification}
                                    >
                                        <Download /> Специфікація
                                    </UiButton>
                                )}

                                {!isLocked && <RecalculateButton orderId={order.id} />}

                                {!isLocked && (
                                    <UiButton type="button" onClick={handleCreateConstruction}>
                                        <PlusSvg width={16} height={16} /> Конструкція
                                    </UiButton>
                                )}
                                </div>

                                {isPendingOrderConstruction ? (
                                    <div className="flex justify-center py-16"><Loading /></div>
                                ) : constructions.length === 0 ? (
                                    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-16">
                                        <p className="text-sm text-muted-foreground">
                                            У замовленні ще немає жодної конструкції
                                        </p>
                                        <Button color="greenDarkgreen" className="w-auto mx-0" onClick={handleCreateConstruction}>
                                            <Plus size={16} /> Додати першу
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {constructions.map((construction: IConstruction) => {
                                            const isOpen = expandedConstructionDetails.has(construction.id);
                                            const cost = canSeeCost ? getConstructionCost(construction.id) : null;

                                            return (
                                                <div
                                                    key={construction.id}
                                                    className="overflow-hidden rounded-xl border border-border bg-card"
                                                >
                                                    <div className="flex items-center gap-3 px-4 py-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleConstructionDetails(construction.id)}
                                                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                                        >
                                                            <ChevronDown
                                                                size={18}
                                                                className={cn(
                                                                    'shrink-0 text-muted-foreground transition-transform duration-200',
                                                                    isOpen && 'rotate-180',
                                                                )}
                                                            />

                                                            <span className="min-w-0 flex-1">
                                                                <span className="block truncate text-sm font-medium text-foreground">
                                                                    Конструкція {construction.constructionNo}
                                                                </span>
                                                                <span className="block truncate text-xs text-muted-foreground">
                                                                    {construction.profileSystem.title} · {construction.width} × {construction.height} мм
                                                                </span>
                                                            </span>
                                                        </button>

                                                        {cost && (
                                                            <div className="hidden shrink-0 flex-col items-end sm:flex">
                                                                <span className="text-sm font-medium tabular-nums text-foreground">
                                                                    {cost.subtotalUsd.toFixed(2)} $
                                                                </span>
                                                                {/* Підсумок конструкції — округлений, як і решта підсумків */}
                                                                <span className="text-xs tabular-nums text-muted-foreground">
                                                                    {cost.subtotalUah.toFixed(0)} ₴
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="hidden w-28 shrink-0 md:block">
                                                            <div className="mb-1 flex items-center justify-between">
                                                                <span className="text-xs text-muted-foreground">Прогрес</span>
                                                                <span className="text-xs font-medium tabular-nums text-foreground">
                                                                    {construction.progress}%
                                                                </span>
                                                            </div>
                                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                                <div
                                                                    className={cn(
                                                                        'h-1.5 rounded-full transition-all duration-300',
                                                                        getProgressColor(Number(construction.progress)),
                                                                    )}
                                                                    style={{ width: `${Math.min(Number(construction.progress), 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Чотири кнопки-іконки без підписів зайняли рядок
                                                            і не пояснювали себе — тепер під трьома крапками */}
                                                        <RowActionsCell
                                                            onEdit={isLocked ? undefined : () => handleEditConstruction(construction)}
                                                            onDelete={isLocked ? undefined : () => handleDeleteConstruction(construction.id)}
                                                            extra={[
                                                                {
                                                                    label: 'Переглянути',
                                                                    icon: <Eye className="h-4 w-4" />,
                                                                    onSelect: () => handleViewConstruction(construction.id),
                                                                },
                                                                {
                                                                    label: 'Копіювати',
                                                                    icon: <Copy className="h-4 w-4" />,
                                                                    onSelect: () => handleCopyConstruction(construction),
                                                                },
                                                            ]}
                                                        />
                                                    </div>

                                                    {isOpen && (
                                                        <div className="flex flex-col gap-4 border-t border-border p-4">
                                                            {cost && (
                                                                <div className="overflow-hidden rounded-lg border border-border">
                                                                    {/* Підкладка виділяє заголовок так само, як підписи груп усередині */}
                                                                    <button
                                                                        onClick={e => toggleConstructionCost(construction.id, e)}
                                                                        className="flex w-full items-center justify-between gap-3 bg-muted px-3 py-2.5 transition-colors hover:bg-secondary"
                                                                    >
                                                                        <span className="text-sm font-medium text-foreground">
                                                                            Вартість конструкції
                                                                        </span>
                                                                        <span className="flex items-center gap-3">
                                                                            <span className="whitespace-nowrap text-sm font-medium tabular-nums text-foreground">
                                                                                {cost.subtotalUsd.toFixed(2)} $
                                                                                <span className="text-muted-foreground"> / {cost.subtotalUah.toFixed(0)} ₴</span>
                                                                            </span>
                                                                            <ChevronDown
                                                                                size={16}
                                                                                className={cn(
                                                                                    'text-muted-foreground transition-transform duration-200',
                                                                                    expandedConstructionCost.has(construction.id) && 'rotate-180',
                                                                                )}
                                                                            />
                                                                        </span>
                                                                    </button>

                                                                    {expandedConstructionCost.has(construction.id) && (
                                                                        <div className="border-t border-border">
                                                                            {COST_GROUPS.map(group => {
                                                                                const items = cost[group.key] as Array<
                                                                                    IOrderCostGlassItem | IOrderCostAccessoryItem | IOrderCostServiceItem
                                                                                >;
                                                                                if (!items.length) return null;

                                                                                return (
                                                                                    <div key={group.key}>
                                                                                        {/* Той самий підпис групи, що й у розділі «Вартість» */}
                                                                                        <SectionLabel>{group.label}</SectionLabel>

                                                                                        <div className="flex flex-col gap-0.5 px-3 py-2.5">
                                                                                            {items.map(item => (
                                                                                                <div key={item.id} className="flex justify-between gap-2 text-sm text-muted-foreground">
                                                                                                    <span className="min-w-0 flex-1 truncate">
                                                                                                        {item.name}
                                                                                                        {'color' in item && item.color ? ` (${item.color})` : ''}
                                                                                                        {'quantity' in item ? ` × ${item.quantity}` : ''}
                                                                                                    </span>
                                                                                                    {/*
                                                                                                      * Гривня з копійками: рядки тут
                                                                                                      * складають очима, і зрізані
                                                                                                      * копійки не давали зійтися з
                                                                                                      * підсумком
                                                                                                      */}
                                                                                                    <span className="shrink-0 whitespace-nowrap tabular-nums text-foreground">
                                                                                                        {item.subtotalUsd.toFixed(2)} $
                                                                                                        <span className="text-muted-foreground"> / {item.subtotalUah.toFixed(2)} ₴</span>
                                                                                                    </span>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}

                                                                            <div className="flex justify-between gap-2 border-t border-border px-3 py-2.5 text-sm font-medium text-foreground">
                                                                                <span>Підсумок (без профілю)</span>
                                                                                <span className="shrink-0 whitespace-nowrap tabular-nums">
                                                                                    {cost.subtotalUsd.toFixed(2)} $
                                                                                    <span className="text-muted-foreground"> / {cost.subtotalUah.toFixed(0)} ₴</span>
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {(construction.hasHandle || construction.glassFill) && (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {construction.hasHandle && (
                                                                        <span className="flex items-center gap-2 rounded-lg border border-border bg-accent/30 px-3 py-2 text-xs">
                                                                            <span className="font-medium text-foreground">Ручка</span>
                                                                            <span className="text-muted-foreground">
                                                                                {construction.handleSide}
                                                                                {construction.handleOffset ? ` · відступ ${construction.handleOffset} мм` : ''}
                                                                            </span>
                                                                        </span>
                                                                    )}

                                                                    {construction.glassFill && (
                                                                        <span className="flex items-center gap-2 rounded-lg border border-border bg-accent/30 px-3 py-2 text-xs">
                                                                            <span className="font-medium text-foreground">Скло</span>
                                                                            <span className="text-muted-foreground">
                                                                                {construction.glassFill.type} · {construction.glassFill.thickness} мм
                                                                            </span>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {!isDealer && (
                                                                <ConstructionDetailsView
                                                                    constructionId={construction.id}
                                                                    className="overflow-hidden rounded-lg border border-border"
                                                                    onDetailClick={detailId => handleDetailClick(construction.id, detailId)}
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
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