import React from 'react';
import { Check, Minus } from 'lucide-react';

import { cn } from '@/helpers/cn';

export type CheckboxState = 'none' | 'partial' | 'all';

interface CheckboxProps {
    /** `partial` — коли вибрано частину вкладених пунктів. */
    state: CheckboxState;
    onChange: () => void;
    disabled?: boolean;
    'aria-label'?: string;
    className?: string;
}

/**
 * Прапорець на три стани.
 *
 * Нативний `<input type="checkbox">` тут не підходить: його вигляд задає
 * браузер, у темній темі він лишається світлим квадратом, а проміжний стан
 * доводилося малювати окремою іконкою поруч. Тому це кнопка з `role="checkbox"` —
 * так само доступна з клавіатури, але повністю під темою.
 */
export const Checkbox: React.FC<CheckboxProps> = ({
    state,
    onChange,
    disabled,
    'aria-label': ariaLabel,
    className,
}) => (
    <button
        type="button"
        role="checkbox"
        aria-checked={state === 'partial' ? 'mixed' : state === 'all'}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={e => {
            // Прапорець часто лежить у клікабельному рядку — щоб клік по ньому
            // не розгортав і не вибирав сам рядок
            e.stopPropagation();
            onChange();
        }}
        className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
            'outline-none transition-colors disabled:pointer-events-none disabled:opacity-50',
            'focus-visible:ring-[3px] focus-visible:ring-ring/50',
            state === 'none'
                ? 'border-input bg-transparent'
                : 'border-primary bg-primary text-primary-foreground',
            className,
        )}
    >
        {state === 'all' && <Check className="h-3 w-3" strokeWidth={3} />}
        {state === 'partial' && <Minus className="h-3 w-3" strokeWidth={3} />}
    </button>
);

export default Checkbox;
