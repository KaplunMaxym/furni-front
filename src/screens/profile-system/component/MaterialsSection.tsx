import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from 'lucide-react';
import { IProfileMaterial } from '@/screens/profile-material/types/IProfileMaterial';
import { useProfileMaterialLinkMutation } from '@/screens/profile-system/hooks/useProfileMaterialLinkMutation';
import { useProfileMaterialUnlinkMutation } from '@/screens/profile-system/hooks/useProfileMaterialUnlinkMutation';
import {useProfileMaterialSimple} from "@/screens/profile-material/hooks/useProfileMaterialSimple";
import {IProfileSystemDetail} from "@/screens/profile-system/types/profile-system/IProfileSystemDetail";
import useModal, {ModalProps} from "@/hooks/useModal/useModal";
import Modal from "@/ui/Modal/Modal";
import SearchInput from "@/ui/input/SearchInput";

interface MaterialsSectionProps {
    profileSystemId: number;
    details: IProfileSystemDetail[];
}

const DETAIL_LABELS: Record<string, string> = {
    LEFT:   'Ліва балка',
    RIGHT:  'Права балка',
    TOP:    'Верхня балка',
    BOTTOM: 'Нижня балка',
};

interface MaterialRowProps {
    material: IProfileMaterial;
    onUnlink: () => void;
    isUnlinking: boolean;
}

type LinkMaterialModalProps = ModalProps & {
    detailLabel: string;
    linkedIds: Set<number>;
    onLink: (materialId: number) => void;
    isLinking: boolean;
};

const decodeBeamLength = (val: unknown): number => {
    if (typeof val === 'number') return val;
    if (val && typeof val === 'object' && 'd' in val) {
        const d = (val as { d: number[] }).d;
        return Array.isArray(d) ? d[0] : 0;
    }
    return 0;
};

const MaterialRow: React.FC<MaterialRowProps> = ({ material, onUnlink, isUnlinking }) => (
    <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-accent/40 hover:bg-accent/60 transition-colors group">
        <div className="flex items-center gap-3 min-w-0">
            <div
                className="w-3 h-3 rounded-full shrink-0 border border-border"
                style={{ backgroundColor: material.color?.code ?? '#D1D1D1' }}
            />
            <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{material.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{material.articleCode}</p>
            </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
            <span className="text-xs text-muted-foreground hidden sm:block">
                {(decodeBeamLength(material.beamLength) / 1000).toFixed(1)} м
            </span>
            <button
                onClick={onUnlink}
                disabled={isUnlinking}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/40 text-muted-foreground hover:text-destructive-foreground disabled:cursor-not-allowed"
                title="Відв'язати матеріал"
            >
                {isUnlinking
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Trash2 size={14} />
                }
            </button>
        </div>
    </div>
);

const LinkMaterialModal: React.FC<LinkMaterialModalProps> = ({
                                                                 detailLabel, linkedIds, onLink, isLinking, ...props
                                                             }) => {
    const [search, setSearch] = useState('');
    const { data, isPending } = useProfileMaterialSimple();

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return (data ?? []).filter(
            m =>
                !linkedIds.has(m.id) &&
                (m.name.toLowerCase().includes(q) ||
                    m.articleCode.toLowerCase().includes(q) ||
                    (m.color?.name ?? '').toLowerCase().includes(q)),
        );
    }, [data, search, linkedIds]);

    const allLinked = !isPending && (data ?? []).filter(m => !linkedIds.has(m.id)).length === 0;

    return (
        // Відступи тепер дає саме полотно модалки (p-6 у ModalLayout).
        // Раніше на них накладалися власні px-5/py-4 заголовка й px-4 списку —
        // виходила подвійна рамка, і на список лишалося менше половини вікна.
        <Modal {...props} className="max-w-[520px]">
            <Modal.Title onClose={props.onClose}>
                Матеріал для «{detailLabel}»
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-3">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Назва, артикул або колір"
                />

                <div className="max-h-[320px] min-h-[180px] overflow-y-auto">
                    {isPending && (
                        <div className="flex flex-col items-center justify-center gap-2 py-12">
                            <Loader2 size={20} className="animate-spin text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Завантаження матеріалів…</p>
                        </div>
                    )}

                    {!isPending && allLinked && !search && (
                        <p className="py-12 text-center text-sm text-muted-foreground">
                            Усі матеріали вже прив&apos;язані
                        </p>
                    )}

                    {!isPending && !allLinked && filtered.length === 0 && search && (
                        <p className="py-12 text-center text-sm text-muted-foreground">
                            Нічого не знайдено
                        </p>
                    )}

                    <div className="space-y-0.5">
                        {filtered.map(m => (
                            <button
                                key={m.id}
                                onClick={() => onLink(m.id)}
                                disabled={isLinking}
                                className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent/60 disabled:opacity-50"
                            >
                                <span
                                    className="h-3.5 w-3.5 shrink-0 rounded-full border border-border"
                                    style={{ backgroundColor: m.color?.code ?? 'transparent' }}
                                />

                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium leading-tight text-foreground">
                                        {m.name}
                                    </span>
                                    <span className="block truncate text-xs text-muted-foreground">
                                        <span className="font-mono">{m.articleCode}</span>
                                        {m.color?.name ? ` · ${m.color.name}` : ''}
                                    </span>
                                </span>

                                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                                    {(decodeBeamLength(m.beamLength) / 1000).toFixed(1)} м
                                </span>

                                <Plus
                                    size={14}
                                    className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

interface DetailMaterialBlockProps {
    detail: IProfileSystemDetail;
    profileSystemId: number;
}

const DetailMaterialBlock: React.FC<DetailMaterialBlockProps> = ({ detail, profileSystemId }) => {
    const [expanded, setExpanded] = useState(true);
    const linkModal = useModal();

    const linkMaterial = useProfileMaterialLinkMutation(profileSystemId);
    const unlinkMaterial = useProfileMaterialUnlinkMutation(profileSystemId);

    const label = DETAIL_LABELS[detail.code] ?? detail.code;
    const materials = detail.materials ?? [];
    const linkedIds = useMemo(() => new Set(materials.map(m => m.profileMaterialId)), [materials]);

    const handleLink = (materialId: number) => {
        linkMaterial.mutate(
            { profileSystemDetailId: detail.id, profileMaterialId: materialId, wasteThreshold: 350 },
            { onSuccess: linkModal.onClose },
        );
    };

    const handleUnlink = (materialId: number) => {
        unlinkMaterial.mutate({ profileSystemDetailId: detail.id, profileMaterialId: materialId });
    };

    return (
        <>
            <div className="rounded-lg border border-border overflow-hidden">
                <button
                    onClick={() => setExpanded(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-card hover:bg-accent/60 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{label}</span>
                        <span className="text-xs text-muted-foreground bg-accent/60 px-2 py-0.5 rounded-full">
                            {materials.length}
                        </span>
                    </div>
                    {expanded
                        ? <ChevronUp size={14} className="text-muted-foreground" />
                        : <ChevronDown size={14} className="text-muted-foreground" />
                    }
                </button>

                {expanded && (
                    <div className="px-3 pb-3 pt-2 space-y-1.5 bg-card">
                        {materials.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-3">
                                Немає прив&apos;язаних матеріалів
                            </p>
                        )}

                        {materials.map(dm => (
                            <MaterialRow
                                key={dm.profileMaterialId}
                                material={dm.profileMaterial!}
                                onUnlink={() => handleUnlink(dm.profileMaterialId)}
                                isUnlinking={
                                    unlinkMaterial.isPending &&
                                    unlinkMaterial.variables?.profileMaterialId === dm.profileMaterialId
                                }
                            />
                        ))}

                        <button
                            onClick={linkModal.onOpen}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-ring hover:text-foreground hover:bg-accent/60 transition-all mt-1"
                        >
                            <Plus size={13} />
                            Прив&apos;язати матеріал
                        </button>
                    </div>
                )}
            </div>

            <LinkMaterialModal
                {...linkModal}
                detailLabel={label}
                linkedIds={linkedIds}
                onLink={handleLink}
                onClose={linkModal.onClose}
                isLinking={linkMaterial.isPending}
            />
        </>
    );
};

const MaterialsSection: React.FC<MaterialsSectionProps> = ({ profileSystemId, details }) => {
    const profileDetails = useMemo(
        () => details.filter(d => d.detailType === 'PROFILE').sort((a, b) => a.sequence - b.sequence),
        [details],
    );

    return (
        <div className="space-y-2">
            {profileDetails.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                    Деталі профільної системи відсутні
                </p>
            )}
            {profileDetails.map(detail => (
                <DetailMaterialBlock
                    key={detail.id}
                    detail={detail}
                    profileSystemId={profileSystemId}
                />
            ))}
        </div>
    );
};

export default MaterialsSection;