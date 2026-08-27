import React from "react";
import InlineField from "./InlineField";
import {
    DrillEdgeParams,
    DrillHandleParams,
    DrillSide,
    DrillSideParams
} from "@/screens/profile-system/types/OperationDetailsType";
import {EDGE_FIELDS} from "@/screens/profile-system/constants/profileSystemConstants";

export interface DrillSideEditorProps {
    side: DrillSide;
    params: DrillSideParams | undefined;
    onSaveEdge: (side: DrillSide, field: keyof DrillEdgeParams, value: number) => void;
    onSaveHandle: (side: DrillSide, field: keyof DrillHandleParams, value: number | null) => void;
    pending: boolean;
}

const DrillSideEditor: React.FC<DrillSideEditorProps> = ({ side, params, onSaveEdge, onSaveHandle, pending }) => {
    const edge   = params?.edge   ?? {};
    const handle = params?.handle;

    const visibleEdgeFields = EDGE_FIELDS.filter(f => edge[f.key] != null);

    return (
        <div className="space-y-4">
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Edge</p>
                {visibleEdgeFields.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {visibleEdgeFields.map(f => (
                            <InlineField
                                key={f.key}
                                label={f.label}
                                value={edge[f.key] ?? null}
                                type="number"
                                pending={pending}
                                onSave={v => onSaveEdge(side, f.key, parseFloat(v))}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 italic">Немає параметрів</p>
                )}
            </div>

            {handle && (
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Handle
                        {side === 'LEFT' && (
                            <span className="ml-2 text-gray-400 font-normal normal-case italic">(за замовчуванням)</span>
                        )}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <InlineField
                            label="Spacing X"
                            value={handle.spacingX ?? null}
                            type="number"
                            pending={pending}
                            onSave={v => onSaveHandle(side, "spacingX", v !== "" ? parseFloat(v) : null)}
                        />
                        <InlineField
                            label="Offset Y"
                            value={handle.offsetY ?? null}
                            type="number"
                            pending={pending}
                            onSave={v => onSaveHandle(side, "offsetY", v !== "" ? parseFloat(v) : null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DrillSideEditor;