import {FC, PropsWithChildren} from "react";
import ToastifyProvider from "@/providers/ToastifyProvider";
import ReactQueryProvider from "./ReactQueryProvider";
import HeaderProvider from "./HeaderProvider";

const Providers: FC<PropsWithChildren> = ({children}) => {
    return (
        <ToastifyProvider>
            <ReactQueryProvider>
                <HeaderProvider>
                    {children}
                </HeaderProvider>
            </ReactQueryProvider>
        </ToastifyProvider>
    );
};

export default Providers;
