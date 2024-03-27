import { Module, customModule, Container } from '@ijstech/components';
import ScomInvoice, { IInvoice } from '@scom/scom-invoice';

const billFrom = {
    avatar: "https://cdn.pixabay.com/photo/2015/04/10/01/41/fox-715588_960_720.jpg",
    username: "SC User 1",
    npub: "npub1wtvapw3a4zr2vhdxuy4khwhzj9hj9cnllkynu8fsedrwxp22fg2qj5mjd8"
}

const paymentAddress = 'lnbc100n1pnqyt82sp5cxpe4whzw7f4jsmp20uv7ehyd583t4ysxfr9nn7ghglk82z8k48qpp5s7h5wfxne272cwn4fw6rdwczya89nhssnxtee8lyyhf0yrr39xzqdqqnp4qwh05slmksqfkgdyz2wst9fewjmah2amldg3jg2pqzqgvr723mslqxqrrsxcqzzn9qyysgqjaxp2k3prntvn34rj78cmj8y47gx4nxaux2qfvux3wqpld4tsl9x480x7knjndet0drxml879c4sv9nlffvr5rn4xmxdrvcy5d8335sqglhwaa';

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