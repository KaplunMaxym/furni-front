'use client'

import { useSearchParams, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

import ConstructionEditor from "@/screens/construction/features/editor/ConstructionEditor";
import { useConstruction } from "@/screens/construction/hooks/construction/useConstruction";
import { useOrderDetails } from "@/screens/order/hooks/order/useOrderDetails";
import { IConstruction } from "@/screens/construction/type/construction/IConstruction";
import { Button } from "@/ui/shadcn/button";
import Loading from "@/ui/loading/Loading";
import { useAuthStore } from "@/store/auth/authReducer";
import { isDealerRole } from "@/config/RoleEnum";

export default function ConstructionEditorPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { role } = useAuthStore();

    const constructionId = Number(searchParams.get('id') ?? 0);
    const orderId = Number(searchParams.get('orderId') ?? 0);

    const { data: construction, isLoading, error, refetch } = useConstruction(constructionId);
    const { data: orderDetails, isLoading: isLoadingOrderDetails } = useOrderDetails(orderId);

    useEffect(() => {
        refetch();
    }, [constructionId, refetch]);

    /*
     * Тут був `setTimeout` на три секунди перед показом редактора — навіть коли
     * дані вже прийшли. Сцену Three.js він не прискорював: вона все одно
     * будується після монтування. Тобто це були три секунди чекання ні за що.
     */
    if (isLoading || isLoadingOrderDetails) {
        return (
            <div className="flex h-dvh w-full flex-col items-center justify-center gap-3">
                <Loading />
                <p className="text-sm text-muted-foreground">Завантаження редактора…</p>
            </div>
        );
    }

    if (error || !construction || !orderDetails) {
        return (
            <div className="flex h-dvh w-full flex-col items-center justify-center gap-3">
                <p className="text-sm text-destructive-foreground">
                    Не вдалося завантажити конструкцію
                </p>
                <Button type="button" variant="outline" onClick={() => navigate(`/order/${orderId}`)}>
                    <ArrowLeft /> Повернутися до замовлення
                </Button>
            </div>
        );
    }

    const handleRefetch = async (): Promise<IConstruction | null> => {
        const result = await refetch();
        return result.data ?? null;
    };

    return (
        <ConstructionEditor
            construction={construction}
            order={orderDetails}
            onGoBack={() => navigate(`/order/${orderId}`)}
            onRefetch={handleRefetch}
            /*
             * Дилеру та сама сторінка відкривається як перегляд: модель без
             * панелей і позначок, камера з тилу. Окрему сторінку для цього не
             * робимо — сцена, завантаження й обробка помилок ті самі, і два
             * майже однакові екрани довелося б правити парами.
             */
            readOnly={isDealerRole(role)}
        />
    );
}
