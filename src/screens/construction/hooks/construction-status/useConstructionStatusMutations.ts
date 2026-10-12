import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { ConstructionStatusService } from "@/services/construction/construction-status/construction-status.service";
import { IConstructionStatusForm } from "@/screens/construction/type/construction-status/IConstructionStatusForm";

/** Список статусів після будь-якої зміни треба перечитати. */
const useInvalidate = () => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: ['all-construction-status'] });
};

/**
 * Помилку показуємо текстом із сервера.
 *
 * Видалення статусу, який комусь призначений, бек відхиляє з поясненням
 * («Статус використовують 4 конструкції…») — мовчазний провал тут виглядав би
 * як зламана кнопка.
 */
const showError = (error: unknown) => {
    const message = (error as AxiosError<{ message?: string }>)?.response?.data?.message;
    toast.error(message || 'Не вдалося виконати дію', { duration: 4000 });
};

export const useConstructionStatusCreateMutation = () => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationKey: ['create-construction-status'],
        mutationFn: (data: IConstructionStatusForm) =>
            ConstructionStatusService.createConstructionStatus(data),
        onSuccess: invalidate,
        onError: showError,
    });
};

export const useConstructionStatusUpdateMutation = () => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationKey: ['update-construction-status'],
        mutationFn: (data: IConstructionStatusForm & { id: number }) =>
            ConstructionStatusService.updateConstructionStatus(data),
        onSuccess: invalidate,
        onError: showError,
    });
};

export const useConstructionStatusDelMutation = () => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationKey: ['delete-construction-status'],
        mutationFn: (data: { id: number }) =>
            ConstructionStatusService.deleteConstructionStatus(data),
        onSuccess: invalidate,
        onError: showError,
    });
};
