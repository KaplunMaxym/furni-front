import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "@/ui/input/Input";

export interface InlineFieldProps {
    label: string;
    value: string | number | null | undefined;
    type?: "text" | "number";
    onSave: (val: string) => void;
    pending?: boolean;
    unit?: string;
}

interface InlineForm {
    value: string | number;
}

const InlineField: React.FC<InlineFieldProps> = ({ label, value, type = "text", onSave, pending, unit }) => {
    const [editing, setEditing] = useState(false);

    const { control, handleSubmit, reset } = useForm<InlineForm>({
        defaultValues: { value: value ?? "" },
    });

    const handleSave = handleSubmit((data) => {
        onSave(String(data.value));
        setEditing(false);
    });

    const handleCancel = () => {
        reset({ value: value ?? "" });
        setEditing(false);
    };

    const handleOpen = () => {
        reset({ value: value ?? "" });
        setEditing(true);
    };

    return (
        <div className="flex flex-row gap-4 items-center">
            <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
            {editing ? (
                <div className="flex flex-row gap-2 items-center">
                    <Input
                        control={control}
                        name="value"
                        type={type}
                        classNameContainer="mb-0"
                        className="text-sm"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave();
                            if (e.key === "Escape") handleCancel();
                        }}
                    />
                    <button
                        onClick={handleSave}
                        disabled={pending}
                        className="text-xs px-2 py-1 bg-emerald/500 text-white rounded hover:bg-emerald/600 disabled:opacity-50 whitespace-nowrap"
                    >
                        Зберегти
                    </button>
                    <button
                        onClick={handleCancel}
                        className="text-xs px-2 py-1 bg-red/600 font-bold rounded hover:bg-red/500 whitespace-nowrap"
                    >
                        Скасувати
                    </button>
                </div>
            ) : (
                <div
                    className="flex items-center gap-1 group cursor-pointer"
                    onClick={handleOpen}
                >
                    <span className="text-sm font-medium text-gray-800">
                        {value != null && value !== ""
                            ? `${value}${unit ? ` ${unit}` : ""}`
                            : <span className="text-gray-400 italic">—</span>
                        }
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-green-600 ml-1">✎</span>
                </div>
            )}
        </div>
    );
};

export default InlineField;