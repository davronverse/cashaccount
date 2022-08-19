# Test Plan

## Overview

### Data Entries

Entry | Account | Validity | Notes
--- | --- | --- | ---
1 | Jonathan#100; | Valid | Key hash
2 | Timothy#200; | Valid | Payment code
3 | Monsterbitar#123; | Valid | Multiple payment entries
4 | bv1#242.03; | Valid | Complete naming collision
5 | ABC#124.9; | Valid | Naming collision only when case folded
6 |  | Valid | OP_RETURN last in the transaction
7 | خرجمن#102 | Invalid | Invalid account name
8 |  | Invalid | Invalid payment data
9 | Alice#76; | Invalid | Registered before release

### Test Vectors

#### Account Transaction

Entry | Blockheight | Transaction ID
--- | --- | ---
1 | 563720 | 590d1fdf7e04af0ee08f9194bb9e8d1971bdcbf55d29303d5bf32d4eae5e7136
2 | 563820 | 17d080c925662159f806a75ad9394c58f482348bad9dbb5192e129ca6a3503da
3 | 563743 | 4e5af7d65ab632f256f95817a860b37ac2eb0391fd9992db60bab1bc54e1d430
4 | 563862 | 4a2da2a69fba3ac07b7047dd17927a890091f13a9e89440a4cd4cfb4c009de1f
5 | 563744 | 6315ba9ee395c3e779817d93cd03b1f11ffdf603f8cf8b518efec43b537c9a16
6 |
7 | 563722 | 4d340a6c66079566ca7da36915ff712afa49237cf6548ee700afb53fdca4e6f2
8 |
9 | 563696 | de41ddf3af2c27d976d7653f5066d6ff49f680e29b2557e63e0b79691c5847f3

#### Account Identity

Entry | Identicon | Account Name | Account Number | Collision Hash
--- | --- | --- | --- | ---
1 | ☯ | Jonathan | #100 | .5876958390
2 | 🚀 | Timothy | #200 | .7910708913
3 | 🐒 | Monsterbitar | #123 | .4279020923
4 | 🥕 | bv1 | #242 | .0321123151
5 | 🌻 | ABC | #124 | .9731605793
6 |
7 | 🐪 | ~~invalid~~ | #102 | .3260954122 
8 |
9 | 🔔 | Alice | #76 | .8608044352

#### Account Collision

Entry | Collision Count | Shortest Identifier
--- | --- | ---
1 | 0 | Jonathan#100;
2 | 0 | Timothy#200;
3 | 0 | Monsterbitar#123;
4 | 9 | bv1#242.03;
5 | 1 | ABC#124.9;
6 |
7 | 0 | ~~invalid~~
8 |
9 | 0 | Alice#76;

#### Payment Data

Entry | Payment Count | Payment Types | Payment Data
--- | --- | --- | ---
1 | 1 | Key Hash | qr4aadjrpu73d2wxwkxkcrt6gqxgu6a7usxfm96fst
2 | 1 | Payment Code | PM8TJa84G8yD81hRCF7kWoDcXDEgSdYNXWWe26HRGzwszeC1uc7JwUyZkqkTSQ2sjRXPEqVAST9aN4wrmXfvf59vzsDxCHbVuwB1oe5gKnR2nfkVvhcc
3 | 2 | Payment Code,<br/>Key Hash | PM8TJgMU63jDuiHGLQuHJpJXrN2yVzjwbKjD1z8NtoJNvvuC2KvAAxenbivG6yfyJKEXdbk53X3J6XjF5bfccpfy4cjT4zhqf1EZAxDxQ8pQHS5LGHDy, <br/>???
4 | 1 | Key Hash | qzgvpjawln2l8wfmsg2qwnnytcua02hy45vpdvrqu5
5 | 1 | Key Hash | qpl00mt4cd9f529n9e67sup8u2tfg32nn5js4thu4r
6 |
7 | 1 | Key Hash | qqffv09vg9cynavgygyqrh9agfra52zqrqvhuq6etv
8 |
9 | 1 | Key Hash | qzyjlsge5jx9fpz4m96xfrhunhcv8plgugzqa368r2
