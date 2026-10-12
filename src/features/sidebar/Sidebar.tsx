import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
    Boxes,
    ChevronDown,
    ClipboardList,
    Layers,
    LayoutDashboard,
    LogOut,
    type LucideIcon,
    Package,
    PanelLeftClose,
    Palette,
    Settings,
    ShieldCheck,
    Scissors,
    ScrollText,
    SquareStack,
    Tags,
    Users,
    Wrench,
} from 'lucide-react';

import { cn } from '@/helpers/cn';
import { RouterEnum } from '@/config/RouterEnum';
import { isDealerRole, RoleEnum } from '@/config/RoleEnum';
import { useAuthStore } from '@/store/auth/authReducer';
import { SHELL_HEADER_HEIGHT } from '@/features/layout/shellMetrics';
import packageJson from '@/../package.json';

interface Item {
    label: string;
    icon: LucideIcon;
    href: string;
    adminOnly?: boolean;
    /**
     * Чи бачить пункт дилер.
     *
     * Позначка позитивна, а не «сховати від дилера»: список закритий за
     * замовчуванням, як і на беку. Новий розділ, доданий колись потім,
     * автоматично лишається невидимим — а при зворотній позначці про нього
     * просто забули б, і дилер побачив би в меню чужий довідник.
     */
    dealer?: boolean;
}

interface Group {
    label: string;
    icon: LucideIcon;
    items: Item[];
}

const GROUPS: Group[] = [
    {
        /*
         * «Робота» нічого не називала: решта груп — теж робота, просто рідша.
         * «Основне» відповідає на питання, чим ця група відрізняється від
         * довідників і налаштувань: сюди заходять щодня, туди — коли треба
         * щось завести або змінити.
         */
        label: 'Основне',
        icon: LayoutDashboard,
        items: [
            { label: 'Головна', icon: LayoutDashboard, href: RouterEnum.MAIN, dealer: true },
            { label: 'Замовлення', icon: ClipboardList, href: RouterEnum.ORDER, dealer: true },
            { label: 'Конструкції', icon: SquareStack, href: RouterEnum.CONSTRUCTION, dealer: true },
            /*
             * Партії різу — в «Основному», а не в «Системі» поруч із журналом.
             *
             * Це не службовий розділ: у нього заходять цех і комірник, щоб
             * подивитись карту розкрою й склад після партії. Без `dealer`:
             * у партії видно замовлення різних клієнтів.
             */
            { label: 'Партії різу', icon: Scissors, href: RouterEnum.CUT_BATCH },
        ],
    },
    {
        label: 'Довідники',
        icon: Layers,
        items: [
            { label: 'Профільні системи', icon: Layers, href: RouterEnum.PROFILE_SYSTEM },
            { label: 'Матеріали', icon: Package, href: RouterEnum.PROFILE_MATERIAL },
            { label: 'Аксесуари', icon: Boxes, href: RouterEnum.PROFILE_ACCESSORY },
            { label: 'Послуги', icon: Wrench, href: RouterEnum.PROFILE_SERVICE },
            { label: 'Скло', icon: SquareStack, href: RouterEnum.GLASS_FILL },
            { label: 'Кольори', icon: Palette, href: RouterEnum.COLOR },
        ],
    },
    {
        label: 'Контрагенти',
        icon: Users,
        items: [{ label: 'Клієнти', icon: Users, href: RouterEnum.CLIENTS }],
    },
    {
        label: 'Система',
        icon: Settings,
        items: [
            { label: 'Курси валют', icon: Settings, href: RouterEnum.CURRENCY_RATE },
            /*
             * Журнал обміну — у «Системі», а не поруч із замовленнями.
             *
             * Заходять у нього не щодня, а коли 1С і ERP розійшлись; у групі
             * «Основне» він щодня маячив би перед очима тим, кому потрібен раз
             * на місяць.
             */
            { label: 'Журнал 1С', icon: ScrollText, href: RouterEnum.INTEGRATION_LOG },
            { label: 'Користувачі', icon: Users, href: RouterEnum.USERS, adminOnly: true },
            { label: 'Ролі користувачів', icon: ShieldCheck, href: RouterEnum.USER_ROLES, adminOnly: true },
            /*
             * Статуси — окремі сторінки, а не таби поруч зі списками.
             *
             * Табом «Статуси» стояв рівноправно із «Замовленнями», хоч у нього
             * заходять раз на місяць; до того ж вибір таба жив у пам'яті, а не в
             * адресі, тож посилання на нього дати було неможливо, а
             * перезавантаження скидало на список.
             */
            { label: 'Статуси замовлень', icon: Tags, href: RouterEnum.ORDER_STATUS },
            { label: 'Статуси конструкцій', icon: Tags, href: RouterEnum.CONSTRUCTION_STATUS },
        ],
    },
];

const STORAGE_KEY = 'furni:sidebar-collapsed';

const ROLE_LABELS: Record<string, string> = {
    [RoleEnum.ROOT_ADMIN]: 'Адміністратор',
    [RoleEnum.STRUCTURAL_ENGINEER]: 'Конструктор',
    [RoleEnum.DEALER]: 'Дилер',
};

/** Дві літери для кружечка: «Остап Строєвус» → «ОС». */
const initials = (value: string): string =>
    value
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? '')
        .join('') || '?';

const Sidebar = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const queryClient = useQueryClient();
    const { role, name, email, clearTokens, clearStorage } = useAuthStore();

    const isAdmin = role === RoleEnum.ROOT_ADMIN;
    const isDealer = isDealerRole(role);
    const roleLabel = (role && ROLE_LABELS[role]) || 'Користувач';

    // Хто увійшов до цієї зміни — має в сховищі лише роль, без імені й пошти.
    // Тоді роль і стає підписом, щоб блок не був порожнім кружечком
    const displayName = name || roleLabel;
    const displayEmail = email || (name ? null : 'Дані оновляться після входу');

    const [closed, setClosed] = useState<Record<string, boolean>>({});
    const [collapsed, setCollapsed] = useState(
        () => localStorage.getItem(STORAGE_KEY) === '1',
    );

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    }, [collapsed]);

    const groups = GROUPS
        .map(group => ({
            ...group,
            items: group.items.filter(item =>
                isDealer ? item.dealer : !item.adminOnly || isAdmin,
            ),
        }))
        .filter(group => group.items.length > 0);

    const toggle = (label: string) =>
        setClosed(current => ({ ...current, [label]: !current[label] }));

    const logout = () => {
        clearTokens();
        clearStorage();
        queryClient.cancelQueries();
        queryClient.clear();
        navigate(RouterEnum.MAIN);
    };

    /*
     * Збіг або сам шлях, або його вкладена сторінка.
     *
     * Було `startsWith(href)` без роздільника, і будь-який пункт підсвічувався
     * разом з усіма, чия адреса починається так само: на «Статусах замовлень»
     * (`/order-status`) горіли ще й «Замовлення» (`/order`), на статусах
     * конструкцій — «Конструкції». Головну доводилось перевіряти окремо, бо
     * `/` — початок геть усього; тепер це виходить саме собою.
     */
    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(`${href}/`);

    return (
        <aside
            className={cn(
                'flex h-dvh shrink-0 flex-col border-r border-border bg-card',
                'transition-[width] duration-200',
                collapsed ? 'w-[72px]' : 'w-[260px]',
            )}
        >
            <div
                className={cn(
                    // Висота спільна з верхньою смугою — щоб рамки склались
                    // в одну лінію через увесь екран
                    SHELL_HEADER_HEIGHT,
                    'flex shrink-0 items-center gap-3 border-b border-border',
                    collapsed ? 'justify-center px-2' : 'px-4',
                )}
            >
                {collapsed ? (
                    /*
                      * У згорнутому меню логотип і є кнопкою розгортання.
                      *
                      * Удвох вони по вертикалі не вміщались у висоту шапки, а
                      * поруч не влазять у 72 пікселі ширини. Логотип тут єдина
                      * помітна ціль, тож натиск по ньому й розгортає меню —
                      * замість того щоб ліпити поруч крихітну стрілку.
                      */
                    <button
                        type="button"
                        title="Розгорнути меню"
                        aria-label="Розгорнути меню"
                        onClick={() => setCollapsed(false)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition-opacity hover:opacity-80"
                    >
                        <Boxes className="h-5 w-5" />
                    </button>
                ) : (
                    <>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                            <Boxes className="h-5 w-5" />
                        </span>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-lg leading-tight tracking-tight text-foreground">
                                <span className="font-semibold">FURNI</span>{' '}
                                <span className="text-muted-foreground">CRM</span>
                            </p>
                            <p className="truncate text-xs leading-tight text-muted-foreground">
                                Алюмінієві фасади
                            </p>
                        </div>

                        <button
                            type="button"
                            title="Згорнути меню"
                            aria-label="Згорнути меню"
                            onClick={() => setCollapsed(true)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                        >
                            <PanelLeftClose className="h-4 w-4" />
                        </button>
                    </>
                )}
            </div>

            {!collapsed && (
                <p className="px-5 pb-2 pt-4 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Меню
                </p>
            )}

            {collapsed ? (
                <nav className="flex-1 space-y-1 overflow-y-auto px-2 pt-3">
                    {groups.flatMap(group => group.items).map(item => (
                        <Link
                            key={item.href}
                            to={item.href}
                            title={item.label}
                            className={cn(
                                'flex h-10 items-center justify-center rounded-lg transition-colors',
                                isActive(item.href)
                                    ? 'bg-primary/10 text-foreground'
                                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                        </Link>
                    ))}
                </nav>
            ) : (
                <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
                    {groups.map(group => {
                        const hasActive = group.items.some(item => isActive(item.href));
                        const isOpen = !closed[group.label] || hasActive;

                        return (
                            <div
                                key={group.label}
                                className={cn('rounded-xl transition-colors', isOpen && 'bg-accent/40 pb-1')}
                            >
                                <button
                                    type="button"
                                    onClick={() => toggle(group.label)}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-accent/60"
                                >
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md">
                                        <group.icon className="h-4 w-4 text-muted-foreground" />
                                    </span>

                                    <span className="flex-1 text-left font-medium">{group.label}</span>

                                    <ChevronDown
                                        className={cn(
                                            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                                            !isOpen && '-rotate-90',
                                        )}
                                    />
                                </button>

                                {isOpen && (
                                    <div className="ml-[26px] pr-2">
                                        {group.items.map((item, index) => {
                                            const isLast = index === group.items.length - 1;

                                            return (
                                                <div key={item.href} className="relative pl-5">
                                                    {/* Куточок і лінія — щоб вкладеність читалась без відступів */}
                                                    <span
                                                        aria-hidden
                                                        className="pointer-events-none absolute left-0 top-0 h-1/2 w-3 rounded-bl-[6px] border-b border-l border-border"
                                                    />
                                                    {!isLast && (
                                                        <span
                                                            aria-hidden
                                                            className="pointer-events-none absolute left-0 top-1/2 h-1/2 w-px bg-border"
                                                        />
                                                    )}

                                                    <Link
                                                        to={item.href}
                                                        className={cn(
                                                            'my-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                                                            isActive(item.href)
                                                                ? 'bg-primary/10 font-medium text-foreground'
                                                                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                                                        )}
                                                    >
                                                        <item.icon className="h-4 w-4 shrink-0" />
                                                        <span className="flex-1 truncate">{item.label}</span>
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            )}

            {/*
             * Спершу «хто ти», потім дія, і аж наприкінці — версія.
             *
             * Раніше роль і версія стояли в одному рядку: слово «Адміністратор»
             * і «v0.4.1» читались як пара, хоча перше стосується користувача, а
             * друге — складання застосунку. Тепер обліковий запис оформлений як
             * у проєкті dashboard, а версія винесена окремим рядком під кнопкою.
             */}
            <div className={cn('border-t border-border', collapsed ? 'p-2' : 'p-3')}>
                {/*
                  * Обліковий запис і вихід — одним рядком.
                  *
                  * Раніше це були три блоки один під одним: картка з іменем,
                  * кнопка теми на всю ширину і кнопка «Вийти» на всю ширину.
                  * Разом вони з'їдали чверть висоти меню — заради дій, до яких
                  * тягнуться раз на зміну. Тема переїхала в шапку, вихід став
                  * іконкою поруч з іменем: він стосується саме цього
                  * користувача, тож і стоїть при ньому.
                  */}
                {role && (
                    <div
                        className={cn(
                            'flex items-center gap-2 rounded-lg bg-accent/40',
                            collapsed ? 'flex-col p-1.5' : 'py-1.5 pl-2 pr-1.5',
                        )}
                    >
                        <span
                            title={[displayName, displayEmail, roleLabel].filter(Boolean).join(' · ')}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-foreground"
                        >
                            {initials(displayName)}
                        </span>

                        {!collapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium leading-tight text-foreground">
                                    {displayName}
                                </p>
                                {/*
                                  * Під іменем — роль, а не пошта.
                                  *
                                  * Пошта тут довша за колонку й однаково
                                  * обрізалась до «oleksandr.dr…», тобто не
                                  * повідомляла нічого. Роль пояснює, чому в
                                  * меню саме ці розділи; повністю все видно
                                  * у підказці на кружечку.
                                  */}
                                <p className="truncate text-xs leading-tight text-muted-foreground">
                                    {roleLabel}
                                </p>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={logout}
                            title="Вийти"
                            aria-label="Вийти"
                            className={cn(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                                /*
                                 * Спокійна за замовчуванням, червона під
                                 * курсором: попередження доречне в мить дії,
                                 * а не цілий робочий день.
                                 */
                                'text-muted-foreground transition-colors',
                                'hover:bg-destructive/15 hover:text-destructive-foreground',
                            )}
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/*
                  * Версія — маленьким банером, а не рядком дрібного тексту.
                  *
                  * Раніше «v0.4.1» висів по центру під кнопкою й читався як
                  * підпис до неї. Тепер це окрема плашка з підписом «Версія»:
                  * видно, що це стан складання, і зрозуміло, що по ній можна
                  * клікнути — саме туди йдуть, коли треба звірити збірку.
                  */}
                <Link
                    to={RouterEnum.VERSION}
                    title={`Версія ${packageJson.version}`}
                    className={cn(
                        'mt-2 flex items-center gap-2 rounded-lg border border-border px-2 py-1.5',
                        'text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground',
                        collapsed ? 'justify-center' : 'justify-between',
                    )}
                >
                    {collapsed ? (
                        <span className="text-[10px] font-medium tabular-nums">
                            {packageJson.version}
                        </span>
                    ) : (
                        <>
                            <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                                Версія
                            </span>
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-foreground">
                                v{packageJson.version}
                            </span>
                        </>
                    )}
                </Link>
            </div>
        </aside>
    );
};

export default Sidebar;
