import React, { useState } from "react";
import { cn } from "@/helpers/cn";
import { IProfileSystemOperation } from "@/screens/profile-system/types/profile-system/IProfileSystemOperation";
import { useProfileSystemMutations } from "@/screens/profile-system/hooks/useProfileSystemMutations";
import InlineField from "./InlineField";
import DrillSideEditor from "./DrillSideEditor";
import MillSideEditor from "./MillSideEditor";
import CncTemplateEditor from "./CncTemplateEditor";
import { ChevronDown } from "lucide-react";
import {
    CutParams, DrillEdgeParams, DrillHandleParams,
    DrillParameters,
    DrillSide,
    MillParameters, MillSideOption, MillSideParams
} from "@/screens/profile-system/types/OperationDetailsType";
import { SIDE_LABELS, SIDES } from "@/screens/profile-system/constants/profileSystemConstants";

export interface OperationSectionProps {
    op: IProfileSystemOperation;
    profileSystemId: number;
    mutations: ReturnType<typeof useProfileSystemMutations>;
}

const OperationSection: React.FC<OperationSectionProps> = ({ op, mutations }) => {
    const [activeSide, setActiveSide] = useState<DrillSide>("TOP");
    const [expandedTemplates, setExpandedTemplates] = useState<Set<number>>(new Set());

    const isDrill = op.operationType === "DRILL";
    const isMill  = op.operationType === "MILL";
    const isCut   = op.operationType === "CUT";
    const hasCnc  = op.cncProgramTemplates.length > 0;

    const [innerTab, setInnerTab] = useState<"params" | "cnc">(() => {
        const hasParams = isDrill || isMill || isCut;
        return hasParams ? "params" : "cnc";
    });

    const drillParams = isDrill ? (op.defaultParameters as DrillParameters | null) ?? {} : {};
    const millParams  = isMill  ? (op.defaultParameters as MillParameters  | null) ?? {} : {};
    const cutParams   = isCut   ? (op.defaultParameters as CutParams | null) : null;

    const toggleTemplate = (id: number) =>
        setExpandedTemplates(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const saveEdgeField = (side: DrillSide, field: keyof DrillEdgeParams, value: number) =>
        mutations.updateDrillSide.mutate({ side, edge: { [field]: value } });

    const saveHandleField = (side: DrillSide, field: keyof DrillHandleParams, value: number | null) => {
        if (value === null) {
            mutations.updateDrillSide.mutate({ side, handle: null });
        } else {
            mutations.updateDrillSide.mutate({ side, handle: { [field]: value } });
        }
    };

    const saveMillField = (side: DrillSide, field: keyof MillSideParams, value: number | MillSideOption) =>
        mutations.updateMillSide.mutate({ side, [field]: value });

    const SideTabs: React.FC = () => (
        <div className="flex gap-2 mb-3">
            {SIDES.map((s: DrillSide) => (
                <button
                    key={s}
                    onClick={() => setActiveSide(s)}
                    className={cn(
                        "py-1 px-2 text-xs rounded-md font-medium transition-colors",
                        activeSide === s
                            ? "bg-emerald/500 text-white"
                            : "bg-black/500 text-gray-600 hover:bg-black/400"
                    )}
                >
                    {SIDE_LABELS[s]}
                    {s === 'LEFT' && (
                        <span className="ml-1 opacity-60 font-normal">(дефолт ручка)</span>
                    )}
                </button>
            ))}
        </div>
    );

    return (
        <div className="space-y-2">
            {hasCnc && (
                <div className="flex gap-1 bg-gray-100 rounded-lg w-fit">
                    {(["params", "cnc"] as const)
                        .filter(tab => tab === "cnc" || isDrill || isMill || isCut)
                        .map(tab => (
                            <button
                                key={tab}
                                onClick={() => setInnerTab(tab)}
                                className={cn(
                                    "text-xs px-2 py-1 rounded-md font-medium transition-colors",
                                    innerTab === tab
                                        ? "bg-emerald/500 text-gray-800 shadow-sm"
                                        : "bg-black/500 text-gray-500 hover:bg-black/400"
                                )}
                            >
                                {tab === "params" ? "Параметри" : "CNC"}
                            </button>
                        ))}
                </div>
            )}

            {(!hasCnc || innerTab === "params") && (
                <>
                    {(isDrill || isMill) && <SideTabs />}

                    {isDrill && (
                        <div className="rounded-lg p-3 bg-gray-50">
                            <DrillSideEditor
                                side={activeSide}
                                params={drillParams[activeSide]}
                                onSaveEdge={saveEdgeField}
                                onSaveHandle={saveHandleField}
                                pending={mutations.updateDrillSide.isPending}
                            />
                        </div>
                    )}

                    {isMill && (
                        <div className="rounded-lg px-1 bg-gray-50">
                            <MillSideEditor
                                side={activeSide}
                                params={millParams[activeSide]}
                                onSave={saveMillField}
                                pending={mutations.updateMillSide.isPending}
                            />
                        </div>
                    )}

                    {cutParams !== null && (
                        <div className="flex flex-col gap-3">
                            <InlineField
                                label="Лівий кут"
                                value={cutParams?.leftAngle ?? null}
                                type="number"
                                unit="°"
                                pending={mutations.updateOperation.isPending}
                                onSave={v => mutations.updateOperation.mutate({
                                    id: op.id,
                                    dto: { defaultParameters: { ...cutParams, leftAngle: parseFloat(v) } }
                                })}
                            />
                            <InlineField
                                label="Правий кут"
                                value={cutParams?.rightAngle ?? null}
                                type="number"
                                unit="°"
                                pending={mutations.updateOperation.isPending}
                                onSave={v => mutations.updateOperation.mutate({
                                    id: op.id,
                                    dto: { defaultParameters: { ...cutParams, rightAngle: parseFloat(v) } }
                                })}
                            />
                            <InlineField
                                label="Offset Z"
                                value={cutParams?.offsetZ ?? null}
                                type="number"
                                unit="мм"
                                pending={mutations.updateOperation.isPending}
                                onSave={v => mutations.updateOperation.mutate({
                                    id: op.id,
                                    dto: { defaultParameters: { ...cutParams, offsetZ: parseFloat(v) } }
                                })}
                            />
                        </div>
                    )}
                </>
            )}

            {hasCnc && innerTab === "cnc" && (
                <div className="space-y-1">
                    {op.cncProgramTemplates.map(t => (
                        <div key={t.id} className="rounded-lg overflow-hidden">
                            <button
                                onClick={() => toggleTemplate(t.id)}
                                className="w-full flex items-center justify-between py-2 text-xs text-left transition-colors"
                            >
                                <span className="font-medium text-gray-700">{t.name ?? `Шаблон #${t.id}`}</span>
                                <ChevronDown
                                    size={14}
                                    className={cn(
                                        "text-gray-400 transition-transform duration-200",
                                        expandedTemplates.has(t.id) && "rotate-180"
                                    )}
                                />
                            </button>
                            {expandedTemplates.has(t.id) && (
                                <div className="border-t border-gray-100 py-2">
                                    <CncTemplateEditor
                                        template={t}
                                        onSave={(templateId, dto) =>
                                            mutations.updateTemplate.mutate({ id: templateId, dto })
                                        }
                                        pending={mutations.updateTemplate.isPending}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default OperationSection;