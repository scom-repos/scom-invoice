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
define("@scom/scom-invoice", ["require", "exports", "@ijstech/components", "@scom/scom-invoice/index.css.ts"], function (require, exports, components_6, index_css_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
            if (address.startsWith('lnbc')) {
                format = 'lightning';
            }
            else if (address.startsWith('bc1')) {
                format = 'bitcoin';
            }
            else {
                format = 'unified';
            }
            // TODO
            return { format, amount: 12345, timestamp: Math.round(Date.now() / 1000), expiry: 119 };
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
            this.lblInvoiceAmount.caption = components_6.FormatUtils.formatNumber(data.amount, { decimalFigures: 2 });
            this.lblCurrency.caption = 'Sats';
            this.lblDescription.caption = 'sats for test@scom.com';
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
        payInvoice() {
            const data = this.btnPay.tag;
            if (data.status !== 'unpaid')
                return;
            if (this.expiryInterval)
                clearInterval(this.expiryInterval);
            let expiryDate = new Date((data.timestamp + data.expiry) * 1000);
            let status = Date.now() >= expiryDate.getTime() ? 'expired' : 'paid';
            this.updateInvoiceStatus(status);
            this.btnPay.tag = { ...data, status };
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
                    this.$render("i-label", { id: "lblDescription", font: { size: '1rem' } }),
                    this.$render("i-button", { id: "btnPay", caption: "Pay", width: "100%", border: { radius: '0.5rem' }, boxShadow: 'none', padding: { top: '0.75rem', bottom: '0.75rem' }, font: { size: '1.125rem', weight: 600 }, onClick: this.payInvoice }))));
        }
    };
    ScomInvoice = __decorate([
        (0, components_6.customElements)('i-scom-invoice')
    ], ScomInvoice);
    exports.default = ScomInvoice;
});
