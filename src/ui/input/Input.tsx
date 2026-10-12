import {ChangeEvent, ComponentProps, useId, useState} from "react";
import {FieldValues, Path, Control, Controller} from "react-hook-form";
import {Eye, EyeOff} from "lucide-react";
import {cn} from "@/helpers/cn";
import Hint from "@/ui/hint/Hint";

interface IInputProps<T extends FieldValues> extends ComponentProps<'input'> {
    control: Control<T>;
    name: Path<T>;
    rules?: object;
    label?: string;
    /** Пояснення поля — іконка поруч із підписом. */
    hint?: string;
    /**
     * Одиниця виміру всередині поля — «мм», «шт», «°».
     *
     * Раніше її писали в підпис: «Ширина (мм) (X):». Підпис від того ріс, а
     * при введенні його не видно взагалі — око в полі, а не над ним. Тепер
     * одиниця стоїть праворуч у самому полі, поруч із числом.
     */
    unit?: string;
    maxLength?: number
    img?: string
    isTextarea?: boolean,
    classNameContainer?: string
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    inputRef?: (el: HTMLInputElement | null) => void;
}

const Input = <T extends FieldValues, >({control, name, rules, label, hint, unit, type = 'text', inputRef, onChange, maxLength = 100000, img, isTextarea, onFocus, onBlur, placeholder, className, classNameContainer, ...props}: IInputProps<T>) => {
    const isPhoneType = type === 'tel'
    // const isTextType = types === 'text'
    const id = useId()

    /*
     * Показ пароля живе в самому полі.
     *
     * Кожна форма робила це сама: тримала свій `showPassword` і клала «око»
     * абсолютно позиціонованою кнопкою — `top-[45%]` в одній, `top-[38px]` у
     * другій, `top-[34px]` у третій. Числа підбирались на око під конкретну
     * розкладку, і варто було додати підпис чи текст помилки, як іконка
     * з'їжджала повз поле.
     *
     * Тут вона центрується відносно обгортки, у якій лежить тільки сам
     * `<input>`, тож `top-1/2` завжди точний. Тип поля лишається
     * `type="password"` — перемикає його поле, а не форма.
     */
    const isPasswordType = type === 'password'
    const [isRevealed, setRevealed] = useState(false)
    const resolvedType = isPasswordType && isRevealed ? 'text' : type

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
            {!!label && (
                <span className="ml-4 flex min-h-5 items-center gap-1.5">
                    <label htmlFor={id} className="text-xs font-semibold text-muted-foreground">
                        {label}
                    </label>
                    {hint && <Hint title={label}>{hint}</Hint>}
                </span>
            )}
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
                                            // text-black на темному тлі був нечитабельним ще до зміни теми
                                            'resize-none w-full scrollbar-hide px-4 py-2 h-[100px] text-base font-medium',
                                            // Класи з shared/ui/input.tsx проєкту dashboard:
                                            // прозорий фон і рамка border-input, кільце на фокусі.
                                            'rounded-md border border-input bg-transparent text-foreground shadow-xs',
                                            'placeholder:text-muted-foreground/70 outline-none transition-[color,box-shadow]',
                                            'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                                            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                                            fieldState.error && 'border-destructive-foreground focus-visible:ring-destructive/40',
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
                                        type={resolvedType}
                                        {...field}
                                        ref={(el) => {
                                            field.ref(el);
                                            inputRef?.(el);
                                        }}
                                        className={cn(
                                            'w-full min-h-[40px] px-4 text-base font-medium text-ellipsis duration-300',
                                            // Класи з shared/ui/input.tsx проєкту dashboard:
                                            // прозорий фон і рамка border-input, кільце на фокусі.
                                            'rounded-md border border-input bg-transparent text-foreground shadow-xs',
                                            'placeholder:text-muted-foreground/70 outline-none transition-[color,box-shadow]',
                                            'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                                            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                                            fieldState.error && 'border-destructive-foreground focus-visible:ring-destructive/40',
                                            (isPhoneType || img) && 'pr-10',
                                            // Місце під одиницю: без цього довге число заповзає під «мм»
                                            unit && 'pr-12',
                                            // Те саме під «око»: пароль інакше заїжджає під кнопку
                                            isPasswordType && 'pr-11',
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

                                {/*
                                  * `pointer-events-none` — щоб клік по «мм»
                                  * ставив курсор у поле, а не провалювався
                                  * повз нього
                                  */}
                                {unit && !isTextarea && (
                                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                        {unit}
                                    </span>
                                )}

                                {isPasswordType && !isTextarea && (
                                    <button
                                        type="button"
                                        onClick={() => setRevealed(prev => !prev)}
                                        aria-label={isRevealed ? 'Сховати пароль' : 'Показати пароль'}
                                        // `tabIndex={-1}`: Tab із поля має вести до наступного
                                        // поля форми, а не до кнопки показу
                                        tabIndex={-1}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {isRevealed
                                            ? <EyeOff className="h-[18px] w-[18px]" />
                                            : <Eye className="h-[18px] w-[18px]" />}
                                    </button>
                                )}

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