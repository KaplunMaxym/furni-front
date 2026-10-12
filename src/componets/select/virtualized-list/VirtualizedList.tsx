import {CSSProperties, useRef, useState, useEffect, FocusEvent, ChangeEvent, ComponentProps, ReactNode} from 'react';
import {List} from 'react-virtualized';
import {UseQueryResult} from "@tanstack/react-query";
import Loading from "@/ui/loading/Loading";
import {cn} from "@/helpers/cn";
import {Control, Controller, FieldValues, Path} from "react-hook-form";
import {Chevrone} from "@/assets";

interface IVirtualizedListProps<T, K extends FieldValues> extends ComponentProps<'input'> {
    label?: string
    optionValue?: keyof T
    useStateProps: [state: T | null, setState: (_: T | null) => void]
    placeholder?: string
    useQuery?: (_: string | number | boolean) => UseQueryResult<Array<T>, Error>
    paramsQuery?: number | string | boolean
    reset?: () => void
    control: Control<K>
    name: Path<K>
    rules?: object
    isDisableSelect?: boolean
    isDisableSearch?: boolean
    options?: Array<T> | undefined
    isBlackDefault?: boolean
    scroll?: boolean
}

const VirtualizedList = <T, K extends FieldValues>(
    {
        label = '',
        optionValue,
        useQuery,
        useStateProps,
        placeholder = '',
        paramsQuery,
        reset,
        control,
        name,
        rules,
        className,
        isDisableSelect,
        isDisableSearch,
        options,
        isBlackDefault = false,
        scroll,
    }: IVirtualizedListProps<T, K>) => {
    const [isOpen, setIsOpen] = useState(false)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const query = useQuery && useQuery(isOpen && paramsQuery ? paramsQuery : false)
    const isPending = query?.isPending
    const optionsQuery = query?.data
    const optionsData = optionsQuery || options
    const [searchTerm, setSearchTerm] = useState('')
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [selectedOption, setSelectedOption] = useStateProps
    const [listWidth, setListWidth] = useState(0)
    const valueInputState = optionValue && selectedOption ? String(selectedOption[optionValue]) : String(selectedOption || '')

    const transformOption = (option: T) =>
        typeof option === 'object' && option && optionValue ? option[optionValue] : option

    const filteredOptions = optionsData?.filter((option) =>
        String(transformOption(option)).toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) =>
        setSearchTerm(e.target.value)

    // Закриття списку при кліку за межами
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (dropdownRef.current) {
            setListWidth(dropdownRef.current.offsetWidth) // Встановлюємо ширину контейнера
        }
        setSearchTerm('')
    }, [isOpen])

    const inputRef = useRef<HTMLInputElement>(null)

    const handleFocus = (el: FocusEvent<HTMLInputElement>) => {
        el.target.blur()
        if (inputRef.current && !isOpen && !scroll) {
            const elementPosition = inputRef.current.getBoundingClientRect().top + window.scrollY - (isDisableSearch ? 200 : 100)
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth',
            })
        }
        setIsOpen(prev => !prev)
    }

    const rowRenderer = ({index, key, style, onChange}: { index: number; key: string; style: CSSProperties; onChange: (value: string) => void }) => {
        const itemStateValue = optionValue ? String(filteredOptions[index][optionValue]) : String(filteredOptions[index])
        return (
            <div
                key={key}
                style={{...style, height: style.height as number - 5}}
                className={cn(
                    "px-2 py-1.5 rounded-sm duration-300 cursor-pointer text-sm text-ellipsis line-clamp-1 w-full text-nowrap flex items-center font-normal hover:bg-accent hover:text-accent-foreground",
                    itemStateValue === valueInputState && 'bg-accent text-accent-foreground'
                )}
                onClick={() => {
                    setSelectedOption(filteredOptions[index])
                    setSearchTerm('')
                    setIsOpen(false)
                    if (!isDisableSelect) onChange(itemStateValue)
                    if (reset) reset()
                }}
            >
                <p>{itemStateValue}</p>
            </div>
        )
    }

    return (
        <div ref={dropdownRef} className="relative w-full">
            <img src={Chevrone} alt={'chevrone'} className={cn('absolute right-5 rotate-90 duration-300 top-[38px] !w-[12px] h-[12px]', isOpen && '-rotate-90')}/>
            {/*{!!label && <p className={"text-xs font-semibold text-gray-600 ml-4 min-h-5 text-gray/600"}>{label}</p>}*/}
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({field, fieldState}) => {
                    const rowHandler = (element: { index: number; key: string; style: CSSProperties; }) =>
                        rowRenderer({...element, onChange: field.onChange})
                    return <>
                        {!!label && <p className={cn("ml-4 min-h-3 mt-1.5 font-semibold text-muted-foreground text-[12px] duration-300 pointer-events-none small-caps")}>{label}</p>}
                        <input
                        {...field}
                        ref={inputRef}
                        className={cn(
                            'w-full min-h-[40px] px-4 text-base font-medium text-ellipsis duration-300',
                            'rounded-md border border-input bg-transparent text-foreground shadow-xs',
                            'placeholder:text-muted-foreground/70 outline-none transition-[color,box-shadow]',
                            'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                            fieldState.error && 'border-destructive-foreground',
                            isOpen && 'border-dark000',
                            isBlackDefault && 'placeholder-black-500',
                            className
                        )}
                        placeholder={placeholder}
                        // value={valueInputState}
                        value={field.value || ''}
                        onChange={() => {}}
                        onFocus={handleFocus}
                    />
                        {isOpen && (
                            <div className="absolute flex flex-col gap-2 text-[14px] z-10 w-full mt-2 p-5 rounded-2xl border border-border bg-card shadow-xl">
                                {!isDisableSearch &&
                                    <input
                                        type={"text"}
                                        className={"w-full px-4 py-1 font-medium bg-background text-foreground border border-border outline-none focus:border-ring text-[16px] rounded-[10px] placeholder:text-muted-foreground small-caps"}
                                        placeholder={"Пошук..."}
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        autoFocus
                                    />
                                }
                                {filteredOptions?.length > 0
                                    ? (
                                        <List
                                            width={listWidth - 40} // Ширина контейнера
                                            height={260} // Висота видимого списку
                                            rowCount={filteredOptions.length} // Кількість елементів
                                            rowHeight={40} // Висота кожного рядка
                                            rowRenderer={rowHandler} // Рендер функція
                                        />
                                    ) :
                                    <>{(isPending && paramsQuery)
                                        ? <Loading className={'my-5 !w-[18px] !h-[18px]'}/>
                                        : <div className="p-2 text-muted-foreground text-base text-center font-normal my-3">Не знайдено</div>
                                    }</>
                                }
                            </div>
                        )}</>
                }}
            />
        </div>
    );
};

export default VirtualizedList;