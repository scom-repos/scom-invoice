export type sendBillCallback = (data: IInvoice) => void;
export type modeType = 'create' | 'view';
export type PaymentFormatType = 'unified' | 'lightning' | 'bitcoin';

interface ITokenObject {
    address?: string;
    name: string;
    decimals: number;
    symbol: string;
}

export interface IInvoice {
    chainId?: number;
    to?: string;
    amount?: number;
    comment?: string;
    token?: ITokenObject;
    paymentAddress?: string;
}
export interface IItem {
    name: string;
    price: number;
    quantity: number;
}

export interface IPayment {
    url: string;
    total: number;
    currency: string;
}