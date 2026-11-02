export const RouterEnum = {
    MAIN: '/',
    VERSION: '/version',
    USERS: '/users',
    USER_ROLES: '/user-roles',
    CLIENTS: '/clients',
    CONSTRUCTION: '/construction',
    CONSTRUCTION_STATUS: '/construction-status',
    CONSTRUCTION_EDITOR: '/construction-editor',
    ORDER: '/order',
    ORDER_STATUS: '/order-status',
    PROFILE_MATERIAL: '/profile-material',
    COLOR: '/color',
    CURRENCY_RATE: '/currency-rate',
    PROFILE_ACCESSORY: '/profile-accessory',
    PROFILE_SERVICE: '/profile-service',
    ORDER_DETAILS: '/order/:id',
    PROFILE_SYSTEM: '/profile-system',
    PROFILE_SYSTEM_DETAILS: '/profile-system/:id',
    GLASS_FILL: '/glass-fill',
    INTEGRATION_LOG: '/integration-log',
    CUT_BATCH: '/cut-batch',
    SETTINGS: '/settings'
}

export type RouterEnum = typeof RouterEnum[keyof typeof RouterEnum];