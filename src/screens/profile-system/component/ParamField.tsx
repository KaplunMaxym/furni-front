import React, { useEffect, useRef, useState } from "react";

import { cn } from "@/helpers/cn";
import Hint from "@/ui/hint/Hint";

export interface ParamFieldProps {
    label: string;
    value: number | string | null | undefined;
    unit?: string;
    pending?: boolean;
    onSave: (value: string) => void;
    readOnly?: boolean;
    /** Що означає це число — розкривається з іконки біля підпису. */
    hint?: string;
}

const AUTOSAVE_DELAY_MS = 700;

const ParamField: React.FC<ParamFieldProps> = ({
    label,
    value,
    unit,
    pending,
    onSave,
    readOnly = false,
    hint,
}) => {
    const asText = value == null ? "" : String(value);
    const [draft, setDraft] = useState(asText);

    useEffect(() => setDraft(asText), [asText]);

    const changed = draft.trim() !== asText && draft.trim() !== "";
    const savedRef = useRef(onSave);
    savedRef.current = onSave;

    useEffect(() => {
        if (!changed || readOnly) return;

        const timer = setTimeout(() => savedRef.current(draft.trim()), AUTOSAVE_DELAY_MS);
        return () => clearTimeout(timer);
    }, [draft, changed, readOnly]);

    /* Підпис і, якщо є пояснення, іконка поруч із ним. */
    const caption = (
        <span className="flex min-w-0 items-center gap-1">
            <span className="truncate text-[11px] uppercase leading-none tracking-wide text-muted-foreground">
                {label}
            </span>
            {hint && <Hint title={label}>{hint}</Hint>}
        </span>
    );

    if (readOnly) {
        return (
            <div className={cn("flex min-w-0 flex-col gap-1")}>
                {caption}
                <p className="flex h-9 items-center rounded-md border border-input px-2.5 text-sm text-muted-foreground">
                    {asText === "" ? "—" : `${asText}${unit ? ` ${unit}` : ""}`}
                </p>
            </div>
        );
    }

    return (
        <label className={cn("flex min-w-0 flex-col gap-1")}>
            {caption}

            <span className="relative flex items-center">
                <input
                    type="number"
                    step="0.001"
                    inputMode="decimal"
                    value={draft}
                    disabled={pending}
                    onChange={e => setDraft(e.target.value)}
                    placeholder="—"
                    className={cn(
                        "h-9 w-full rounded-md border border-input bg-transparent pl-2.5 text-sm shadow-xs",
                        "text-foreground placeholder:text-muted-foreground/70 outline-none",
                        "transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        "disabled:opacity-50",
                        unit ? "pr-10" : "pr-2.5",
                        changed && "border-chart-3/60",
                    )}
                />

                {unit && (
                    <span className="pointer-events-none absolute right-2.5 text-sm leading-none text-muted-foreground">
                        {unit}
                    </span>
                )}
            </span>
        </label>
    );
};

export default ParamField;
