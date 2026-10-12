export interface IClient {
    id: number;
    firstName: string;
    lastName: string;
    middleName?: string;
    email?: string;
    phone?: string;
    /** Код контрагента в 1С. Рядок із ведучими нулями. */
    code1C?: string | null;

    /**
     * Цінова категорія клієнта — з неї підставляється категорія в його
     * замовлення. Дилеру не показується ніде: сервер її йому й не віддає.
     */
    priceCategory?: string;

    /**
     * Вхід у систему, якщо він у клієнта є. Наявність цього поля й означає,
     * що клієнт — дилер: окремої ознаки «isDealer» немає навмисно, інакше
     * вона могла б розійтися з дійсністю.
     */
    user?: { id: number; email: string } | null;
}