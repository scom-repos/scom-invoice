/// <amd-module name="@scom/scom-invoice/interface.ts" />
declare module "@scom/scom-invoice/interface.ts" {
    export type PaymentFormatType = 'unified' | 'lightning' | 'bitcoin';
    export const enum InvoiceStatus {
        Expired = "expired",
        Paid = "paid",
        Unpaid = "unpaid"
    }
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
}
/// <amd-module name="@scom/scom-invoice/index.css.ts" />
declare module "@scom/scom-invoice/index.css.ts" {
    export const formStyle: string;
    export const imageStyle: string;
    export const tableStyle: string;
    export const invoiceCardStyle: string;
}
/// <amd-module name="@scom/scom-invoice/utils/bech32.ts" />
declare module "@scom/scom-invoice/utils/bech32.ts" {
    function toWords(bytes: ArrayLike<number>): number[];
    function fromWordsUnsafe(words: ArrayLike<number>): number[] | undefined;
    function fromWords(words: ArrayLike<number>): number[];
    export const bech32: BechLib;
    export const bech32m: BechLib;
    export interface Decoded {
        prefix: string;
        words: number[];
    }
    export interface BechLib {
        decodeUnsafe: (str: string, LIMIT?: number | undefined) => Decoded | undefined;
        decode: (str: string, LIMIT?: number | undefined) => Decoded;
        encode: (prefix: string, words: ArrayLike<number>, LIMIT?: number | undefined) => string;
        toWords: typeof toWords;
        fromWordsUnsafe: typeof fromWordsUnsafe;
        fromWords: typeof fromWords;
    }
}
/// <amd-module name="@scom/scom-invoice/utils/decoder.ts" />
declare module "@scom/scom-invoice/utils/decoder.ts" {
    export function decode(invoice: string): {
        coinType: string;
        satoshis: number;
        millisatoshis: number;
        signature: string;
        timestamp: number;
        tags: any[];
        signingData: string;
    };
}
/// <amd-module name="@scom/scom-invoice/utils/index.ts" />
declare module "@scom/scom-invoice/utils/index.ts" {
    export { decode as decodeInvoice } from "@scom/scom-invoice/utils/decoder.ts";
}
/// <amd-module name="@scom/scom-invoice" />
declare module "@scom/scom-invoice" {
    import { ControlElement, Module } from '@ijstech/components';
    import { IInvoice, InvoiceStatus } from "@scom/scom-invoice/interface.ts";
    import { decodeInvoice } from "@scom/scom-invoice/utils/index.ts";
    export { decodeInvoice, IInvoice, InvoiceStatus };
    type payInvoiceCallback = (data: IInvoice) => Promise<boolean>;
    interface ScomInvoiceElement extends ControlElement {
        onPayInvoice?: payInvoiceCallback;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-invoice']: ScomInvoiceElement;
            }
        }
    }
    export default class ScomInvoice extends Module {
        private pnlInvoice;
        private lblPaymentFormat;
        private pnlFormat;
        private lblRecipient;
        private lblInvoiceAmount;
        private lblCurrency;
        private lblDescription;
        private btnPay;
        private _data;
        private expiryInterval;
        private networkMap;
        tag: any;
        onPayInvoice: payInvoiceCallback;
        init(): void;
        get isPaid(): boolean;
        set isPaid(value: boolean);
        private setData;
        private getData;
        getConfigurators(): {
            name: string;
            target: string;
            getActions: () => any[];
            getData: any;
            setData: any;
            getTag: any;
            setTag: any;
        }[];
        private _getActions;
        private getTag;
        private setTag;
        private updateTag;
        private updateStyle;
        private updateTheme;
        private getNetwork;
        private viewInvoiceDetail;
        private extractPaymentAddress;
        private renderPaymentFormatIcons;
        private updateInvoiceStatus;
        private viewInvoiceByPaymentAddress;
        private payInvoice;
        render(): any;
    }
}
