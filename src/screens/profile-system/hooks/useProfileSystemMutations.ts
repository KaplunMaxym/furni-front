import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileSystemService } from "@/services/profile-system/profile-system.service";
import { IProfileSystemUpdate } from "@/screens/profile-system/types/profile-system/IProfileSystemUpdate";
import {
    IProfileSystemOperationUpdate, IUpdateDrill, IUpdateMill, IUpdateTemplate
} from "@/screens/profile-system/types/profile-system/IProfileSystemOperationUpdate";

export const useProfileSystemMutations = (profileSystemId: number) => {
    const queryClient = useQueryClient();

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ['profile-system-full', profileSystemId] });

    const updateSystem = useMutation({
        mutationFn: (dto: IProfileSystemUpdate) =>
            ProfileSystemService.updateProfileSystem(profileSystemId, dto),
        onSuccess: invalidate,
        onError: invalidate
    });

    const updateOperation = useMutation({
        mutationFn: ({ id, dto }: { id: number; dto: IProfileSystemOperationUpdate }) =>
            ProfileSystemService.updateOperation(id, dto),
        onSuccess: invalidate,
        onError: invalidate
    });

    const updateDrillSide = useMutation({
        mutationFn: (dto: IUpdateDrill) =>
            ProfileSystemService.updateDrill(profileSystemId, dto),
        onSuccess: invalidate,
        onError: invalidate
    });

    const updateMillSide = useMutation({
        mutationFn: (dto: IUpdateMill) =>
            ProfileSystemService.updateMill(profileSystemId, dto),
        onSuccess: invalidate,
        onError: invalidate
    });

    const updateTemplate = useMutation({
        mutationFn: ({ id, dto }: { id: number; dto: IUpdateTemplate }) =>
            ProfileSystemService.updateTemplate(id, dto),
        onSuccess: invalidate,
        onError: invalidate
    });

    return { updateSystem, updateOperation, updateDrillSide, updateMillSide, updateTemplate };
};