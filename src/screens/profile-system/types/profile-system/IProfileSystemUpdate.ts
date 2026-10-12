export type IProfileSystemUpdate = Partial<{
    title: string;
    code1C: string;
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    /**
     * Корекція довжини деталі з кожного боку, мм.
     *
     * Окреме поле, хоч у базі воно лежить у `defaultParameters`: бек вписує
     * його туди сам, лишаючи решту ключів (зазори скла й інше) недоторканими.
     * `null` — прибрати корекцію.
     */
    lengthCorrection: number | null;
}>;