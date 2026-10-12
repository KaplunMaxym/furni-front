export interface IClientsQuery {
    id: number;
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    phone: string;
    code1C: string | null;

    /** Цінова категорія клієнта — джерело категорії для його замовлень. */
    priceCategory?: string;

    /**
     * Вхід у систему, якщо він у клієнта є. Наявність цього поля й означає,
     * що клієнт — дилер; окремої ознаки навмисно немає, вона могла б
     * розійтися з дійсністю.
     */
    user?: { id: number; email: string } | null;
}