const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const rpc = require('node-bitcoin-rpc');
const bch = require('bitcore-lib-cash');
const base58check = require('base58check');
const cashaddr = require('cashaddrjs');
const bchaddr = require('bchaddrjs');
const cors = require('cors');

mongoose.connect(process.env.MONGO_CONNECTION, { useNewUrlParser: true });
const Alias = require('../models/alias');

/**
 * @api {post} /alias Create alias
 * @apiName Create new alias
 * 
 * @apiParam {String} [requested_alias] The requested alias
 * @apiParam {String} [payment_data] A bitcoin cash address
 * 
 * @apiSuccess (200) {Object} `Alias` object
 */
router.post('/', cors(), async function (req, res) {

    const { requested_alias, payment_data } = req.body;

    // .log(req.body);
    // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

    if (!requested_alias || !/^\w{1,99}$/.test(requested_alias)) {
        console.log("Request Failed!!!!!!!!!!!!!!");
        return res.status(400).json({ err: 'invalid-alias', alias: requested_alias })
    }
    console.log("Request Success!");
    const pd = id_payment_data(payment_data);

    if (!pd) return res.status(400).json({ err: 'unrecognized-payment-data' })

    const alias = await Alias.create({
        alias: requested_alias,
        payment_data: pd
    });

    const s = s2h(build_script(alias));
    console.log("###########################");
    console.log({ alias: alias, script: s });

    return res.status(200).json({ alias: alias, script: s });
});

/**
 * @api {post} /alias/:id/broadcast Broadcast alias
 * @apiName Broadcast alias
 * 
 * @apiParam {ObjectId} [id] _id property of alias returned from POST /alias
 */
router.post('/:id/broadcast', async function (req, res) {
    const alias_id = req.params['id'];
    console.log(alias_id);

    const alias = await Alias.findById(alias_id);

    rpc.init(process.env.ABC_RPC_ADDR, process.env.ABC_RPC_PORT, process.env.ABC_RPC_USER, process.env.ABC_RPC_PASS);

	// pentuple timeout length from 500 to 2500 (2.5seconds).
	rpc.setTimeout(2500)
    console.log('test');
    rpc.call('listunspent', [0], (err, r) => {
        if (err) {
            console.log("listunspent", err);
            return res.status(500).json({ err: err });
        }

        const utxos = r.result;

        const s = build_script(alias);

        let tx = new bch.Transaction().from(utxos).feePerKb(1001);
        tx.addOutput(new bch.Transaction.Output({ script: s, satoshis: 0 }));

        rpc.call('getrawchangeaddress', [], (err, r) => {
            if (err) {
                console.log("getrawchangeaddress", err);
                return res.status(500).json({ err: err });
            }

            tx.change(r.result);

            rpc.call('signrawtransaction', [tx.toString()], (err, r) => {
                if (err) {
                    console.log("signrawtx", err);
                    return res.status(500).json({ err: err });
                }

                console.log(r);

                rpc.call('sendrawtransaction', [r.result.hex], (err, r) => {
                    if (err) {
                        console.log("sendrawtx", err);
                        return res.status(500).json({ err: err });
                    }

                    return res.status(200).json({ txid: r.result });
                })
            })
        });
    });
});

function build_script(alias) {
    data_map = {
        'p2pkh': '01',
        'p2sh' : '02',
        'p2pc' : '03',
        'p2sk' : '04',
    }

    const s = new bch.Script();
    s.add(bch.Opcode.OP_RETURN);
    s.add(Buffer.from("01010101", "hex"));
    s.add(Buffer.from(alias.alias, "utf8"));

    for (let [key, value] of alias.payment_data.entries()) {
        s.add(Buffer.from(data_map[key] + value, "hex"));
    }

    console.log(s);
    return s;
}

function s2h(script) {
    let parts = script.toString().replace("OP_RETURN", '0x6a').split(' ');
    let string = "";
    for (let p of parts) {
        if (p.indexOf('0x') === 0) {
            string += p.substring(2);
        } else {
            let hc = (p).toString(16);
            if (hc.length % 2) hc = '0' + hc;
            string += hc;
        }
    }

    return string;
}

function id_payment_data(pd) {
    if (typeof pd === 'string') pd = [pd];
    const id = {};
    
    for (let item of pd) {
        try {
            //p2pkh/p2sh
            const type = bchaddr.detectAddressType(item)
            id[type] = Buffer.from(cashaddr.decode(bchaddr.toCashAddress(item)).hash).toString('hex');
            continue;
        } catch (err) { }
    
        try {
            //bip47 payment code
            const b58 = base58check.decode(item);
            if (b58.prefix.toString('hex') === '47' && b58.data.length == 80) {
                id['p2pc'] = b58.data.toString('hex');
                continue;
            }
        } catch (err) { }

        // failed to detect an address
        return false;
    }

    return id;
}

module.exports = router;
