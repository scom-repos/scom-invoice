import {
    Control,
    ControlElement,
    customElements,
    FormatUtils,
    HStack,
    Image,
    Label,
    Module,
    moment,
    Styles,
    Table,
} from '@ijstech/components';
import { imageStyle, tableStyle } from './index.css';
import assets from "./assets";
import { IInvoice, Status } from './interface';

const Theme = Styles.Theme.ThemeVars;

type payInvoiceType = (data: IInvoice) => void;

interface ScomInvoiceDetailElement extends ControlElement {
    onPayInvoice?: payInvoiceType;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-invoice-detail']: ScomInvoiceDetailElement;
        }
    }
}

@customElements('i-scom-invoice-detail')
export class ScomInvoiceDetail extends Module {
    private imgAvatar: Image;
    private lblUserName: Label;
    private lblInternetIdentifier: Label;
    private lblUserPubKey: Label;
    private lblInvoiceNumber: Label;
    private lblBilledTo: Label;
    private lblStatus: Label;
    private lblDueDate: Label;
    private itemTable: Table;
    private lblTotal: Label;
    private pnlButtons: HStack;
    private itemColumns = [
        {
            title: 'ITEM',
            fieldName: 'name',
            width: '50%'
        },
        {
            title: 'QUANTITY',
            fieldName: 'quantity',
            width: '15%'
        },
        {
            title: 'PRICE',
            fieldName: 'price',
            width: '15%',
            textAlign: 'right',
            onRenderCell: (source: Control, columnData: any, rowData: any) => {
                return (
                    <i-label caption={`$${FormatUtils.formatNumber(columnData, { decimalFigures: 2 })}`}></i-label>
                )
            }
        },
        {
            title: 'AMOUNT',
            fieldName: 'amount',
            width: '20%',
            textAlign: 'right',
            onRenderCell: (source: Control, columnData: any, rowData: any) => {
                const amount = rowData.price * rowData.quantity;
                return (
                    <i-label caption={`$${FormatUtils.formatNumber(amount, { decimalFigures: 2 })}`}></i-label>
                )
            }
        }
    ];
    private columns: any[] = this.itemColumns.slice();
    private data: IInvoice;
    public onPayInvoice: payInvoiceType;
    
    setData(data: IInvoice) {
        this.data = data;
        this.updateUI();
    }

    private getStatusColors(status: Status) {
        const color = { background: '', font: '' };
        if (status === Status.Paid) {
            color.background = '#81C784';
            color.font = '#07640B';
        } else {
            color.background = '#F6C958';
            color.font = '#C47100';
        }
        return color;
    }

    private updateUI() {
        this.imgAvatar.url = this.data.billFrom?.avatar || assets.fullPath('img/default_avatar.png');
        this.lblUserName.caption = this.data.billFrom?.username || "";
        this.lblInternetIdentifier.caption = this.data.billFrom?.internetIdentifier || "";
        this.lblUserPubKey.caption = this.data.billFrom?.npub ? FormatUtils.truncateWalletAddress(this.data.billFrom?.npub) : "";
        this.lblInvoiceNumber.caption = "INVOICE #" + this.data.billNumber;
        this.lblBilledTo.caption = this.data.billTo;
        this.lblDueDate.caption = moment.unix(this.data.dueDate).format('MMM DD, YYYY');
        const status = this.data.status ?? Status.Unpaid;
        const { background, font } = this.getStatusColors(status);
        this.lblStatus.caption = status;
        this.lblStatus.background = { color: background };
        this.lblStatus.font = { color: font };
        this.itemTable.data = [...this.data.items];
        this.lblTotal.caption = `$${FormatUtils.formatNumber(this.data.total, { decimalFigures: 2 })} ${this.data.currency}`;
        this.pnlButtons.visible = status === Status.Unpaid;
    }

    private handlePayInvoiceButtonClick() {
        if (this.onPayInvoice) this.onPayInvoice(this.data);
    }
    
    render() {
        return (
            <i-vstack gap="1.5rem">
                <i-vstack gap="1.5rem">
                    <i-hstack horizontalAlignment="space-between" gap="0.5rem">
                        <i-hstack minWidth={0} verticalAlignment="center" stack={{ grow: "1", shrink: "1" }}>
                            <i-panel width="3rem" height="3rem" stack={{ shrink: '0' }} margin={{ right: "0.75rem" }} border={{ radius: "50%" }} overflow="hidden">
                                <i-panel width="100%" height={0} overflow="hidden" padding={{ bottom: "100%" }}>
                                    <i-image
                                        id="imgAvatar"
                                        class={imageStyle}
                                        position="absolute"
                                        display="block"
                                        width="100%"
                                        height="100%"
                                        top="100%"
                                        left={0}
                                        url={assets.fullPath('img/default_avatar.png')}
                                    ></i-image>
                                </i-panel>
                            </i-panel>
                            <i-hstack width="100%" minWidth={0} horizontalAlignment="space-between" verticalAlignment="center" gap="0.5rem">
                                <i-vstack height="100%" minWidth={0} verticalAlignment='space-between' stack={{ shrink: "1" }} lineHeight="1.125rem">
                                    <i-label
                                        id="lblUserName"
                                        font={{ size: '0.9375rem', weight: 700 }}
                                        textOverflow="ellipsis"
                                        overflow="hidden"
                                    ></i-label>
                                    <i-label
                                        id="lblInternetIdentifier"
                                        font={{ size: '0.75rem', weight: 400, color: Theme.text.secondary }}
                                        lineHeight={'1rem'}
                                        textOverflow="ellipsis"
                                        overflow="hidden"
                                    ></i-label>
                                    <i-label
                                        id="lblUserPubKey"
                                        font={{ size: '0.75rem', weight: 400, color: Theme.text.secondary }}
                                        lineHeight={'1rem'}
                                        textOverflow="ellipsis"
                                        overflow="hidden"
                                    ></i-label>
                                </i-vstack>
                            </i-hstack>
                        </i-hstack>
                        <i-vstack horizontalAlignment="end" gap="0.5rem" stack={{ grow: "1", shrink: "0" }}>
                            <i-label caption="BILLED TO" font={{ size: '0.8125rem' }}></i-label>
                            <i-label id="lblBilledTo" font={{ size: '1rem', weight: 600 }}></i-label>
                        </i-vstack>
                    </i-hstack>
                    <i-label id="lblInvoiceNumber" caption="INVOICE" font={{ size: '0.875rem' }}></i-label>
                    <i-hstack horizontalAlignment="space-between" gap="0.5rem">
                        <i-hstack gap="0.5rem">
                            <i-label height={24} caption="STATUS" padding={{ top: '0.25rem', bottom: '0.25rem' }} font={{ size: '0.875rem' }}></i-label>
                            <i-label id="lblStatus" height={24} padding={{ top: '0.25rem', bottom: '0.25rem', left: '0.5rem', right: '0.5rem' }} border={{ radius: '0.5rem' }}></i-label>
                        </i-hstack>
                        <i-vstack horizontalAlignment="end" gap="0.5rem">
                            <i-label caption="DUE DATE" font={{ size: '0.8125rem' }}></i-label>
                            <i-label id="lblDueDate" font={{ size: '0.875rem', weight: 600 }}></i-label>
                        </i-vstack>
                    </i-hstack>
                </i-vstack>
                <i-vstack gap="1rem">
                    <i-table
                        id="itemTable"
                        class={tableStyle}
                        heading={true}
                        columns={this.columns}
                        headingStyles={{
                            font: { size: '0.875rem', weight: 600, color: Theme.text.secondary },
                            padding: { top: '1.25rem', bottom: '1.25rem', left: '0.5rem', right: '0.5rem' }
                        }}
                        bodyStyles={{
                            font: { size: '0.875rem', color: Theme.text.primary },
                            padding: { top: '1.25rem', bottom: '1.25rem', left: '0.5rem', right: '0.5rem' }
                        }}
                    ></i-table>
                    <i-hstack
                        width="50%"
                        margin={{ left: 'auto' }}
                        padding={{ left: '0.5rem' }}
                        horizontalAlignment='space-between'
                        verticalAlignment="center"
                        gap="1rem"
                        mediaQueries={[
                            {
                                maxWidth: '767px',
                                properties: {
                                    width: '100%',
                                    padding: { left: 0 }
                                }
                            }
                        ]}
                    >
                        <i-label caption="TOTAL" font={{ weight: 600 }}></i-label>
                        <i-label id="lblTotal" class="text-right" font={{ weight: 600, color: Theme.colors.primary.main }}></i-label>
                    </i-hstack>
                </i-vstack>
                <i-hstack id="pnlButtons" horizontalAlignment="end" visible={false}>
                    <i-button
                        caption="Pay Invoice"
                        border={{ radius: '0.5rem' }}
                        boxShadow='none'
                        padding={{ top: '0.625rem', bottom: '0.625rem', left: '1.25rem', right: '1.25rem' }}
                        font={{ weight: 600 }}
                        onClick={this.handlePayInvoiceButtonClick}
                    ></i-button>
                </i-hstack>
            </i-vstack>
        )
    }
}