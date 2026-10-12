import {ComponentProps, FC} from "react";
import {XIcon} from "lucide-react";
import {cn} from "@/helpers/cn";

interface ModalTitleProps extends ComponentProps<"div"> {
    onClose?: () => void
}

const ModalTitle: FC<ModalTitleProps> = ({children, className, onClose, ...props}) => {
    return (
        <div
            {...props}
            className={cn(
                // text-base, а не text-lg: заголовок модалки не змагається
                // за увагу з полями всередині неї.
                "flex flex-row flex-nowrap justify-between items-center gap-5",
                "text-base font-semibold leading-none text-foreground",
                className
            )}
        >
            <div>{children}</div>
            {onClose &&
                <button
                    onClick={onClose}
                    aria-label="Закрити"
                    // Кнопка закриття з dialog.tsx проєкту dashboard: хрестик
                    // приглушений і проявляється під курсором, замість того щоб
                    // весь час змагатися із заголовком поруч.
                    className={cn(
                        'group flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded',
                        'outline-none transition-[color,box-shadow]',
                        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                        'disabled:pointer-events-none',
                    )}
                    type={'reset'}
                >
                    <XIcon size={16} className="opacity-60 transition-opacity group-hover:opacity-100"/>
                </button>
            }
        </div>
    );
};

export default ModalTitle;