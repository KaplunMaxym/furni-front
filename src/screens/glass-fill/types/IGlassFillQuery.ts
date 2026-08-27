import {IGlassPrice} from "@/screens/glass-fill/types/IGlassPrice";

export interface GlassFillQuery {
    id: number;
    type: string;
    thickness: number | null;
    glassPrices: IGlassPrice[];
}