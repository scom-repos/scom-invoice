export type PaymentFormatType = 'unified' | 'lightning' | 'bitcoin';
export const enum InvoiceStatus {
    Expired = 'expired',
    Paid = 'paid',
    Unpaid = 'unpaid'
};

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
    status?: InvoiceStatus;
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