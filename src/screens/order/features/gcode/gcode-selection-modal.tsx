import React, { FC, useState, useEffect, useCallback } from "react";
import Modal from "@/ui/Modal/Modal";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Button } from "@/ui/shadcn/button";
import { ModalProps } from "@/hooks/useModal/useModal";
import { IConstruction } from "@/screens/construction/type/construction/IConstruction";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
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

    /** Усе розгорнуто — кнопка має пропонувати згорнути, а не розгорнути ще раз. */
    const allExpanded = nodes.length > 0 && nodes.every((n) => n.expanded);

    const toggleExpandAll = () => {
        if (allExpanded) {
            setNodes((prev) => prev.map((n) => ({ ...n, expanded: false })));
            return;
        }

        setNodes((prev) =>
            prev.map((n) => {
                // Догружаємо лише те, що ще не тягнули: розгортання відкриває
                // деталі, а їхній G-code приходить окремим запитом на кожну
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

                {/*
                  * Панель дій.
                  *
                  * «Розгорнути всі», «Вибрати все», «Зняти все» були синіми
                  * підкресленими написами з роздільниками «|» — на кнопки вони
                  * не схожі, а саме кнопками тут і користуються.
                  */}
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            state={globalState}
                            aria-label="Вибрати все"
                            onChange={() => (globalState === "all" ? deselectAll() : selectAll())}
                        />
                        <span className="text-sm text-muted-foreground">
                            Вибрано <span className="font-medium tabular-nums text-foreground">{selectedCount}</span> файлів
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={toggleExpandAll}
                            disabled={nodes.length === 0}
                        >
                            {allExpanded ? 'Згорнути всі' : 'Розгорнути всі'}
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={selectAll}>
                            Вибрати все
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={deselectAll}
                            disabled={selectedCount === 0}
                        >
                            Зняти все
                        </Button>
                    </div>
                </div>

                {/* Tree */}
                <div className="flex-1 overflow-y-auto rounded-b-xl divide-y divide-border">
                    {nodes.length === 0 && (
                        <p className="text-center text-muted-foreground py-12 text-sm">Конструкцій немає</p>
                    )}

                    {nodes.map((node) => {
                        const cState = getConstructionState(node);
                        const totalDetails = node.details.length;
                        const loadedDetails = node.details.filter((d) => d.gcodeItems.length > 0).length;

                        return (
                            <div key={node.construction.id}>

                                {/* Construction row */}
                                <div
                                    className="flex items-center gap-2 px-4 py-3 hover:bg-accent/60 cursor-pointer select-none transition-colors"
                                    onClick={() => toggleConstruction(node.construction.id)}
                                >
                                    <Checkbox
                                        state={cState}
                                        onChange={() => toggleConstruction_selection(node)}
                                    />

                                    {node.expanded
                                        ? <ChevronDown  size={16} className="text-muted-foreground shrink-0" />
                                        : <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                                    }

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground">
                                            Конструкція {node.construction.constructionNo}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {node.construction.profileSystem?.title} •{" "}
                                            {node.construction.width} × {node.construction.height} мм •{" "}
                                            {totalDetails} деталей
                                        </p>
                                    </div>

                                    {node.expanded && (
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {loadedDetails}/{totalDetails} завантажено
                                        </span>
                                    )}
                                </div>

                                {/* Details */}
                                {node.expanded && (
                                    <div className="bg-transparent">
                                        {node.details.length === 0 && (
                                            <p className="text-xs text-muted-foreground px-12 py-3">
                                                Деталей немає
                                            </p>
                                        )}

                                        {node.details.map((detail) => {
                                            const dState = getDetailState(detail);

                                            return (
                                                <div key={detail.detailId} className="border-t border-border">

                                                    {/* Detail row */}
                                                    <div className="flex items-center gap-2 pl-10 pr-4 py-2 hover:bg-accent/60 transition-colors">
                                                        <Checkbox
                                                            state={dState}
                                                            onChange={() => toggleDetail_selection(detail)}
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-muted-foreground">
                                                                {detail.sequence ? `R${detail.sequence}` : detail.name}
                                                            </p>
                                                        </div>

                                                        {detail.loading && (
                                                            <span className="text-xs text-muted-foreground animate-pulse">
                                                                Завантаження…
                                                            </span>
                                                        )}
                                                        {detail.error && (
                                                            <span className="text-xs text-destructive-foreground">
                                                                Помилка
                                                            </span>
                                                        )}
                                                        {!detail.loading && !detail.error && detail.gcodeItems.length === 0 && (
                                                            <span className="text-xs text-muted-foreground">
                                                                G-code відсутній
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* GCode items */}
                                                    {detail.gcodeItems.map((item) => {
                                                        const k = makeKey(detail.detailId, item.operationId);
                                                        const checked = !!selection[k];

                                                        return (
                                                            <div
                                                                key={k}
                                                                className={cn(
                                                                    "flex items-center gap-3 pl-16 pr-4 py-1.5 cursor-pointer transition-colors",
                                                                    checked
                                                                        ? "bg-primary/10"
                                                                        : "hover:bg-accent/60",
                                                                )}
                                                            >
                                                                <Checkbox
                                                                    state={checked ? 'all' : 'none'}
                                                                    aria-label={item.fileName}
                                                                    onChange={() => toggleItem(detail.detailId, item.operationId)}
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-mono text-muted-foreground/60 truncate">
                                                                        {item.fileName}
                                                                    </p>
                                                                    {item.operationTitle && (
                                                                        <p className="text-xs text-muted-foreground truncate">
                                                                            {item.operationTitle}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-muted-foreground shrink-0 font-mono">
                                                                    {item.operationType}
                                                                </span>
                                                            </div>
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
                <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-4 py-3">
                    <Button type="button" variant="secondary" onClick={modalProps.onClose}>
                        Скасувати
                    </Button>

                    <Button
                        type="button"
                        disabled={selectedCount === 0 || isDownloading}
                        onClick={handleDownload}
                    >
                        <Download size={15} />
                        {isDownloading
                            ? "Завантаження…"
                            : `Завантажити${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
                    </Button>
                </div>

            </Modal.Body>
        </Modal>
    );
};

export default GCodeSelectionModal;