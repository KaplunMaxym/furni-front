import React, { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
    ArrowLeft,
    Boxes,
    Check,
    Info,
    Loader2,
    type LucideIcon,
    Package,
    Settings2,
} from "lucide-react";

import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import { cn } from "@/helpers/cn";
import { refreshIcon } from "@/assets";
import { Button } from "@/ui/shadcn/button";
import PageHeader, { HeaderBadge, SectionHeading } from "@/ui/page-header/PageHeader";

import { useProfileSystemFullQuery } from "@/screens/profile-system/hooks/useProfileSystemFullQuery";
import { useProfileSystemMutations } from "@/screens/profile-system/hooks/useProfileSystemMutations";
import { IProfileSystemOperation } from "@/screens/profile-system/types/profile-system/IProfileSystemOperation";
import SectionCard from "@/screens/profile-system/component/SectionCard";
import GeneralSection from "@/screens/profile-system/component/GeneralSection";
import OperationSection from "@/screens/profile-system/component/OperationSection";
import MaterialsSection from "@/screens/profile-system/component/MaterialsSection";
import AccessoriesSection from "@/screens/profile-system/component/AccessoriesSection";

type SectionId = 'general' | 'materials' | 'accessories' | 'operations';

interface SectionMeta {
    id: SectionId;
    label: string;
    /** Пояснення над самим розділом — на відміну від `counts`, воно не міняється. */
    description: string;
    icon: LucideIcon;
}

const SECTIONS: SectionMeta[] = [
    {
        id: 'general',
        label: 'Основна інформація',
        description: 'Назва, коди та габаритні межі, у яких можна створювати конструкції',
        icon: Info,
    },
    {
        id: 'materials',
        label: 'Матеріали профілю',
        description: 'З яких деталей складається виріб і який профіль іде на кожну з них',
        icon: Package,
    },
    {
        id: 'accessories',
        label: 'Аксесуари профілю',
        description: 'Фурнітура, що додається до кожної конструкції на цій системі',
        icon: Boxes,
    },
    {
        id: 'operations',
        label: 'Операції та CNC',
        description: 'Обробка деталей і шаблони програм для верстата',
        icon: Settings2,
    },
];

/**
 * Підписи типів операцій.
 *
 * У картці розділу раніше стояло тільки «Активна» / «Вимкнена», і на системі
 * з десятком операцій усі згорнуті картки виглядали однаково — щоб знайти
 * потрібну, треба було розгортати їх по черзі.
 */
const OPERATION_LABELS: Record<string, string> = {
    CUT:          'Різ',
    MILL:         'Фрезерування',
    DRILL:        'Свердління',
    HANDLE_MILL:  'Фрезерування під ручку',
    HANDLE_DRILL: 'Свердління під ручку',
    MILL_DRILL:   'Фрезерування і свердління',
    HINGE_MILL:   'Фрезерування під завіси',
    GROOVE_MILL:  'Паз',
    SLOT_MILL:    'Проріз',
    WIRE_MILL:    'Канал під дріт',
    BACK_GROOVE:  'Задній паз',
    ASSEMBLY:     'Складання',
    OTHER:        'Інше',
};

/**
 * Стан автозбереження — той самий індикатор, що на сторінці налаштувань
 * проєкту dashboard. Показує, що зміни не загубилися, і замінює собою кнопку.
 */
const SaveState: React.FC<{ isSaving: boolean; isDirty: boolean }> = ({ isSaving, isDirty }) => (
    <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
        {isSaving || isDirty ? (
            <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Зберігаємо
            </>
        ) : (
            <>
                <Check className="h-3.5 w-3.5" />
                Збережено
            </>
        )}
    </span>
);

/**
 * Сторінка профільної системи.
 *
 * Було: дві колонки, у лівій одна під одною чотири картки (інформація,
 * розміри, матеріали, аксесуари), у правій — усі операції розгорнутим списком.
 * На системі з десятком операцій сторінка йшла на кілька екранів прокрутки, і
 * щоб від аксесуарів дійти до потрібної операції, доводилось шукати очима.
 *
 * Стало: розділи ліворуч, вміст праворуч — як на сторінці Settings у проєкті
 * dashboard. Розділів чотири, вони різні за змістом, і в такому вигляді видно
 * всі одразу, а не два ярлики з рештою, схованою всередині. Лічильники біля
 * назв відповідають на питання «а там взагалі щось є» до переходу в розділ.
 */
const ProfileSystemDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const profileSystemId = Number(id);

    const [section, setSection] = useState<SectionId>('general');
    const [isDirty, setIsDirty] = useState(false);

    // Стабільне посилання: інакше ефект у GeneralSection перезапускався б
    // на кожен рендер сторінки
    const handleDirtyChange = useCallback((dirty: boolean) => setIsDirty(dirty), []);

    const { data, isPending, isError } = useProfileSystemFullQuery(profileSystemId);
    const mutations = useProfileSystemMutations(profileSystemId);

    if (isPending) {
        return (
            <MainLayout>
                <div className="flex h-48 w-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin">
                        <img src={refreshIcon} alt="завантаження" />
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (isError || !data) {
        return (
            <MainLayout>
                <div className="flex h-48 w-full flex-col items-center justify-center gap-3">
                    <p className="text-sm text-destructive-foreground">
                        Не вдалося завантажити профільну систему
                    </p>
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeft /> Повернутися
                    </Button>
                </div>
            </MainLayout>
        );
    }

    const details = data.details ?? [];
    const accessories = data.accessories ?? [];
    const operations = data.operations ?? [];

    const counts: Record<SectionId, string> = {
        general: 'Назва, коди, розміри',
        materials: details.length ? `${details.length} деталей` : 'Немає деталей',
        accessories: accessories.length ? `${accessories.length} позицій` : 'Немає позицій',
        operations: operations.length ? `${operations.length} операцій` : 'Немає операцій',
    };

    const isSaving = mutations.updateSystem.isPending;
    const activeMeta = SECTIONS.find(item => item.id === section);

    return (
        <MainLayout>
            <div className="flex w-full flex-col gap-4">
                {/* Назва й коди одним рядком; підпис у плашці каже, що це за код */}
                <PageHeader
                    title={data.title}
                    badges={
                        <>
                            <HeaderBadge mono>Код {data.code}</HeaderBadge>
                            {data.code1C && <HeaderBadge mono>1С: {data.code1C}</HeaderBadge>}
                        </>
                    }
                    leading={
                        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                            <ArrowLeft /> Повернутися
                        </Button>
                    }
                    actions={section === 'general' && <SaveState isSaving={isSaving} isDirty={isDirty} />}
                />

                {/* ── розділи + вміст ─────────────────────────────────── */}
                <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
                    <div className="h-fit rounded-xl border border-border bg-card p-2">
                        {/*
                          * На вузькому екрані меню лягає над вмістом рядком —
                          * колонка на 240 px там з'їла б половину ширини.
                          */}
                        <div className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
                            {SECTIONS.map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setSection(item.id)}
                                    className={cn(
                                        'flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors lg:w-full',
                                        item.id === section
                                            ? 'bg-primary/10 text-foreground'
                                            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                                    )}
                                >
                                    <item.icon className="h-4 w-4 shrink-0" />

                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-medium">
                                            {item.label}
                                        </span>
                                        <span className="hidden truncate text-xs text-muted-foreground lg:block">
                                            {counts[item.id]}
                                        </span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="min-w-0 space-y-3">
                        {/* Який саме розділ відкрито — раніше про це казало лише меню ліворуч */}
                        {activeMeta && (
                            <SectionHeading title={activeMeta.label} description={activeMeta.description} />
                        )}

                        {section === 'general' && (
                            <SectionCard
                                title="Основна інформація"
                                description="Зміни зберігаються самі"
                            >
                                <GeneralSection
                                    system={data}
                                    isPending={isSaving}
                                    onSave={dto => mutations.updateSystem.mutateAsync(dto)}
                                    onDirtyChange={handleDirtyChange}
                                />
                            </SectionCard>
                        )}

                        {section === 'materials' && (
                            <SectionCard
                                title="Матеріали профілю"
                                description="Який матеріал використовує кожна деталь системи"
                            >
                                {details.length > 0 ? (
                                    <MaterialsSection
                                        profileSystemId={profileSystemId}
                                        details={details}
                                    />
                                ) : (
                                    <p className="py-6 text-center text-sm text-muted-foreground">
                                        У системі ще немає деталей
                                    </p>
                                )}
                            </SectionCard>
                        )}

                        {section === 'accessories' && (
                            <SectionCard
                                title="Аксесуари профілю"
                                description="Що додається до конструкції та за яким правилом рахується"
                            >
                                <AccessoriesSection
                                    profileSystemId={profileSystemId}
                                    accessories={accessories}
                                />
                            </SectionCard>
                        )}

                        {section === 'operations' && (
                            operations.length > 0 ? (
                                operations
                                    .slice()
                                    .sort((a, b) => a.sequence - b.sequence)
                                    .map((op: IProfileSystemOperation) => (
                                        <SectionCard
                                            key={op.id}
                                            title={op.title || OPERATION_LABELS[op.operationType] || 'Без назви'}
                                            description={[
                                                `№${op.sequence}`,
                                                OPERATION_LABELS[op.operationType] ?? op.operationType,
                                                op.cncProgramTemplates.length
                                                    ? `${op.cncProgramTemplates.length} програм CNC`
                                                    : null,
                                            ].filter(Boolean).join(' · ')}
                                            badge={!op.isActive && (
                                                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                                    Вимкнена
                                                </span>
                                            )}
                                            collapsible
                                            // Згорнуті за замовчуванням: розгорнуті
                                            // операції знову дали б довгий сувій
                                            defaultOpen={false}
                                        >
                                            <OperationSection
                                                op={op}
                                                profileSystemId={profileSystemId}
                                                systemDetails={details}
                                                mutations={mutations}
                                            />
                                        </SectionCard>
                                    ))
                            ) : (
                                <SectionCard title="Операції та CNC">
                                    <p className="py-6 text-center text-sm text-muted-foreground">
                                        У системі ще немає операцій
                                    </p>
                                </SectionCard>
                            )
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ProfileSystemDetailPage;
