import {
    ComboBox,
    ControlElement,
    customElements,
    Datepicker,
    Input,
    Module,
    Styles,
    VStack,
    Control,
    Label,
    FormatUtils,
    IComboItem,
} from '@ijstech/components';
import { formStyle } from './index.css';
import { IInvoice, IItem, sendBillCallback } from './interface';

const Theme = Styles.Theme.ThemeVars;

interface ScomInvoiceFormElement extends ControlElement {
    onSendBill?: sendBillCallback;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-invoice-form']: ScomInvoiceFormElement;
        }
    }
}

const currencies = [
    {
        label: 'USD - US Dollar',
        value: 'USD'
    },
    {
        label: 'Sats',
        value: 'Sats'
    },
];

@customElements('i-scom-invoice-form')
export class ScomInvoiceForm extends Module {
    private edtBillTo: Input;
    private comboCurrency: ComboBox;
    private edtDueDate: Datepicker;
    private edtBillNumber: Input;
    private pnlItems: VStack;
    private lblTotal: Label;
    private itemControls: Record<number, Record<keyof IItem, Input>> = {};
    private itemId = 0;
    public onSendBill: sendBillCallback;

    init() {
        this.updateOrderTotal = this.updateOrderTotal.bind(this);
        super.init();
        this.addItem();
    }

    clear() {
        this.edtBillTo.value = "";
        this.comboCurrency.clear();
        this.edtDueDate.value = undefined;
        this.edtBillNumber.value = "";
        this.pnlItems.clearInnerHTML();
        this.itemId = 0;
        this.itemControls = {};
        this.addItem();
    }

    private addItem() {
        const itemId = this.itemId;
        const edtName = (
            <i-input
                width="100%"
                height={36}
                padding={{ left: '0.5rem', right: '0.5rem' }}
                border={{ radius: "0.375rem" }}
                background={{ color: Theme.colors.secondary.dark }}
            ></i-input>
        );
        const edtPrice = (
            <i-input
                width="100%"
                height={36}
                padding={{ left: '0.5rem', right: '0.5rem' }}
                border={{ radius: "0.375rem" }}
                background={{ color: Theme.colors.secondary.dark }}
                inputType="number"
                onChanged={this.updateOrderTotal}
            ></i-input>
        );
        const edtQuantity = (
            <i-input
                width="100%"
                height={36}
                padding={{ left: '0.5rem', right: '0.5rem' }}
                border={{ radius: "0.375rem" }}
                background={{ color: Theme.colors.secondary.dark }}
                inputType="number"
                onChanged={this.updateOrderTotal}
            ></i-input>
        );
        const rowElm = (
            <i-hstack verticalAlignment="center" gap="1.25rem">
                <i-panel stack={{ grow: '2', shrink: '1', basis: '0' }}>
                    {edtName}
                </i-panel>
                <i-panel stack={{ grow: '1', shrink: '1', basis: '0' }}>
                    {edtPrice}
                </i-panel>
                <i-panel stack={{ grow: '1', shrink: '1', basis: '0' }}>
                    {edtQuantity}
                </i-panel>
                <i-panel>
                    <i-icon width={16} height={16} name="minus-circle" fill={Theme.text.primary} cursor="pointer" onClick={() => this.removeItem(rowElm, itemId)}></i-icon>
                </i-panel>
            </i-hstack>
        );
        this.pnlItems.appendChild(rowElm);
        this.itemControls[itemId] = {
            name: edtName,
            price: edtPrice,
            quantity: edtQuantity
        };
        this.itemId++;
    }

    private removeItem(rowElm: Control, itemId: number) {
        this.pnlItems.removeChild(rowElm);
        delete this.itemControls[itemId];
    }

    private updateOrderTotal() {
        let total = 0;
        for (let key in this.itemControls) {
            const controls = this.itemControls[key];
            total += Number(controls.price.value) * Number(controls.quantity.value);
        }
        const currency = (this.comboCurrency.selectedItem as IComboItem).value;
        this.lblTotal.caption = `$${FormatUtils.formatNumber(total, { decimalFigures: 2 })} ${currency}`;
    }
    
    handleSendBillButtonClick() {
        if (!this.edtBillTo.value || !this.edtDueDate.value || !this.edtBillNumber.value) return;
        let total = 0;
        let items: IItem[] = [];
        for (let key in this.itemControls) {
            const controls = this.itemControls[key];
            const price = Number(controls.price.value);
            const quantity = Number(controls.quantity.value);
            total += price * quantity;
            items.push({
                name: controls.name.value || '',
                price: price,
                quantity: quantity
            });
        }
        const currency = (this.comboCurrency.selectedItem as IComboItem).value;
        const data: IInvoice = {
            billTo: this.edtBillTo.value,
            currency: currency,
            dueDate: this.edtDueDate.value.unix(),
            items: items,
            billNumber: this.edtBillNumber.value,
            total: total
        };
        if (this.onSendBill) this.onSendBill(data);
    }

    render() {
        return (
            <i-panel class={formStyle} width="100%" height="100%">
                <i-panel border={{ radius: '0.5rem' }} overflow="hidden">
                    <i-vstack
                        padding={{ top: "2rem", bottom: "2rem", left: "2.5rem", right: "2.5rem" }}
                        border={{ bottom: { width: 1, style: 'solid', color: Theme.divider } }}
                        gap="2rem"
                        mediaQueries={[
                            {
                                maxWidth: '767px',
                                properties: {
                                    padding: { top: "1rem", bottom: "1rem", left: "1.25rem", right: "1.25rem" }
                                }
                            }
                        ]}
                    >
                        <i-label caption="BILL INFORMATION" font={{ size: '1.25rem' }}></i-label>
                        <i-vstack gap="0.5rem">
                            <i-panel>
                                <i-label display="inline" caption="BILL TO "></i-label>
                                <i-label display="inline" caption="*" font={{ color: Theme.colors.error.main }}></i-label>
                            </i-panel>
                            <i-input
                                id="edtBillTo"
                                width="100%"
                                height={36}
                                padding={{ left: '0.5rem', right: '0.5rem' }}
                                border={{ radius: "0.375rem" }}
                                background={{ color: Theme.colors.secondary.dark }}
                            ></i-input>
                        </i-vstack>
                        <i-vstack gap="0.5rem">
                            <i-panel>
                                <i-label display="inline" caption="CURRENCY "></i-label>
                                <i-label display="inline" caption="*" font={{ color: Theme.colors.error.main }}></i-label>
                            </i-panel>
                            <i-combo-box
                                id="comboCurrency"
                                height={36}
                                width="100%"
                                border={{ radius: "0.375rem" }}
                                items={currencies}
                                selectedItem={currencies[0]}
                            ></i-combo-box>
                        </i-vstack>
                        <i-hstack verticalAlignment="center" gap="1.25rem">
                            <i-vstack stack={{ grow: '1' }} gap="0.5rem">
                                <i-panel>
                                    <i-label display="inline" caption="DUE DATE "></i-label>
                                    <i-label display="inline" caption="*" font={{ color: Theme.colors.error.main }}></i-label>
                                </i-panel>
                                <i-datepicker
                                    id='edtDueDate'
                                    height={36}
                                    width="100%"
                                    type="date"
                                    background={{ color: Theme.colors.secondary.dark }}
                                    border={{ radius: "0.375rem" }}
                                ></i-datepicker>
                            </i-vstack>
                            <i-vstack stack={{ grow: '1' }} gap="0.5rem">
                                <i-panel>
                                    <i-label caption="BILL NUMBER "></i-label>
                                    <i-label display="inline" caption="*" font={{ color: Theme.colors.error.main }}></i-label>
                                </i-panel>
                                <i-input
                                    id="edtBillNumber"
                                    width="100%"
                                    height={36}
                                    padding={{ left: '0.5rem', right: '0.5rem' }}
                                    border={{ radius: "0.375rem" }}
                                    background={{ color: Theme.colors.secondary.dark }}
                                ></i-input>
                            </i-vstack>
                        </i-hstack>
                    </i-vstack>
                    <i-vstack
                        padding={{ top: "2rem", bottom: "2rem", left: "2.5rem", right: "2.5rem" }}
                        gap="1rem"
                        mediaQueries={[
                            {
                                maxWidth: '767px',
                                properties: {
                                    padding: { top: "1rem", bottom: "1rem", left: "1.25rem", right: "1.25rem" }
                                }
                            }
                        ]}
                    >
                        <i-vstack gap="0.5rem">
                            <i-hstack verticalAlignment="center" gap="1.25rem">
                                <i-panel stack={{ grow: '2', shrink: '1', basis: '0' }}>
                                    <i-label caption="ITEM"></i-label>
                                </i-panel>
                                <i-panel stack={{ grow: '1', shrink: '1', basis: '0' }}>
                                    <i-label caption="PRICE"></i-label>
                                </i-panel>
                                <i-panel stack={{ grow: '1', shrink: '1', basis: '0' }}>
                                    <i-label caption="QUANTITY"></i-label>
                                </i-panel>
                                <i-panel width={16}></i-panel>
                            </i-hstack>
                            <i-vstack id="pnlItems" gap="1rem"></i-vstack>
                        </i-vstack>
                        <i-panel>
                            <i-button
                                caption="Add Item"
                                icon={{ name: 'plus-circle', fill: Theme.text.primary }}
                                background={{ color: 'transparent' }}
                                border={{ radius: '0.5rem' }}
                                boxShadow='none'
                                padding={{ top: '0.625rem', bottom: '0.625rem' }}
                                font={{ weight: 600, color: Theme.text.primary }}
                                onClick={this.addItem}
                            ></i-button>
                        </i-panel>
                    </i-vstack>
                    <i-vstack
                        padding={{ top: "2rem", bottom: "2rem", left: "2.5rem", right: "2.5rem" }}
                        background={{ color: Theme.colors.primary.main }}
                        gap="2rem"
                        mediaQueries={[
                            {
                                maxWidth: '767px',
                                properties: {
                                    padding: { top: "1rem", bottom: "1rem", left: "1.25rem", right: "1.25rem" }
                                }
                            }
                        ]}
                    >
                        <i-hstack verticalAlignment="center" horizontalAlignment="space-between" gap="0.5rem">
                            <i-label caption="TOTAL" font={{ size: '1.125rem', color: Theme.colors.primary.contrastText }}></i-label>
                            <i-label id="lblTotal" caption="-" font={{ size: '1.125rem', color: Theme.colors.primary.contrastText }}></i-label>
                        </i-hstack>
                    </i-vstack>
                </i-panel>
                <i-panel margin={{ top: '1.25rem' }}>
                    <i-button
                        id="btnSendBill"
                        caption="SEND BILL"
                        width="100%"
                        border={{ radius: '0.5rem' }}
                        boxShadow='none'
                        padding={{ top: '0.625rem', bottom: '0.625rem' }}
                        font={{ weight: 600 }}
                        onClick={this.handleSendBillButtonClick}
                    ></i-button>
                </i-panel>
            </i-panel>
        )
    }
}