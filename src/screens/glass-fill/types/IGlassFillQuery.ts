import {IGlassPrice} from "@/screens/glass-fill/types/IGlassPrice";

export interface GlassFillQuery {
    id: number;
    type: string;
    code1C?: string | null;
    thickness: number | null;
    glassPrices: IGlassPrice[];
}