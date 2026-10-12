import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ProfileSystemService } from '@/services/profile-system/profile-system.service';
import { IProfileSystemUpdate } from '@/screens/profile-system/types/profile-system/IProfileSystemUpdate';

/**
 * Оновлення профільної системи зі списку.
 *
 * `useProfileSystemMutations` не підходить: він прив'язаний до одного id ще на
 * етапі виклику хука й інвалідує лише `profile-system-full` — картку, яку зі
 * списку ніхто не відкривав. Тут id приходить у момент збереження, а
 * оновлюються обидва списки, включно з коротким для селектів.
 */
export const useProfileSystemQuickUpdateMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...dto }: IProfileSystemUpdate & { id: number }) =>
            ProfileSystemService.updateProfileSystem(id, dto),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['all-profile-system'] });
            queryClient.invalidateQueries({ queryKey: ['all-profile-system-simple'] });
            queryClient.invalidateQueries({ queryKey: ['profile-system-full', variables.id] });
        },
    });
};
