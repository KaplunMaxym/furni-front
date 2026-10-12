import { ComponentProps, FC } from 'react';
import { Link } from 'react-router';

import { cn } from '@/helpers/cn';
import { buttonVariants, type ButtonVariant } from '@/ui/shadcn/button';
import Loading from '../loading/Loading';

interface IButtonProps extends ComponentProps<'button'> {
    color?: keyof typeof COLOR_TO_VARIANT;
    isPending?: boolean;
    isDisable?: boolean;
    ImgLeftIcon?: string;
    ImgRightIcon?: string;
    loadingText?: number;
    disablePropagation?: boolean;
    classNameText?: string;
    nowrap?: boolean;
}

/**
 * Старі назви кольорів → варіанти кнопки з проєкту dashboard.
 *
 * Назви лишені як є навмисно: вони розкидані по сотнях викликів, і
 * перейменування дало б величезний дифф без жодної користі. Замість цього
 * кожна стара назва просто вказує на свій варіант нової кнопки.
 */
const COLOR_TO_VARIANT = {
    // основна дія
    greenWhite: 'default',
    greenDarkgreen: 'default',
    whiteSalat: 'default',

    // другорядна
    grayGreen: 'secondary',
    grayWhite: 'secondary',
    gray: 'secondary',

    // контурна
    blackGreenLine: 'outline',
    blackNoneLine: 'outline',
    WhiteBlackLineAndWhite: 'outline',
    greenLightLineWhiteBlackLine: 'outline',

    // ледь помітна
    transparent: 'ghost',
    lightGrayWhite: 'ghost',

    // небезпечна
    red: 'destructive',
    redAndGray: 'destructive',

    // акцентна
    blue: 'default',
} as const satisfies Record<string, ButtonVariant>;

/** Кольори, яких у наборі dashboard немає — доводимо класом поверх варіанта. */
const COLOR_EXTRA: Partial<Record<keyof typeof COLOR_TO_VARIANT, string>> = {
    blue: 'bg-chart-1 text-foreground hover:bg-chart-1/90',
    whiteSalat: 'rounded-full',
};

const Button: FC<IButtonProps> = ({
    color = 'redAndGray',
    children,
    isPending = false,
    isDisable = false,
    className,
    onClick,
    loadingText,
    disablePropagation = false,
    classNameText = '',
    nowrap = false,
    ...props
}) => {
    return (
        <button
            {...props}
            className={cn(
                buttonVariants({ variant: COLOR_TO_VARIANT[color] }),
                COLOR_EXTRA[color],
                // Тільки ширина: висоту, радіус і відступи задає розмір
                // перенесеної кнопки. Раніше тут стояли ще min-h-[40px] і
                // rounded-[12px] від старого компонента — вони перебивали
                // геометрію dashboard, і кнопки лишалися такими ж, як були.
                'w-full',
                isPending && 'pointer-events-none w-[58px] text-opacity-0',
                isDisable && 'pointer-events-none opacity-50',
                className,
            )}
            onClick={e => {
                if (!disablePropagation) e.stopPropagation();
                return isPending || isDisable ? {} : onClick && onClick(e);
            }}
        >
            {isPending ? (
                loadingText ? (
                    loadingText
                ) : (
                    <Loading />
                )
            ) : (
                <div
                    className={cn(
                        'flex shrink-0 items-center justify-center gap-2 text-wrap duration-0 [&>div]:shrink-0',
                        nowrap && 'text-nowrap',
                        classNameText,
                    )}
                >
                    {children}
                </div>
            )}
        </button>
    );
};

export default Button;

export const LinkButton: FC<ComponentProps<typeof Link>> = ({ children, className, ...rest }) => {
    return (
        <Link className={cn(buttonVariants({ variant: 'secondary' }), 'text-center', className)} {...rest}>
            <div className={'w-full text-center'}>{children}</div>
        </Link>
    );
};
