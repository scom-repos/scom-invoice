import { Module, customModule, Container } from '@ijstech/components';
import ScomInvoice, { InvoiceStatus } from '@scom/scom-invoice';

const invoiceData = {
    chainId: 43113,
    token: { name: "AVAX", decimals: 18, symbol: "AVAX" },
    amount: 1,
    comment: "Testing",
    to: "0x9C6c3A26f8D1277A86BFFC86335e625e39106C04",
    status: InvoiceStatus.Paid
};
const paymentAddress = 'lnbc2500u1pvjluezsp5zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zygspp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq5xysxxatsyp3k7enxv4jsxqzpu9qrsgquk0rl77nj30yxdy8j9vdx85fkpmdla2087ne0xh8nhedh8w27kyke0lp53ut353s06fv3qfegext0eh0ymjpf39tuven09sam30g4vgpfna3rh';

@customModule
export default class Module1 extends Module {
    private scomInvoice: ScomInvoice;
    private scomInvoice2: ScomInvoice;

    constructor(parent?: Container, options?: any) {
        super(parent, options);
    }

    async init() {
        super.init();
        this.setData(this.scomInvoice, invoiceData);
        this.setData(this.scomInvoice2, { paymentAddress });
    }

    setData(target: ScomInvoice, data: any) {
        const builderTarget = target.getConfigurators().find((conf: any) => conf.target === 'Builders');
        builderTarget.setData(data);
    }

    render() {
        return (
            <i-hstack gap="1rem">
                <i-panel
                    padding={{ top: '1.25rem', bottom: '1.25rem', left: '1.25rem', right: '1.25rem' }}
                    stack={{ grow: "1", shrink: "1", basis: "0" }}
                >
                    <i-scom-invoice id="scomInvoice"></i-scom-invoice>
                </i-panel>
                <i-panel
                    padding={{ top: '1.25rem', bottom: '1.25rem', left: '1.25rem', right: '1.25rem' }}
                    margin={{ top: 'auto', bottom: 'auto' }}
                    stack={{ grow: "1", shrink: "1", basis: "0" }}
                >
                    <i-scom-invoice id="scomInvoice2"></i-scom-invoice>
                </i-panel>
            </i-hstack>
        )
    }
}