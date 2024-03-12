/// <amd-module name="@scom/scom-invoice/interface.ts" />
declare module "@scom/scom-invoice/interface.ts" {
    export type sendBillCallback = (data: IInvoice) => void;
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
        billTo: string;
        currency: string;
        dueDate: number;
        billNumber: number;
        items: IItem[];
        total: number;
        status?: Status;
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
}
/// <amd-module name="@scom/scom-invoice/form.tsx" />
declare module "@scom/scom-invoice/form.tsx" {
    import { ControlElement, Module } from '@ijstech/components';
    import { sendBillCallback } from "@scom/scom-invoice/interface.ts";
    interface ScomInvoiceFormElement extends ControlElement {
        onSendBill?: sendBillCallback;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-invoice-form']: ScomInvoiceFormElement;
            }
        }
    }
    export class ScomInvoiceForm extends Module {
        private edtBillTo;
        private comboCurrency;
        private edtDueDate;
        private edtBillNumber;
        private pnlItems;
        private lblTotal;
        private itemControls;
        private itemId;
        onSendBill: sendBillCallback;
        init(): void;
        clear(): void;
        private addItem;
        private removeItem;
        private updateOrderTotal;
        handleSendBillButtonClick(): void;
        render(): any;
    }
}
/// <amd-module name="@scom/scom-invoice/assets.ts" />
declare module "@scom/scom-invoice/assets.ts" {
    function fullPath(path: string): string;
    const _default: {
        fullPath: typeof fullPath;
    };
    export default _default;
}
/// <amd-module name="@scom/scom-invoice/payment.tsx" />
declare module "@scom/scom-invoice/payment.tsx" {
    import { ControlElement, Module } from '@ijstech/components';
    import { IPayment } from "@scom/scom-invoice/interface.ts";
    interface ScomInvoicePaymentElement extends ControlElement {
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-invoice-payment']: ScomInvoicePaymentElement;
            }
        }
    }
    export class ScomInvoicePayment extends Module {
        private lblLink;
        private iconCopy;
        private lblTotalPrice;
        private data;
        setData(data: IPayment): void;
        copyUrl(): void;
        render(): any;
    }
}
/// <amd-module name="@scom/scom-invoice" />
declare module "@scom/scom-invoice" {
    import { ControlElement, Module } from '@ijstech/components';
    import { IBillFrom, sendBillCallback } from "@scom/scom-invoice/interface.ts";
    export { IInvoice } from "@scom/scom-invoice/interface.ts";
    interface ScomInvoiceElement extends ControlElement {
        onSendBill?: sendBillCallback;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-invoice']: ScomInvoiceElement;
            }
        }
    }
    export default class ScomInvoice extends Module {
        private invoiceForm;
        private invoicePayment;
        private pnlInvoice;
        private imgAvatar;
        private lblUserName;
        private lblInternetIdentifier;
        private lblUserPubKey;
        private lblInvoiceNumber;
        private lblBilledTo;
        private lblStatus;
        private lblDueDate;
        private itemTable;
        private lblTotal;
        private pnlButtons;
        private itemColumns;
        private columns;
        private _billFrom;
        private _data;
        onSendBill: sendBillCallback;
        get billFrom(): IBillFrom;
        set billFrom(value: IBillFrom);
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
        private handleSendBill;
        private getStatusColors;
        private viewInvoice;
        private payInvoice;
        render(): any;
    }
}
