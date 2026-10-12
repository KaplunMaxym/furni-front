'use client'
import React, {useState, useMemo, ComponentProps, useRef, useEffect} from "react";
import {cn} from "@/helpers/cn";
import {Chevrone} from "@/assets";
import {createPortal} from "react-dom";

interface ISelectorProps<T> extends ComponentProps<'div'> {
    options: Array<T> | undefined;
    optionValue?: keyof T;
    optionLabel?: keyof T;
    placeholder?: string;
    getAndSet: [state: never | null | number | string, setState: (limit: never) => void];
    label?: string;
    isBlackDefault?: boolean;
    isEmptyValueDisable?: boolean;
    searchable?: boolean;
    allowClear?: boolean;
    dropdownPosition?: 'top' | 'bottom';
    hasError?: boolean;
}

const SelectorSearch = <T,>({options, optionValue, hasError = false, optionLabel, className, placeholder, getAndSet, isEmptyValueDisable = false, label = '', isBlackDefault = false, searchable = true, allowClear = false, dropdownPosition: initialDropdownPosition, ...rest}: ISelectorProps<T>) => {
    const [state, setState] = getAndSet;
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [inputValue, setInputValue] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number, width: number, direction: 'top' | 'bottom'} | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;

            const clickedOutsideWrapper = wrapperRef.current && !wrapperRef.current.contains(target);

            const clickedOutsideDropdown = !dropdownRef.current || !dropdownRef.current.contains(target);

            if (clickedOutsideWrapper && clickedOutsideDropdown) {
                setOpen(false);
                setSearch('');
                if (state) {
                    const selected = options?.find(opt => String(getOptionValue(opt)) === String(state));
                    setInputValue(selected ? String(getOptionLabel(selected)) : '');
                } else {
                    setInputValue('');
                }
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, state, options]);

    const getOptionValue = (option: T) => {
        if (typeof option === 'object' && option && optionValue) return option[optionValue];
        return option;
    };

    const getOptionLabel = (option: T) => {
        if (typeof option === 'object' && option && optionLabel) return option[optionLabel];
        if (typeof option === 'object' && option && optionValue) return option[optionValue];
        return option;
    };

    const filteredOptions = useMemo(() => {
        if (!options) return [];
        if (!searchable || !search) return options;
        return options.filter(opt =>
            String(getOptionLabel(opt)).toLowerCase().includes(search.toLowerCase())
        );
    }, [options, search, searchable]);

    useEffect(() => {
        if (!open) {
            const selected = options?.find(opt => String(getOptionValue(opt)) === String(state));
            setInputValue(selected ? String(getOptionLabel(selected)) : '');
        }
    }, [state, options, open]);

    useEffect(() => {
        if (searchable && search && filteredOptions.length === 1 && open) {
            const option = filteredOptions[0];
            const value = getOptionValue(option);
            const label = String(getOptionLabel(option));

            if (search.toLowerCase() === label.toLowerCase()) {
                setState(value as never);
                setInputValue(label);
                setSearch('');
                setOpen(false);
            }
        }
    }, [filteredOptions, searchable, search, open]);

    const handleSelect = (option: T) => {
        const value = getOptionValue(option);
        setState(value as never);
        setSearch('');
        const label = String(getOptionLabel(option));
        setInputValue(label);
        setOpen(false);
        inputRef.current?.blur();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setSearch(value);

        if (!open) {
            openDropdown();
        }
    };

    const handleInputClick = (e: React.MouseEvent) => {
        if (searchable && open && document.activeElement === inputRef.current) {
            return;
        }

        if (open) {
            setOpen(false);
            setSearch('');
            if (state) {
                const selected = options?.find(opt => String(getOptionValue(opt)) === String(state));
                setInputValue(selected ? String(getOptionLabel(selected)) : '');
            } else {
                setInputValue('');
            }
        } else {
            openDropdown();
            if (searchable) {
                setSearch('');
                setInputValue('');
            }
        }
    };

    const toggleDropdown = () => {
        if (open) {
            setOpen(false);
            setSearch('');
            if (state) {
                const selected = options?.find(opt => String(getOptionValue(opt)) === String(state));
                setInputValue(selected ? String(getOptionLabel(selected)) : '');
            } else {
                setInputValue('');
            }
        } else {
            openDropdown();
            if (searchable) {
                setSearch('');
                setInputValue('');
            }
        }
    };

    const openDropdown = () => {
        if (wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;

            const direction: 'top' | 'bottom' =
                initialDropdownPosition || (spaceBelow < 100 && spaceAbove > spaceBelow ? 'top' : 'bottom');

            const labelHeight = wrapperRef.current.querySelector('p')?.getBoundingClientRect().height || 0;

            setDropdownPosition({
                top: direction === 'bottom'
                    ? rect.bottom + window.scrollY
                    : rect.top + window.scrollY - (dropdownRef.current?.offsetHeight || 0) + labelHeight,
                left: rect.left + window.scrollX,
                width: rect.width,
                direction
            });
            setOpen(true);
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setState(null as never);
        setSearch('');
        setInputValue('');
        setOpen(false);
        inputRef.current?.blur();
    };

    const handleChevronClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleDropdown();
    };

    const dropdown = dropdownPosition && (
        <div
            ref={dropdownRef}
            style={{
                position: 'absolute',
                top: dropdownPosition.direction === 'bottom' ? dropdownPosition.top : undefined,
                bottom: dropdownPosition.direction === 'top' ? window.innerHeight - dropdownPosition.top : undefined,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                zIndex: 9999
            }}
            className="max-h-[240px] overflow-auto rounded-md border border-input bg-popover p-1 text-popover-foreground shadow-lg"
        >
            <div>
                {allowClear && placeholder && (
                    <div
                        onMouseDown={e => {
                            e.preventDefault();
                            handleClear(e);
                        }}
                        className={cn(
                            'relative flex w-full cursor-pointer select-none items-center rounded px-2 py-1.5 text-sm outline-none',
                            'hover:bg-accent hover:text-accent-foreground',
                            (!state || state === null) && 'bg-accent text-accent-foreground'
                        )}
                    >
                        {placeholder}
                    </div>
                )}
                {!filteredOptions.length && (
                    <div className="px-2.5 py-2 text-sm text-muted-foreground">Нічого не знайдено</div>
                )}
                {filteredOptions.map((option, i) => (
                    <div
                        key={i}
                        onMouseDown={e => {
                            e.preventDefault();
                            handleSelect(option);
                        }}
                        className={cn(
                            'relative flex w-full cursor-pointer select-none items-center rounded px-2 py-1.5 text-sm outline-none',
                            'hover:bg-accent hover:text-accent-foreground',
                            String(getOptionValue(option)) === String(state) && 'bg-accent text-accent-foreground'
                        )}
                    >
                        {String(getOptionLabel(option))}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div
            ref={wrapperRef}
            {...rest}
            onClick={e => e.stopPropagation()}
            className={cn('relative flex flex-col gap-[5px] h-fit', className)}
        >
            {!!label && <p className="text-xs font-semibold ml-4 min-h-5 text-muted-foreground">{label}</p>}

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onClick={handleInputClick}
                    placeholder={placeholder}
                    readOnly={!searchable}
                    className={cn(
                        'h-9 w-full rounded-md px-3 py-2 pr-9 text-sm shadow-xs outline-none',
                        'border border-input bg-transparent text-foreground transition-[color,box-shadow]',
                        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                        !state && !isBlackDefault && 'text-muted-foreground',
                        searchable ? 'cursor-text' : 'cursor-pointer',
                        hasError && 'border-destructive-foreground'
                    )}
                />
                <img
                    onClick={handleChevronClick}
                    className={cn(
                        'w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-150 cursor-pointer',
                        open ? 'rotate-270' : 'rotate-90'
                    )}
                    src={Chevrone}
                    alt="chevrone"
                />
            </div>

            {open && dropdown && createPortal(dropdown, document.body)}
        </div>
    );
};

export default SelectorSearch;