import { ComponentProps, FC } from 'react';

import { cn } from '@/helpers/cn';
import { useAuthStore } from '@/store/auth/authReducer';

type IChildSubContainerAuth = ComponentProps<'div'>;

/**
 * Обгортка сторінки.
 *
 * Ні `mt-16`, ні `max-w-[calc(100vw-160px)]` більше не потрібні: меню стоїть
 * у потоці ліворуч, а не поверх сторінки, тож місце під контент рахує флексбокс.
 *
 * Обмеження `max-w-[1700px]` теж прибрано: воно лишалося від верстки з
 * фіксованим меню і на широких моніторах лишало порожню смугу праворуч.
 * Тепер сторінка займає всю доступну ширину, а вужчою її роблять самі екрани
 * там, де це доречно.
 */
const MainLayout: FC<IChildSubContainerAuth> = ({ children, className }) => {
    const { accessToken } = useAuthStore();

    return (
        <div
            className={cn(
                'flex w-full flex-col gap-3 p-6',
                !accessToken && 'min-h-dvh',
                className,
            )}
        >
            {children}
        </div>
    );
};

export default MainLayout;
