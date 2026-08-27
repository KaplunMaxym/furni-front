export const RouterEnum = {
    MAIN: '/',
    VERSION: '/version',
    USERS: '/users',
    CLIENTS: '/clients',
    CONSTRUCTION: '/construction',
    CONSTRUCTION_EDITOR: '/construction-editor',
    ORDER: '/order',
    PROFILE_MATERIAL: '/profile-material',
    COLOR: '/color',
    CURRENCY_RATE: '/currency-rate',
    PROFILE_ACCESSORY: '/profile-accessory',
    PROFILE_SERVICE: '/profile-service',
    ORDER_DETAILS: '/order/:id',
    PROFILE_SYSTEM: '/profile-system',
    PROFILE_SYSTEM_DETAILS: '/profile-system/:id',
    GLASS_FILL: '/glass-fill'
}

export type RouterEnum = typeof RouterEnum[keyof typeof RouterEnum];