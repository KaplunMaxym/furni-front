import React from "react";
import { RefreshCw } from 'lucide-react';

import { cn } from "@/helpers/cn";
import { Button } from "@/ui/shadcn/button";
import { useOrderRecalculateMutation } from "@/screens/order/hooks/order/useOrderRecalculateMutation";

interface RecalculateButtonProps {
    orderId: number;
}

/**
 * Перерахунок вартості замовлення.
 *
 * Кнопка стрибала: старий спільний `Button` під час запиту стискав себе до
 * `w-[58px]` і ховав напис, підставляючи спінер. Кнопка з двох слів на мить
 * ставала квадратиком, а сусідні — з'їжджали ліворуч.
 *
 * Тому тут кнопка з набору dashboard — та сама, що «Роздрукувати» в модалці
 * деталі, — а стан очікування показує іконка, що обертається. Напис не
 * змінюється, тож ширина лишається тією ж від початку й до кінця запиту.
 */
const RecalculateButton: React.FC<RecalculateButtonProps> = ({ orderId }) => {
    const { mutate, isPending } = useOrderRecalculateMutation(orderId);

    return (
        <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => mutate()}
        >
            <RefreshCw className={cn(isPending && 'animate-spin')} />
            Перерахувати вартість
        </Button>
    );
};

export default RecalculateButton;
