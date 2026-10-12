import { FC, useMemo } from 'react';

import { ModalProps } from '@/hooks/useModal/useModal';
import Modal from '@/ui/Modal/Modal';
import { cn } from '@/helpers/cn';
import PriceListEditor from '@/ui/prices/PriceListEditor';
import { PriceCategoryType } from '@/screens/glass-fill/types/IGlassPrice';
import { IProfileMaterial } from '@/screens/profile-material/types/IProfileMaterial';
import { useProfileMaterialPriceUpsertMutation } from '@/screens/profile-material/hooks/useProfileMaterialPriceUpsertMutation';

type Props = ModalProps & {
    profileMaterial: IProfileMaterial | null;
};

/**
 * Ціни за категоріями.
 *
 * Уся робота з полями — у спільному PriceListEditor: тут лишається тільки
 * зв'язок з даними й мутацією. Раніше ці три модалки (матеріали, аксесуари,
 * скло) містили по копії однієї й тієї ж таблиці з режимом редагування рядка.
 */
const ProfileMaterialPricesModal: FC<Props> = ({ profileMaterial, ...props }) => {
    const { mutateAsync: upsertPrice, isPending } = useProfileMaterialPriceUpsertMutation();

    const values = useMemo(() => {
        const map: Partial<Record<PriceCategoryType, number>> = {};
        for (const price of profileMaterial?.prices ?? []) {
            map[price.category as PriceCategoryType] = price.pricePerBeam;
        }
        return map;
    }, [profileMaterial]);

    const handleSave = async (category: PriceCategoryType, price: number) => {
        if (!profileMaterial) return;
        await upsertPrice({
            profileMaterialId: profileMaterial.id,
            category,
            pricePerBeam: price,
        });
    };

    return (
        <Modal
            {...props}
            className={cn(
                'max-w-[520px]',
            )}
        >
            <Modal.Title className="gap-2" onClose={props.onClose}>
                Ціни — {profileMaterial?.articleCode} {profileMaterial?.name}
                {profileMaterial?.color ? ` (${profileMaterial.color.name})` : ''}
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-3">
                <PriceListEditor
                    values={values}
                    onSave={handleSave}
                    isPending={isPending}
                    unitLabel="за балку"
                />
            </Modal.Body>
        </Modal>
    );
};

export default ProfileMaterialPricesModal;
