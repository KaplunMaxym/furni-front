import React, { useState } from "react";
import { FileCode2 } from "lucide-react";

import SegmentedTabs, { type SegmentedTab } from "@/ui/tabs/SegmentedTabs";
import { IProfileSystemOperation } from "@/screens/profile-system/types/profile-system/IProfileSystemOperation";
import { useProfileSystemMutations } from "@/screens/profile-system/hooks/useProfileSystemMutations";
import ParamField from "./ParamField";
import ParamGroup from "./ParamGroup";
import DrillSideEditor from "./DrillSideEditor";
import MillSideEditor from "./MillSideEditor";
import CncTemplateModal from "@/screens/profile-system/features/modals/modal-cnc-template";
import useModal from "@/hooks/useModal";
import { ICncProgramTemplate } from "@/screens/profile-system/types/cnc/ICncProgramTemplate";
import ShelfSideEditor, { ShelfFieldDef } from "./ShelfSideEditor";
import ToggleField from "./ToggleField";
import {
    CutParams, DetailCode, DrillEdgeParams, DrillHandleParams,
    DrillParameters,
    DrillSide,
    MillParameters, MillSideOption, MillSideParams
} from "@/screens/profile-system/types/OperationDetailsType";
import {
    SIDE_LABELS, SIDES, sidesFromParams,
    SHELF_PAIR_FIELDS, SHELF_WIRE_FIELDS, SHELF_BACK_GROOVE_FIELDS, SHELF_DRILL_FIELDS, ALL_DETAIL_CODES,
} from "@/screens/profile-system/constants/profileSystemConstants";
import {
    CUT_HINTS, GROUP_HINTS, MILL_COMMON_HINTS,
    SHELF_BACK_GROOVE_HINTS, SHELF_DRILL_HINTS, SHELF_PAIR_HINTS, SHELF_WIRE_HINTS,
} from "@/constants/paramHints";

export interface OperationSectionProps {
    op: IProfileSystemOperation;
    profileSystemId: number;
    systemDetails?: Array<{ code: string; detailType: string }>;
    mutations: ReturnType<typeof useProfileSystemMutations>;
}

type InnerTab = 'params' | 'cnc';

/** Обгортка для блоку параметрів — щоб він читався як окрема панель. */
const ParamsPanel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="rounded-lg border border-border bg-accent/30 p-4">{children}</div>
);

const OperationSection: React.FC<OperationSectionProps> = ({ op, mutations, systemDetails = [] }) => {
    const [activeSide, setActiveSide] = useState<DetailCode>("TOP");
    const [openTemplate, setOpenTemplate] = useState<ICncProgramTemplate | null>(null);
    const templateModal = useModal();

    const isDrill = op.operationType === "DRILL";
    const isMill  = op.operationType === "MILL";
    const isCut   = op.operationType === "CUT";

    const SHELF_FIELDS: Partial<Record<string, {
        fields: ShelfFieldDef[];
        withFromEnd?: boolean;
        hints: Record<string, string>;
    }>> = {
        GROOVE_MILL: { fields: SHELF_PAIR_FIELDS, hints: SHELF_PAIR_HINTS },
        SLOT_MILL:   { fields: SHELF_PAIR_FIELDS, hints: SHELF_PAIR_HINTS },
        WIRE_MILL:   { fields: SHELF_WIRE_FIELDS, withFromEnd: true, hints: SHELF_WIRE_HINTS },
        BACK_GROOVE: { fields: SHELF_BACK_GROOVE_FIELDS, hints: SHELF_BACK_GROOVE_HINTS },
    };

    const filledSideParams = Object.entries(
        (op.defaultParameters as unknown as Record<string, Record<string, unknown>> | null) ?? {},
    ).filter(([code, value]) =>
        (ALL_DETAIL_CODES as string[]).includes(code) &&
        value && typeof value === 'object' && Object.keys(value).length > 0,
    );

    const isShelfDrill = isDrill
        && filledSideParams.length > 0
        && filledSideParams.every(([, value]) => !('edge' in value));

    // Показуються лише ті ключі, що справді є в параметрах сторони, — тож
    // список спільний для всіх систем, а на екран потрапляє тільки своє.
    const MILL_EXTRA_KEYS: Array<{ key: string; label: string }> = [
        { key: 'startX',        label: 'Початок, X' },
        { key: 'centerX',       label: 'Центр, X' },
        { key: 'sideX',         label: 'Від краю, X' },
        { key: 'mirrorOffsetX', label: 'Дзеркальний зсув, X' },
    ];

    const shelfConfig = isShelfDrill
        ? { fields: SHELF_DRILL_FIELDS, hints: SHELF_DRILL_HINTS }
        : SHELF_FIELDS[op.operationType];
    const isShelfOp   = Boolean(shelfConfig);
    const shelfParams = (op.defaultParameters as unknown as Record<string, Record<string, unknown>> | null) ?? {};

    const hasHandleDetail = systemDetails.some(d => d.detailType === 'HANDLE');

    const availableSides = ((isShelfOp || isDrill || isMill)
        ? sidesFromParams(op.defaultParameters as unknown as Record<string, unknown> | null)
        : SIDES
    ).filter(side => {
        const sideParams = (op.defaultParameters as unknown as
            Record<string, { millSides?: string } | undefined> | null)?.[side];

        if (sideParams && Object.keys(sideParams).length === 0) return false;

        if (isMill) return sideParams?.millSides !== 'none';

        return true;
    });

    const effectiveSide: DetailCode = availableSides.includes(activeSide)
        ? activeSide
        : (availableSides[0] ?? activeSide);

    const saveShelfField = (side: string, field: string, value: number | boolean) => {
        const next = {
            ...shelfParams,
            [side]: { ...(shelfParams[side] ?? {}), [field]: value },
        };
        mutations.updateOperation.mutate({ id: op.id, dto: { defaultParameters: next } });
    };

    const hasCnc = op.cncProgramTemplates.length > 0;
    const hasParams = isDrill || isMill || isCut || isShelfOp;

    const [innerTab, setInnerTab] = useState<InnerTab>(hasParams ? 'params' : 'cnc');

    const drillParams = isDrill ? (op.defaultParameters as DrillParameters | null) ?? {} : {};
    const millParams  = isMill  ? (op.defaultParameters as MillParameters  | null) ?? {} : {};
    const cutParams   = isCut   ? (op.defaultParameters as CutParams | null) : null;

    /*
     * Корекції довжини тут немає навмисно.
     *
     * Вона описує профіль, а не операцію, і живе в «Основній інформації»
     * системи одним значенням. Поки вона лежала всередині кожної операції, ще
     * й окремо для кожної сторони, те саме число доводилось правити в чотирьох
     * місцях — і забуте четверте означало, що деталь ріжуть однієї довжини, а
     * фрезерують іншої.
     */

    const millExtraFields = isMill
        ? MILL_EXTRA_KEYS.filter(f =>
            (millParams as unknown as Record<string, Record<string, unknown>>)[effectiveSide]?.[f.key] !== undefined)
        : [];

    const openTemplateModal = (template: ICncProgramTemplate) => {
        setOpenTemplate(template);
        templateModal.onOpen();
    };

    const saveEdgeField = (side: DrillSide, field: keyof DrillEdgeParams, value: number) =>
        mutations.updateDrillSide.mutate({ side, edge: { [field]: value } });

    const saveHandleField = (side: DrillSide, field: keyof DrillHandleParams, value: number | null) => {
        if (value === null) {
            mutations.updateDrillSide.mutate({ side, handle: null });
        } else {
            mutations.updateDrillSide.mutate({ side, handle: { [field]: value } });
        }
    };

    const saveMillField = (side: DrillSide, field: keyof MillSideParams, value: number | MillSideOption) =>
        mutations.updateMillSide.mutate({ side, [field]: value });

    /** Параметри в корені операції фрезерування — діють на всі балки одразу. */
    const millCommon = isMill
        ? (millParams as unknown as { friezeRadius?: number; ignoreHandleSide?: boolean })
        : null;

    const saveMillCommon = (field: 'friezeRadius' | 'ignoreHandleSide', value: number | boolean) =>
        mutations.updateOperation.mutate({
            id: op.id,
            dto: { defaultParameters: { ...(millParams as object), [field]: value } },
        });

    const saveCutField = (field: 'leftAngle' | 'rightAngle' | 'offsetZ', raw: string) =>
        mutations.updateOperation.mutate({
            id: op.id,
            dto: { defaultParameters: { ...cutParams, [field]: parseFloat(raw) } },
        });

    /*
     * Сторони — сегментний перемикач, а не ряд кнопок.
     *
     * Раніше активна сторона фарбувалася класами `bg-emerald/500 text-white`,
     * а решта — `bg-black/500 text-gray-600`. Ні `text-white`, ні `gray-600`
     * без слеша в палітрі немає, тож обидва стани виглядали однаково.
     */
    const sideTabs: ReadonlyArray<SegmentedTab<DetailCode>> = availableSides.map(side => ({
        key: side,
        label: SIDE_LABELS[side],
    }));

    const innerTabs: ReadonlyArray<SegmentedTab<InnerTab>> = [
        ...(hasParams ? [{ key: 'params' as const, label: 'Параметри' }] : []),
        { key: 'cnc' as const, label: 'Програми CNC', count: op.cncProgramTemplates.length },
    ];

    return (
        <div className="flex flex-col gap-3">
            {hasCnc && hasParams && (
                <SegmentedTabs tabs={innerTabs} value={innerTab} onChange={setInnerTab} />
            )}

            {(!hasCnc || innerTab === 'params') && hasParams && (
                <div className="flex flex-col gap-3">
                    {(isDrill || isMill || isShelfOp) && sideTabs.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <SegmentedTabs
                                tabs={sideTabs}
                                value={effectiveSide}
                                onChange={setActiveSide}
                            />
                            {effectiveSide === 'LEFT' && hasHandleDetail && (
                                <span className="text-xs text-muted-foreground">
                                    сторона ручки за замовчуванням
                                </span>
                            )}
                        </div>
                    )}

                    {isDrill && !isShelfDrill && (
                        <ParamsPanel>
                            <DrillSideEditor
                                side={effectiveSide}
                                params={drillParams[effectiveSide]}
                                onSaveEdge={saveEdgeField}
                                onSaveHandle={saveHandleField}
                                pending={mutations.updateDrillSide.isPending}
                            />
                        </ParamsPanel>
                    )}

                    {/*
                      * Спільні параметри фрезерування.
                      *
                      * Радіус фрези й перемикач урахування сторони ручки лежать
                      * у корені параметрів операції й діють на всі балки, але в
                      * інтерфейсі їх не було взагалі — правити їх можна було
                      * лише сідом.
                      */}
                    {isMill && millCommon && (
                        <ParamsPanel>
                            <div className="flex flex-col gap-4">
                                <ParamGroup title="Спільне для всіх балок" hint={GROUP_HINTS.millCommon}>
                                    {millCommon.friezeRadius !== undefined && (
                                        <ParamField
                                            label="Радіус фрези"
                                            hint={MILL_COMMON_HINTS.friezeRadius}
                                            value={millCommon.friezeRadius}
                                            unit="мм"
                                            pending={mutations.updateOperation.isPending}
                                            onSave={v => saveMillCommon('friezeRadius', parseFloat(v))}
                                        />
                                    )}
                                </ParamGroup>

                                {millCommon.ignoreHandleSide !== undefined && (
                                    <ToggleField
                                        label="Не зважати на сторону ручки"
                                        hint={MILL_COMMON_HINTS.ignoreHandleSide}
                                        value={millCommon.ignoreHandleSide}
                                        pending={mutations.updateOperation.isPending}
                                        onToggle={v => saveMillCommon('ignoreHandleSide', v)}
                                    />
                                )}
                            </div>
                        </ParamsPanel>
                    )}

                    {isMill && (
                        <ParamsPanel>
                            <MillSideEditor
                                side={effectiveSide}
                                params={millParams[effectiveSide]}
                                onSave={saveMillField}
                                pending={mutations.updateMillSide.isPending}
                                extraFields={millExtraFields}
                                extraPending={mutations.updateOperation.isPending}
                                onSaveExtra={(field, value) => saveShelfField(effectiveSide, field, value)}
                            />
                        </ParamsPanel>
                    )}

                    {isShelfOp && shelfConfig && (
                        <ParamsPanel>
                            <ShelfSideEditor
                                side={effectiveSide}
                                title="Параметри"
                                params={shelfParams[effectiveSide]}
                                fields={shelfConfig.fields}
                                withFromEnd={'withFromEnd' in shelfConfig ? shelfConfig.withFromEnd : undefined}
                                hints={shelfConfig.hints}
                                pending={mutations.updateOperation.isPending}
                                onSave={(field, value) => saveShelfField(effectiveSide, field, value)}
                            />
                        </ParamsPanel>
                    )}

                    {cutParams !== null && (
                        <ParamsPanel>
                            <div className="flex flex-col gap-4">
                                <ParamGroup title="Різ" hint={GROUP_HINTS.cut}>
                                    <ParamField
                                        label="Лівий кут"
                                        hint={CUT_HINTS.leftAngle}
                                        value={cutParams?.leftAngle ?? null}
                                        // unit="°"
                                        pending={mutations.updateOperation.isPending}
                                        onSave={v => saveCutField('leftAngle', v)}
                                    />
                                    <ParamField
                                        label="Правий кут"
                                        hint={CUT_HINTS.rightAngle}
                                        value={cutParams?.rightAngle ?? null}
                                        // unit="°"
                                        pending={mutations.updateOperation.isPending}
                                        onSave={v => saveCutField('rightAngle', v)}
                                    />
                                    <ParamField
                                        label="Зсув по Z"
                                        hint={CUT_HINTS.offsetZ}
                                        value={cutParams?.offsetZ ?? null}
                                        unit="мм"
                                        pending={mutations.updateOperation.isPending}
                                        onSave={v => saveCutField('offsetZ', v)}
                                    />
                                </ParamGroup>

                            </div>
                        </ParamsPanel>
                    )}
                </div>
            )}

            {hasCnc && (innerTab === 'cnc' || !hasParams) && (
                /*
                 * Список шаблонів, редактор — у модалці.
                 *
                 * Розгортання просто тут розсувало картку операції на висоту
                 * всієї програми, і сусідні операції їхали за межі екрана.
                 */
                <div className="flex flex-col gap-2">
                    {op.cncProgramTemplates.map(t => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => openTemplateModal(t)}
                            className="flex w-full items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-left transition-colors hover:bg-accent/40"
                        >
                            <FileCode2 className="h-4 w-4 shrink-0 text-muted-foreground" />

                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium text-foreground">
                                    {t.name ?? `Шаблон #${t.id}`}
                                </span>
                                <span className="block truncate text-xs text-muted-foreground">
                                    {t.templateContent.split('\n').length} рядків
                                </span>
                            </span>

                            <span className="shrink-0 text-xs text-muted-foreground">Відкрити</span>
                        </button>
                    ))}
                </div>
            )}

            {!hasCnc && !hasParams && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                    Ця операція не має ні параметрів, ні програм CNC
                </p>
            )}

            <CncTemplateModal
                {...templateModal}
                template={openTemplate}
                pending={mutations.updateTemplate.isPending}
                onSave={(templateId, dto) =>
                    mutations.updateTemplate.mutate({ id: templateId, dto })
                }
                onClose={() => {
                    setOpenTemplate(null);
                    templateModal.onClose();
                }}
            />
        </div>
    );
};

export default OperationSection;
