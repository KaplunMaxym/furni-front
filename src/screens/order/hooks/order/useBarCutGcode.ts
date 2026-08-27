import { useMutation } from '@tanstack/react-query';
import instance from "@/services/api/interceptors.api";

type BarCutPiece = { detailId: number; offset: number };

export const useBarCutGcode = () => {
    return useMutation({
        mutationFn: async (pieces: BarCutPiece[]): Promise<{ code: string; fileName: string }> => {
            const response = await instance.post('/gcode-program/bar-cut-gcode', { pieces });
            return response.data.data;
        },
    });
};