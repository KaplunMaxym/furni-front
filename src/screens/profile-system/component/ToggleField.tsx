import React from "react";

import { cn } from "@/helpers/cn";
import Hint from "@/ui/hint/Hint";

export interface ToggleFieldProps {
    label: string;
    value: boolean;
    onToggle: (v: boolean) => void;
    pending?: boolean;
    /** Що змінює цей перемикач — розкривається з іконки біля підпису. */
    hint?: string;
}

/**
 * Перемикач.
 *
 * Був невидимий: `bg-green-600` для увімкненого і `bg-gray-300` для
 * вимкненого — обидва класи в проєкті не існують (`theme.colors` замінює
 * палітру Tailwind), тож доріжка йшла без фону в обох станах, і відрізнити
 * їх можна було хіба що за положенням кружечка.
 */
const ToggleField: React.FC<ToggleFieldProps> = ({ label, value, onToggle, pending, hint }) => (
    <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-sm text-foreground">{label}</span>
            {hint && <Hint title={label}>{hint}</Hint>}
        </span>

        <button
            type="button"
            role="switch"
            aria-checked={value}
            onClick={() => onToggle(!value)}
            disabled={pending}
            className={cn(
                "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full",
                "outline-none transition-colors disabled:opacity-50",
                "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                value ? "bg-primary" : "bg-input",
            )}
        >
            <span
                className={cn(
                    "inline-block h-3.5 w-3.5 transform rounded-full shadow transition-transform",
                    value ? "translate-x-4 bg-primary-foreground" : "translate-x-1 bg-muted-foreground",
                )}
            />
        </button>
    </div>
);

export default ToggleField;
