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
import { INetwork } from "@ijstech/eth-wallet";
import getNetworkList from '@scom/scom-network-list';
import { IInvoice, modeType, PaymentFormatType, sendBillCallback } from './interface';
import { invoiceCardStyle } from './index.css';
import { decodeInvoice } from './utils';
export { decodeInvoice, IInvoice };

const Theme = Styles.Theme.ThemeVars;

type InvoiceStatus = 'expired' | 'paid' | 'unpaid';
type payInvoiceCallback = (data: IInvoice) => Promise<boolean>;

interface ScomInvoiceElement extends ControlElement {
    onPayInvoice?: payInvoiceCallback;
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
    private pnlInvoice: VStack;
    private lblPaymentFormat: Label;
    private pnlFormat: VStack;
    private lblInvoiceAmount: Label;
    private lblCurrency: Label;
    private lblDescription: Label;
    private btnPay: Button;
    private _data: IInvoice;
    private expiryInterval: any;
    private networkMap: Record<number, INetwork>;
    public onPayInvoice: payInvoiceCallback;

    init() {
        super.init();
    }

    private async setData(value: IInvoice) {
        this._data = value;
        if (value.paymentAddress) {
            this.viewInvoiceByPaymentAddress(value.paymentAddress);
        } else {
            this.viewInvoiceDetail(this._data);
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

    private getNetwork(chainId: number) {
        if (!this.networkMap) {
            const defaultNetworkList: INetwork[] = getNetworkList();
            this.networkMap = defaultNetworkList.reduce((acc, cur) => {
                acc[cur.chainId] = cur;
                return acc;
            }, {});
        }
        return this.networkMap[chainId];
    }

    private viewInvoiceDetail(data: IInvoice) {
        this.pnlInvoice.visible = false;
        const network = this.getNetwork(data.chainId);
        this.lblPaymentFormat.caption = network?.chainName || "";
        this.pnlFormat.clearInnerHTML();
        if (network.image) {
            this.pnlFormat.appendChild(
                <i-hstack horizontalAlignment="end" gap="0.25rem">
                    <i-image width="1rem" height="1rem" url={network.image}></i-image>
                </i-hstack>
            )
        }
        this.lblInvoiceAmount.caption = FormatUtils.formatNumber(data.amount, { decimalFigures: 0 });
        this.lblCurrency.caption = data.token.symbol;
        this.lblDescription.caption = data.comment || '';
        let status: InvoiceStatus = 'unpaid';
        this.updateInvoiceStatus(status);
        this.btnPay.tag = { ...data, status };
        this.pnlInvoice.visible = true;
    }

    private extractPaymentAddress(address: string) {
        let format: PaymentFormatType;
        if (/^(lnbc|lntb|lnbcrt|lnsb|lntbs)([0-9]+(m|u|n|p))?1\S+/gm.test(address)) {
            format = 'lightning';
            const data = decodeInvoice(address);
            const expiry = data.tags?.find(tag => tag.name === 'expire_time')?.value;
            const description = data.tags?.find(tag => tag.name === 'description')?.value;
            return { ...data, format, expiry, description };
        }
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
                <i-icon width="1.5rem" height="1.5rem" name={name}></i-icon>
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
        let status: InvoiceStatus;
        if (data.timestamp != null && data.expiry != null) {
            let expiryDate = new Date((data.timestamp + data.expiry) * 1000);
            if (Date.now() >= expiryDate.getTime()) {
                status = 'expired';
                this.updateInvoiceStatus(status);
                this.btnPay.tag = { ...data, status };
                return;
            }
        }
        status = 'paid';
        if (this.onPayInvoice) {
            let success = await this.onPayInvoice(this._data);
            if (!success) status = 'unpaid';
        }
        this.updateInvoiceStatus(status);
        this.btnPay.tag = { ...data, status };
    }

    render() {
        return (
            <i-panel width="100%" height="100%">
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