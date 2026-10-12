import React from "react";
import ParamField from "./ParamField";
import ParamGroup from "./ParamGroup";
import { DrillSide, MillSideOption, MillSideParams } from "@/screens/profile-system/types/OperationDetailsType";
import { MILL_HINTS } from "@/constants/paramHints";
import { MILL_SIDES_LABELS } from "@/screens/profile-system/constants/profileSystemConstants";

export interface MillExtraField {
    key: string;
    label: string;
}

export interface MillSideEditorProps {
    side: DrillSide;
    params: MillSideParams | undefined;
    onSave: (side: DrillSide, field: keyof MillSideParams, value: number | MillSideOption) => void;
    pending: boolean;
    extraFields?: MillExtraField[];
    onSaveExtra?: (field: string, value: number) => void;
    extraPending?: boolean;
}

const MillSideEditor: React.FC<MillSideEditorProps> = ({
    side,
    params,
    onSave,
    pending,
    extraFields = [],
    onSaveExtra,
    extraPending,
}) => {
    const hasPair = params?.millLengthStart !== undefined || params?.millLengthEnd !== undefined;

    const extraValue = (key: string) => {
        const v = (params as unknown as Record<string, unknown> | undefined)?.[key];
        return typeof v === "number" ? v : undefined;
    };

    return (
        <ParamGroup>
            {hasPair ? (
                <>
                    <ParamField
                        label="Довжина, початок"
                        hint={MILL_HINTS.millLengthStart}
                        value={params?.millLengthStart}
                        unit="мм"
                        pending={pending}
                        onSave={val => {
                            const num = Number(val);
                            if (!Number.isNaN(num)) onSave(side, "millLengthStart", num);
                        }}
                    />
                    <ParamField
                        label="Довжина, кінець"
                        hint={MILL_HINTS.millLengthEnd}
                        value={params?.millLengthEnd ?? params?.millLengthStart}
                        unit="мм"
                        pending={pending}
                        onSave={val => {
                            const num = Number(val);
                            if (!Number.isNaN(num)) onSave(side, "millLengthEnd", num);
                        }}
                    />
                </>
            ) : (
                <ParamField
                    label="Довжина фрезерування"
                    hint={MILL_HINTS.millLength}
                    value={params?.millLength}
                    unit="мм"
                    pending={pending}
                    onSave={val => {
                        const num = Number(val);
                        if (!Number.isNaN(num)) onSave(side, "millLength", num);
                    }}
                />
            )}

            {extraFields.map(f => (
                <ParamField
                    key={f.key}
                    label={f.label}
                    hint={MILL_HINTS[f.key]}
                    value={extraValue(f.key)}
                    unit="мм"
                    pending={extraPending}
                    onSave={val => {
                        const num = Number(val);
                        if (!Number.isNaN(num)) onSaveExtra?.(f.key, num);
                    }}
                />
            ))}

            <ParamField
                label="Сторони фрезерування"
                hint={MILL_HINTS.millSides}
                // У базі лишається `both`/`start`/`end` — на екран іде підпис
                value={params?.millSides ? MILL_SIDES_LABELS[params.millSides] : undefined}
                readOnly
                onSave={() => undefined}
            />
        </ParamGroup>
    );
};

export default MillSideEditor;
