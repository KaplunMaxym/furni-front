import '@/App.css'
import {Route, RouteObject, Routes} from "react-router";
import Auth from "@/screens/auth/Auth";
import Providers from "@/providers/Providers";
import {useAuthStore} from "./store/auth/authReducer";
import Version from "@/screens/version/Version";
import {RouterEnum} from "./config/RouterEnum";
import '@mui/x-date-pickers/timeViewRenderers';
import Clients from "@/screens/client/Clients";
import Main from "@/screens/main/Main";
import {RoleEnum} from "@/config/RoleEnum";
import UserScreens from "@/screens/users/UserScreens";
import GlassFill from "@/screens/glass-fill/GlassFill";
import OrderScreens from "@/screens/order/OrderScreens";
import OrderDetails from "@/screens/order/features/screens/order-screen/OrderDetails";
import ConstructionEditorPage from "@/screens/construction/pages/construction/ConstructionEditorPage";
import ConstructionsScreens from "@/screens/construction/ConstructionsScreens";
import ProfileSystem from "@/screens/profile-system/ProfileSystem";
import ProfileSystemDetailPage from "@/screens/profile-system/features/screens/ProfileSystemDetailPage";
import ProfileService from "@/screens/profile-service/ProfileService";
import ColorScreen from "@/screens/catalog/Color";
import ProfileMaterialScreen from "@/screens/profile-material/ProfileMaterial";
import ProfileAccessoryScreen from "@/screens/profile-accessory/ProfileAccessory";
import CurrencyRate from "@/screens/currency-rate/CurrencyRate";

function App() {
    const {accessToken, role} = useAuthStore()
    const routes: Array<RouteObject> = [
        { path: RouterEnum.MAIN, element: <Main /> },
        { path: RouterEnum.ORDER, element: <OrderScreens /> },
        { path: RouterEnum.ORDER_DETAILS, element: <OrderDetails /> },
        { path: RouterEnum.GLASS_FILL, element: <GlassFill /> },
        { path: RouterEnum.CLIENTS, element: <Clients /> },
        { path: RouterEnum.PROFILE_SERVICE, element: <ProfileService /> },
        { path: RouterEnum.COLOR, element: <ColorScreen /> },
        { path: RouterEnum.PROFILE_SYSTEM, element: <ProfileSystem /> },
        { path: RouterEnum.CURRENCY_RATE, element: <CurrencyRate /> },
        { path: RouterEnum.PROFILE_MATERIAL, element: <ProfileMaterialScreen /> },
        { path: RouterEnum.PROFILE_ACCESSORY, element: <ProfileAccessoryScreen /> },
        { path: RouterEnum.PROFILE_SYSTEM_DETAILS, element: <ProfileSystemDetailPage /> },
        { path: RouterEnum.CONSTRUCTION_EDITOR, element: <ConstructionEditorPage /> },
        { path: RouterEnum.CONSTRUCTION, element: <ConstructionsScreens /> },
        ...(role === RoleEnum.ROOT_ADMIN ?
            [
                { path: RouterEnum.USERS, element: <UserScreens /> },
            ]: []),
        { path: RouterEnum.VERSION, element: <Version /> },
    ]

    return (
        <Providers>
            <div className={'text-gray/300'}>
                <Routes>
                    {accessToken
                        ? routes.map((route, index) => (
                            <Route key={index} path={route.path} element={route.element}/>
                        ))
                        : <Route path="*" element={<Auth/>}/>
                    }
                </Routes>
            </div>
        </Providers>
    )
}

export default App
