import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
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
            {/* gray-400 / gray-800 / green-600 тут не працювали: theme.colors
                замінює палітру Tailwind, і плоских ключів у ній немає */}
            <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
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
                        className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 whitespace-nowrap"
                    >
                        Зберегти
                    </button>
                    <button
                        onClick={handleCancel}
                        className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 whitespace-nowrap"
                    >
                        Скасувати
                    </button>
                </div>
            ) : (
                <div
                    className="flex items-center gap-1 group cursor-pointer"
                    onClick={handleOpen}
                >
                    <span className="text-sm font-medium text-foreground">
                        {value != null && value !== ""
                            ? `${value}${unit ? ` ${unit}` : ""}`
                            : <span className="text-muted-foreground italic">—</span>
                        }
                    </span>
                    <Pencil className="ml-1 h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
            )}
        </div>
    );
};

export default InlineField;