import { FC, useMemo } from 'react';

import { ModalProps } from '@/hooks/useModal/useModal';
import Modal from '@/ui/Modal/Modal';
import { cn } from '@/helpers/cn';
import PriceListEditor from '@/ui/prices/PriceListEditor';
import { PriceCategoryType } from '@/screens/glass-fill/types/IGlassPrice';
import { IProfileAccessory } from '@/screens/profile-accessory/types/IProfileAccessory';
import { useProfileAccessoryPriceUpsertMutation } from '@/screens/profile-accessory/hooks/useProfileAccessoryPriceUpsertMutation';

type Props = ModalProps & {
    profileAccessory: IProfileAccessory | null;
};

/**
 * Ціни за категоріями.
 *
 * Уся робота з полями — у спільному PriceListEditor: тут лишається тільки
 * зв'язок з даними й мутацією. Раніше ці три модалки (матеріали, аксесуари,
 * скло) містили по копії однієї й тієї ж таблиці з режимом редагування рядка.
 */
const ProfileAccessoryPricesModal: FC<Props> = ({ profileAccessory, ...props }) => {
    const { mutateAsync: upsertPrice, isPending } = useProfileAccessoryPriceUpsertMutation();

    const values = useMemo(() => {
        const map: Partial<Record<PriceCategoryType, number>> = {};
        for (const price of profileAccessory?.prices ?? []) {
            map[price.category as PriceCategoryType] = price.pricePerUnit;
        }
        return map;
    }, [profileAccessory]);

    const handleSave = async (category: PriceCategoryType, price: number) => {
        if (!profileAccessory) return;
        await upsertPrice({
            profileAccessoryId: profileAccessory.id,
            category,
            pricePerUnit: price,
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
                Ціни — {profileAccessory?.articleCode} {profileAccessory?.name}
                {profileAccessory?.color ? ` (${profileAccessory.color.name})` : ''}
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-3">
                <PriceListEditor
                    values={values}
                    onSave={handleSave}
                    isPending={isPending}
                    unitLabel="за одиницю"
                />
            </Modal.Body>
        </Modal>
    );
};

export default ProfileAccessoryPricesModal;
