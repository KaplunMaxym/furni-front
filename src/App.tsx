import '@/App.css'
import {Navigate, Route, RouteObject, Routes} from "react-router";
import Auth from "@/screens/auth/Auth";
import Providers from "@/providers/Providers";
import {useAuthStore} from "./store/auth/authReducer";
import Version from "@/screens/version/Version";
import {RouterEnum} from "./config/RouterEnum";
import Clients from "@/screens/client/Clients";
import Main from "@/screens/main/Main";
import {isDealerRole, RoleEnum} from "@/config/RoleEnum";
import Users from "@/screens/users/features/screens/user-screen/Users";
import UserRoles from "@/screens/users/features/screens/user-role-screen/UserRoles";
import GlassFill from "@/screens/glass-fill/GlassFill";
import Order from "@/screens/order/features/screens/order-screen/Order";
import OrderStatus from "@/screens/order/features/screens/order-status-screen/OrderStatus";
import OrderDetails from "@/screens/order/features/screens/order-screen/OrderDetails";
import ConstructionEditorPage from "@/screens/construction/pages/construction/ConstructionEditorPage";
import Construction from "@/screens/construction/pages/construction/Construction";
import ConstructionStatus from "@/screens/construction/pages/construction-status/ConstructionStatus";
import ProfileSystem from "@/screens/profile-system/ProfileSystem";
import ProfileSystemDetailPage from "@/screens/profile-system/features/screens/ProfileSystemDetailPage";
import ProfileService from "@/screens/profile-service/ProfileService";
import ColorScreen from "@/screens/catalog/Color";
import ProfileMaterialScreen from "@/screens/profile-material/ProfileMaterial";
import ProfileAccessoryScreen from "@/screens/profile-accessory/ProfileAccessory";
import CurrencyRate from "@/screens/currency-rate/CurrencyRate";
import IntegrationLog from "@/screens/integration-log/IntegrationLog";
import CutBatches from "@/screens/cut-batch/CutBatches";
import Settings from "@/screens/settings/Settings";

/**
 * Маршрути, доступні дилеру.
 *
 * Перелік позитивний: усе, чого тут немає, для нього не існує. Прибирати
 * маршрути «крім заборонених» було б помилкою — новий розділ, доданий потім,
 * виявився б відкритим за замовчуванням.
 *
 * Це лише зручність, а не захист: сам доступ до даних закриває гвард на
 * сервері. Тут ми лише не показуємо дверей, у які все одно не пустять.
 */
const DEALER_ROUTES: string[] = [
    RouterEnum.MAIN,
    RouterEnum.ORDER,
    RouterEnum.ORDER_DETAILS,
    RouterEnum.CONSTRUCTION,
    RouterEnum.CONSTRUCTION_EDITOR,
    RouterEnum.VERSION,
];

function App() {
    const {accessToken, role} = useAuthStore()
    const isDealer = isDealerRole(role);

    const routes: Array<RouteObject> = [
        { path: RouterEnum.MAIN, element: <Main /> },
        { path: RouterEnum.ORDER, element: <Order /> },
        { path: RouterEnum.ORDER_STATUS, element: <OrderStatus /> },
        { path: RouterEnum.ORDER_DETAILS, element: <OrderDetails /> },
        { path: RouterEnum.GLASS_FILL, element: <GlassFill /> },
        { path: RouterEnum.CLIENTS, element: <Clients /> },
        { path: RouterEnum.PROFILE_SERVICE, element: <ProfileService /> },
        { path: RouterEnum.COLOR, element: <ColorScreen /> },
        { path: RouterEnum.PROFILE_SYSTEM, element: <ProfileSystem /> },
        { path: RouterEnum.CURRENCY_RATE, element: <CurrencyRate /> },
        { path: RouterEnum.INTEGRATION_LOG, element: <IntegrationLog /> },
        { path: RouterEnum.CUT_BATCH, element: <CutBatches /> },
        { path: RouterEnum.SETTINGS, element: <Settings /> },
        { path: RouterEnum.PROFILE_MATERIAL, element: <ProfileMaterialScreen /> },
        { path: RouterEnum.PROFILE_ACCESSORY, element: <ProfileAccessoryScreen /> },
        { path: RouterEnum.PROFILE_SYSTEM_DETAILS, element: <ProfileSystemDetailPage /> },
        { path: RouterEnum.CONSTRUCTION_EDITOR, element: <ConstructionEditorPage /> },
        { path: RouterEnum.CONSTRUCTION, element: <Construction /> },
        { path: RouterEnum.CONSTRUCTION_STATUS, element: <ConstructionStatus /> },
        ...(role === RoleEnum.ROOT_ADMIN ?
            [
                { path: RouterEnum.USERS, element: <Users /> },
                { path: RouterEnum.USER_ROLES, element: <UserRoles /> },
            ]: []),
        { path: RouterEnum.VERSION, element: <Version /> },
    ]

    const visibleRoutes = isDealer
        ? routes.filter(route => DEALER_ROUTES.includes(route.path as string))
        : routes;

    return (
        <Providers>
            <div className="text-foreground">
                <Routes>
                    {accessToken
                        ? <>
                            {visibleRoutes.map((route, index) => (
                                <Route key={index} path={route.path} element={route.element}/>
                            ))}
                            {/*
                              * Набрана вручну адреса закритого розділу вела б у
                              * порожню сторінку без жодного пояснення — вертаємо
                              * на головну
                              */}
                            <Route path="*" element={<Navigate to={RouterEnum.MAIN} replace />}/>
                        </>
                        : <Route path="*" element={<Auth/>}/>
                    }
                </Routes>
            </div>
        </Providers>
    )
}

export default App
