import { bech32 } from './bech32';

function toHexString(byteArray) {
    return Array.from(byteArray, function (byte: number) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}

function toUTF8String(byteArray) {
    let str = '';
    for (let byte of byteArray) {
        str += '%' + ('0' + byte.toString(16)).slice(-2);
    }
    return decodeURIComponent(str);
}

function wordsToInt(words: number[]) {
    let sum = 0;
    for (let i = 0; i < words.length; i++) {
        sum = sum * 32 + words[i];
    }
    return sum;
}

function wordsToBinaryString(words: number[]) {
    return Array.from(words, function (byte) {
        return ('000000' + byte.toString(2)).slice(-5);
    }).join('');
}

function decodeAmount(amount: string, multiplier: string): { satoshis: number, millisatoshis: number } {
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
    if (satoshis != null) millisatoshis = satoshis * 1000;
    return { satoshis, millisatoshis };
}

function decodeHumanReadablePart(prefix: string) {
    const match = /^ln(\S+?)(\d*)([munp]?)$/.exec(prefix);
    if (!match) throw new Error('Invalid prefix');
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
    }
}

function routingInfoParser(words: number[]) {
    let routes: any[] = [];
    let routesData = bech32.fromWords(words);
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
        })
    }
    return routes;
}

function decodeTag(type: number, length: number, data: number[]) {
    switch (type) {
        case 1:
            if (length !== 52) break;
            return {
                name: 'payment_hash',
                value: toHexString(bech32.fromWords(data))
            };
        case 16:
            if (length !== 52) break;
            return {
                name: 'payment_secret',
                value: toHexString(bech32.fromWords(data))
            };
        case 13:
            return {
                name: 'description',
                value: toUTF8String(bech32.fromWords(data))
            }
        case 19:
            return {
                name: 'payee_node_key',
                value: toHexString(bech32.fromWords(data))
            };
        case 23:
            return {
                name: 'purpose_commit_hash',
                value: toHexString(bech32.fromWords(data))
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

function decodeTags(words: number[]) {
    let tags: any[] = [];
    while (words.length > 0) {
        let type = words[0];
        let tagLength = wordsToInt(words.slice(1, 3));
        let data = words.slice(3, tagLength + 3);
        words = words.slice(tagLength + 3);
        const tag = decodeTag(type, tagLength, data);
        if (tag) tags.push(tag);
    }
    return tags;
}

export function decode(invoice: string) {
    const request = invoice.trim().toLowerCase();
    if (!request.startsWith('ln')) throw new Error('Invalid lightning payment request');

    const { prefix, words } = bech32.decode(request, Number.MAX_SAFE_INTEGER);
    const { coinType, satoshis, millisatoshis } = decodeHumanReadablePart(prefix);

    let sigWords = words.slice(-104);
    let sigData = bech32.fromWords(sigWords);
    const recoveryFlag = sigData.pop() as number;
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
    signingData += toHexString(bech32.fromWords(words.slice(0, -104)));

    return {
        coinType,
        satoshis,
        millisatoshis,
        signature,
        timestamp,
        tags,
        signingData
    }
}