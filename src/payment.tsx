import {
    application,
    ControlElement,
    customElements,
    FormatUtils,
    Icon,
    Label,
    Module,
    Styles
} from '@ijstech/components';
import { IPayment } from './interface';
import assets from "./assets";

const Theme = Styles.Theme.ThemeVars;

interface ScomInvoicePaymentElement extends ControlElement { }

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-invoice-payment']: ScomInvoicePaymentElement;
        }
    }
}

@customElements('i-scom-invoice-payment')
export class ScomInvoicePayment extends Module {
    private lblLink: Label;
    private iconCopy: Icon;
    private lblTotalPrice: Label;
    private data: IPayment;

    setData(data: IPayment) {
        const { currency, total, url } = data;
        this.data = data;
        this.lblLink.caption = url || "";
        this.lblTotalPrice.caption = `$${FormatUtils.formatNumber(total, { decimalFigures: 2 })} ${currency}`;
    }
    
    copyUrl() {
        application.copyToClipboard(this.data.url || "");
        this.iconCopy.name = "check-circle";
        this.iconCopy.fill = Theme.colors.success.main;
        setTimeout(() => {
            this.iconCopy.name = 'copy';
            this.iconCopy.fill = Theme.text.primary;
        }, 1600)
    }

    render() {
        return (
            <i-vstack
                maxWidth="28.125rem"
                margin={{ left: 'auto', right: 'auto' }}
                border={{ width: 1, style: 'solid', color: Theme.divider, radius: '0.75rem' }}
                horizontalAlignment="center"
            >
                <i-vstack
                    class="text-center"
                    maxWidth="20rem"
                    minWidth="20rem"
                    horizontalAlignment="center"
                    padding={{ top: '1.5rem', left: '1rem', right: '1rem' }}
                    gap="1rem"
                >
                    <i-label caption="Scan the QR code or copy and paste the payment details into your wallet."></i-label>
                    <i-label caption="waiting for payment..."></i-label>
                </i-vstack>
                <i-panel
                    maxWidth="20rem"
                    minWidth="20rem"
                    maxHeight="20rem"
                    minHeight="20rem"
                    margin={{ top: '2.5rem', bottom: '2.5rem', left: 'auto', right: 'auto' }}
                    padding={{ top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }}
                    border={{ width: '0.5rem', style: 'solid', color: Theme.colors.secondary.main, radius: '1rem' }}
                >
                    <i-image
                        display="block"
                        width="100%"
                        height="100%"
                        url={assets.fullPath('img/payment.png')}
                    ></i-image>
                </i-panel>
                <i-vstack
                    width="100%"
                    padding={{ top: '1.5rem', bottom: '1.5rem', left: '1.5rem', right: '1.5rem' }}
                    border={{ top: { width: 1, style: 'solid', color: Theme.divider } }}
                    gap="0.5rem"
                >
                    <i-hstack verticalAlignment="center" border={{ width: 1, style: 'solid', color: Theme.divider, radius: '0.25rem' }}>
                        <i-panel
                            minWidth={0}
                            margin={{ top: '0.75rem', bottom: '0.75rem', left: '1rem', right: '1rem' }}
                            stack={{ grow: '1' }}
                        >
                            <i-label id="lblLink" width="100%" textOverflow='ellipsis'></i-label>
                        </i-panel>
                        <i-hstack
                            verticalAlignment='center'
                            margin={{ left: '0.5rem' }}
                            padding={{ top: '0.75rem', bottom: '0.75rem', left: '1rem', right: '1rem' }}
                            border={{ left: { width: 1, style: 'solid', color: Theme.divider } }}
                            cursor="pointer"
                            onClick={this.copyUrl}
                        >
                            <i-icon id="iconCopy" width="0.875rem" height="0.875rem" name="copy"></i-icon>
                        </i-hstack>
                    </i-hstack>
                    <i-hstack horizontalAlignment="space-between" padding={{ top: '1rem', bottom: '1rem' }}>
                        <i-label caption="Total Price"></i-label>
                        <i-label id="lblTotalPrice" caption="-"></i-label>
                    </i-hstack>
                    <i-button
                        caption="Pay In Wallet"
                        width="100%"
                        border={{ radius: '0.5rem' }}
                        boxShadow='none'
                        padding={{ top: '0.75rem', bottom: '0.75rem' }}
                        font={{ weight: 600 }}
                    ></i-button>
                </i-vstack>
            </i-vstack>
        )
    }
}