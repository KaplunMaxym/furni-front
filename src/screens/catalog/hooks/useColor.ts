import {useQuery} from "@tanstack/react-query";
import {CatalogService} from "@/services/catalog/catalog.service";
import {IColor} from "@/screens/catalog/types/IColor";

export const useColor = () => {
    return useQuery({
        queryKey: ['all-colors-simple'],
        queryFn: () => CatalogService.getColorSimple()
            .then(data => data.data.data as IColor[])
    })
}

export const useProfileColors = () => {
    return useQuery({
        queryKey: ['profile-colors'],
        queryFn: () => CatalogService.getColorProfileSimple()
            .then(data => data.data.data as IColor[])
    });
};

export const useHandleColors = () => {
    return useQuery({
        queryKey: ['handle-colors'],
        queryFn: () => CatalogService.getColorHandleSimple()
            .then(data => data.data.data as IColor[])
    });
};