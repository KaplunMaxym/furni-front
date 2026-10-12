import {FC, PropsWithChildren} from "react";
import {Toaster} from "sonner";
import {useThemeStore} from "@/store/theme/useThemeStore";

/**
 * Повідомлення застосунку.
 *
 * Перенесено з проєкту dashboard разом із бібліотекою: `react-hot-toast`
 * не має власного оформлення, і кольори доводилось задавати вручну —
 * `#2ecc71`, `#ff1616`, `#f0ad4e` inline у кожному місці. На темній темі
 * це були три яскраві плями з чужої палітри, до того ж без іконок і без
 * розрізнення заголовка й пояснення.
 *
 * `richColors` дає готові стани (успіх, помилка, попередження) у темній
 * темі; тон і форма ті самі, що в dashboard, тож повідомлення виглядають
 * як частина інтерфейсу, а не як накладка.
 */
const ToastifyProvider: FC<PropsWithChildren> = ({children}) => {
    // Тост малюється в порталі поверх сторінки — у чужій темі він виглядав би
    // як вирізаний з іншого застосунку
    const theme = useThemeStore(state => state.theme);

    return (
        <>
            <Toaster theme={theme} position="top-right" richColors />
            {children}
        </>
    );
};

export default ToastifyProvider;
