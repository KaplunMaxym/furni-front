import React from "react";
import { useNavigate, useParams } from "react-router";
import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import { useProfileSystemFullQuery } from "@/screens/profile-system/hooks/useProfileSystemFullQuery";
import { useProfileSystemMutations } from "@/screens/profile-system/hooks/useProfileSystemMutations";
import { refreshIcon } from "@/assets";
import { IProfileSystemOperation } from "@/screens/profile-system/types/profile-system/IProfileSystemOperation";
import InlineField from "@/screens/profile-system/component/InlineField";
import SectionCard from "@/screens/profile-system/component/SectionCard";
import OperationSection from "@/screens/profile-system/component/OperationSection";
import Button from "@/ui/button/Button";
import {ArrowLeft} from "lucide-react";
import MaterialsSection from "@/screens/profile-system/component/MaterialsSection";
import AccessoriesSection from "@/screens/profile-system/component/AccessoriesSection";

const ProfileSystemDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate= useNavigate();
    const profileSystemId = Number(id);

    const { data, isPending, isError } = useProfileSystemFullQuery(profileSystemId);
    const mutations = useProfileSystemMutations(profileSystemId);

    if (isPending) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center w-full h-48">
                    <div className="w-8 h-8 animate-spin">
                        <img src={refreshIcon} alt="завантаження" />
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (isError || !data) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center w-full h-48 gap-3">
                    <p className="text-[red/500] text-sm">Не вдалося завантажити систему профілів</p>
                    <button onClick={() => navigate(-1)} className="text-xs px-3 py-1.5 bg-[#D1D1D1] rounded hover:bg-[#9B9E93]">
                        ← Назад
                    </button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-4">

                <div className="flex items-center gap-3">
                    <div className="flex w-fit justify-start items-center">
                        <Button onClick={() => navigate(-1)} className="flex items-center gap-2" color="gray">
                            <ArrowLeft size={20} /> Повернутися
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                        <SectionCard title="Основна інформація">
                            <div className="flex flex-col gap-4">
                                <InlineField
                                    label="Назва"
                                    value={data.title}
                                    pending={mutations.updateSystem.isPending}
                                    onSave={v => mutations.updateSystem.mutate({ title: v })}
                                />
                                <InlineField
                                    label="Код"
                                    value={data.code}
                                    pending={mutations.updateSystem.isPending}
                                    onSave={() => {}}
                                />
                            </div>
                        </SectionCard>

                        <SectionCard title="Розміри (мм)">
                            <div className="grid grid-cols-2 gap-4">
                                <InlineField label="Мін. ширина"  value={data.minWidth}  type="number" unit="мм" pending={mutations.updateSystem.isPending} onSave={v => mutations.updateSystem.mutate({ minWidth:  parseFloat(v) })} />
                                <InlineField label="Макс. ширина" value={data.maxWidth}  type="number" unit="мм" pending={mutations.updateSystem.isPending} onSave={v => mutations.updateSystem.mutate({ maxWidth:  parseFloat(v) })} />
                                <InlineField label="Мін. висота"  value={data.minHeight} type="number" unit="мм" pending={mutations.updateSystem.isPending} onSave={v => mutations.updateSystem.mutate({ minHeight: parseFloat(v) })} />
                                <InlineField label="Макс. висота" value={data.maxHeight} type="number" unit="мм" pending={mutations.updateSystem.isPending} onSave={v => mutations.updateSystem.mutate({ maxHeight: parseFloat(v) })} />
                            </div>
                        </SectionCard>

                        {data.details && data.details.length > 0 && (
                            <SectionCard title="Матеріали профілів">
                                <MaterialsSection
                                    profileSystemId={profileSystemId}
                                    details={data.details}
                                />
                            </SectionCard>
                        )}

                        <SectionCard title="Аксесуари">
                            <AccessoriesSection
                                profileSystemId={profileSystemId}
                                accessories={data.accessories ?? []}
                            />
                        </SectionCard>
                    </div>

                    <div className="space-y-3 max-w-4xl">
                        {data.operations
                            .slice()
                            .sort((a, b) => a.sequence - b.sequence)
                            .map((op: IProfileSystemOperation) => (
                                <SectionCard
                                    key={op.id}
                                    title={op.title || 'Немає назви'}
                                    badgeColor={op.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}
                                    collapsible
                                >
                                    <OperationSection
                                        key={op.id}
                                        op={op}
                                        profileSystemId={profileSystemId}
                                        mutations={mutations}
                                    />
                                </SectionCard>
                            ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ProfileSystemDetailPage;