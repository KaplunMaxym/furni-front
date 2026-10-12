import { ClipboardList, Layers, PackageCheck, Scissors, TrendingUp, Users } from 'lucide-react';

import MainLayout from '@/ui/layouts/main-layout/MainLatout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Skeleton } from '@/ui/shadcn/skeleton';
import { useDashboardAttention, useDashboardOverview } from '@/screens/main/hooks/useDashboard';
import KpiCard from '@/screens/main/component/KpiCard';
import MonthlyChart from '@/screens/main/component/MonthlyChart';
import SystemsShare from '@/screens/main/component/SystemsShare';
import RecentOrders from '@/screens/main/component/RecentOrders';
import AttentionBlock from '@/screens/main/component/AttentionBlock';
import WasteTable from '@/screens/main/component/WasteTable';
import PageHeader from '@/ui/page-header/PageHeader';
import { useAuthStore } from '@/store/auth/authReducer';
import { isDealerRole } from '@/config/RoleEnum';

/** Заглушка на час завантаження — повторює сітку, щоб сторінка не стрибала. */
const DashboardSkeleton = () => (
    <div className="flex w-full flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[88px] rounded-xl" />
            ))}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Skeleton className="h-[280px] rounded-xl" />
            <Skeleton className="h-[280px] rounded-xl" />
        </div>
    </div>
);

const Main = () => {
    const { overview, isLoading, isError, refetch } = useDashboardOverview();

    /*
     * Дилер бачить ту саму головну, але з власними числами: бек рахує їх у
     * межах його клієнта. Тут прибираємо лише те, що для нього безглузде —
     * розмір клієнтської бази й відхід профілю на виробництві.
     */
    const { role } = useAuthStore();
    const isDealer = isDealerRole(role);
    const { attention } = useDashboardAttention();

    if (isLoading) {
        return (
            <MainLayout>
                <DashboardSkeleton />
            </MainLayout>
        );
    }

    if (isError || !overview) {
        return (
            <MainLayout>
                <Card className="mx-auto mt-10 w-full max-w-md">
                    <CardContent className="flex flex-col items-center gap-3 p-6">
                        <p className="text-sm text-muted-foreground">
                            Не вдалося завантажити дашборд.
                        </p>
                        <button
                            onClick={() => refetch()}
                            className="rounded-md border border-border px-4 py-2 text-sm text-card-foreground transition-colors hover:bg-muted/50"
                        >
                            Спробувати ще раз
                        </button>
                    </CardContent>
                </Card>
            </MainLayout>
        );
    }

    const { kpi } = overview;

    return (
        <MainLayout>
            <div className="flex w-full flex-col gap-4">
                {/*
                  * Дилеру — про його замовлення, а не про завод.
                  *
                  * «Стан виробництва просто зараз» описував усю компанію, тоді
                  * як числа нижче для дилера пораховані лише в межах його
                  * клієнта. Підпис обіцяв більше, ніж сторінка показує.
                  */}
                <PageHeader
                    title="Головна"
                    description={isDealer
                        ? 'Ваші замовлення й конструкції: скільки в роботі та що вже завершено'
                        : 'Стан виробництва просто зараз: замовлення, конструкції та що потребує уваги'}
                />

                {/* ── KPI ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
                    <KpiCard
                        label="Замовлень у роботі"
                        value={kpi.activeOrders}
                        icon={<ClipboardList size={18} />}
                        iconClassName="text-chart-1"
                    />
                    <KpiCard
                        label="Конструкцій у роботі"
                        value={kpi.activeConstructions}
                        hint={`середній прогрес ${kpi.averageProgress}%`}
                        icon={<Layers size={18} />}
                        iconClassName="text-chart-2"
                    />
                    {/*
                      * Деталі — це заготовки на верстаті: балки, скло, отвори.
                      * Дилер їх не бачить ніде в інтерфейсі, тож і число про
                      * них нічого йому не каже.
                      */}
                    {!isDealer && (
                        <KpiCard
                            label="Деталей не готово"
                            value={kpi.pendingDetails}
                            icon={<Scissors size={18} />}
                            iconClassName="text-chart-3"
                        />
                    )}
                    <KpiCard
                        label="Завершено за місяць"
                        value={kpi.completedThisMonth}
                        icon={<PackageCheck size={18} />}
                        iconClassName="text-chart-2"
                    />
                    {/*
                      * Скільки в компанії клієнтів — не справа дилера: це розмір
                      * чужої клієнтської бази. Бек йому й не рахує це число.
                      */}
                    {!isDealer && (
                        <KpiCard
                            label="Клієнтів"
                            value={kpi.clients}
                            icon={<Users size={18} />}
                            iconClassName="text-chart-4"
                        />
                    )}
                    <KpiCard
                        label="Середній прогрес"
                        value={kpi.averageProgress}
                        unit="%"
                        icon={<TrendingUp size={18} />}
                        iconClassName="text-chart-5"
                    />
                </div>

                {/* ── дві колонки: замовлення | виробництво ────────────── */}
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

                    <div className="flex flex-col gap-4">
                        <Card>
                            <CardHeader className="p-5 pb-3">
                                <CardTitle className="text-base">Динаміка</CardTitle>
                                <CardDescription>Останні 6 місяців</CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 pt-0">
                                <MonthlyChart data={overview.monthly} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="p-5 pb-3">
                                <CardTitle className="text-base">
                                    {isDealer ? 'Ваші останні замовлення' : 'Останні замовлення'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 pt-0">
                                <RecentOrders orders={overview.recentOrders} />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Card>
                            <CardHeader className="p-5 pb-3">
                                <CardTitle className="text-base">Профільні системи</CardTitle>
                                {/* «Усі» — це всі конструкції компанії; дилеру рахуються лише його */}
                                <CardDescription>
                                    {isDealer ? 'За вашими конструкціями' : 'За всі конструкції'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 pt-0">
                                <SystemsShare data={overview.systems} />
                            </CardContent>
                        </Card>

                        {/*
                          * Відхід — показник закупівлі й розкрою, тобто того,
                          * наскільки ощадливо працює виробництво. Дилеру він
                          * нічого не пояснює про його замовлення.
                          */}
                        {!isDealer && (
                            <Card>
                                <CardHeader className="p-5 pb-3">
                                    <CardTitle className="text-base">Відходи профілю</CardTitle>
                                    <CardDescription>Топ за часткою відходу</CardDescription>
                                </CardHeader>
                                <CardContent className="p-5 pt-0">
                                    <WasteTable rows={overview.waste} />
                                </CardContent>
                            </Card>
                        )}

                        {/* Стан даних — лише адміну, бек іншим віддає 403 */}
                        {attention && (
                            <Card>
                                <CardHeader className="p-5 pb-3">
                                    <CardTitle className="text-base">Стан даних</CardTitle>
                                    <CardDescription>Видно лише адміністратору</CardDescription>
                                </CardHeader>
                                <CardContent className="p-5 pt-0">
                                    <AttentionBlock attention={attention} />
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

            </div>
        </MainLayout>
    );
};

export default Main;
