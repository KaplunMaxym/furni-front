import { FC, useMemo } from 'react';

import { ModalProps } from '@/hooks/useModal/useModal';
import Modal from '@/ui/Modal/Modal';
import { cn } from '@/helpers/cn';
import PriceListEditor from '@/ui/prices/PriceListEditor';
import { PriceCategoryType } from '@/screens/glass-fill/types/IGlassPrice';
import { IGlassFill } from '@/screens/glass-fill/types/IGlassFill';
import { useGlassPriceUpsertMutation } from '@/screens/glass-fill/hooks/useGlassPriceUpsertMutation';

type Props = ModalProps & {
    glassFill: IGlassFill | null;
};

/**
 * Ціни за категоріями.
 *
 * Уся робота з полями — у спільному PriceListEditor: тут лишається тільки
 * зв'язок з даними й мутацією. Раніше ці три модалки (матеріали, аксесуари,
 * скло) містили по копії однієї й тієї ж таблиці з режимом редагування рядка.
 */
const GlassPricesModal: FC<Props> = ({ glassFill, ...props }) => {
    const { mutateAsync: upsertPrice, isPending } = useGlassPriceUpsertMutation();

    const values = useMemo(() => {
        const map: Partial<Record<PriceCategoryType, number>> = {};
        // У скла поле зветься glassPrices, а не prices — модель інша
        for (const price of glassFill?.glassPrices ?? []) {
            map[price.category as PriceCategoryType] = price.pricePerM2;
        }
        return map;
    }, [glassFill]);

    const handleSave = async (category: PriceCategoryType, price: number) => {
        if (!glassFill) return;
        await upsertPrice({
            glassFillId: glassFill.id,
            category,
            pricePerM2: price,
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
                Ціни — {glassFill?.type}
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-3">
                <PriceListEditor
                    values={values}
                    onSave={handleSave}
                    isPending={isPending}
                    unitLabel="за м²"
                />
            </Modal.Body>
        </Modal>
    );
};

export default GlassPricesModal;
