import React, { FC, useState } from 'react';
import { ModalProps } from '@/hooks/useModal/useModal';
import Modal from '@/ui/Modal/Modal';
import { cn } from '@/helpers/cn';
import Button from '@/ui/button/Button';
import Input from '@/ui/input/Input';
import { useForm } from 'react-hook-form';
import Loading from '@/ui/loading/Loading';
import {
    PRICE_CATEGORIES,
    PRICE_CATEGORY_LABELS,
    PriceCategoryType,
} from '@/screens/glass-fill/types/IGlassPrice';
import { IProfileMaterial, IProfileMaterialPrice } from '@/screens/profile-material/types/IProfileMaterial';
import { useProfileMaterialPriceUpsertMutation } from '@/screens/profile-material/hooks/useProfileMaterialPriceUpsertMutation';
import {EditIcon} from "lucide-react";

type Props = ModalProps & {
    profileMaterial: IProfileMaterial | null;
};

interface PriceForm {
    pricePerBeam: string;
}

const ProfileMaterialPricesModal: FC<Props> = ({ profileMaterial, ...props }) => {
    const [editingCategory, setEditingCategory] = useState<PriceCategoryType | null>(null);

    const { mutateAsync: upsertPrice, isPending } = useProfileMaterialPriceUpsertMutation();

    const { control, handleSubmit, reset, setValue } = useForm<PriceForm>({
        defaultValues: { pricePerBeam: '' },
    });

    const getPriceByCategory = (category: PriceCategoryType): IProfileMaterialPrice | undefined =>
        profileMaterial?.prices.find(p => p.category === category);

    const startEdit = (category: PriceCategoryType) => {
        const existing = getPriceByCategory(category);
        setValue('pricePerBeam', existing?.pricePerBeam?.toFixed(4) ?? '');
        setEditingCategory(category);
    };

    const cancelEdit = () => {
        setEditingCategory(null);
        reset();
    };

    const onSubmit = async ({ pricePerBeam }: PriceForm) => {
        if (!profileMaterial || !editingCategory) return;
        await upsertPrice({
            profileMaterialId: profileMaterial.id,
            category: editingCategory,
            pricePerBeam: parseFloat(pricePerBeam),
        });
        setEditingCategory(null);
        reset();
    };

    return (
        <Modal
            {...props}
            className={cn(
                'flex flex-col gap-2.5 max-w-[560px] min-h-10 rounded-base-mini mx-2 overflow-y-auto max-h-dvh h-auto',
            )}
        >
            <Modal.Title className="gap-2" onClose={props.onClose}>
                Ціни — {profileMaterial?.articleCode} {profileMaterial?.name}
                {profileMaterial?.color ? ` (${profileMaterial.color.name})` : ''}
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-3 rounded-xl p-3">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-2 pl-2 font-semibold text-xs">Категорія</th>
                            <th className="text-right py-2 font-semibold text-xs">Ціна / балку</th>
                            <th className="w-[44px]" />
                        </tr>
                    </thead>
                    <tbody>
                    {PRICE_CATEGORIES.map(category => {
                        const existing = getPriceByCategory(category);
                        const isEditing = editingCategory === category;

                        return (
                            <tr key={category} className="border-b border-gray-100 last:border-0">
                                <td className="py-2 pl-2 text-sm font-medium">
                                    {PRICE_CATEGORY_LABELS[category]}
                                </td>

                                <td className="py-2 text-right">
                                    {isEditing ? (
                                        <form
                                            id={`form-${category}`}
                                            onSubmit={handleSubmit(onSubmit)}
                                            className="flex justify-end"
                                        >
                                            <Input
                                                control={control}
                                                name="pricePerBeam"
                                                placeholder="0.0000"
                                                classNameContainer="w-[130px]"
                                                type="number"
                                                rules={{
                                                    required: 'Ціна обов\'язкова',
                                                    validate: (val: number) => {
                                                        const num = parseFloat(String(val));
                                                        if (isNaN(num)) return 'Введіть коректне число';
                                                        if (num < 0) return 'Має бути ≥ 0';
                                                        return true;
                                                    },
                                                }}
                                                autoFocus
                                            />
                                        </form>
                                    ) : (
                                        <span className={cn(existing ? 'text-gray-900' : 'text-gray-400')}>
                                                {existing
                                                    ? `${existing.pricePerBeam.toFixed(2)} $`
                                                    : '—'}
                                            </span>
                                    )}
                                </td>

                                <td className="py-1 pl-2">
                                    {isEditing ? (
                                        <div className="flex gap-1">
                                            <Button
                                                type="submit"
                                                form={`form-${category}`}
                                                color="greenDarkgreen"
                                                className="min-h-[30px] w-fit px-2 text-xs"
                                                disabled={isPending}
                                            >
                                                ✓
                                            </Button>
                                            <Button
                                                type="button"
                                                color="red"
                                                className="min-h-[30px] w-fit px-2 text-xs"
                                                onClick={cancelEdit}
                                                disabled={isPending}
                                            >
                                                ✕
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            color="greenDarkgreen"
                                            className="min-h-[30px] w-fit"
                                            onClick={() => startEdit(category)}
                                        >
                                            <EditIcon className="w-4 h-4" />
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>

                {isPending && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Loading />
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ProfileMaterialPricesModal;