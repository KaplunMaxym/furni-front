import {ChangeEvent, ComponentProps, useId} from "react";
import {FieldValues, Path, Control, Controller} from "react-hook-form";
import {cn} from "@/helpers/cn";

interface IInputProps<T extends FieldValues> extends ComponentProps<'input'> {
    control: Control<T>;
    name: Path<T>;
    rules?: object;
    label?: string;
    maxLength?: number
    img?: string
    isTextarea?: boolean,
    classNameContainer?: string
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    inputRef?: (el: HTMLInputElement | null) => void;
}

const Input = <T extends FieldValues, >({control, name, rules, label, type = 'text', inputRef, onChange, maxLength = 100000, img, isTextarea, onFocus, onBlur, placeholder, className, classNameContainer, ...props}: IInputProps<T>) => {
    const isPhoneType = type === 'tel'
    // const isTextType = types === 'text'
    const id = useId()

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, onChange: (value: string | number) => void) => {
        let value = e.target.value
        if (isPhoneType) {
            value = value.replace(/[^\d+]/g, '')
            if (value.startsWith('+380') && value.length <= maxLength) {
                onChange(value)
            } else if (!value) {
                onChange('+380')
            }
        } else if (type === 'number') {
            value = value.replace(/[^\d.,-]/g, '');
            value = value.replace(/\./g, ',');
            const parts = value.split(',');
            if (parts.length > 2) {
                value = parts[0] + ',' + parts.slice(1).join('');
            }
            onChange(value !== '' ? parseFloat(value.replace(',', '.')) : '');
        } else {
            onChange(value.slice(0, maxLength))
        }
    }

    const handleFocusPhone = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, onChange: (value: string) => void) => {
        const value = e.target.value
        if (isPhoneType && !value.startsWith('+380'))
            onChange('+380')
    }

    const handleBlurPhone = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, onChange: (value: string) => void) => {
        const value = e.target.value
        if (isPhoneType && value === '+380')
            onChange('')
    }

    return (
        <div className={cn('w-auto', classNameContainer)}>
            {!!label && <label htmlFor={id} className={"text-xs font-semibold text-gray-600 ml-4 min-h-5 text-react/300"}>{label}</label>}
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({field, fieldState}) => {
                    return (
                        <>
                            <div className={'relative flex-1'}>
                                {isTextarea ? (
                                    <textarea
                                        id={id}
                                        className={cn(
                                            'min-h-[210px]',
                                            "resize-none px-4 py-2 h-[100px] font-medium text-black rounded-3xl border-2 outline-none focus:ring-0 text-base w-full focus:border-2 focus:border-react/300 scrollbar-hide",
                                            fieldState.error && "border-2 border-red/600 focus:border-2 focus:border-red/600",
                                            !fieldState.error && "border-2 border-white/600",
                                            className,
                                        )}
                                        {...field}
                                        onFocus={(e) => handleFocusPhone(e, field.onChange)}
                                        placeholder={placeholder}
                                        onBlur={(e) => {
                                            handleBlurPhone(e, field.onChange)
                                            field.onBlur()
                                        }}
                                        maxLength={maxLength}
                                        value={props.value || field.value || ''}
                                        onChange={(e) => handleChange(e, field.onChange)}
                                    />
                                ) : (
                                    <input
                                        id={id}
                                        type={type}
                                        {...field}
                                        ref={(el) => {
                                            field.ref(el);
                                            inputRef?.(el);
                                        }}
                                        className={cn(
                                            'px-4 min-h-[40px] font-medium text-black rounded-[12px] border-2 outline-none focus:ring-0 text-base w-full text-ellipsis border-react/500 focus:border-react/300 bg-react/500 duration-300',
                                            // !fieldState.error && 'border-2 border-white/600',
                                            fieldState.error && 'border-2 border-red/600 focus:border-2 focus:border-red/500',
                                            (isPhoneType || img) && 'pr-10',
                                            className
                                        )}
                                        {...props}
                                        maxLength={maxLength}
                                        placeholder={placeholder}
                                        value={(onChange ? props.value : (props.value ?? field.value)) ?? ''}
                                        onChange={(e) => {
                                            onChange && onChange(e)
                                            handleChange(e, field.onChange)
                                        }}
                                        onFocus={(e) => {
                                            handleFocusPhone(e, field.onChange)
                                            if (onFocus) onFocus(e)
                                        }}
                                        onBlur={(e) => {
                                            handleBlurPhone(e, field.onChange)
                                            field.onBlur()
                                            if (onBlur) onBlur(e)
                                        }}
                                    />)}
                                {/*// <Image src={(fieldState.error && icon.error) || img || icon.phoneMobile} alt={'icon'} className={'absolute top-3.5 right-5'}/>}*/}

                            </div>
                            {/*{fieldState.error && (*/}
                            {/*    <p className={'text-red-500 text-xs text-red/600 ml-4 mt-1'}>*/}
                            {/*        {fieldState.error.message}*/}
                            {/*    </p>*/}
                            {/*)}*/}
                        </>
                    )
                }}
            />
        </div>
    );
};

export default Input;


// Приклад використання компонента

// <Input<Inputs>
//     control={control}
//     name="phone"
//     types={'tel'}
//     label={'Телефон'}
//     placeholder={'+380 (XXX) XXXXXX'}
//     maxLength={13}
//     rules={phoneRegex}
//     inputMode={'numeric'}
// />