import {
    Button,
    ControlElement,
    customElements,
    FormatUtils,
    HStack,
    Label,
    Module,
    Styles,
    VStack,
} from '@ijstech/components';
import { IBillFrom, IInvoice, IInvoiceData, modeType, PaymentFormatType, sendBillCallback } from './interface';
import { ScomInvoiceForm } from './form';
import { ScomInvoiceDetail } from './detail';
import { ScomInvoicePayment } from './payment';
import { invoiceCardStyle } from './index.css';
import { decodeInvoice } from './utils';
export { decodeInvoice, IInvoice, IInvoiceData };

const Theme = Styles.Theme.ThemeVars;

type InvoiceStatus = 'expired' | 'paid' | 'unpaid';
type payInvoiceCallback = (paymentAddress: string) => Promise<void>;

interface ScomInvoiceElement extends ControlElement {
    onSendBill?: sendBillCallback;
    onPayInvoice?: payInvoiceCallback;
    mode?: modeType;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-invoice']: ScomInvoiceElement;
        }
    }
}

@customElements('i-scom-invoice')
export default class ScomInvoice extends Module {
    private invoiceForm: ScomInvoiceForm;
    private invoicePayment: ScomInvoicePayment;
    private invoiceDetail: ScomInvoiceDetail;
    private pnlInvoice: VStack;
    private lblPaymentFormat: Label;
    private pnlFormat: VStack;
    private lblInvoiceAmount: Label;
    private lblCurrency: Label;
    private lblDescription: Label;
    private btnPay: Button;
    private _billFrom: IBillFrom;
    private _data: IInvoiceData;
    private mode: modeType = 'view';
    private expiryInterval: any;
    public onSendBill: sendBillCallback;
    public onPayInvoice: payInvoiceCallback;

    get billFrom() {
        return this._billFrom;
    }

    set billFrom(value: IBillFrom) {
        this._billFrom = value;
    }

    init() {
        super.init();
        const mode = this.getAttribute('mode', true);
        this.setData({ mode });
    }

    private async setData(value: IInvoiceData) {
        this._data = value;
        this.mode = value.mode || 'view';
        if (this.mode === 'create') {
            this.invoiceDetail.visible = false;
            this.invoicePayment.visible = false;
            this.pnlInvoice.visible = false;
            this.invoiceForm.visible = true;
        } else {
            if (value.paymentAddress) {
                this.viewInvoiceByPaymentAddress(value.paymentAddress);
            } else if (value.billTo && value.dueDate) {
                this.viewInvoiceDetail(this._data);
            }
        }
    }

    private getData() {
        return this._data;
    }

    getConfigurators() {
        return [
            {
                name: 'Builder Configurator',
                target: 'Builders',
                getActions: () => {
                    return this._getActions();
                },
                getData: this.getData.bind(this),
                setData: this.setData.bind(this),
                getTag: this.getTag.bind(this),
                setTag: this.setTag.bind(this)
            }
        ]
    }

    private _getActions() {
        return [];
    }

    private getTag() {
        return this.tag;
    }

    private setTag(value: any) {
        const newValue = value || {};
        for (let prop in newValue) {
            if (newValue.hasOwnProperty(prop)) {
                if (prop === 'light' || prop === 'dark')
                    this.updateTag(prop, newValue[prop]);
                else
                    this.tag[prop] = newValue[prop];
            }
        }
        this.updateTheme();
    }

    private updateTag(type: 'light' | 'dark', value: any) {
        this.tag[type] = this.tag[type] ?? {};
        for (let prop in value) {
            if (value.hasOwnProperty(prop))
                this.tag[type][prop] = value[prop];
        }
    }

    private updateStyle(name: string, value: any) {
        value ?
            this.style.setProperty(name, value) :
            this.style.removeProperty(name);
    }

    private updateTheme() {
        const themeVar = document.body.style.getPropertyValue('--theme') || 'light';
        this.updateStyle('--text-primary', this.tag[themeVar]?.fontColor);
        this.updateStyle('--text-secondary', this.tag[themeVar]?.secondaryColor);
        this.updateStyle('--background-main', this.tag[themeVar]?.backgroundColor);
        this.updateStyle('--colors-primary-main', this.tag[themeVar]?.primaryColor);
        this.updateStyle('--colors-primary-light', this.tag[themeVar]?.primaryLightColor);
        this.updateStyle('--colors-primary-dark', this.tag[themeVar]?.primaryDarkColor);
        this.updateStyle('--colors-secondary-light', this.tag[themeVar]?.secondaryLight);
        this.updateStyle('--colors-secondary-main', this.tag[themeVar]?.secondaryMain);
        this.updateStyle('--divider', this.tag[themeVar]?.borderColor);
        this.updateStyle('--action-selected', this.tag[themeVar]?.selected);
        this.updateStyle('--action-selected_background', this.tag[themeVar]?.selectedBackground);
        this.updateStyle('--action-hover_background', this.tag[themeVar]?.hoverBackground);
        this.updateStyle('--action-hover', this.tag[themeVar]?.hover);
    }

    private handleSendBill(data: IInvoice) {
        data.billFrom = this.billFrom;
        if (this.onSendBill) this.onSendBill(data);
    }

    private viewInvoiceDetail(data: IInvoice) {
        this.invoiceForm.visible = false;
        this.invoicePayment.visible = false;
        this.pnlInvoice.visible = false;
        this.invoiceDetail.setData(data);
        this.invoiceDetail.visible = true;
    }

    private showInvoicePayment(data: IInvoice) {
        this.invoiceForm.visible = false;
        this.invoiceDetail.visible = false;
        this.pnlInvoice.visible = false;
        this.invoicePayment.setData({
            url: 'https://example.payment.com/i/MygmZUVXnIbs3UbSQJc7PG',
            currency: data.currency,
            total: data.total
        });
        this.invoicePayment.visible = true;
    }

    private extractPaymentAddress(address: string) {
        let format: PaymentFormatType;
        if (/^(lnbc|lntb|lnbcrt|lnsb|lntbs)([0-9]+(m|u|n|p))?1\S+/gm.test(address)) {
            format = 'lightning';
            const data = decodeInvoice(address);
            const expiry = data.tags?.find(tag => tag.name === 'expire_time')?.value;
            const description = data.tags?.find(tag => tag.name === 'description')?.value;
            return { ...data, format, expiry, description };
        } else if (address.startsWith('bc1')) {
            format = 'bitcoin';
        } else {
            format = 'unified'
        }
        return {
            format,
            satoshis: 12345,
            timestamp: Math.round(Date.now() / 1000),
            expiry: 119,
            description: 'sats for test@scom.com'
        };
    }

    private renderPaymentFormatIcons(format: PaymentFormatType) {
        this.pnlFormat.clearInnerHTML();
        const icons = [];
        if (format !== 'lightning') {
            icons.push('link');
        }
        if (format !== 'bitcoin') {
            icons.push('bolt');
        }
        const pnlIcons: HStack = (<i-hstack horizontalAlignment="end" gap="0.25rem"></i-hstack>);
        this.pnlFormat.appendChild(pnlIcons);
        for (const name of icons) {
            pnlIcons.appendChild(
                <i-icon width="1rem" height="1rem" name={name}></i-icon>
            )
        }
    }

    private updateInvoiceStatus(status: InvoiceStatus) {
        if (status === 'expired') {
            this.btnPay.caption = "Expired";
            this.btnPay.enabled = false;
            this.pnlInvoice.enabled = false;
        } else {
            if (status === 'paid') {
                this.btnPay.caption = "Paid";
                this.btnPay.enabled = false;
            } else {
                this.btnPay.caption = "Pay";
                this.btnPay.enabled = true;
            }
            this.pnlInvoice.enabled = true;
        }
    }

    private viewInvoiceByPaymentAddress(address: string) {
        if (this.expiryInterval) clearInterval(this.expiryInterval);
        this.invoiceDetail.visible = false;
        this.invoicePayment.visible = false;
        this.pnlInvoice.visible = false;
        const data = this.extractPaymentAddress(address);
        this.lblPaymentFormat.caption = data.format === 'lightning' ? 'Lightning Invoice' : data.format === 'bitcoin' ? 'On-chain' : 'Unified';
        this.renderPaymentFormatIcons(data.format);
        this.lblInvoiceAmount.caption = FormatUtils.formatNumber(data.satoshis, { decimalFigures: 0 });
        this.lblCurrency.caption = 'Sats';
        this.lblDescription.caption = data.description || '';
        let expiryDate = new Date((data.timestamp + data.expiry) * 1000);
        let status: InvoiceStatus = 'unpaid';
        if (Date.now() < expiryDate.getTime()) {
            this.expiryInterval = setInterval(() => {
                if (Date.now() >= expiryDate.getTime()) {
                    clearInterval(this.expiryInterval);
                    status = 'expired';
                    this.updateInvoiceStatus(status);
                    this.btnPay.tag = { ...data, status };
                }
            }, 30000);
        } else {
            status = 'expired';
        }
        this.updateInvoiceStatus(status);
        this.btnPay.tag = { ...data, status };
        this.pnlInvoice.visible = true;
    }
    
    private async payInvoice() {
        const data = this.btnPay.tag;
        if (data.status !== 'unpaid') return;
        if (this.expiryInterval) clearInterval(this.expiryInterval);
        let expiryDate = new Date((data.timestamp + data.expiry) * 1000);
        let status: InvoiceStatus;
        if (Date.now() >= expiryDate.getTime()) {
            status = 'expired';
            this.updateInvoiceStatus(status);
            this.btnPay.tag = { ...data, status };
        } else {
            status = 'paid';
            if (this.onPayInvoice) {
                await this.onPayInvoice(this._data.paymentAddress);
            }
            this.updateInvoiceStatus(status);
            this.btnPay.tag = { ...data, status };
        }
    }

    render() {
        return (
            <i-panel width="100%" height="100%">
                <i-scom-invoice-form id="invoiceForm" visible={false} onSendBill={this.handleSendBill}></i-scom-invoice-form>
                <i-scom-invoice-detail id="invoiceDetail" visible={false} onPayInvoice={this.showInvoicePayment}></i-scom-invoice-detail>
                <i-scom-invoice-payment id="invoicePayment" visible={false}></i-scom-invoice-payment>
                <i-vstack
                    id="pnlInvoice"
                    class={invoiceCardStyle}
                    padding={{ top: '1.5rem', bottom: '1.5rem', left: '1.5rem', right: '1.5rem' }}
                    border={{ radius: '1rem' }}
                    gap="1rem"
                    visible={false}
                >
                    <i-hstack horizontalAlignment="space-between" verticalAlignment="center" lineHeight="1.125rem" gap="0.75rem">
                        <i-label id="lblPaymentFormat" font={{ size: '1rem' }}></i-label>
                        <i-vstack id="pnlFormat" gap="0.25rem"></i-vstack>
                    </i-hstack>
                    <i-hstack verticalAlignment="end" margin={{ top: '2.25rem', bottom: '1.25rem' }} lineHeight="2.75rem" gap="0.75rem">
                        <i-label id="lblInvoiceAmount" font={{ size: '2.25rem' }}></i-label>
                        <i-label id="lblCurrency" font={{ size: '1.25rem', transform: 'capitalize' }} ></i-label>
                    </i-hstack>
                    <i-label id="lblDescription" font={{ size: '1rem' }} lineHeight="1.25rem" lineClamp={2}></i-label>
                    <i-button
                        id="btnPay"
                        caption="Pay"
                        width="100%"
                        border={{ radius: '0.5rem' }}
                        boxShadow='none'
                        padding={{ top: '0.75rem', bottom: '0.75rem' }}
                        font={{ size: '1.125rem', weight: 600 }}
                        onClick={this.payInvoice}
                    ></i-button>
                </i-vstack>
            </i-panel>
        )
    }
}