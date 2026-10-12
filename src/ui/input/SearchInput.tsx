import { FC } from 'react';
import { Search, X } from 'lucide-react';

import { cn } from '@/helpers/cn';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

/**
 * Поле пошуку без react-hook-form.
 *
 * Загальний `Input` прив'язаний до форми через `control`/`name`, а фільтр
 * живе не у формі, а в сторі — заводити форму заради одного рядка було б
 * зайвим. Стилі ті самі, що в решти полів: прозорий фон і рамка `input`.
 */
const SearchInput: FC<SearchInputProps> = ({ value, onChange, placeholder, className }) => (
    <div className={cn('relative', className)}>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
                'h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-9 text-sm shadow-xs',
                'text-foreground placeholder:text-muted-foreground outline-none',
                'transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
            )}
        />

        {/* Хрестик тільки коли є що чистити — порожнє поле з кнопкою збиває з пантелику */}
        {value && (
            <button
                type="button"
                aria-label="Очистити пошук"
                onClick={() => onChange('')}
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        )}
    </div>
);

export default SearchInput;
