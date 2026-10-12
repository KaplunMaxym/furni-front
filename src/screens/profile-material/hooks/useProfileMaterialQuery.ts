import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { IPagination } from '@/types/IPagination';
import { IProfileMaterial } from '@/screens/profile-material/types/IProfileMaterial';
import { ProfileMaterialService } from '@/services/profile-material/profile-material.service';
import { useProfileMaterialFilterStore } from '@/store/profile-material/useProfileMaterialFilter';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export const useProfileMaterialQuery = () => {
    const { page, limit, search, colorId, profileSystemId, sortBy, sortOrder} = useProfileMaterialFilterStore();

    // Селекти застосовуються одразу, а текст — із затримкою: на кожну літеру
    // окремий запит не потрібен.
    const debouncedSearch = useDebouncedValue(search);

    const filterParams = {
        sortBy,
        sortOrder,
        page,
        limit,
        // Бек із forbidNonWhitelisted не проти зайвих undefined (axios їх не
        // відправляє), але порожній рядок він би прийняв як фільтр.
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
        ...(colorId !== null && { colorId }),
        ...(profileSystemId !== null && { profileSystemId }),
    };

    return useQuery({
        queryKey: ['all-profile-material', filterParams],
        queryFn: () =>
            ProfileMaterialService.getProfileMaterials(filterParams).then(
                data => data.data.data as { meta: IPagination; profileMaterials: IProfileMaterial[] }
            ),
        // Поки їде наступна сторінка чи новий фільтр, таблиця показує попередній
        // результат замість того, щоб блимати порожнечею.
        placeholderData: keepPreviousData,
    });
};
