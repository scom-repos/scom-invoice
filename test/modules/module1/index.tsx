import { Module, customModule, Container, VStack, application } from '@ijstech/components';
import assets from '@modules/assets';
import ScomInvoice, { IInvoice } from '@scom/scom-invoice';

const billFrom = {
    avatar: "https://cdn.pixabay.com/photo/2015/04/10/01/41/fox-715588_960_720.jpg",
    username: "SC User 1",
    npub: "npub1wtvapw3a4zr2vhdxuy4khwhzj9hj9cnllkynu8fsedrwxp22fg2qj5mjd8"
}

@customModule
export default class Module1 extends Module {
    private scomInvoice: ScomInvoice;

    constructor(parent?: Container, options?: any) {
        super(parent, options);
    }

    async init() {
        super.init();
        this.scomInvoice.billFrom = billFrom;
    }
    
    viewInvoice(data: IInvoice) {
        const builderTarget = this.scomInvoice.getConfigurators().find((conf: any) => conf.target === 'Builders');
        builderTarget.setData(data);
    }

    render() {
        return (
            <i-panel padding={{ top: '1.25rem', bottom: '1.25rem', left: '1.25rem', right: '1.25rem' }}>
                <i-scom-invoice id="scomInvoice" onSendBill={this.viewInvoice}></i-scom-invoice>
            </i-panel>
        )
    }
}