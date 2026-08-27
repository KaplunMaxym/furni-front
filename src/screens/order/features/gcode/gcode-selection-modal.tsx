import React, { FC, useState, useEffect, useCallback } from "react";
import Modal from "@/ui/Modal/Modal";
import Button from "@/ui/button/Button";
import { ModalProps } from "@/hooks/useModal/useModal";
import { IConstruction } from "@/screens/construction/type/construction/IConstruction";
import { Download, ChevronDown, ChevronRight, CheckSquare, Square, Minus } from "lucide-react";
import { cn } from "@/helpers/cn";
import { saveAs } from "file-saver";
import JSZip from "jszip";

type GCodeItem = {
    operationId: number;
    operationType: string;
    operationTitle: string | null;
    code: string;
    fileName: string;
};

type DetailGCode = {
    detailId: number;
    detailNo: string | number;
    gcodeItems: GCodeItem[];
    loading: boolean;
    error: boolean;
    sequence: number;
    name: string;
};

type ConstructionNode = {
    construction: IConstruction;
    details: DetailGCode[];
    expanded: boolean;
};

type SelectionMap = Record<string, boolean>;

function makeKey(detailId: number, operationId: number) {
    return `${detailId}-${operationId}`;
}

const CheckIcon: FC<{ state: "all" | "none" | "partial"; onClick: () => void; className?: string }> = ({ state, onClick, className }) => (
    <button
        type="button"
        onClick={(e) => {
            e.stopPropagation();
            onClick();
        }}
        className={cn("flex items-center justify-center w-5 h-5 rounded transition-colors shrink-0", className)}
    >
        {state === "all"     && <CheckSquare size={18} className="text-[#0094D5]" />}
        {state === "partial" && <Minus       size={18} className="text-[#0094D5]" />}
        {state === "none"    && <Square      size={18} className="text-gray-500"  />}
    </button>
);

type GCodeSelectionModalProps = ModalProps & {
    constructions: IConstruction[] | null | undefined;
    orderNumber?: string | number;
    getGcodeForDetail: (detailId: number) => Promise<{ gcode: GCodeItem[] }>;
};

const GCodeSelectionModal: FC<GCodeSelectionModalProps> = ({
                                                               constructions, orderNumber, getGcodeForDetail, ...modalProps
                                                           }) => {
    const [nodes, setNodes]               = useState<ConstructionNode[]>([]);
    const [selection, setSelection]       = useState<SelectionMap>({});
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (!modalProps.open || !constructions) return;
        const initial: ConstructionNode[] = constructions.map((c) => ({
            construction: c,
            expanded: false,
            details: (c.details || [])
                .filter((d) => d.operations && d.operations.length > 0)
                .sort((a, b) => a.sequence - b.sequence)
                .map((d) => ({
                    detailId: d.id,
                    detailNo: d.detailNo,
                    sequence: d.sequence,
                    name: d.name,
                    gcodeItems: [] as GCodeItem[],
                    loading: false,
                    error: false,
                })),
        }));
        setNodes(initial);
        setSelection({});
    }, [modalProps.open, constructions]);

    const fetchDetail = useCallback(async (constructionId: number, detailId: number) => {
        setNodes((prev) =>
            prev.map((n) =>
                n.construction.id !== constructionId ? n : {
                    ...n,
                    details: n.details.map((d) =>
                        d.detailId !== detailId ? d : { ...d, loading: true, error: false }
                    ),
                }
            )
        );
        try {
            const { gcode } = await getGcodeForDetail(detailId);
            setNodes((prev) =>
                prev.map((n) =>
                    n.construction.id !== constructionId ? n : {
                        ...n,
                        details: n.details.map((d) =>
                            d.detailId !== detailId ? d : { ...d, loading: false, gcodeItems: gcode }
                        ),
                    }
                )
            );
            setSelection((prev) => {
                const next = { ...prev };
                gcode.forEach((item) => {
                    const k = makeKey(detailId, item.operationId);
                    if (!(k in next)) next[k] = true;
                });
                return next;
            });
        } catch {
            setNodes((prev) =>
                prev.map((n) =>
                    n.construction.id !== constructionId ? n : {
                        ...n,
                        details: n.details.map((d) =>
                            d.detailId !== detailId ? d : { ...d, loading: false, error: true }
                        ),
                    }
                )
            );
        }
    }, [getGcodeForDetail]);

    const toggleConstruction = (constructionId: number) => {
        setNodes((prev) =>
            prev.map((n) => {
                if (n.construction.id !== constructionId) return n;
                const expanding = !n.expanded;
                if (expanding) {
                    n.details.forEach((d) => {
                        if (d.gcodeItems.length === 0 && !d.loading) {
                            fetchDetail(constructionId, d.detailId);
                        }
                    });
                }
                return { ...n, expanded: expanding };
            })
        );
    };

    const getConstructionState = (node: ConstructionNode): "all" | "none" | "partial" => {
        const allKeys = node.details.flatMap((d) =>
            d.gcodeItems.map((g) => makeKey(d.detailId, g.operationId))
        );
        if (allKeys.length === 0) return "none";
        const selected = allKeys.filter((k) => selection[k]);
        if (selected.length === 0) return "none";
        if (selected.length === allKeys.length) return "all";
        return "partial";
    };

    const getDetailState = (detail: DetailGCode): "all" | "none" | "partial" => {
        if (detail.gcodeItems.length === 0) return "none";
        const keys = detail.gcodeItems.map((g) => makeKey(detail.detailId, g.operationId));
        const selected = keys.filter((k) => selection[k]);
        if (selected.length === 0) return "none";
        if (selected.length === keys.length) return "all";
        return "partial";
    };

    const toggleConstruction_selection = (node: ConstructionNode) => {
        const state = getConstructionState(node);
        const allKeys = node.details.flatMap((d) =>
            d.gcodeItems.map((g) => makeKey(d.detailId, g.operationId))
        );
        const newVal = state !== "all";
        setSelection((prev) => {
            const next = { ...prev };
            allKeys.forEach((k) => (next[k] = newVal));
            return next;
        });
    };

    const toggleDetail_selection = (detail: DetailGCode) => {
        const state = getDetailState(detail);
        const keys = detail.gcodeItems.map((g) => makeKey(detail.detailId, g.operationId));
        const newVal = state !== "all";
        setSelection((prev) => {
            const next = { ...prev };
            keys.forEach((k) => (next[k] = newVal));
            return next;
        });
    };

    const toggleItem = (detailId: number, operationId: number) => {
        const k = makeKey(detailId, operationId);
        setSelection((prev) => ({ ...prev, [k]: !prev[k] }));
    };

    const selectAll = () => {
        const next: SelectionMap = {};
        nodes.forEach((n) =>
            n.details.forEach((d) =>
                d.gcodeItems.forEach((g) => (next[makeKey(d.detailId, g.operationId)] = true))
            )
        );
        setSelection(next);
    };

    const deselectAll = () => setSelection({});

    const expandAll = () => {
        setNodes((prev) =>
            prev.map((n) => {
                if (!n.expanded) {
                    n.details.forEach((d) => {
                        if (d.gcodeItems.length === 0 && !d.loading) {
                            fetchDetail(n.construction.id, d.detailId);
                        }
                    });
                }
                return { ...n, expanded: true };
            })
        );
    };

    const selectedCount = Object.values(selection).filter(Boolean).length;

    const globalState = (() => {
        const allKeys = nodes.flatMap((n) =>
            n.details.flatMap((d) => d.gcodeItems.map((g) => makeKey(d.detailId, g.operationId)))
        );
        if (allKeys.length === 0) return "none";
        const sel = allKeys.filter((k) => selection[k]);
        if (sel.length === 0) return "none";
        if (sel.length === allKeys.length) return "all";
        return "partial";
    })();

    const handleDownload = async () => {
        if (selectedCount === 0) return;
        setIsDownloading(true);
        try {
            const zip = new JSZip();
            nodes.forEach((n) => {
                n.details.forEach((d) => {
                    d.gcodeItems.forEach((g) => {
                        const k = makeKey(d.detailId, g.operationId);
                        if (!selection[k]) return;
                        const path =
                            `Construction_${n.construction.constructionNo}/` +
                            `${g.fileName}`;
                        zip.file(path, g.code);
                    });
                });
            });
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `Order_${orderNumber ?? "unknown"}_Selected_GCode.zip`);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Modal
            {...modalProps}
            className="flex flex-col max-w-[700px] w-full mx-2 rounded-xl overflow-hidden max-h-[90dvh]"
        >
            <Modal.Title className="gap-2" onClose={modalProps.onClose}>
                Вибір G-Code для завантаження
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-0 p-0 overflow-hidden flex-1 min-h-0">

                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-2.5 rounded-tl-xl rounded-tr-xl border-b border-react/500 bg-react/600 shrink-0">
                    <div className="flex items-center gap-2">
                        <CheckIcon
                            state={globalState}
                            onClick={() => globalState === "all" ? deselectAll() : selectAll()}
                        />
                        <span className="text-sm text-gray-400">
                            Вибрано:{" "}
                            <span className="font-semibold text-gray-200">{selectedCount}</span> файлів
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={expandAll}
                            className="text-xs text-[#0094D5] hover:underline"
                        >
                            Розгорнути всі
                        </button>
                        <span className="text-react/300">|</span>
                        <button
                            type="button"
                            onClick={selectAll}
                            className="text-xs text-[#0094D5] hover:underline"
                        >
                            Вибрати все
                        </button>
                        <span className="text-react/300">|</span>
                        <button
                            type="button"
                            onClick={deselectAll}
                            className="text-xs text-gray-500 hover:underline"
                        >
                            Зняти все
                        </button>
                    </div>
                </div>

                {/* Tree */}
                <div className="flex-1 overflow-y-auto rounded-b-xl divide-y divide-react/500">
                    {nodes.length === 0 && (
                        <p className="text-center text-gray-500 py-12 text-sm">Конструкцій немає</p>
                    )}

                    {nodes.map((node) => {
                        const cState = getConstructionState(node);
                        const totalDetails = node.details.length;
                        const loadedDetails = node.details.filter((d) => d.gcodeItems.length > 0).length;

                        return (
                            <div key={node.construction.id}>

                                {/* Construction row */}
                                <div
                                    className="flex items-center gap-2 px-4 py-3 hover:bg-react/500 cursor-pointer select-none transition-colors"
                                    onClick={() => toggleConstruction(node.construction.id)}
                                >
                                    <CheckIcon
                                        state={cState}
                                        onClick={() => toggleConstruction_selection(node)}
                                    />

                                    {node.expanded
                                        ? <ChevronDown  size={16} className="text-gray-500 shrink-0" />
                                        : <ChevronRight size={16} className="text-gray-500 shrink-0" />
                                    }

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-200">
                                            Конструкція {node.construction.constructionNo}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {node.construction.profileSystem?.title} •{" "}
                                            {node.construction.width} × {node.construction.height} мм •{" "}
                                            {totalDetails} деталей
                                        </p>
                                    </div>

                                    {node.expanded && (
                                        <span className="text-xs text-gray-500 shrink-0">
                                            {loadedDetails}/{totalDetails} завантажено
                                        </span>
                                    )}
                                </div>

                                {/* Details */}
                                {node.expanded && (
                                    <div className="bg-react/600">
                                        {node.details.length === 0 && (
                                            <p className="text-xs text-gray-500 px-12 py-3">
                                                Деталей немає
                                            </p>
                                        )}

                                        {node.details.map((detail) => {
                                            const dState = getDetailState(detail);

                                            return (
                                                <div key={detail.detailId} className="border-t border-react/500">

                                                    {/* Detail row */}
                                                    <div className="flex items-center gap-2 pl-10 pr-4 py-2 hover:bg-react/500 transition-colors">
                                                        <CheckIcon
                                                            state={dState}
                                                            onClick={() => toggleDetail_selection(detail)}
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-gray-500">
                                                                {detail.sequence ? `R${detail.sequence}` : detail.name}
                                                            </p>
                                                        </div>

                                                        {detail.loading && (
                                                            <span className="text-xs text-gray-500 animate-pulse">
                                                                Завантаження…
                                                            </span>
                                                        )}
                                                        {detail.error && (
                                                            <span className="text-xs text-red-400">
                                                                Помилка
                                                            </span>
                                                        )}
                                                        {!detail.loading && !detail.error && detail.gcodeItems.length === 0 && (
                                                            <span className="text-xs text-gray-500">
                                                                G-code відсутній
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* GCode items */}
                                                    {detail.gcodeItems.map((item) => {
                                                        const k = makeKey(detail.detailId, item.operationId);
                                                        const checked = !!selection[k];

                                                        return (
                                                            <label
                                                                key={k}
                                                                className={cn(
                                                                    "flex items-center gap-3 pl-16 pr-4 py-1.5 cursor-pointer transition-colors",
                                                                    checked
                                                                        ? "bg-[#064A76]/20"
                                                                        : "hover:bg-react/500",
                                                                )}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className="w-3.5 h-3.5 rounded accent-[#0094D5] shrink-0"
                                                                    checked={checked}
                                                                    onChange={() => toggleItem(detail.detailId, item.operationId)}
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-mono text-gray-300 truncate">
                                                                        {item.fileName}
                                                                    </p>
                                                                    {item.operationTitle && (
                                                                        <p className="text-xs text-gray-500 truncate">
                                                                            {item.operationTitle}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-gray-500 shrink-0 font-mono">
                                                                    {item.operationType}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 px-4 py-3 shrink-0">
                    <Button
                        type="button"
                        color="gray"
                        className="w-auto flex-1 px-4"
                        onClick={modalProps.onClose}
                    >
                        Скасувати
                    </Button>

                    <Button
                        type="button"
                        color="blue"
                        className="w-auto px-4 flex-1 flex justify-center items-center gap-2"
                        disabled={selectedCount === 0 || isDownloading}
                        onClick={handleDownload}
                    >
                        <Download size={15} />
                        {isDownloading
                            ? "Завантаження…"
                            : `Завантажити ${selectedCount > 0 ? `(${selectedCount})` : ""}`
                        }
                    </Button>
                </div>

            </Modal.Body>
        </Modal>
    );
};

export default GCodeSelectionModal;