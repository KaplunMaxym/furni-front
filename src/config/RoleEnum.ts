export const RoleEnum = {
    ROOT_ADMIN: 'ROOT_ADMIN',
    STRUCTURAL_ENGINEER: 'STRUCTURAL_ENGINEER',
    /**
     * Дилер — клієнт із власним входом.
     *
     * Бачить лише головну, свої замовлення й свої конструкції. Решта розділів
     * для нього не існує: ні в меню, ні в маршрутах, ні на боці сервера.
     * Ховати пункти в інтерфейсі — половина справи, тому те саме обмеження
     * стоїть у гварді на беку; тут воно лише для того, щоб дилер не бачив
     * дверей, у які все одно не пустять.
     */
    DEALER: 'DEALER',
}

export type RoleEnum = typeof RoleEnum[keyof typeof RoleEnum];

/** Чи це дилер — питається на кожній сторінці, тож винесено сюди. */
export const isDealerRole = (role?: string | null): boolean => role === RoleEnum.DEALER;
