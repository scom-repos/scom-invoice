import { Module, customModule, Container } from '@ijstech/components';
import ScomInvoice, { IInvoice } from '@scom/scom-invoice';

const billFrom = {
    avatar: "https://cdn.pixabay.com/photo/2015/04/10/01/41/fox-715588_960_720.jpg",
    username: "SC User 1",
    npub: "npub1wtvapw3a4zr2vhdxuy4khwhzj9hj9cnllkynu8fsedrwxp22fg2qj5mjd8"
}

const paymentAddress = 'lnbc500u1pxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxjlwvf';

@customModule
export default class Module1 extends Module {
    private scomInvoice: ScomInvoice;
    private scomInvoice2: ScomInvoice;

    constructor(parent?: Container, options?: any) {
        super(parent, options);
    }

    async init() {
        super.init();
        this.scomInvoice.billFrom = billFrom;
        this.setData(this.scomInvoice2, { paymentAddress });
    }
    
    setData(target: ScomInvoice, data: any) {
        const builderTarget = target.getConfigurators().find((conf: any) => conf.target === 'Builders');
        builderTarget.setData(data);
    }

    viewInvoice(data: IInvoice) {
        this.setData(this.scomInvoice, data);
    }

    render() {
        return (
            <i-hstack gap="1rem">
                <i-panel
                    padding={{ top: '1.25rem', bottom: '1.25rem', left: '1.25rem', right: '1.25rem' }}
                    stack={{ grow: "1", shrink: "1", basis: "0" }}
                >
                    <i-scom-invoice id="scomInvoice" mode="create" onSendBill={this.viewInvoice}></i-scom-invoice>
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