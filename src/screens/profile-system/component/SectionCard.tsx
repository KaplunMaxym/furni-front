import React, { useState } from "react";
import { cn } from "@/helpers/cn";

export interface SectionCardProps {
    title: string;
    badge?: string;
    badgeColor?: string;
    children: React.ReactNode;
    collapsible?: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({title, badge, badgeColor = "bg-gray-100 text-gray-600", children, collapsible = false}) => {
    const [open, setOpen] = useState(true);

    return (
        <div className="rounded-xl bg-react/600 shadow-sm overflow-hidden">
            <div
                className={cn(
                    "flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200",
                    collapsible && "cursor-pointer hover:bg-gray-100"
                )}
                onClick={collapsible ? () => setOpen(o => !o) : undefined}
            >
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
                    {badge && (
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", badgeColor)}>
                            {badge}
                        </span>
                    )}
                </div>
                {collapsible && <span className="text-gray-400 text-xs">{open ? "▲" : "▼"}</span>}
            </div>
            {(!collapsible || open) && <div className="p-5">{children}</div>}
        </div>
    );
};

export default SectionCard;