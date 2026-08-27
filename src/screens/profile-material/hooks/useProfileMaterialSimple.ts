import {useQuery} from "@tanstack/react-query";
import {ProfileMaterialService} from "@/services/profile-material/profile-material.service";
import {IProfileMaterial} from "@/screens/profile-material/types/IProfileMaterial";

export const useProfileMaterialSimple = () => {
    return useQuery({
        queryKey: ['profile-service/simple'],
        queryFn: async () => {
            const res = await ProfileMaterialService.getProfileMaterialsSimple();
            console.log('response:', res);
            return res.data.data?.profileMaterials as IProfileMaterial[];
        }
    })
}