import { useQuery } from '@tanstack/react-query';
import { IPagination } from '@/types/IPagination';
import { IProfileMaterial } from '@/screens/profile-material/types/IProfileMaterial';
import { ProfileMaterialService } from '@/services/profile-material/profile-material.service';
import { useProfileMaterialFilterStore } from '@/store/profile-material/useProfileMaterialFilter';

export const useProfileMaterialQuery = () => {
    const useFilter = () => {
        const { page, limit } = useProfileMaterialFilterStore();
        return { page, limit };
    };
    const filterParams = useFilter();
    return useQuery({
        queryKey: ['all-profile-material', filterParams],
        queryFn: () =>
            ProfileMaterialService.getProfileMaterials(filterParams).then(
                data => data.data.data as { meta: IPagination; profileMaterials: IProfileMaterial[] }
            ),
    });
};