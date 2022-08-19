#!/usr/bin/env bash

# just block anything that isnt a valid txid
if ! [[ $1 =~ ^[a-fA-F0-9]{64}$ ]]; then
    exit -1
fi

curl http://rest-service:3000/user/deposit --data "txid=$1"