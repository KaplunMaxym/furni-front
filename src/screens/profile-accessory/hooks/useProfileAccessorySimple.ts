import {useQuery} from "@tanstack/react-query";
import {ProfileAccessoryService} from "@/services/profile-accessory/profile-accessory.service";
import {IProfileAccessory} from "@/screens/profile-accessory/types/IProfileAccessory";

export const useProfileAccessorySimple = () => {
    return useQuery({
        queryKey: ['profile-accessory/simple'],
        queryFn: async () => {
            const res = await ProfileAccessoryService.getProfileAccessoriesSimple();
            console.log('response:', res);
            return res.data.data?.profileAccessories as IProfileAccessory[];
        }
    })
}