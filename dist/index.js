var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-invoice/interface.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Status = void 0;
    var Status;
    (function (Status) {
        Status["Unpaid"] = "UNPAID";
        Status["Paid"] = "PAID";
    })(Status = exports.Status || (exports.Status = {}));
});
define("@scom/scom-invoice/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.invoiceCardStyle = exports.tableStyle = exports.imageStyle = exports.formStyle = void 0;
    const Theme = components_1.Styles.Theme.ThemeVars;
    exports.formStyle = components_1.Styles.style({
        $nest: {
            'i-input': {
                $nest: {
                    '> input': {
                        background: Theme.colors.secondary.dark
                    }
                }
            },
            'i-combo-box': {
                $nest: {
                    '.selection': {
                        background: Theme.colors.secondary.dark
                    },
                    '.selection input': {
                        background: Theme.colors.secondary.dark,
                        color: Theme.colors.secondary.contrastText
                    },
                    '.icon-btn': {
                        background: Theme.colors.secondary.dark
                    },
                    '> .icon-btn:hover': {
                        background: Theme.colors.secondary.dark
                    },
                }
            }
        }
    });
    exports.imageStyle = components_1.Styles.style({
        transform: 'translateY(-100%)',
        $nest: {
            '&>img': {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center'
            }
        }
    });
    exports.tableStyle = components_1.Styles.style({
        $nest: {
            '.i-table-cell:first-child': {
                paddingLeft: 0
            },
            '.i-table-cell:last-child': {
                paddingRight: 0
            },
            '.i-table-body > tr:hover td': {
                color: Theme.text.primary
            }
        }
    });
    exports.invoiceCardStyle = components_1.Styles.style({
        background: 'linear-gradient(40deg, #1d1d1d 50%, rgb(100 69 22 / 62%), #1d1d1d)',
        $nest: {
            '&.disabled': {
                opacity: 0.7,
                background: 'linear-gradient(40deg, #1d1d1d 50%, #383838, #1d1d1d)',
            }
        }
    });
});
define("@scom/scom-invoice/form.tsx", ["require", "exports", "@ijstech/components", "@scom/scom-invoice/index.css.ts"], function (require, exports, components_2, index_css_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScomInvoiceForm = void 0;
    const Theme = components_2.Styles.Theme.ThemeVars;
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
    let ScomInvoiceForm = class ScomInvoiceForm extends components_2.Module {
        constructor() {
            super(...arguments);
            this.itemControls = {};
            this.itemId = 0;
        }
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
        addItem() {
            const itemId = this.itemId;
            const edtName = (this.$render("i-input", { width: "100%", height: 36, padding: { left: '0.5rem', right: '0.5rem' }, border: { radius: "0.375rem" }, background: { color: Theme.colors.secondary.dark } }));
            const edtPrice = (this.$render("i-input", { width: "100%", height: 36, padding: { left: '0.5rem', right: '0.5rem' }, border: { radius: "0.375rem" }, background: { color: Theme.colors.secondary.dark }, inputType: "number", onChanged: this.updateOrderTotal }));
            const edtQuantity = (this.$render("i-input", { width: "100%", height: 36, padding: { left: '0.5rem', right: '0.5rem' }, border: { radius: "0.375rem" }, background: { color: Theme.colors.secondary.dark }, inputType: "number", onChanged: this.updateOrderTotal }));
            const rowElm = (this.$render("i-hstack", { verticalAlignment: "center", gap: "1.25rem" },
                this.$render("i-panel", { stack: { grow: '2', shrink: '1', basis: '0' } }, edtName),
                this.$render("i-panel", { stack: { grow: '1', shrink: '1', basis: '0' } }, edtPrice),
                this.$render("i-panel", { stack: { grow: '1', shrink: '1', basis: '0' } }, edtQuantity),
                this.$render("i-panel", null,
                    this.$render("i-icon", { width: 16, height: 16, name: "minus-circle", fill: Theme.text.primary, cursor: "pointer", onClick: () => this.removeItem(rowElm, itemId) }))));
            this.pnlItems.appendChild(rowElm);
            this.itemControls[itemId] = {
                name: edtName,
                price: edtPrice,
                quantity: edtQuantity
            };
            this.itemId++;
        }
        removeItem(rowElm, itemId) {
            this.pnlItems.removeChild(rowElm);
            delete this.itemControls[itemId];
        }
        updateOrderTotal() {
            let total = 0;
            for (let key in this.itemControls) {
                const controls = this.itemControls[key];
                total += Number(controls.price.value) * Number(controls.quantity.value);
            }
            const currency = this.comboCurrency.selectedItem.value;
            this.lblTotal.caption = `$${components_2.FormatUtils.formatNumber(total, { decimalFigures: 2 })} ${currency}`;
        }
        handleSendBillButtonClick() {
            if (!this.edtBillTo.value || !this.edtDueDate.value || !this.edtBillNumber.value)
                return;
            let total = 0;
            let items = [];
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
            const currency = this.comboCurrency.selectedItem.value;
            const data = {
                billTo: this.edtBillTo.value,
                currency: currency,
                dueDate: this.edtDueDate.value.unix(),
                items: items,
                billNumber: this.edtBillNumber.value,
                total: total
            };
            if (this.onSendBill)
                this.onSendBill(data);
        }
        render() {
            return (this.$render("i-panel", { class: index_css_1.formStyle, width: "100%", height: "100%" },
                this.$render("i-panel", { border: { radius: '0.5rem' }, overflow: "hidden" },
                    this.$render("i-vstack", { padding: { top: "2rem", bottom: "2rem", left: "2.5rem", right: "2.5rem" }, border: { bottom: { width: 1, style: 'solid', color: Theme.divider } }, gap: "2rem", mediaQueries: [
                            {
                                maxWidth: '767px',
                                properties: {
                                    padding: { top: "1rem", bottom: "1rem", left: "1.25rem", right: "1.25rem" }
                                }
                            }
                        ] },
                        this.$render("i-label", { caption: "BILL INFORMATION", font: { size: '1.25rem' } }),
                        this.$render("i-vstack", { gap: "0.5rem" },
                            this.$render("i-panel", null,
                                this.$render("i-label", { display: "inline", caption: "BILL TO " }),
                                this.$render("i-label", { display: "inline", caption: "*", font: { color: Theme.colors.error.main } })),
                            this.$render("i-input", { id: "edtBillTo", width: "100%", height: 36, padding: { left: '0.5rem', right: '0.5rem' }, border: { radius: "0.375rem" }, background: { color: Theme.colors.secondary.dark } })),
                        this.$render("i-vstack", { gap: "0.5rem" },
                            this.$render("i-panel", null,
                                this.$render("i-label", { display: "inline", caption: "CURRENCY " }),
                                this.$render("i-label", { display: "inline", caption: "*", font: { color: Theme.colors.error.main } })),
                            this.$render("i-combo-box", { id: "comboCurrency", height: 36, width: "100%", border: { radius: "0.375rem" }, items: currencies, selectedItem: currencies[0] })),
                        this.$render("i-hstack", { verticalAlignment: "center", gap: "1.25rem" },
                            this.$render("i-vstack", { stack: { grow: '1' }, gap: "0.5rem" },
                                this.$render("i-panel", null,
                                    this.$render("i-label", { display: "inline", caption: "DUE DATE " }),
                                    this.$render("i-label", { display: "inline", caption: "*", font: { color: Theme.colors.error.main } })),
                                this.$render("i-datepicker", { id: 'edtDueDate', height: 36, width: "100%", type: "date", background: { color: Theme.colors.secondary.dark }, border: { radius: "0.375rem" } })),
                            this.$render("i-vstack", { stack: { grow: '1' }, gap: "0.5rem" },
                                this.$render("i-panel", null,
                                    this.$render("i-label", { caption: "BILL NUMBER " }),
                                    this.$render("i-label", { display: "inline", caption: "*", font: { color: Theme.colors.error.main } })),
                                this.$render("i-input", { id: "edtBillNumber", width: "100%", height: 36, padding: { left: '0.5rem', right: '0.5rem' }, border: { radius: "0.375rem" }, background: { color: Theme.colors.secondary.dark } })))),
                    this.$render("i-vstack", { padding: { top: "2rem", bottom: "2rem", left: "2.5rem", right: "2.5rem" }, gap: "1rem", mediaQueries: [
                            {
                                maxWidth: '767px',
                                properties: {
                                    padding: { top: "1rem", bottom: "1rem", left: "1.25rem", right: "1.25rem" }
                                }
                            }
                        ] },
                        this.$render("i-vstack", { gap: "0.5rem" },
                            this.$render("i-hstack", { verticalAlignment: "center", gap: "1.25rem" },
                                this.$render("i-panel", { stack: { grow: '2', shrink: '1', basis: '0' } },
                                    this.$render("i-label", { caption: "ITEM" })),
                                this.$render("i-panel", { stack: { grow: '1', shrink: '1', basis: '0' } },
                                    this.$render("i-label", { caption: "PRICE" })),
                                this.$render("i-panel", { stack: { grow: '1', shrink: '1', basis: '0' } },
                                    this.$render("i-label", { caption: "QUANTITY" })),
                                this.$render("i-panel", { width: 16 })),
                            this.$render("i-vstack", { id: "pnlItems", gap: "1rem" })),
                        this.$render("i-panel", null,
                            this.$render("i-button", { caption: "Add Item", icon: { name: 'plus-circle', fill: Theme.text.primary }, background: { color: 'transparent' }, border: { radius: '0.5rem' }, boxShadow: 'none', padding: { top: '0.625rem', bottom: '0.625rem' }, font: { weight: 600, color: Theme.text.primary }, onClick: this.addItem }))),
                    this.$render("i-vstack", { padding: { top: "2rem", bottom: "2rem", left: "2.5rem", right: "2.5rem" }, background: { color: Theme.colors.primary.main }, gap: "2rem", mediaQueries: [
                            {
                                maxWidth: '767px',
                                properties: {
                                    padding: { top: "1rem", bottom: "1rem", left: "1.25rem", right: "1.25rem" }
                                }
                            }
                        ] },
                        this.$render("i-hstack", { verticalAlignment: "center", horizontalAlignment: "space-between", gap: "0.5rem" },
                            this.$render("i-label", { caption: "TOTAL", font: { size: '1.125rem', color: Theme.colors.primary.contrastText } }),
                            this.$render("i-label", { id: "lblTotal", caption: "-", font: { size: '1.125rem', color: Theme.colors.primary.contrastText } })))),
                this.$render("i-panel", { margin: { top: '1.25rem' } },
                    this.$render("i-button", { id: "btnSendBill", caption: "SEND BILL", width: "100%", border: { radius: '0.5rem' }, boxShadow: 'none', padding: { top: '0.625rem', bottom: '0.625rem' }, font: { weight: 600 }, onClick: this.handleSendBillButtonClick }))));
        }
    };
    ScomInvoiceForm = __decorate([
        (0, components_2.customElements)('i-scom-invoice-form')
    ], ScomInvoiceForm);
    exports.ScomInvoiceForm = ScomInvoiceForm;
});
define("@scom/scom-invoice/assets.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const moduleDir = components_3.application.currentModuleDir;
    function fullPath(path) {
        return `${moduleDir}/${path}`;
    }
    ;
    exports.default = {
        fullPath
    };
});
define("@scom/scom-invoice/detail.tsx", ["require", "exports", "@ijstech/components", "@scom/scom-invoice/index.css.ts", "@scom/scom-invoice/assets.ts", "@scom/scom-invoice/interface.ts"], function (require, exports, components_4, index_css_2, assets_1, interface_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScomInvoiceDetail = void 0;
    const Theme = components_4.Styles.Theme.ThemeVars;
    let ScomInvoiceDetail = class ScomInvoiceDetail extends components_4.Module {
        constructor() {
            super(...arguments);
            this.itemColumns = [
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
                    onRenderCell: (source, columnData, rowData) => {
                        return (this.$render("i-label", { caption: `$${components_4.FormatUtils.formatNumber(columnData, { decimalFigures: 2 })}` }));
                    }
                },
                {
                    title: 'AMOUNT',
                    fieldName: 'amount',
                    width: '20%',
                    textAlign: 'right',
                    onRenderCell: (source, columnData, rowData) => {
                        const amount = rowData.price * rowData.quantity;
                        return (this.$render("i-label", { caption: `$${components_4.FormatUtils.formatNumber(amount, { decimalFigures: 2 })}` }));
                    }
                }
            ];
            this.columns = this.itemColumns.slice();
        }
        setData(data) {
            this.data = data;
            this.updateUI();
        }
        getStatusColors(status) {
            const color = { background: '', font: '' };
            if (status === interface_1.Status.Paid) {
                color.background = '#81C784';
                color.font = '#07640B';
            }
            else {
                color.background = '#F6C958';
                color.font = '#C47100';
            }
            return color;
        }
        updateUI() {
            this.imgAvatar.url = this.data.billFrom?.avatar || assets_1.default.fullPath('img/default_avatar.png');
            this.lblUserName.caption = this.data.billFrom?.username || "";
            this.lblInternetIdentifier.caption = this.data.billFrom?.internetIdentifier || "";
            this.lblUserPubKey.caption = this.data.billFrom?.npub ? components_4.FormatUtils.truncateWalletAddress(this.data.billFrom?.npub) : "";
            this.lblInvoiceNumber.caption = "INVOICE #" + this.data.billNumber;
            this.lblBilledTo.caption = this.data.billTo;
            this.lblDueDate.caption = components_4.moment.unix(this.data.dueDate).format('MMM DD, YYYY');
            const status = this.data.status ?? interface_1.Status.Unpaid;
            const { background, font } = this.getStatusColors(status);
            this.lblStatus.caption = status;
            this.lblStatus.background = { color: background };
            this.lblStatus.font = { color: font };
            this.itemTable.data = [...this.data.items];
            this.lblTotal.caption = `$${components_4.FormatUtils.formatNumber(this.data.total, { decimalFigures: 2 })} ${this.data.currency}`;
            this.pnlButtons.visible = status === interface_1.Status.Unpaid;
        }
        handlePayInvoiceButtonClick() {
            if (this.onPayInvoice)
                this.onPayInvoice(this.data);
        }
        render() {
            return (this.$render("i-vstack", { gap: "1.5rem" },
                this.$render("i-vstack", { gap: "1.5rem" },
                    this.$render("i-hstack", { horizontalAlignment: "space-between", gap: "0.5rem" },
                        this.$render("i-hstack", { minWidth: 0, verticalAlignment: "center", stack: { grow: "1", shrink: "1" } },
                            this.$render("i-panel", { width: "3rem", height: "3rem", stack: { shrink: '0' }, margin: { right: "0.75rem" }, border: { radius: "50%" }, overflow: "hidden" },
                                this.$render("i-panel", { width: "100%", height: 0, overflow: "hidden", padding: { bottom: "100%" } },
                                    this.$render("i-image", { id: "imgAvatar", class: index_css_2.imageStyle, position: "absolute", display: "block", width: "100%", height: "100%", top: "100%", left: 0, url: assets_1.default.fullPath('img/default_avatar.png') }))),
                            this.$render("i-hstack", { width: "100%", minWidth: 0, horizontalAlignment: "space-between", verticalAlignment: "center", gap: "0.5rem" },
                                this.$render("i-vstack", { height: "100%", minWidth: 0, verticalAlignment: 'space-between', stack: { shrink: "1" }, lineHeight: "1.125rem" },
                                    this.$render("i-label", { id: "lblUserName", font: { size: '0.9375rem', weight: 700 }, textOverflow: "ellipsis", overflow: "hidden" }),
                                    this.$render("i-label", { id: "lblInternetIdentifier", font: { size: '0.75rem', weight: 400, color: Theme.text.secondary }, lineHeight: '1rem', textOverflow: "ellipsis", overflow: "hidden" }),
                                    this.$render("i-label", { id: "lblUserPubKey", font: { size: '0.75rem', weight: 400, color: Theme.text.secondary }, lineHeight: '1rem', textOverflow: "ellipsis", overflow: "hidden" })))),
                        this.$render("i-vstack", { horizontalAlignment: "end", gap: "0.5rem", stack: { grow: "1", shrink: "0" } },
                            this.$render("i-label", { caption: "BILLED TO", font: { size: '0.8125rem' } }),
                            this.$render("i-label", { id: "lblBilledTo", font: { size: '1rem', weight: 600 } }))),
                    this.$render("i-label", { id: "lblInvoiceNumber", caption: "INVOICE", font: { size: '0.875rem' } }),
                    this.$render("i-hstack", { horizontalAlignment: "space-between", gap: "0.5rem" },
                        this.$render("i-hstack", { gap: "0.5rem" },
                            this.$render("i-label", { height: 24, caption: "STATUS", padding: { top: '0.25rem', bottom: '0.25rem' }, font: { size: '0.875rem' } }),
                            this.$render("i-label", { id: "lblStatus", height: 24, padding: { top: '0.25rem', bottom: '0.25rem', left: '0.5rem', right: '0.5rem' }, border: { radius: '0.5rem' } })),
                        this.$render("i-vstack", { horizontalAlignment: "end", gap: "0.5rem" },
                            this.$render("i-label", { caption: "DUE DATE", font: { size: '0.8125rem' } }),
                            this.$render("i-label", { id: "lblDueDate", font: { size: '0.875rem', weight: 600 } })))),
                this.$render("i-vstack", { gap: "1rem" },
                    this.$render("i-table", { id: "itemTable", class: index_css_2.tableStyle, heading: true, columns: this.columns, headingStyles: {
                            font: { size: '0.875rem', weight: 600, color: Theme.text.secondary },
                            padding: { top: '1.25rem', bottom: '1.25rem', left: '0.5rem', right: '0.5rem' }
                        }, bodyStyles: {
                            font: { size: '0.875rem', color: Theme.text.primary },
                            padding: { top: '1.25rem', bottom: '1.25rem', left: '0.5rem', right: '0.5rem' }
                        } }),
                    this.$render("i-hstack", { width: "50%", margin: { left: 'auto' }, padding: { left: '0.5rem' }, horizontalAlignment: 'space-between', verticalAlignment: "center", gap: "1rem", mediaQueries: [
                            {
                                maxWidth: '767px',
                                properties: {
                                    width: '100%',
                                    padding: { left: 0 }
                                }
                            }
                        ] },
                        this.$render("i-label", { caption: "TOTAL", font: { weight: 600 } }),
                        this.$render("i-label", { id: "lblTotal", class: "text-right", font: { weight: 600, color: Theme.colors.primary.main } }))),
                this.$render("i-hstack", { id: "pnlButtons", horizontalAlignment: "end", visible: false },
                    this.$render("i-button", { caption: "Pay Invoice", border: { radius: '0.5rem' }, boxShadow: 'none', padding: { top: '0.625rem', bottom: '0.625rem', left: '1.25rem', right: '1.25rem' }, font: { weight: 600 }, onClick: this.handlePayInvoiceButtonClick }))));
        }
    };
    ScomInvoiceDetail = __decorate([
        (0, components_4.customElements)('i-scom-invoice-detail')
    ], ScomInvoiceDetail);
    exports.ScomInvoiceDetail = ScomInvoiceDetail;
});
define("@scom/scom-invoice/payment.tsx", ["require", "exports", "@ijstech/components", "@scom/scom-invoice/assets.ts"], function (require, exports, components_5, assets_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScomInvoicePayment = void 0;
    const Theme = components_5.Styles.Theme.ThemeVars;
    let ScomInvoicePayment = class ScomInvoicePayment extends components_5.Module {
        setData(data) {
            const { currency, total, url } = data;
            this.data = data;
            this.lblLink.caption = url || "";
            this.lblTotalPrice.caption = `$${components_5.FormatUtils.formatNumber(total, { decimalFigures: 2 })} ${currency}`;
        }
        copyUrl() {
            components_5.application.copyToClipboard(this.data.url || "");
            this.iconCopy.name = "check-circle";
            this.iconCopy.fill = Theme.colors.success.main;
            setTimeout(() => {
                this.iconCopy.name = 'copy';
                this.iconCopy.fill = Theme.text.primary;
            }, 1600);
        }
        render() {
            return (this.$render("i-vstack", { maxWidth: "28.125rem", margin: { left: 'auto', right: 'auto' }, border: { width: 1, style: 'solid', color: Theme.divider, radius: '0.75rem' }, horizontalAlignment: "center" },
                this.$render("i-vstack", { class: "text-center", maxWidth: "20rem", minWidth: "20rem", horizontalAlignment: "center", padding: { top: '1.5rem', left: '1rem', right: '1rem' }, gap: "1rem" },
                    this.$render("i-label", { caption: "Scan the QR code or copy and paste the payment details into your wallet." }),
                    this.$render("i-label", { caption: "waiting for payment..." })),
                this.$render("i-panel", { maxWidth: "20rem", minWidth: "20rem", maxHeight: "20rem", minHeight: "20rem", margin: { top: '2.5rem', bottom: '2.5rem', left: 'auto', right: 'auto' }, padding: { top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }, border: { width: '0.5rem', style: 'solid', color: Theme.colors.secondary.main, radius: '1rem' } },
                    this.$render("i-image", { display: "block", width: "100%", height: "100%", url: assets_2.default.fullPath('img/payment.png') })),
                this.$render("i-vstack", { width: "100%", padding: { top: '1.5rem', bottom: '1.5rem', left: '1.5rem', right: '1.5rem' }, border: { top: { width: 1, style: 'solid', color: Theme.divider } }, gap: "0.5rem" },
                    this.$render("i-hstack", { verticalAlignment: "center", border: { width: 1, style: 'solid', color: Theme.divider, radius: '0.25rem' } },
                        this.$render("i-panel", { minWidth: 0, margin: { top: '0.75rem', bottom: '0.75rem', left: '1rem', right: '1rem' }, stack: { grow: '1' } },
                            this.$render("i-label", { id: "lblLink", width: "100%", textOverflow: 'ellipsis' })),
                        this.$render("i-hstack", { verticalAlignment: 'center', margin: { left: '0.5rem' }, padding: { top: '0.75rem', bottom: '0.75rem', left: '1rem', right: '1rem' }, border: { left: { width: 1, style: 'solid', color: Theme.divider } }, cursor: "pointer", onClick: this.copyUrl },
                            this.$render("i-icon", { id: "iconCopy", width: "0.875rem", height: "0.875rem", name: "copy" }))),
                    this.$render("i-hstack", { horizontalAlignment: "space-between", padding: { top: '1rem', bottom: '1rem' } },
                        this.$render("i-label", { caption: "Total Price" }),
                        this.$render("i-label", { id: "lblTotalPrice", caption: "-" })),
                    this.$render("i-button", { caption: "Pay In Wallet", width: "100%", border: { radius: '0.5rem' }, boxShadow: 'none', padding: { top: '0.75rem', bottom: '0.75rem' }, font: { weight: 600 } }))));
        }
    };
    ScomInvoicePayment = __decorate([
        (0, components_5.customElements)('i-scom-invoice-payment')
    ], ScomInvoicePayment);
    exports.ScomInvoicePayment = ScomInvoicePayment;
});
///<amd-module name='@scom/scom-invoice/utils/bech32.ts'/> 
/*---------------------------------------------------------------------------------------------
  *  Copyright (c) 2017 Pieter Wuille
  *  Copyright (c) 2018 bitcoinjs contributors
  *  Licensed under the MIT License.
  *  https://github.com/bitcoinjs/bech32/blob/8307501d91ac0cd7d93d55a0aefbe415148cdbbe/LICENSE
  *--------------------------------------------------------------------------------------------*/
define("@scom/scom-invoice/utils/bech32.ts", ["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.bech32m = exports.bech32 = void 0;
    const ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
    const ALPHABET_MAP = {};
    for (let z = 0; z < ALPHABET.length; z++) {
        const x = ALPHABET.charAt(z);
        ALPHABET_MAP[x] = z;
    }
    function polymodStep(pre) {
        const b = pre >> 25;
        return (((pre & 0x1ffffff) << 5) ^
            (-((b >> 0) & 1) & 0x3b6a57b2) ^
            (-((b >> 1) & 1) & 0x26508e6d) ^
            (-((b >> 2) & 1) & 0x1ea119fa) ^
            (-((b >> 3) & 1) & 0x3d4233dd) ^
            (-((b >> 4) & 1) & 0x2a1462b3));
    }
    function prefixChk(prefix) {
        let chk = 1;
        for (let i = 0; i < prefix.length; ++i) {
            const c = prefix.charCodeAt(i);
            if (c < 33 || c > 126)
                return 'Invalid prefix (' + prefix + ')';
            chk = polymodStep(chk) ^ (c >> 5);
        }
        chk = polymodStep(chk);
        for (let i = 0; i < prefix.length; ++i) {
            const v = prefix.charCodeAt(i);
            chk = polymodStep(chk) ^ (v & 0x1f);
        }
        return chk;
    }
    function convert(data, inBits, outBits, pad) {
        let value = 0;
        let bits = 0;
        const maxV = (1 << outBits) - 1;
        const result = [];
        for (let i = 0; i < data.length; ++i) {
            value = (value << inBits) | data[i];
            bits += inBits;
            while (bits >= outBits) {
                bits -= outBits;
                result.push((value >> bits) & maxV);
            }
        }
        if (pad) {
            if (bits > 0) {
                result.push((value << (outBits - bits)) & maxV);
            }
        }
        else {
            if (bits >= inBits)
                return 'Excess padding';
            if ((value << (outBits - bits)) & maxV)
                return 'Non-zero padding';
        }
        return result;
    }
    function toWords(bytes) {
        return convert(bytes, 8, 5, true);
    }
    function fromWordsUnsafe(words) {
        const res = convert(words, 5, 8, false);
        if (Array.isArray(res))
            return res;
    }
    function fromWords(words) {
        const res = convert(words, 5, 8, false);
        if (Array.isArray(res))
            return res;
        throw new Error(res);
    }
    function getLibraryFromEncoding(encoding) {
        let ENCODING_CONST;
        if (encoding === 'bech32') {
            ENCODING_CONST = 1;
        }
        else {
            ENCODING_CONST = 0x2bc830a3;
        }
        function encode(prefix, words, LIMIT) {
            LIMIT = LIMIT || 90;
            if (prefix.length + 7 + words.length > LIMIT)
                throw new TypeError('Exceeds length limit');
            prefix = prefix.toLowerCase();
            // determine chk mod
            let chk = prefixChk(prefix);
            if (typeof chk === 'string')
                throw new Error(chk);
            let result = prefix + '1';
            for (let i = 0; i < words.length; ++i) {
                const x = words[i];
                if (x >> 5 !== 0)
                    throw new Error('Non 5-bit word');
                chk = polymodStep(chk) ^ x;
                result += ALPHABET.charAt(x);
            }
            for (let i = 0; i < 6; ++i) {
                chk = polymodStep(chk);
            }
            chk ^= ENCODING_CONST;
            for (let i = 0; i < 6; ++i) {
                const v = (chk >> ((5 - i) * 5)) & 0x1f;
                result += ALPHABET.charAt(v);
            }
            return result;
        }
        function __decode(str, LIMIT) {
            LIMIT = LIMIT || 90;
            if (str.length < 8)
                return str + ' too short';
            if (str.length > LIMIT)
                return 'Exceeds length limit';
            // don't allow mixed case
            const lowered = str.toLowerCase();
            const uppered = str.toUpperCase();
            if (str !== lowered && str !== uppered)
                return 'Mixed-case string ' + str;
            str = lowered;
            const split = str.lastIndexOf('1');
            if (split === -1)
                return 'No separator character for ' + str;
            if (split === 0)
                return 'Missing prefix for ' + str;
            const prefix = str.slice(0, split);
            const wordChars = str.slice(split + 1);
            if (wordChars.length < 6)
                return 'Data too short';
            let chk = prefixChk(prefix);
            if (typeof chk === 'string')
                return chk;
            const words = [];
            for (let i = 0; i < wordChars.length; ++i) {
                const c = wordChars.charAt(i);
                const v = ALPHABET_MAP[c];
                if (v === undefined)
                    return 'Unknown character ' + c;
                chk = polymodStep(chk) ^ v;
                // not in the checksum?
                if (i + 6 >= wordChars.length)
                    continue;
                words.push(v);
            }
            if (chk !== ENCODING_CONST)
                return 'Invalid checksum for ' + str;
            return { prefix, words };
        }
        function decodeUnsafe(str, LIMIT) {
            const res = __decode(str, LIMIT);
            if (typeof res === 'object')
                return res;
        }
        function decode(str, LIMIT) {
            const res = __decode(str, LIMIT);
            if (typeof res === 'object')
                return res;
            throw new Error(res);
        }
        return {
            decodeUnsafe,
            decode,
            encode,
            toWords,
            fromWordsUnsafe,
            fromWords,
        };
    }
    exports.bech32 = getLibraryFromEncoding('bech32');
    exports.bech32m = getLibraryFromEncoding('bech32m');
});
define("@scom/scom-invoice/utils/decoder.ts", ["require", "exports", "@scom/scom-invoice/utils/bech32.ts"], function (require, exports, bech32_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decode = void 0;
    function toHexString(byteArray) {
        return Array.from(byteArray, function (byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
    }
    function toUTF8String(byteArray) {
        let str = '';
        for (let byte of byteArray) {
            str += '%' + ('0' + byte.toString(16)).slice(-2);
        }
        return decodeURIComponent(str);
    }
    function wordsToInt(words) {
        let sum = 0;
        for (let i = 0; i < words.length; i++) {
            sum = sum * 32 + words[i];
        }
        return sum;
    }
    function wordsToBinaryString(words) {
        return Array.from(words, function (byte) {
            return ('000000' + byte.toString(2)).slice(-5);
        }).join('');
    }
    function decodeAmount(amount, multiplier) {
        let _amount = Number(amount);
        if (!Number.isInteger(_amount)) {
            throw new Error('Invalid amount');
        }
        let satoshis, millisatoshis;
        switch (multiplier) {
            case 'm':
                satoshis = _amount * 100000;
                break;
            case 'u':
                satoshis = _amount * 100;
                break;
            case 'n':
                satoshis = _amount * 0.1;
                break;
            case 'p':
                satoshis = _amount * 0.0001;
                break;
            default:
                throw new Error('Invalid multiplier');
        }
        if (satoshis != null)
            millisatoshis = satoshis * 1000;
        return { satoshis, millisatoshis };
    }
    function decodeHumanReadablePart(prefix) {
        const match = /^ln(\S+?)(\d*)([munp]?)$/.exec(prefix);
        if (!match)
            throw new Error('Invalid prefix');
        const coinType = match[1];
        const amount = match[2];
        const multiplier = match[3];
        if (!amount && !multiplier) {
            return { coinType };
        }
        const { satoshis, millisatoshis } = decodeAmount(amount, multiplier);
        return {
            coinType,
            satoshis,
            millisatoshis,
        };
    }
    function routingInfoParser(words) {
        let routes = [];
        let routesData = bech32_1.bech32.fromWords(words);
        while (routesData.length > 0) {
            let pubkey = routesData.slice(0, 33);
            let shortChannelId = routesData.slice(33, 41);
            let feeBaseMsat = routesData.slice(41, 45);
            let feeProportionalMillionths = routesData.slice(45, 49);
            let cltvExpiryDelta = routesData.slice(49, 51);
            routesData = routesData.slice(51);
            routes.push({
                pubkey: toHexString(pubkey),
                short_channel_id: toHexString(shortChannelId),
                fee_base_msat: parseInt(toHexString(feeBaseMsat), 16),
                fee_proportional_millionths: parseInt(toHexString(feeProportionalMillionths), 16),
                cltv_expiry_delta: parseInt(toHexString(cltvExpiryDelta), 16)
            });
        }
        return routes;
    }
    function decodeTag(type, length, data) {
        switch (type) {
            case 1:
                if (length !== 52)
                    break;
                return {
                    name: 'payment_hash',
                    value: toHexString(bech32_1.bech32.fromWords(data))
                };
            case 16:
                if (length !== 52)
                    break;
                return {
                    name: 'payment_secret',
                    value: toHexString(bech32_1.bech32.fromWords(data))
                };
            case 13:
                return {
                    name: 'description',
                    value: toUTF8String(bech32_1.bech32.fromWords(data))
                };
            case 19:
                return {
                    name: 'payee_node_key',
                    value: toHexString(bech32_1.bech32.fromWords(data))
                };
            case 23:
                return {
                    name: 'purpose_commit_hash',
                    value: toHexString(bech32_1.bech32.fromWords(data))
                };
            case 6:
                return {
                    name: 'expire_time',
                    value: wordsToInt(data)
                };
            case 24:
                return {
                    name: 'min_final_cltv_expiry',
                    value: wordsToInt(data)
                };
            case 9:
                // TODO parse fallback address
                return {
                    name: 'fallback_address',
                    value: {
                        version: data[0],
                        address: ''
                    }
                };
            case 3:
                const routes = routingInfoParser(data);
                return {
                    name: 'routing_info',
                    value: routes
                };
            case 5:
                return {
                    name: 'feature_bits',
                    value: wordsToBinaryString(data)
                };
        }
    }
    function decodeTags(words) {
        let tags = [];
        while (words.length > 0) {
            let type = words[0];
            let tagLength = wordsToInt(words.slice(1, 3));
            let data = words.slice(3, tagLength + 3);
            words = words.slice(tagLength + 3);
            const tag = decodeTag(type, tagLength, data);
            if (tag)
                tags.push(tag);
        }
        return tags;
    }
    function decode(invoice) {
        const request = invoice.trim().toLowerCase();
        if (!request.startsWith('ln'))
            throw new Error('Invalid lightning payment request');
        const { prefix, words } = bech32_1.bech32.decode(request, Number.MAX_SAFE_INTEGER);
        const { coinType, satoshis, millisatoshis } = decodeHumanReadablePart(prefix);
        let sigWords = words.slice(-104);
        let sigData = bech32_1.bech32.fromWords(sigWords);
        const recoveryFlag = sigData.pop();
        const signature = toHexString(sigData);
        if (![0, 1, 2, 3].includes(recoveryFlag) || sigData.length !== 64) {
            throw new Error('Invalid signature');
        }
        const timestamp = wordsToInt(words.slice(0, 7));
        const tags = decodeTags(words.slice(7, -104));
        let signingData = '';
        for (let i = 0; i < prefix.length; i++) {
            signingData += prefix.charCodeAt(i).toString(16);
        }
        signingData += toHexString(bech32_1.bech32.fromWords(words.slice(0, -104)));
        return {
            coinType,
            satoshis,
            millisatoshis,
            signature,
            timestamp,
            tags,
            signingData
        };
    }
    exports.decode = decode;
});
define("@scom/scom-invoice/utils/index.ts", ["require", "exports", "@scom/scom-invoice/utils/decoder.ts"], function (require, exports, decoder_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeInvoice = void 0;
    Object.defineProperty(exports, "decodeInvoice", { enumerable: true, get: function () { return decoder_1.decode; } });
});
define("@scom/scom-invoice", ["require", "exports", "@ijstech/components", "@scom/scom-invoice/index.css.ts", "@scom/scom-invoice/utils/index.ts"], function (require, exports, components_6, index_css_3, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeInvoice = void 0;
    Object.defineProperty(exports, "decodeInvoice", { enumerable: true, get: function () { return utils_1.decodeInvoice; } });
    const Theme = components_6.Styles.Theme.ThemeVars;
    let ScomInvoice = class ScomInvoice extends components_6.Module {
        constructor() {
            super(...arguments);
            this.mode = 'view';
        }
        get billFrom() {
            return this._billFrom;
        }
        set billFrom(value) {
            this._billFrom = value;
        }
        init() {
            super.init();
            const mode = this.getAttribute('mode', true);
            this.setData({ mode });
        }
        async setData(value) {
            this._data = value;
            this.mode = value.mode || 'view';
            if (this.mode === 'create') {
                this.invoiceDetail.visible = false;
                this.invoicePayment.visible = false;
                this.pnlInvoice.visible = false;
                this.invoiceForm.visible = true;
            }
            else {
                if (value.paymentAddress) {
                    this.viewInvoiceByPaymentAddress(value.paymentAddress);
                }
                else if (value.billTo && value.dueDate) {
                    this.viewInvoiceDetail(this._data);
                }
            }
        }
        getData() {
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
            ];
        }
        _getActions() {
            return [];
        }
        getTag() {
            return this.tag;
        }
        setTag(value) {
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
        updateTag(type, value) {
            this.tag[type] = this.tag[type] ?? {};
            for (let prop in value) {
                if (value.hasOwnProperty(prop))
                    this.tag[type][prop] = value[prop];
            }
        }
        updateStyle(name, value) {
            value ?
                this.style.setProperty(name, value) :
                this.style.removeProperty(name);
        }
        updateTheme() {
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
        handleSendBill(data) {
            data.billFrom = this.billFrom;
            if (this.onSendBill)
                this.onSendBill(data);
        }
        viewInvoiceDetail(data) {
            this.invoiceForm.visible = false;
            this.invoicePayment.visible = false;
            this.pnlInvoice.visible = false;
            this.invoiceDetail.setData(data);
            this.invoiceDetail.visible = true;
        }
        showInvoicePayment(data) {
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
        extractPaymentAddress(address) {
            let format;
            if (/^(lnbc|lntb|lnbcrt|lnsb|lntbs)([0-9]+(m|u|n|p))?1\S+/gm.test(address)) {
                format = 'lightning';
                const data = (0, utils_1.decodeInvoice)(address);
                const expiry = data.tags?.find(tag => tag.name === 'expire_time')?.value;
                const description = data.tags?.find(tag => tag.name === 'description')?.value;
                return { ...data, format, expiry, description };
            }
            else if (address.startsWith('bc1')) {
                format = 'bitcoin';
            }
            else {
                format = 'unified';
            }
            return {
                format,
                satoshis: 12345,
                timestamp: Math.round(Date.now() / 1000),
                expiry: 119,
                description: 'sats for test@scom.com'
            };
        }
        renderPaymentFormatIcons(format) {
            this.pnlFormat.clearInnerHTML();
            const icons = [];
            if (format !== 'lightning') {
                icons.push('link');
            }
            if (format !== 'bitcoin') {
                icons.push('bolt');
            }
            const pnlIcons = (this.$render("i-hstack", { horizontalAlignment: "end", gap: "0.25rem" }));
            this.pnlFormat.appendChild(pnlIcons);
            for (const name of icons) {
                pnlIcons.appendChild(this.$render("i-icon", { width: "1rem", height: "1rem", name: name }));
            }
        }
        updateInvoiceStatus(status) {
            if (status === 'expired') {
                this.btnPay.caption = "Expired";
                this.btnPay.enabled = false;
                this.pnlInvoice.enabled = false;
            }
            else {
                if (status === 'paid') {
                    this.btnPay.caption = "Paid";
                    this.btnPay.enabled = false;
                }
                else {
                    this.btnPay.caption = "Pay";
                    this.btnPay.enabled = true;
                }
                this.pnlInvoice.enabled = true;
            }
        }
        viewInvoiceByPaymentAddress(address) {
            if (this.expiryInterval)
                clearInterval(this.expiryInterval);
            this.invoiceDetail.visible = false;
            this.invoicePayment.visible = false;
            this.pnlInvoice.visible = false;
            const data = this.extractPaymentAddress(address);
            this.lblPaymentFormat.caption = data.format === 'lightning' ? 'Lightning Invoice' : data.format === 'bitcoin' ? 'On-chain' : 'Unified';
            this.renderPaymentFormatIcons(data.format);
            this.lblInvoiceAmount.caption = components_6.FormatUtils.formatNumber(data.satoshis, { decimalFigures: 0 });
            this.lblCurrency.caption = 'Sats';
            this.lblDescription.caption = data.description || '';
            let expiryDate = new Date((data.timestamp + data.expiry) * 1000);
            let status = 'unpaid';
            if (Date.now() < expiryDate.getTime()) {
                this.expiryInterval = setInterval(() => {
                    if (Date.now() >= expiryDate.getTime()) {
                        clearInterval(this.expiryInterval);
                        status = 'expired';
                        this.updateInvoiceStatus(status);
                        this.btnPay.tag = { ...data, status };
                    }
                }, 30000);
            }
            else {
                status = 'expired';
            }
            this.updateInvoiceStatus(status);
            this.btnPay.tag = { ...data, status };
            this.pnlInvoice.visible = true;
        }
        async payInvoice() {
            const data = this.btnPay.tag;
            if (data.status !== 'unpaid')
                return;
            if (this.expiryInterval)
                clearInterval(this.expiryInterval);
            let expiryDate = new Date((data.timestamp + data.expiry) * 1000);
            let status;
            if (Date.now() >= expiryDate.getTime()) {
                status = 'expired';
                this.updateInvoiceStatus(status);
                this.btnPay.tag = { ...data, status };
            }
            else {
                status = 'paid';
                if (this.onPayInvoice) {
                    await this.onPayInvoice(this._data.paymentAddress);
                }
                this.updateInvoiceStatus(status);
                this.btnPay.tag = { ...data, status };
            }
        }
        render() {
            return (this.$render("i-panel", { width: "100%", height: "100%" },
                this.$render("i-scom-invoice-form", { id: "invoiceForm", visible: false, onSendBill: this.handleSendBill }),
                this.$render("i-scom-invoice-detail", { id: "invoiceDetail", visible: false, onPayInvoice: this.showInvoicePayment }),
                this.$render("i-scom-invoice-payment", { id: "invoicePayment", visible: false }),
                this.$render("i-vstack", { id: "pnlInvoice", class: index_css_3.invoiceCardStyle, padding: { top: '1.5rem', bottom: '1.5rem', left: '1.5rem', right: '1.5rem' }, border: { radius: '1rem' }, gap: "1rem", visible: false },
                    this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: "center", lineHeight: "1.125rem", gap: "0.75rem" },
                        this.$render("i-label", { id: "lblPaymentFormat", font: { size: '1rem' } }),
                        this.$render("i-vstack", { id: "pnlFormat", gap: "0.25rem" })),
                    this.$render("i-hstack", { verticalAlignment: "end", margin: { top: '2.25rem', bottom: '1.25rem' }, lineHeight: "2.75rem", gap: "0.75rem" },
                        this.$render("i-label", { id: "lblInvoiceAmount", font: { size: '2.25rem' } }),
                        this.$render("i-label", { id: "lblCurrency", font: { size: '1.25rem', transform: 'capitalize' } })),
                    this.$render("i-label", { id: "lblDescription", font: { size: '1rem' }, lineHeight: "1.25rem", lineClamp: 2 }),
                    this.$render("i-button", { id: "btnPay", caption: "Pay", width: "100%", border: { radius: '0.5rem' }, boxShadow: 'none', padding: { top: '0.75rem', bottom: '0.75rem' }, font: { size: '1.125rem', weight: 600 }, onClick: this.payInvoice }))));
        }
    };
    ScomInvoice = __decorate([
        (0, components_6.customElements)('i-scom-invoice')
    ], ScomInvoice);
    exports.default = ScomInvoice;
});
