import {CSSProperties, FC, PropsWithChildren, ReactNode, useEffect, useRef} from "react";
import {cn} from "@/helpers/cn";
import {ModalProps} from "@/hooks/useModal/useModal";
import Portal from "@/common/Portal";

interface ModalLayoutProps extends PropsWithChildren<ModalProps> {
    className?: string
    style?: CSSProperties
}

/**
 * Полотно модалки за зразком `dialog.tsx` із проєкту dashboard.
 *
 * Там це Radix-діалог, і анімація описана парами станів
 * (`data-[state=open]:animate-in fade-in-0 zoom-in-95`). Radix сюди не
 * переносив: у furni-front модалка вже має власний стан `animation`
 * ('in' / 'out') і `useModal` тримає закриття рівно 200 мс — стільки ж, скільки
 * триває анімація. Тож ті самі два кадри задані як звичайні класи.
 *
 * Підкладка й полотно анімуються окремо: підкладка лише проявляється, полотно
 * ще й підростає з 95 % — саме це й відрізняє появу діалогу від простого
 * увімкнення шару.
 *
 * Поки модалка згортається, її вміст заморожений.
 *
 * Закриття триває 200 мс, і весь цей час модалка ще на екрані. Екран же
 * скидає вибраний запис одразу — `setSelected(null)` і `onClose()` летять
 * одним batch'ем. Через це форма встигала перемалюватись у режим створення
 * просто під час згортання: заголовок мінявся з «Редагувати» на «Створити»,
 * поля порожніли, підпис кнопки стрибав. Виглядало як смикання.
 *
 * Тому під час згортання показуємо останній кадр «живого» вмісту, а не
 * поточний. Лагодити це в кожному екрані окремо було б п'ятнадцять однакових
 * `setTimeout` — і кожен новий екран знову приносив би ту саму ваду.
 */
const ModalLayout: FC<ModalLayoutProps> = (
    {
        onClose,
        open,
        animation,
        children,
        className,
        style
    }) => {
    /*
     * Ref, а не стан: перемальовувати заради збереженого кадру нічого не
     * треба, він потрібен рівно в тому рендері, який уже відбувається.
     */
    const lastOpenContent = useRef<ReactNode>(children);

    useEffect(() => {
        // Оновлюємо лише поки модалка відкрита — інакше перезапишемо
        // збережений кадр тим самим порожнім вмістом, від якого тікаємо
        if (animation === 'in') lastOpenContent.current = children;
    });

    if (!open) return null;

    const isClosing = animation === 'out';
    const content = isClosing ? lastOpenContent.current : children;

    return (
        <Portal target="modals-root">
            <div
                style={{...(style || {})}}
                onClick={(e) => {
                    e.stopPropagation()
                    onClose()
                }}
                className={cn(
                    // p-4 замінює `mx-2` й `max-h-[calc(100%-2rem)]` з оригіналу:
                    // там полотно позиціонувалось fixed і мусило рахувати відступи
                    // саме, тут його центрує підкладка — тож відступ її й тримає.
                    "fixed inset-0 z-[70] flex h-dvh w-full items-center justify-center overscroll-none p-4",
                    // bg-black/80 — як у dialog.tsx; раніше було bg-background/80,
                    // а фон сторінки й так майже чорний, тож підкладка не читалась
                    "bg-black/80",
                    isClosing ? "animate-fade-out" : "animate-fade-in",
                )}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                        // Класи полотна з dialog.tsx проєкту dashboard
                        'grid w-full max-h-full gap-4',
                        'overflow-y-auto rounded-xl border border-border bg-card p-6 text-foreground shadow-lg',
                        isClosing ? 'animate-dialog-out' : 'animate-dialog-in',
                        className,
                    )}
                >
                    {content}
                </div>
            </div>
        </Portal>
    );
};


export default ModalLayout;
