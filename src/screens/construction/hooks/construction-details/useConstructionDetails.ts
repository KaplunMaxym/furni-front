import {ConstructionDetailsService} from "@/services/construction/construction-details/construction-details.service";
import {useQuery} from "@tanstack/react-query";
import {ConstructionDetail} from "@/screens/construction/type/construction-details/IConstructionDetail";

/**
 * Деталі конструкції.
 *
 * `enabled` за реальним id — не оптимізація, а виправлення.
 *
 * Модалка деталей змонтована постійно і, поки нічого не вибрано, підставляє
 * `0`. Раніше це просто йшло на сервер і поверталося порожнім списком, тож
 * ніхто не помічав. Відколи вибірки звужуються за клієнтом, конструкції з
 * id 0 не існує ні в кого — і дилер отримував «Конструкцію не знайдено»
 * щоразу, як відкривав сторінку замовлення.
 */
export const useConstructionDetails = (constructionId: number) => {
    return useQuery({
        queryKey: ['construction-details', constructionId],
        queryFn: () => ConstructionDetailsService.getAllConstructionDetails(constructionId)
            .then(data => data.data.data as ConstructionDetail[]),
        enabled: constructionId > 0,
    });
};
