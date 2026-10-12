import React from "react";
import ParamField from "./ParamField";
import ParamGroup from "./ParamGroup";
import ToggleField from "./ToggleField";
import { DetailCode } from "@/screens/profile-system/types/OperationDetailsType";

export interface ShelfFieldDef {
    key: string;
    label: string;
}

export interface ShelfSideEditorProps {
    side: DetailCode;
    params?: Record<string, unknown>;
    fields: ShelfFieldDef[];
    withFromEnd?: boolean;
    title?: string;
    pending?: boolean;
    onSave: (field: string, value: number | boolean) => void;
    unit?: string;
    /**
     * Пояснення полів за ключем. Приходять ззовні, бо однакові поля в різних
     * операціях означають різне: `startX` у пазі боковини — це не те саме, що
     * `startX` у фрезеруванні рами.
     */
    hints?: Record<string, string>;
}

const ShelfSideEditor: React.FC<ShelfSideEditorProps> = ({
    params,
    fields,
    withFromEnd = false,
    title,
    pending,
    onSave,
    unit = "мм",
    hints,
}) => {
    const hasParams = params && Object.keys(params).length > 0;

    if (!hasParams) {
        return (
            <p className="text-xs italic text-muted-foreground">
                Для цієї деталі операція не передбачена
            </p>
        );
    }

    const numericValue = (key: string) => {
        const v = params?.[key];
        return typeof v === "number" ? v : undefined;
    };

    return (
        <div className="space-y-4">
            <ParamGroup title={title}>
                {fields.map(f => (
                    <ParamField
                        key={f.key}
                        label={f.label}
                        hint={hints?.[f.key]}
                        value={numericValue(f.key)}
                        unit={unit}
                        pending={pending}
                        onSave={val => {
                            const num = Number(val);
                            if (!Number.isNaN(num)) onSave(f.key, num);
                        }}
                    />
                ))}
            </ParamGroup>

            {withFromEnd && (
                <ToggleField
                    label="Від кінця деталі"
                    hint={hints?.fromEnd}
                    value={params?.fromEnd !== false}
                    pending={pending}
                    onToggle={v => onSave("fromEnd", v)}
                />
            )}
        </div>
    );
};

export default ShelfSideEditor;
