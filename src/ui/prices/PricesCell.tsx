import { FC } from 'react';
import { Tag } from 'lucide-react';

import { cn } from '@/helpers/cn';

interface PricesCellProps {
    /** Скільки категорій уже має ціну. */
    filled: number;
    /** Скільки їх усього. */
    total: number;
    onClick: () => void;
}

/**
 * Комірка «Ціни» — кнопка-чип із наочним станом.
 *
 * Раніше це був текст-посилання «3 / 5 категорій» або «Не задано» одного
 * кольору. За ним не було видно головного: заповнено все, частково чи нічого.
 * Тепер стан читається кольором, а число лишається для точності.
 */
const PricesCell: FC<PricesCellProps> = ({ filled, total, onClick }) => {
    const state = filled === 0 ? 'empty' : filled < total ? 'partial' : 'full';

    const label =
        state === 'empty' ? 'Не задано' : state === 'full' ? 'Усі категорії' : `${filled} з ${total}`;

    return (
        <button
            type="button"
            onClick={e => {
                e.stopPropagation();
                onClick();
            }}
            title="Призначити ціни за категоріями"
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                'transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                state === 'empty' &&
                    'border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                state === 'partial' && 'border-transparent bg-chart-3/15 text-chart-3 hover:bg-chart-3/25',
                state === 'full' && 'border-transparent bg-chart-2/15 text-chart-2 hover:bg-chart-2/25',
            )}
        >
            <Tag className="h-3.5 w-3.5" />
            {label}
        </button>
    );
};

export default PricesCell;
