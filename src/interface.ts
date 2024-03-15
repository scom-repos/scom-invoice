export type sendBillCallback = (data: IInvoice) => void;
export type modeType = 'create' | 'view';
export type PaymentFormatType = 'unified' | 'lightning' | 'bitcoin';

export enum Status {
    Unpaid = "UNPAID",
    Paid = "PAID"
}

export interface IBillFrom {
    avatar?: string;
    username: string;
    npub: string;
    internetIdentifier?: string;
}

export interface IInvoice {
    billFrom?: IBillFrom;
    billTo?: string;
    currency?: string;
    dueDate?: number;
    billNumber?: number;
    items?: IItem[];
    total?: number;
    status?: Status;
}

export interface IInvoiceData extends IInvoice {
    paymentAddress?: string;
    mode?: modeType;
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