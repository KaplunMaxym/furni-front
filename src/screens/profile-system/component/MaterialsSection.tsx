import React, { useState, useMemo } from 'react';
import {Plus, Trash2, ChevronDown, ChevronUp, Search, Loader2, Check, X} from 'lucide-react';
import { IProfileMaterial } from '@/screens/profile-material/types/IProfileMaterial';
import { useProfileMaterialLinkMutation } from '@/screens/profile-system/hooks/useProfileMaterialLinkMutation';
import { useProfileMaterialUnlinkMutation } from '@/screens/profile-system/hooks/useProfileMaterialUnlinkMutation';
import {useProfileMaterialSimple} from "@/screens/profile-material/hooks/useProfileMaterialSimple";
import {IProfileSystemDetail} from "@/screens/profile-system/types/profile-system/IProfileSystemDetail";
import useModal, {ModalProps} from "@/hooks/useModal/useModal";
import Modal from "@/ui/Modal/Modal";

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
    <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-react/500 hover:bg-react/400 transition-colors group">
        <div className="flex items-center gap-3 min-w-0">
            <div
                className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                style={{ backgroundColor: material.color?.code ?? '#D1D1D1' }}
            />
            <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{material.name}</p>
                <p className="text-xs text-gray-400 font-mono">{material.articleCode}</p>
            </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
            <span className="text-xs text-gray-400 hidden sm:block">
                {(decodeBeamLength(material.beamLength) / 1000).toFixed(1)} м
            </span>
            <button
                onClick={onUnlink}
                disabled={isUnlinking}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:cursor-not-allowed"
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
        <Modal
            {...props}
            className="flex flex-col max-w-lg mx-2 max-h-[60vh] rounded-xl overflow-hidden"
        >
            <Modal.Title className="gap-2 px-5 py-4" onClose={props.onClose}>
                <div className="flex items-center gap-3">
                    <div>
                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                            Прив'язати матеріал
                        </p>
                        <p className="text-sm font-semibold text-gray-500 leading-tight">
                            {detailLabel}
                        </p>
                    </div>
                </div>
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-0 p-0 overflow-hidden">
                <div className="px-4 py-3">
                    <div className="flex items-center gap-2.5 bg-react/500 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#639922]/30 transition-all border border-react/400">
                        <Search size={14} className="text-gray-400 shrink-0" />
                        <input
                            autoFocus
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Пошук за назвою, артикулом або кольором..."
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500 text-gray-200"
                            style={{ background: 'transparent' }}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="text-gray-400 hover:text-gray-200 transition-colors"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 px-3 py-2 min-h-[200px]">
                    {isPending && (
                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                            <Loader2 size={22} className="animate-spin text-gray-400" />
                            <p className="text-xs text-gray-400">Завантаження матеріалів...</p>
                        </div>
                    )}

                    {!isPending && allLinked && !search && (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <div className="w-10 h-10 rounded-full bg-react/500 flex items-center justify-center">
                                <Check size={18} className="text-gray-500" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-500">Всі матеріали прив'язані</p>
                                <p className="text-xs text-gray-400 mt-0.5">Немає доступних матеріалів для додавання</p>
                            </div>
                        </div>
                    )}

                    {!isPending && !allLinked && filtered.length === 0 && search && (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <div className="w-10 h-10 rounded-full bg-react/500 flex items-center justify-center">
                                <Search size={18} className="text-gray-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-800">Нічого не знайдено</p>
                                <p className="text-xs text-gray-400 mt-0.5">Спробуйте інший запит</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        {filtered.map(m => (
                            <button
                                key={m.id}
                                onClick={() => onLink(m.id)}
                                disabled={isLinking}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-react/500 active:bg-react/400 transition-colors text-left disabled:opacity-50 group"
                            >
                                <div
                                    className="w-4 h-4 rounded-full shrink-0 border border-black/10 shadow-sm"
                                    style={{ backgroundColor: m.color?.code ?? '#D1D1D1' }}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-800 truncate leading-tight">
                                        {m.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-xs text-gray-400 font-mono">{m.articleCode}</p>
                                        {m.color?.name && (
                                            <>
                                                <span className="text-gray-300">·</span>
                                                <p className="text-xs text-gray-400">{m.color.name}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs text-gray-400 tabular-nums">
                                        {(decodeBeamLength(m.beamLength) / 1000).toFixed(1)} м
                                    </span>
                                    <div className="w-6 h-6 rounded-md bg-react/500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus size={13} className="text-gray-500" />
                                    </div>
                                </div>
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
            <div className="rounded-lg border border-react/500 overflow-hidden">
                <button
                    onClick={() => setExpanded(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-react/600 hover:bg-react/500 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800">{label}</span>
                        <span className="text-xs text-gray-400 bg-react/400 px-2 py-0.5 rounded-full">
                            {materials.length}
                        </span>
                    </div>
                    {expanded
                        ? <ChevronUp size={14} className="text-gray-400" />
                        : <ChevronDown size={14} className="text-gray-400" />
                    }
                </button>

                {expanded && (
                    <div className="px-3 pb-3 pt-2 space-y-1.5 bg-react/600">
                        {materials.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-3">
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
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-react/300 text-xs text-gray-400 hover:border-gray-400 hover:text-gray-600 hover:bg-react/500 transition-all mt-1"
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
                <p className="text-sm text-gray-400 text-center py-6">
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