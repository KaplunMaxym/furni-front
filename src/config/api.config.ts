export const SERVER_URL = import.meta.env.VITE_SERVER_URL
export const API_URL = `${SERVER_URL}/api`

// Auth
export const postLoginUrl = () => '/auth/login'
export const postRefreshTokenUrl = () => '/auth/refresh'

// User
export const getUsersUrl = () => '/user/all-user'
export const deleteUser = (id: number) => `/user/delete-user/${id}`
export const createUser = () => '/user/create-user'
export const updateUser = (id: number) => `/user/update-user/${id}`

// User Role
export const getUserRoles = () => '/user/all-user-role'
export const getUserRolesQuery = () => '/user/all-user-role-query'
export const createUserRole = () => '/user/create-user-role'
export const updateUserRole = (id: number) => `/user/update-user-role/${id}`

// Client
export const getClientsUrl = () => '/client/all-client'
export const getClientsSimpleUrl = () => '/client/all-client-simple'
export const deleteClient = (id: number) => `/client/delete-client/${id}`
export const createClient = () => '/client/create-client'
/** Клієнт + вхід до нього однією дією. */
export const createDealer = () => '/client/create-dealer'
export const updateClient = (id: number) => `/client/update-client/${id}`

// Order
export const getOrdersUrl = () => '/order/all-order'
export const getOrdersSimpleUrl = () => '/order/all-order-simple'
export const getOrderDetails = (id: number) => `/order/get-order-details/${id}`
export const createOrder = () => '/order/create-order'
export const updateOrder = (id: number) => `/order/update-order/${id}`
export const deleteOrder = (id: number) => `/order/delete-order/${id}`
export const recalculateOrderCost = (id: number) => `/order/${id}/recalculate-cost`

// Order Status
export const getOrderStatusUrl = () => '/order/all-order-status'
export const getOrderStatusQuery = () => '/order/all-order-status-query'
export const createOrderStatus = () => '/order/create-order-status'
export const updateOrderStatus = (id: number) => `/order/update-order-status/${id}`
export const deleteOrderStatus = (id: number) => `/order/delete-order-status/${id}`

// Glass Fill
export const getGlassFillUrl = () => '/glass-fill/all-glass-fill'
export const getGlassSimpleFillUrl = () => '/glass-fill/all-glass-fill-simple'
export const createGlassFill = () => '/glass-fill/create-glass-fill'
export const updateGlassFill = (id: number) => `/glass-fill/update-glass-fill/${id}`
export const deleteGlassFill = (id: number) => `/glass-fill/delete-glass-fill/${id}`

// Glass Price
export const upsertGlassPrice = () => '/glass-fill/upsert-glass-price'

// Construction
export const getConstruction = () => '/construction/all-construction'
export const getOneConstruction = (id: number) => `/construction/get-construction/${id}`
export const getConstructionByOrder = (orderId: number) => `/construction/get-construction-by-order/${orderId}`
export const createConstruction = () => '/construction/create-construction'
export const updateConstruction = (id: number) => `/construction/update-construction/${id}`
export const deleteConstruction = (id: number) => `/construction/delete-construction/${id}`

// Construction Status
export const getConstructionStatus = () => '/construction/all-construction-status'
export const createConstructionStatus = () => '/construction/create-construction-status'
export const updateConstructionStatus = (id: number) => `/construction/update-construction-status/${id}`
export const deleteConstructionStatus = (id: number) => `/construction/delete-construction-status/${id}`

// Construction Details
export const getConstructionDetails = (constructionId: number) => `/construction/all-construction-details/${constructionId}`
export const updateConstructionDetailComplete = (detailId: number) => `/construction/update-construction-detail-complete/${detailId}`
export const updateConstructionDetailDownload = (detailId: number) => `/construction/update-construction-detail-label-download/${detailId}`
export const updateConstructionDetailOperationComplete = (detailId: number, operationId: number) => `/construction/update-construction-detail-operation-complete/${detailId}/${operationId}`

// Profile System
export const getProfileSystemUrl = () => '/profile-system/all-profile-system-simple'
export const getProfileSystemQueryUrl = () => '/profile-system/all-profile-system'
export const getProfileSystem = (id: number) => `/profile-system/get-profile-system/${id}`
export const updateProfileSystem = (id: number) => `/profile-system/update-profile-system/${id}`

// Profile System Material
export const updateLinkDetailMaterial = (id: number) => `/profile-system/${id}/detail-materials`
export const deleteUnlinkDetailMaterial = (id: number) => `/profile-system/${id}/detail-materials`

// Profile System Accessory
export const updateLinkAccessory = (id: number) => `/profile-system/${id}/accessories`
export const deleteUnlinkAccessory = (id: number) => `/profile-system/${id}/accessories`

// Profile System Operation
export const getProfileSystemOperations = (profileSystemId: number) => `/profile-system/get-operations/${profileSystemId}`
export const getProfileSystemOperation = (id: number) => `/profile-system/get-operation/${id}`
export const updateProfileSystemOperation = (id: number) => `/profile-system/update-operation/${id}`

// Cnc Template
export const getCncTemplates = (profileSystemId: number) => `/profile-system/get-templates/${profileSystemId}`
export const getCncTemplate = (id: number) => `/profile-system/get-template/${id}`
export const updateCncTemplate = (id: number) => `/profile-system/update-template/${id}`

// Profile System Detail
export const getProfileSystemDetails = (profileSystemId: number) => `/profile-system/get-profile-system-details/${profileSystemId}`
export const getProfileSystemDetail = (id: number) => `/profile-system/get-profile-system-detail/${id}`
export const updateProfileSystemDetail = (id: number) => `/profile-system/update-profile-system-detail/${id}`

// Mill Side
export const getMillSide = (profileSystemId: number) => `/profile-system/get-mill-parameters/${profileSystemId}`
export const updateMillSide = (id: number) => `/profile-system/update-mill-parameter/${id}`

// Drill Side
export const getDrillSide = (profileSystemId: number) => `/profile-system/get-drill-side-params/${profileSystemId}`
export const updateDrillSide = (id: number) => `/profile-system/update-drill-side-param/${id}`

// Gcode Program
export const getGcodeProgramUrl = (id: number) => `/gcode-program/get-gcode-for-operation-and-detail/${id}`
export const getGcodeByDetailUrl = (detailId: number) => `/gcode-program/get-gcode-for-detail/${detailId}`

// Profile Service
export const getProfileServiceUrl = () => '/profile-service';
export const getProfileServiceSimpleUrl = () => '/profile-service/simple';
export const createProfileService = () => '/profile-service';
export const updateProfileService = (id: number) => `/profile-service/${id}`;
export const deleteProfileService = (id: number) => `/profile-service/${id}`;

// Profile Material
export const getProfileMaterialUrl = () => '/profile-material';
export const getProfileMaterialSimpleUrl = () => '/profile-material/simple';
export const createProfileMaterialUrl = () => '/profile-material';
export const updateProfileMaterialUrl = (id: number) => `/profile-material/${id}`;
export const deleteProfileMaterialUrl = (id: number) => `/profile-material/${id}`;
export const upsertProfileMaterialPriceUrl = () => '/profile-material/price/upsert';

// Profile Accessory
export const getProfileAccessoryUrl = () => '/profile-accessory';
export const getProfileAccessorySimpleUrl = () => '/profile-accessory/simple';
export const createProfileAccessoryUrl = () => '/profile-accessory';
export const updateProfileAccessoryUrl = (id: number) => `/profile-accessory/${id}`;
export const deleteProfileAccessoryUrl = (id: number) => `/profile-accessory/${id}`;
export const upsertProfileAccessoryPriceUrl = () => '/profile-accessory/price/upsert';

// Currency
export const getCurrencyRateUrl = () => '/currency-rate';
export const getCurrencyRateSimpleUrl = () => '/currency-rate/simple';
export const createCurrencyRateUrl = () => '/currency-rate';
export const updateCurrencyRateUrl = (id: number) => `/currency-rate/${id}`;
export const deleteCurrencyRateUrl = (id: number) => `/currency-rate/${id}`;

// Catalog
export const getColorsSimpleUrl = () => '/catalog/all-colors-simple'
export const getColorsForProfileUrl = () => '/catalog/colors/profile'
export const getColorsForHandleUrl = () => '/catalog/colors/handle'
export const getColorsUrl = () => '/catalog/colors';
export const createColorUrl = () => '/catalog/colors';
export const updateColorUrl = (id: number) => `/catalog/colors/${id}`;
export const deleteColorUrl = (id: number) => `/catalog/colors/${id}`;

// Обмін з 1С
export const integration1CPreviewUrl = (orderId: number) => `/integration-1c/order/${orderId}/preview`;
export const integration1CHistoryUrl = (orderId: number) => `/integration-1c/order/${orderId}/history`;
export const integration1CLogsUrl = () => '/integration-1c/log/all-log';
export const integration1CLogUrl = (id: number) => `/integration-1c/log/get-log/${id}`;
export const cutBatchesUrl = () => '/integration-1c/cut-batch/all-batch';
export const cutBatchUrl = (id: number) => `/integration-1c/cut-batch/get-batch/${id}`;

// Дашборд
export const dashboardOverviewUrl = () => '/dashboard/overview';
export const dashboardAttentionUrl = () => '/dashboard/attention';
