import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

import useModal from '@/hooks/useModal';
import ConfirmActionModal from '@/features/confirm-modal';
import RowActions, { type RowAction } from './RowActions';

interface RowActionsCellProps {
    onEdit?: () => void;
    /** Видалення. Підтвердження питаємо тут, окремо на екрані нічого не треба. */
    onDelete?: () => Promise<void> | void;
    /** Питати підтвердження перед видаленням. */
    confirmDelete?: boolean;
    /** Дії, специфічні для екрана — ціни, G-code, деталі тощо. */
    extra?: RowAction[];
}

/**
 * Готова комірка дій: «Редагувати», довільні дії екрана, «Видалити».
 *
 * Іконки — lucide, а не svg-файли з assets. Ті мали колір, вшитий у сам файл
 * (`edit_icon.svg` — `stroke="white"`), тож на світлій кнопці ставали
 * невидимими. Lucide малює currentColor і завжди збігається з кольором тексту
 * пункту меню.
 */
const RowActionsCell: React.FC<RowActionsCellProps> = ({
    onEdit,
    onDelete,
    confirmDelete = true,
    extra = [],
}) => {
    const modalDelete = useModal();
    const [isPending, setIsPending] = useState(false);

    const runDelete = async () => {
        if (!onDelete) return;
        setIsPending(true);
        try {
            await onDelete();
        } finally {
            setIsPending(false);
        }
    };

    const actions: RowAction[] = [
        ...(onEdit
            ? [{ label: 'Редагувати', icon: <Pencil className="h-4 w-4" />, onSelect: onEdit }]
            : []),
        ...extra,
        ...(onDelete
            ? [
                  {
                      label: 'Видалити',
                      icon: <Trash2 className="h-4 w-4" />,
                      danger: true,
                      disabled: isPending,
                      onSelect: () => (confirmDelete ? modalDelete.onOpen() : void runDelete()),
                  },
              ]
            : []),
    ];

    return (
        <>
            <RowActions actions={actions} />
            {onDelete && confirmDelete && (
                <ConfirmActionModal onClick={runDelete} isPending={isPending} {...modalDelete} />
            )}
        </>
    );
};

export default RowActionsCell;
