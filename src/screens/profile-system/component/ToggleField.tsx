import React from "react";
import { cn } from "@/helpers/cn";

export interface ToggleFieldProps {
    label: string;
    value: boolean;
    onToggle: (v: boolean) => void;
    pending?: boolean;
}

const ToggleField: React.FC<ToggleFieldProps> = ({ label, value, onToggle, pending }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">{label}</span>
        <button
            onClick={() => onToggle(!value)}
            disabled={pending}
            className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50",
                value ? "bg-green-600" : "bg-gray-300"
            )}
        >
            <span className={cn(
                "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform",
                value ? "translate-x-4" : "translate-x-1"
            )} />
        </button>
    </div>
);

export default ToggleField;