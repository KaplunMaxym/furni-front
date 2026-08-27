import React, { FC, useState } from 'react';
import { ModalProps } from '@/hooks/useModal/useModal';
import Modal from '@/ui/Modal/Modal';
import { cn } from '@/helpers/cn';
import Button from '@/ui/button/Button';
import Input from '@/ui/input/Input';
import { useForm } from 'react-hook-form';
import Loading from '@/ui/loading/Loading';
import {
    IGlassPrice,
    PRICE_CATEGORIES,
    PRICE_CATEGORY_LABELS,
    PriceCategoryType,
} from '@/screens/glass-fill/types/IGlassPrice';
import { IGlassFill } from '@/screens/glass-fill/types/IGlassFill';
import { useGlassPriceUpsertMutation } from '@/screens/glass-fill/hooks/useGlassPriceUpsertMutation';
import {EditIcon} from "lucide-react";

type Props = ModalProps & {
    glassFill: IGlassFill | null;
};

interface PriceForm {
    pricePerM2: string;
}

const GlassPricesModal: FC<Props> = ({ glassFill, ...props }) => {
    const [editingCategory, setEditingCategory] = useState<PriceCategoryType | null>(null);

    const { mutateAsync: upsertPrice, isPending } = useGlassPriceUpsertMutation();

    const { control, handleSubmit, reset, setValue } = useForm<PriceForm>({
        defaultValues: { pricePerM2: '' },
    });

    const getPriceByCategory = (category: PriceCategoryType): IGlassPrice | undefined =>
        glassFill?.glassPrices.find(p => p.category === category);

    const startEdit = (category: PriceCategoryType) => {
        const existing = getPriceByCategory(category);
        setValue('pricePerM2', existing?.pricePerM2?.toString() ?? '');
        setEditingCategory(category);
    };

    const cancelEdit = () => {
        setEditingCategory(null);
        reset();
    };

    const onSubmit = async ({ pricePerM2 }: PriceForm) => {
        if (!glassFill || !editingCategory) return;
        await upsertPrice({
            glassFillId: glassFill.id,
            category: editingCategory,
            pricePerM2: parseFloat(pricePerM2),
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
                Ціни — {glassFill?.type}
                {glassFill?.thickness ? ` (${glassFill.thickness} мм)` : ''}
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-3 rounded-xl p-3">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-2 pl-2 font-semibold text-xs">Категорія</th>
                        <th className="text-right py-2 font-semibold text-xs">Ціна / м²</th>
                        <th className="w-[44px]" />
                    </tr>
                    </thead>
                    <tbody>
                    {PRICE_CATEGORIES.map(category => {
                        const existing = getPriceByCategory(category);
                        const isEditing = editingCategory === category;

                        return (
                            <tr
                                key={category}
                                className="border-b border-gray-100 last:border-0"
                            >
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
                                                name="pricePerM2"
                                                type="number"
                                                placeholder="0.0000"
                                                classNameContainer="w-[130px]"
                                                rules={{
                                                    required: 'Обов\'язкове поле',
                                                    min: { value: 0, message: 'Має бути > 0' },
                                                }}
                                                autoFocus
                                            />
                                        </form>
                                    ) : (
                                        <span className={cn(existing ? 'text-gray-900' : 'text-gray-400')}>
                                            {existing ? `${existing.pricePerM2.toFixed(2)} $`
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
                                            className={"min-h-[36px] w-fit"}
                                            color="greenDarkgreen"
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

export default GlassPricesModal;