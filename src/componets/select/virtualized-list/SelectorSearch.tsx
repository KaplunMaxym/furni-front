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
            className="bg-white text-black rounded-[12px] max-h-[200px] overflow-auto"
        >
            <div className="max-h-[200px] overflow-y-auto border border-react/400">
                {allowClear && placeholder && (
                    <div
                        onMouseDown={e => {
                            e.preventDefault();
                            handleClear(e);
                        }}
                        className={cn(
                            'px-3 py-2 text-sm text-white/600 bg-react/500 hover:bg-react/400 cursor-pointer border-b border-react/400',
                            (!state || state === null) && 'bg-react/400 font-semibold'
                        )}
                    >
                        {placeholder}
                    </div>
                )}
                {!filteredOptions.length && (
                    <div className="px-3 py-2 text-sm bg-react/500 text-white/600">Nothing found</div>
                )}
                {filteredOptions.map((option, i) => (
                    <div
                        key={i}
                        onMouseDown={e => {
                            e.preventDefault();
                            handleSelect(option);
                        }}
                        className={cn(
                            'px-3 py-2 text-sm text-white/600 bg-react/500 hover:bg-react/400 cursor-pointer',
                            String(getOptionValue(option)) === String(state) && 'bg-react/400 font-semibold'
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
            className={cn('relative flex flex-col gap-[5px] h-fit', className)}
        >
            {!!label && <p className="text-xs font-semibold text-gray-600 ml-4 min-h-5 text-react/300">{label}</p>}

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
                        'px-4 h-[40px] font-medium rounded-[12px] outline-none text-base bg-react/500 w-full pr-10',
                        !state && !isBlackDefault && 'text-react/300',
                        searchable ? 'cursor-text' : 'cursor-pointer',
                        hasError && 'border-2 border-red/500'
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