import {DrillEdgeParams, DrillSide, MillSideOption} from "@/screens/profile-system/types/OperationDetailsType";

export const OPERATION_TYPE_LABELS: Record<string, string> = {
    CUT:         "Різання",
    MILL:        "Фрезерування",
    DRILL:       "Свердління",
    HANDLE_MILL: "Фрезерування ручки",
    MILL_DRILL:  "Фрезер + свердління",
};

export const DETAIL_TYPE_LABELS: Record<string, string> = {
    PROFILE: "Профіль",
    HANDLE:  "Ручка",
    GLASS:   "Скло",
};

export const SIDES: DrillSide[] = ["TOP", "BOTTOM", "LEFT", "RIGHT"];

export const SIDE_LABELS: Record<DrillSide, string> = {
    TOP: "Верх", BOTTOM: "Низ", LEFT: "Ліво", RIGHT: "Право",
};

export const MILL_SIDES_OPTIONS: MillSideOption[] = ["none", "start", "end", "both"];

export const EDGE_FIELDS: Array<{ key: keyof DrillEdgeParams; label: string }> = [
    { key: "startOffsetX1", label: "Start X1" },
    { key: "startOffsetX2", label: "Start X2" },
    { key: "startOffsetX3", label: "Start X3" },
    { key: "endOffsetX1",   label: "End X1" },
    { key: "endOffsetX2",   label: "End X2" },
    { key: "endOffsetX3",   label: "End X3" },
    { key: "offsetY",       label: "Offset Y" },
    { key: "offsetY1",      label: "Offset Y1 (start)" },
    { key: "offsetY2",      label: "Offset Y2 (end)" },
    { key: "offsetZ",       label: "Offset Z" },
    // { key: "countStart",    label: "Count Start" },
    // { key: "countEnd",      label: "Count End" },
];