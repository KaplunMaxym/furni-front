export interface IClientForm {
    firstName: string;
    lastName: string;
    middleName?: string;
    email?: string;
    phone?: string;
    code1C?: string;
    /**
     * Цінова категорія — з неї підставляється категорія в замовлення клієнта.
     *
     * `null` при оновленні означає «прибрати категорію»: `undefined` зник би
     * у JSON, і старе значення лишилось би в базі.
     */
    priceCategory?: string | null;
}