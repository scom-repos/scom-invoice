import {
    Button,
    ControlElement,
    customElements,
    FormatUtils,
    HStack,
    Icon,
    Image,
    Label,
    Module,
    Styles,
    VStack,
} from '@ijstech/components';
import { INetwork } from "@ijstech/eth-wallet";
import getNetworkList from '@scom/scom-network-list';
import { IInvoice, InvoiceStatus, PaymentFormatType } from './interface';
import { invoiceCardStyle } from './index.css';
import { decodeInvoice } from './utils';
export { decodeInvoice, IInvoice, InvoiceStatus };

const Theme = Styles.Theme.ThemeVars;

type payInvoiceCallback = (data: IInvoice) => Promise<{ success: boolean; tx?: string }>;

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
    private imgNetwork: Image;
    private iconNetwork: Icon;
    private lblRecipient: Label;
    private lblInvoiceAmount: Label;
    private lblCurrency: Label;
    private lblDescription: Label;
    private lblTransaction: Label;
    private btnPay: Button;
    private _data: IInvoice;
    private expiryInterval: any;
    private networkMap: Record<number, INetwork>;
    tag: any = {
      light: {},
      dark: {}
    }
    public onPayInvoice: payInvoiceCallback;

    init() {
        super.init();
    }

    get isPaid() {
        return this.btnPay.tag?.status === InvoiceStatus.Paid;
    }

    set isPaid(value: boolean) {
        let status: InvoiceStatus;
        if (value) {
            status = InvoiceStatus.Paid;
            this.updateInvoiceStatus(status);
            this.btnPay.tag.status = status;
            if (this.expiryInterval) clearInterval(this.expiryInterval);
        }
    }

    get tx() {
        return this._data.tx;
    }

    set tx(value: string) {
        this._data.tx = value;
        if (this._data.chainId && value) {
            this.lblTransaction.link.href = this.getExplorerUrlByTransactionId(this._data.chainId, value);
            this.lblTransaction.visible = true;
        } else {
            this.lblTransaction.visible = false;
        }
    }

    private async setData(value: IInvoice) {
        this._data = value;
        if (value.chainId) {
            this.viewInvoiceDetail(this._data);
        } else {
            this.viewInvoiceByPaymentAddress(value.paymentAddress);
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

    private getExplorerUrlByTransactionId(chainId: number, tx: string) {
        let url = "";
        const network = this.getNetwork(chainId);
        const explorerUrl = network.blockExplorerUrls && network.blockExplorerUrls.length ? network.blockExplorerUrls[0] : "";
        const explorerTxUrl = explorerUrl ? `${explorerUrl}${explorerUrl.endsWith("/") ? "" : "/"}tx/` : "";
        if (network && explorerTxUrl) {
            url = `${explorerTxUrl}${tx}`;
        }
        return url;
    }

    private viewInvoiceDetail(data: IInvoice) {
        this.pnlInvoice.visible = false;
        this.lblRecipient.visible = !!data.to;
        const network = this.getNetwork(data.chainId);
        this.lblPaymentFormat.caption = network?.chainName || "";
        if (data.to) this.lblRecipient.caption = `To ${data.to}`;
        if (network.image) {
            this.imgNetwork.url = network.image;
        }
        this.imgNetwork.visible = !!network.image;
        this.iconNetwork.visible = false;
        this.lblInvoiceAmount.caption = FormatUtils.formatNumber(data.amount, { decimalFigures: 6, hasTrailingZero: false });
        this.lblCurrency.caption = data.token.symbol;
        this.lblDescription.caption = data.comment || '';
        this.lblDescription.visible = !!data.comment;
        if (data.tx) {
            this.lblTransaction.link.href = this.getExplorerUrlByTransactionId(data.chainId, data.tx);
            this.lblTransaction.visible = true;
        } else {
            this.lblTransaction.visible = false;
        }
        let status: InvoiceStatus = data.status || InvoiceStatus.Unpaid;
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

    private updateInvoiceStatus(status: InvoiceStatus) {
        let text;
        if (status === InvoiceStatus.Expired) {
            text = "Expired";
        } else if (status === InvoiceStatus.Paid) {
            text = "Paid";
        } else {
            text = "Pay";
        }
        this.btnPay.caption = text;
        this.btnPay.enabled = status === InvoiceStatus.Unpaid;
        this.pnlInvoice.enabled = status !== InvoiceStatus.Expired;
    }

    private viewInvoiceByPaymentAddress(address: string) {
        if (this.expiryInterval) clearInterval(this.expiryInterval);
        this.pnlInvoice.visible = false;
        this.lblRecipient.visible = false;
        this.lblTransaction.visible = false;
        const data = this.extractPaymentAddress(address);
        this.lblPaymentFormat.caption = 'Lightning Invoice';
        this.iconNetwork.name = 'bolt';
        this.iconNetwork.visible = true;
        this.imgNetwork.visible = false;
        this.lblInvoiceAmount.caption = FormatUtils.formatNumber(data.satoshis, { decimalFigures: 0 });
        this.lblCurrency.caption = 'Sats';
        this.lblDescription.caption = data.description || '';
        this.lblDescription.visible = !!data.description;
        let expiryDate = new Date((data.timestamp + data.expiry) * 1000);
        let status: InvoiceStatus = this._data.status || InvoiceStatus.Unpaid;
        if (status === 'unpaid') {
            if (Date.now() < expiryDate.getTime()) {
                this.expiryInterval = setInterval(() => {
                    if (Date.now() >= expiryDate.getTime()) {
                        clearInterval(this.expiryInterval);
                        status = InvoiceStatus.Expired;
                        this.updateInvoiceStatus(status);
                        this.btnPay.tag = { ...data, status };
                    }
                }, 30000);
            } else {
                status = InvoiceStatus.Expired;
            }
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
                status = InvoiceStatus.Expired;
                this.updateInvoiceStatus(status);
                this.btnPay.tag = { ...data, status };
                return;
            }
        }
        status = InvoiceStatus.Paid;
        if (this.onPayInvoice) {
            this.btnPay.rightIcon.spin = true;
            this.btnPay.rightIcon.visible = true;
            let result = await this.onPayInvoice(this._data);
            if (!result.success) status = InvoiceStatus.Unpaid;
            if (result.tx) this.tx = result.tx;
            this.btnPay.rightIcon.spin = false;
            this.btnPay.rightIcon.visible = false;
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
                        <i-label id="lblPaymentFormat" font={{ size: '1rem', color: '#fff' }}></i-label>
                        <i-vstack gap="0.25rem">
                            <i-hstack horizontalAlignment="end" gap="0.25rem">
                                <i-image id="imgNetwork" width="1.5rem" height="1.5rem" visible={false}></i-image>
                                <i-icon id="iconNetwork" width="1rem" height="1rem" visible={false}></i-icon>
                            </i-hstack>
                        </i-vstack>
                    </i-hstack>
                    <i-label id="lblRecipient" font={{ size: '1rem', color: '#fff' }} visible={false}></i-label>
                    <i-panel margin={{ top: '2.25rem', bottom: '1.25rem' }} lineHeight="2.75rem">
                        <i-label id="lblInvoiceAmount" font={{ size: '2.25rem', color: '#fff' }} margin={{ right: "0.75rem" }}></i-label>
                        <i-label id="lblCurrency" display="inline" font={{ size: '1.25rem', transform: 'capitalize', color: '#fff' }} ></i-label>
                    </i-panel>
                    <i-label id="lblDescription" font={{ size: '1rem', color: '#fff' }} lineHeight="1.25rem" lineClamp={2} visible={false}></i-label>
                    <i-label id="lblTransaction" caption="View on block explorer" font={{ size: '0.875rem', color: '#FE9F10' }} visible={false}></i-label>
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