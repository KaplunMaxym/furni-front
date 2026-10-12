import { PropsWithChildren, FC } from 'react';

import Sidebar from '@/features/sidebar/Sidebar';
import TopBar from '@/features/topbar/TopBar';
import { useAuthStore } from '../store/auth/authReducer';

const AppShell: FC<PropsWithChildren> = ({ children }) => {
    const { accessToken } = useAuthStore();

    if (!accessToken) {
        return <div className="flex min-h-dvh flex-1 flex-col">{children}</div>;
    }

    return (
        <div className="flex h-dvh bg-background">
            <Sidebar />

            {/*
              * Смуга над контентом, а не над усім вікном: меню має власну
              * шапку з логотипом, і суцільний хедер поверх обох розрізав би
              * її навпіл.
              */}
            <div className="flex min-w-0 flex-1 flex-col">
                <TopBar />
                <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
};

export default AppShell;
