import {useQuery} from "@tanstack/react-query";
import {ConstructionService} from "@/services/construction/construction/construction.service";
import {IConstruction} from "@/screens/construction/type/construction/IConstruction";

export const useConstructionByOrder = (orderId: number) => {
    return useQuery({
        queryKey: ['get-construction-by-order', orderId],
        queryFn: () => ConstructionService.getConstructionByOrder(orderId)
            .then(data => data.data.data as IConstruction[]),
        /*
         * Поки замовлення не обране, запиту немає.
         *
         * Форма створення конструкції відкривається і без замовлення — його
         * там ще тільки обирають, — і без цієї умови хук щоразу ходив би за
         * конструкціями замовлення з номером 0.
         */
        enabled: orderId > 0,
    })
}