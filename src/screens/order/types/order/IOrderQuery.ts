export interface IOrderQuery {
    id: number;
    name: string;
    orderNumber: string;
    createdAt: string;
    clientId: string;
    priceCategory: string;
    client: {
        id: number;
        firstName: string;
        lastName: string;
    };
    statusId: string;
    status: {
        id: number;
        code: string;
        title: string;
    };
}