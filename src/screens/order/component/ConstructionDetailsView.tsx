import React, { FC } from "react";
import {Check} from "lucide-react";
import { cn } from "@/helpers/cn";
import Loading from "@/ui/loading/Loading";
import { ConstructionDetail } from "@/screens/construction/type/construction-details/IConstructionDetail";
import { useConstructionDetails } from "@/screens/construction/hooks/construction-details/useConstructionDetails";
import { SectionLabel } from "@/ui/section-label/SectionLabel";
import {DETAIL_TYPE_LABELS, DetailType} from "@/screens/construction/type/construction/IConstruction";

interface ConstructionDetailsViewProps {
    constructionId: number;
    className?: string;
    onDetailClick?: (detailId: number) => void;
}

/** Плитка зведення: підпис ліворуч, число праворуч. */
const Stat: FC<{ label: string; value: number | string }> = ({ label, value }) => (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-accent/30 p-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
);

const ConstructionDetailsView: FC<ConstructionDetailsViewProps> = ({constructionId, className, onDetailClick}) => {
    const { data: details, isPending, isError, error } = useConstructionDetails(constructionId);

    const calculateDetailProgress = (detail: ConstructionDetail): number => {
        if (detail.operations.length === 0) return 0;
        const completedOps = detail.operations.filter(op => op.isCompleted).length;
        return Math.round((completedOps / detail.operations.length) * 100);
    };

    if (isPending) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loading />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-destructive/40 border border-destructive/40 rounded-lg p-4">
                <p className="text-destructive-foreground">Помилка завантаження деталей конструкції</p>
                <p className="text-sm text-destructive-foreground mt-1">{error?.message}</p>
            </div>
        );
    }

    if (!details || details.length === 0) {
        return (
            <div className="flex items-center justify-center h-96 bg-accent/30 rounded-lg border border-border">
                <div className="text-center">
                    <p className="text-muted-foreground text-lg">Деталі конструкції не знайдено</p>
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            {/*
              * Підпис на підкладці — такий самий, як у розкладі вартості.
              * Раніше це був дрібний сірий рядок того ж кольору, що й підписи
              * плиток під ним, тож заголовок не читався як заголовок.
              */}
            <SectionLabel>Деталі конструкції ({details.length} шт.)</SectionLabel>

            <div className="space-y-3 p-3">
            {details.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    {/*
                      * Три однакові плитки, а не зелена, синя й фіолетова.
                      * Кольори не позначали ні стану, ні шкали — це просто три
                      * числа, і різні відтінки лише змагалися між собою.
                      */}
                    <Stat label="Завершені деталі" value={details.filter(d => d.isCompleted).length} />
                    <Stat label="Всього операцій" value={details.reduce((sum, d) => sum + d.operations.length, 0)} />
                    <Stat
                        label="Загальний прогрес"
                        value={`${Math.round((details.filter(d => d.isCompleted).length / details.length) * 100)}%`}
                    />
                </div>
            )}

            <div className="space-y-2">
                {[...details].sort((a, b) => a.detailNo.localeCompare(b.detailNo)).map((detail) => {
                    const progress = calculateDetailProgress(detail);

                    return (
                        <button
                            key={detail.id}
                            onClick={() => onDetailClick?.(detail.id)}
                            className="w-full bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow p-3 hover:bg-accent/40"
                        >
                            <div className="flex gap-2 flex-1 min-w-0">
                                {/*
                                  * Кружечок готовності: заповнений, коли деталь
                                  * завершена, і порожній, коли ні. Раніше він був
                                  * смарагдовий проти сірого з `opacity-20` — обидва
                                  * класи в цій палітрі не існують, тож обведення
                                  * просто не малювалось.
                                  */}
                                <div
                                    className={cn(
                                        "flex-shrink-0 w-[26px] h-[26px] rounded-full flex items-center justify-center border transition-colors",
                                        detail.isCompleted
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-input'
                                    )}
                                >
                                    {detail.isCompleted && <Check size={14} strokeWidth={3} />}
                                </div>

                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            {/*
                                              * Тип деталі — нейтральний бейдж із
                                              * підписом українською. Було п'ять
                                              * різнокольорових плашок зі словами
                                              * «PROFILE», «GLASS»: колір нічого не
                                              * означав, крім самого типу, тобто
                                              * дублював напис усередині себе.
                                              */}
                                            <span className="rounded-full border border-input px-2 py-0.5 text-xs text-muted-foreground">
                                                {DETAIL_TYPE_LABELS[detail.type]}
                                            </span>
                                            <span className="text-sm font-bold text-foreground">
                                                Деталь №{detail.detailNo}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-muted-foreground">
                                                {detail.name}
                                            </span>
                                            {detail.type === DetailType.GLASS && detail.area != null && (
                                                <span className="text-sm font-bold text-foreground">
                                                    {detail.area} м²
                                                </span>
                                            )}
                                            {detail.type === DetailType.HANDLE && detail.handleOffset != null && (
                                                <span className="text-sm font-bold text-foreground">
                                                   {detail.handleOffset} мм
                                                </span>
                                            )}
                                            {detail.type === DetailType.PROFILE && detail.length != null && (
                                                <span className="text-sm font-bold text-foreground">
                                                    {detail.length} мм
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {detail.operations.length > 0 && (
                                        <div className="mt-2 flex items-center gap-2">
                                            {/*
                                              * Смуга одного кольору. Раніше вона
                                              * міняла колір за відсотком — червона,
                                              * жовта, синя, зелена — ніби 30 %
                                              * готовності це тривога. Довжина смуги
                                              * і так каже все, що треба.
                                              */}
                                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full bg-primary transition-all duration-300"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                                {progress}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
            </div>
        </div>
    );
};

export default ConstructionDetailsView;