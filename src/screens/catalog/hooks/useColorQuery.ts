import { useQuery } from '@tanstack/react-query';
import { IPagination } from '@/types/IPagination';
import { useColorFilterStore } from '@/store/color/useColorFilter';
import {IColor} from "@/screens/catalog/types/IColor";
import {CatalogService} from "@/services/catalog/catalog.service";

export const useColorQuery = () => {
    const useColorFilter = () => {
        const { page, limit } = useColorFilterStore();
        return { page, limit };
    };
    const filterParams = useColorFilter();
    return useQuery({
        queryKey: ['all-colors', filterParams],
        queryFn: () =>
            CatalogService.getColors(filterParams).then(
                data => data.data.data as { meta: IPagination; colors: IColor[] }
            ),
    });
};