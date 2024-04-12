var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-invoice/interface.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ;
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
    function convert(data, inBits, outBits) {
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
        if (bits > 0) {
            result.push((value << (outBits - bits)) & maxV);
        }
        return result;
    }
    function _5BitArrayTo8BitArray(words) {
        return convert(words, 5, 8);
    }
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
        let routesData = _5BitArrayTo8BitArray(words);
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
                    value: toHexString(_5BitArrayTo8BitArray(data))
                };
            case 16:
                if (length !== 52)
                    break;
                return {
                    name: 'payment_secret',
                    value: toHexString(_5BitArrayTo8BitArray(data))
                };
            case 13:
                return {
                    name: 'description',
                    value: toUTF8String(_5BitArrayTo8BitArray(data))
                };
            case 19:
                return {
                    name: 'payee_node_key',
                    value: toHexString(_5BitArrayTo8BitArray(data))
                };
            case 23:
                return {
                    name: 'purpose_commit_hash',
                    value: toHexString(_5BitArrayTo8BitArray(data))
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
        let sigData = _5BitArrayTo8BitArray(sigWords);
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
        signingData += toHexString(_5BitArrayTo8BitArray(words.slice(0, -104)));
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
define("@scom/scom-invoice", ["require", "exports", "@ijstech/components", "@scom/scom-network-list", "@scom/scom-invoice/index.css.ts", "@scom/scom-invoice/utils/index.ts"], function (require, exports, components_2, scom_network_list_1, index_css_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeInvoice = void 0;
    Object.defineProperty(exports, "decodeInvoice", { enumerable: true, get: function () { return utils_1.decodeInvoice; } });
    const Theme = components_2.Styles.Theme.ThemeVars;
    let ScomInvoice = class ScomInvoice extends components_2.Module {
        constructor() {
            super(...arguments);
            this.tag = {
                light: {},
                dark: {}
            };
        }
        init() {
            super.init();
        }
        get isPaid() {
            return this.btnPay.tag?.status === "paid" /* InvoiceStatus.Paid */;
        }
        set isPaid(value) {
            let status;
            if (value) {
                status = "paid" /* InvoiceStatus.Paid */;
                this.updateInvoiceStatus(status);
                this.btnPay.tag.status = status;
                if (this.expiryInterval)
                    clearInterval(this.expiryInterval);
            }
        }
        async setData(value) {
            this._data = value;
            if (value.chainId) {
                this.viewInvoiceDetail(this._data);
            }
            else {
                this.viewInvoiceByPaymentAddress(value.paymentAddress);
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
        getNetwork(chainId) {
            if (!this.networkMap) {
                const defaultNetworkList = (0, scom_network_list_1.default)();
                this.networkMap = defaultNetworkList.reduce((acc, cur) => {
                    acc[cur.chainId] = cur;
                    return acc;
                }, {});
            }
            return this.networkMap[chainId];
        }
        viewInvoiceDetail(data) {
            this.pnlInvoice.visible = false;
            this.lblRecipient.visible = !!data.to;
            const network = this.getNetwork(data.chainId);
            this.lblPaymentFormat.caption = network?.chainName || "";
            if (data.to)
                this.lblRecipient.caption = `To ${data.to}`;
            this.pnlFormat.clearInnerHTML();
            if (network.image) {
                this.pnlFormat.appendChild(this.$render("i-hstack", { horizontalAlignment: "end", gap: "0.25rem" },
                    this.$render("i-image", { width: "1.5rem", height: "1.5rem", url: network.image })));
            }
            this.lblInvoiceAmount.caption = components_2.FormatUtils.formatNumber(data.amount, { decimalFigures: 6, hasTrailingZero: false });
            this.lblCurrency.caption = data.token.symbol;
            this.lblDescription.caption = data.comment || '';
            let status = data.status || "unpaid" /* InvoiceStatus.Unpaid */;
            this.updateInvoiceStatus(status);
            this.btnPay.tag = { ...data, status };
            this.pnlInvoice.visible = true;
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
            if (status === "expired" /* InvoiceStatus.Expired */) {
                this.btnPay.caption = "Expired";
                this.btnPay.enabled = false;
                this.pnlInvoice.enabled = false;
            }
            else {
                if (status === "paid" /* InvoiceStatus.Paid */) {
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
            this.pnlInvoice.visible = false;
            this.lblRecipient.visible = false;
            const data = this.extractPaymentAddress(address);
            this.lblPaymentFormat.caption = data.format === 'lightning' ? 'Lightning Invoice' : data.format === 'bitcoin' ? 'On-chain' : 'Unified';
            this.renderPaymentFormatIcons(data.format);
            this.lblInvoiceAmount.caption = components_2.FormatUtils.formatNumber(data.satoshis, { decimalFigures: 0 });
            this.lblCurrency.caption = 'Sats';
            this.lblDescription.caption = data.description || '';
            let expiryDate = new Date((data.timestamp + data.expiry) * 1000);
            let status = this._data.status || "unpaid" /* InvoiceStatus.Unpaid */;
            if (status === 'unpaid') {
                if (Date.now() < expiryDate.getTime()) {
                    this.expiryInterval = setInterval(() => {
                        if (Date.now() >= expiryDate.getTime()) {
                            clearInterval(this.expiryInterval);
                            status = "expired" /* InvoiceStatus.Expired */;
                            this.updateInvoiceStatus(status);
                            this.btnPay.tag = { ...data, status };
                        }
                    }, 30000);
                }
                else {
                    status = "expired" /* InvoiceStatus.Expired */;
                }
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
            let status;
            if (data.timestamp != null && data.expiry != null) {
                let expiryDate = new Date((data.timestamp + data.expiry) * 1000);
                if (Date.now() >= expiryDate.getTime()) {
                    status = "expired" /* InvoiceStatus.Expired */;
                    this.updateInvoiceStatus(status);
                    this.btnPay.tag = { ...data, status };
                    return;
                }
            }
            status = "paid" /* InvoiceStatus.Paid */;
            if (this.onPayInvoice) {
                this.btnPay.rightIcon.spin = true;
                this.btnPay.rightIcon.visible = true;
                let success = await this.onPayInvoice(this._data);
                if (!success)
                    status = "unpaid" /* InvoiceStatus.Unpaid */;
                this.btnPay.rightIcon.spin = false;
                this.btnPay.rightIcon.visible = false;
            }
            this.updateInvoiceStatus(status);
            this.btnPay.tag = { ...data, status };
        }
        render() {
            return (this.$render("i-panel", { width: "100%", height: "100%" },
                this.$render("i-vstack", { id: "pnlInvoice", class: index_css_1.invoiceCardStyle, padding: { top: '1.5rem', bottom: '1.5rem', left: '1.5rem', right: '1.5rem' }, border: { radius: '1rem' }, gap: "1rem", visible: false },
                    this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: "center", lineHeight: "1.125rem", gap: "0.75rem" },
                        this.$render("i-label", { id: "lblPaymentFormat", font: { size: '1rem', color: '#fff' } }),
                        this.$render("i-vstack", { id: "pnlFormat", gap: "0.25rem" })),
                    this.$render("i-label", { id: "lblRecipient", font: { size: '1rem', color: '#fff' }, visible: false }),
                    this.$render("i-panel", { margin: { top: '2.25rem', bottom: '1.25rem' }, lineHeight: "2.75rem" },
                        this.$render("i-label", { id: "lblInvoiceAmount", font: { size: '2.25rem', color: '#fff' }, margin: { right: "0.75rem" } }),
                        this.$render("i-label", { id: "lblCurrency", display: "inline", font: { size: '1.25rem', transform: 'capitalize', color: '#fff' } })),
                    this.$render("i-label", { id: "lblDescription", font: { size: '1rem', color: '#fff' }, lineHeight: "1.25rem", lineClamp: 2 }),
                    this.$render("i-button", { id: "btnPay", caption: "Pay", width: "100%", border: { radius: '0.5rem' }, boxShadow: 'none', padding: { top: '0.75rem', bottom: '0.75rem' }, font: { size: '1.125rem', weight: 600 }, onClick: this.payInvoice }))));
        }
    };
    ScomInvoice = __decorate([
        (0, components_2.customElements)('i-scom-invoice')
    ], ScomInvoice);
    exports.default = ScomInvoice;
});
