import React from "react";
import ParamField from "./ParamField";
import ParamGroup from "./ParamGroup";
import {
    DrillEdgeParams,
    DrillHandleParams,
    DrillSide,
    DrillSideParams
} from "@/screens/profile-system/types/OperationDetailsType";
import { EDGE_FIELDS } from "@/screens/profile-system/constants/profileSystemConstants";
import { DRILL_EDGE_HINTS, DRILL_HANDLE_HINTS, GROUP_HINTS } from "@/constants/paramHints";

export interface DrillSideEditorProps {
    side: DrillSide;
    params: DrillSideParams | undefined;
    onSaveEdge: (side: DrillSide, field: keyof DrillEdgeParams, value: number) => void;
    onSaveHandle: (side: DrillSide, field: keyof DrillHandleParams, value: number | null) => void;
    pending: boolean;
}

const DrillSideEditor: React.FC<DrillSideEditorProps> = ({
    side,
    params,
    onSaveEdge,
    onSaveHandle,
    pending,
}) => {
    const edge = params?.edge ?? {};
    const handle = params?.handle;

    const visibleEdgeFields = EDGE_FIELDS.filter(f => edge[f.key] != null);

    return (
        <div className="space-y-4">
            {visibleEdgeFields.length > 0 ? (
                <ParamGroup title="Отвори по краях" hint={GROUP_HINTS.edge}>
                    {visibleEdgeFields.map(f => (
                        <ParamField
                            key={f.key}
                            label={f.label}
                            hint={DRILL_EDGE_HINTS[f.key]}
                            value={edge[f.key] ?? null}
                            unit="мм"
                            pending={pending}
                            onSave={val => {
                                const num = Number(val);
                                if (!Number.isNaN(num)) onSaveEdge(side, f.key, num);
                            }}
                        />
                    ))}
                </ParamGroup>
            ) : (
                <p className="text-xs italic text-muted-foreground">Немає параметрів</p>
            )}

            {handle && (
                <ParamGroup
                    title={side === "LEFT" ? "Ручка (за замовчуванням)" : "Ручка"}
                    hint={GROUP_HINTS.handle}
                >
                    <ParamField
                        label="Крок між отворами, X"
                        hint={DRILL_HANDLE_HINTS.spacingX}
                        value={handle.spacingX ?? null}
                        unit="мм"
                        pending={pending}
                        onSave={val => onSaveHandle(side, "spacingX", val !== "" ? parseFloat(val) : null)}
                    />
                    <ParamField
                        label="Зсув по Y"
                        hint={DRILL_HANDLE_HINTS.offsetY}
                        value={handle.offsetY ?? null}
                        unit="мм"
                        pending={pending}
                        onSave={val => onSaveHandle(side, "offsetY", val !== "" ? parseFloat(val) : null)}
                    />
                </ParamGroup>
            )}
        </div>
    );
};

export default DrillSideEditor;
