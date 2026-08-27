import { MenuOpen } from "@mui/icons-material";
import { Transition } from "@headlessui/react";
import { RouterEnum } from "@/config/RouterEnum";
import Button from "@/ui/button/Button";
import { AnchorHTMLAttributes, DetailedHTMLProps, FC, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth/authReducer";
import { Link, useLocation, useNavigate } from "react-router";
import { cn } from "@/helpers/cn";
import packageJson from "@/../package.json";
import { useQueryClient } from "@tanstack/react-query";
import {RoleEnum} from "@/config/RoleEnum";
import {Header} from "@/features/Header";

type AnchorProps = DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> & { blank?: boolean }

const NavigationMenu = () => {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { clearTokens, clearStorage, role } = useAuthStore()
    const navigate = useNavigate()

    const logoutHandler = () => {
        clearTokens();
        clearStorage();
        queryClient.cancelQueries();
        queryClient.clear();
        navigate('/')
    }

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1280);
        };
        handleResize()
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) && !isDesktop) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDesktop]);

    useEffect(() => {
        if (!isDesktop && isOpen)
            document.body.style.overflow = 'hidden'
        else
            document.body.style.overflow = ''
    }, [isOpen, isDesktop])

    const LingCustom: FC<AnchorProps> = ({ children, href = '/', className, blank = false, ...rest }) => {
        const location = useLocation()
        const isActive = location.pathname === href
        const classNameCustom = 'py-2 px-4 rounded-[12px] duration-300 flex flex-row gap-2 font-semibold text-white/600 bg-react/500 text-center hover:bg-white/600 hover:bg-opacity-5'
        const isActiveClassName = 'bg-red/500'
        const searchParams = new URLSearchParams(location.search);
        const finalUrl = location.pathname === href ? `${href}?${searchParams.toString()}` : href;
        return <>
            {blank
                ? <a
                    href={finalUrl}
                    {...rest}
                    target="_blank"
                    className={cn(
                        classNameCustom,
                        isActive && isActiveClassName,
                        className,
                    )}
                >{children}
                </a>
                : <Link
                    to={finalUrl}
                    {...rest}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                        classNameCustom,
                        isActive && isActiveClassName,
                        className,
                    )}
                >
                    <div className={'text-center w-full'}>{children}</div>
                </Link>}
        </>
    }

    return (
        <>
            <Header onMenuToggle={() => setIsOpen(!isOpen)} />

            <div className="relative flex desktop:w-[160px]">
                {!isDesktop && isOpen && (
                    <div
                        className="fixed inset-0 z-[60] bg-black/600 bg-opacity-20 backdrop-blur-[1.5px]"
                        onClick={() => setIsOpen(false)}
                    />
                )}
                <Transition
                    show={isDesktop || isOpen}
                    enter="transform transition duration-300 ease-in-out"
                    enterFrom="-translate-x-full"
                    enterTo="translate-x-0"
                    leave="transform transition duration-300 ease-in-out"
                    leaveFrom="translate-x-0"
                    leaveTo="-translate-x-full"
                >
                    <div
                        ref={menuRef}
                        className={cn(
                            'h-dvh bg-react/500 text-white z-[70] transition-all fixed top-0 left-0 bottom-0 w-[160px] overflow-y-auto scrollbar-hide desktop:w-[160px] flex flex-col justify-between p-4',
                        )}
                    >
                        <div className={'flex flex-col gap-3.5 pt-8'}>
                            <div className={'mx-auto w-full desktop:w-auto flex flex-row justify-between items-center'}>
                                <button onClick={() => setIsOpen(false)} className={'desktop:hidden ml-auto'}>
                                    <MenuOpen sx={{ fontSize: 30, color: 'white' }} />
                                </button>
                            </div>
                            <nav className="flex flex-col gap-2.5 h-full">
                                <LingCustom href={RouterEnum.MAIN}>
                                    Головна
                                </LingCustom>
                                <LingCustom href={RouterEnum.ORDER}>
                                    Замовлення
                                </LingCustom>
                                <LingCustom href={RouterEnum.CONSTRUCTION}>
                                    Конструкції
                                </LingCustom>
                                <LingCustom href={RouterEnum.COLOR}>
                                    Кольори
                                </LingCustom>
                                <LingCustom href={RouterEnum.PROFILE_SERVICE}>
                                    Послуги
                                </LingCustom>
                                <LingCustom href={RouterEnum.PROFILE_MATERIAL}>
                                    Матеріали
                                </LingCustom>
                                <LingCustom href={RouterEnum.PROFILE_ACCESSORY}>
                                    Аксесуари
                                </LingCustom>
                                <LingCustom href={RouterEnum.PROFILE_SYSTEM}>
                                    Профілі
                                </LingCustom>
                                <LingCustom href={RouterEnum.GLASS_FILL}>
                                    Скло
                                </LingCustom>
                                <LingCustom href={RouterEnum.CLIENTS}>
                                    Клієнти
                                </LingCustom>
                                <LingCustom href={RouterEnum.CURRENCY_RATE}>
                                    Курси валют
                                </LingCustom>
                                {role === RoleEnum.ROOT_ADMIN && (
                                    <>
                                        <LingCustom href={RouterEnum.USERS}>
                                            Користувачі
                                        </LingCustom>
                                    </>
                                )}
                            </nav>
                        </div>

                        <div className={'flex flex-col gap-3 mt-auto pt-5'}>
                            <Button className={'mt-auto'} onClick={logoutHandler}>
                                Вийти
                            </Button>
                            <LingCustom href={RouterEnum.VERSION}>
                                FR-v{packageJson.version}
                            </LingCustom>
                        </div>
                    </div>
                </Transition>
            </div>
        </>
    );
};

export default NavigationMenu;