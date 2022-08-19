# Cash Account test vectors and sample code

All sample code can be copy-pasted into a python3 REPL.

## Specification standard values

[Specification standard values](test_data/standard_values.yaml)

## Complete registration

[Complete registration test vectors](/test_data/complete.yaml)

This is one of the complete vectors. The content is used throughout the sample code below.

```yaml
valid: true
account_name:
  string: Jonathan
  hex:    '4a6f6e617468616e'
payment_data:
  address:     bitcoincash:qr4aadjrpu73d2wxwkxkcrt6gqxgu6a7usxfm96fst
  type_name:   key hash
  hash160_hex:   'ebdeb6430f3d16a9c6758d6c0d7a400c8e6bbee4'
  hex:         '01ebdeb6430f3d16a9c6758d6c0d7a400c8e6bbee4'
  structure:   <type><hash160>
op_return:
  hex:       '0401010101084a6f6e617468616e1501ebdeb6430f3d16a9c6758d6c0d7a400c8e6bbee4'
  structure: <OP_PUSH(4)><protocol> <OP_PUSH(8)><account_name> OP_PUSH(21=0x15)><payment_data>
transaction:
  hash: '590d1fdf7e04af0ee08f9194bb9e8d1971bdcbf55d29303d5bf32d4eae5e7136'
block:
  height: 563720
  hash:   '000000000000000002abbeff5f6fb22a0b3b5c2685c6ef4ed2d2257ed54e9dcb'
account_number:
  value:   100
  process: <block_height> - <block_modification_value>
optional_identicon:
  index:  96
  string: ☯
  process:
    - block+transaction: '000000000000000002abbeff5f6fb22a0b3b5c2685c6ef4ed2d2257ed54e9dcb590d1fdf7e04af0ee08f9194bb9e8d1971bdcbf55d29303d5bf32d4eae5e7136'
    - sha256:            '37f1d9b19e25be4d310f3d4a798091ad38a2fb4a3fb66a82ff1d12e2e29a6230'
    - last_4_bytes:      0xe29a6230
    - modulus_100:       96
collision_hash:
  string: '5876958390'
  process:
    - block+transaction:     '000000000000000002abbeff5f6fb22a0b3b5c2685c6ef4ed2d2257ed54e9dcb590d1fdf7e04af0ee08f9194bb9e8d1971bdcbf55d29303d5bf32d4eae5e7136'
    - sha256:                '37f1d9b19e25be4d310f3d4a798091ad38a2fb4a3fb66a82ff1d12e2e29a6230'
    - first_4_bytes:         '37f1d9b1'
    - decimal_string:        '938596785'
    - reversed:              '587695839'
    - right_pad_zeros_to_10: '5876958390'
collision_avoidance_part:
  same_block_collision_hashes: []
  string: null
identifier:
  complete:              Jonathan#100.5876958390
  short:                 Jonathan#100
  minimal:               Jonathan#100
  short_with_identicon: ☯Jonathan#100
```

## Account name

[Account name test vectors](/test_data/account_name.yaml)

Sample code: create `account_name_bytes` for OP_RETURN registration.

```python
import re  # regular expressions

# b'...' means bytes instead of unicode
ACCOUNT_NAME_REGULAR_EXPRESSION = b'^[a-zA-Z0-9_]{1,99}$'
account_name_bytes = b'Jonathan'
assert re.match(ACCOUNT_NAME_REGULAR_EXPRESSION, account_name_bytes) is not None  # valid
assert re.match(ACCOUNT_NAME_REGULAR_EXPRESSION, b'-Jonathan-')      is None      # not valid
assert account_name_bytes.hex() == '4a6f6e617468616e'
```

## Payment data

[Payment data test vectors](/test_data/payment_data.yaml)

### Payment data: Key hash

Sample code: create `keyhash_payment_data_bytes` for OP_RETURN registration.

```python
import cashaddress

keyhash = cashaddress.convert.Address.from_string('bitcoincash:qr4aadjrpu73d2wxwkxkcrt6gqxgu6a7usxfm96fst')
assert keyhash.prefix == 'bitcoincash'  # is on the Bitcoin Cash network
assert keyhash.version in ['P2PKH', 'P2PKH-TESTNET']  # is p2pkh

KEYHASH_TYPE = bytes.fromhex('01')
hash160_bytes = bytes(keyhash.payload)
keyhash_payment_data_bytes = KEYHASH_TYPE + hash160_bytes
assert keyhash_payment_data_bytes.hex() == '01ebdeb6430f3d16a9c6758d6c0d7a400c8e6bbee4'
```

### Payment data: Script hash

Sample code: create `scripthash_payment_data_bytes` for OP_RETURN registration.

```python
import cashaddress

scripthash = cashaddress.convert.Address.from_string('bitcoincash:pp4d24pemra2k3mths8cjxpuu6yl3a5ctvcp8mdkm9')
assert scripthash.prefix  in ['bitcoincash', 'bchtest']  # is on a Bitcoin Cash network
assert scripthash.version in ['P2SH', 'P2SH-TESTNET']    # is p2sh

SCRIPTHASH_TYPE = bytes.fromhex('02')
hash160_bytes = bytes(scripthash.payload)
scripthash_payment_data_bytes = SCRIPTHASH_TYPE + hash160_bytes
assert scripthash_payment_data_bytes.hex() == '026ad55439d8faab476bbc0f89183ce689f8f6985b'
```

### Payment data: Payment code (BIP-47)

Sample code: use an existing payment code to create `bip47_payment_data_bytes` for OP_RETURN registration.

*Please note that this is very basic validation of the payment code. See BIP-47 for details.*

```python
import base58

bip47_code = 'PM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA'
payload_bytes = base58.b58decode_check(bip47_code)
version_byte = payload_bytes[0]
assert version_byte == 0x47  # we only use the version byte to confirm that we have a BIP-47 payment code

bip47_data_bytes = payload_bytes[1:]
assert len(bip47_data_bytes) == 80    # we need the 80 bytes of payment code data after the version byte

PAYMENTCODE_TYPE = bytes.fromhex('03')
bip47_payment_data_bytes = PAYMENTCODE_TYPE + bip47_data_bytes
assert bip47_payment_data_bytes.hex() == '03010002b85034fb08a8bfefd22848238257b252721454bbbfba2c3667f168837ea2cdad671af9f65904632e2dcc0c6ad314e11d53fc82fa4c4ea27a4a14eccecc478fee00000000000000000000000000'
```

Sample code: use the xpub at `m/47'/145'/0'` to create `bip47_payment_data_bytes` for OP_RETURN registration.
This is the reverse process of the sample code above.

```python
import base58

xpub = 'xpub6D3t231wUi5v9PEa8mgmyV7Tovg3CzrGEUGNQTfm9cK93je3PgX9udfhzUDx29pkeeHQBPpTSHpAxnDgsf2XRbvLrmbCUQybjtHx8SUb3JB'
payload_bytes = base58.b58decode_check(xpub)
pubkey_bytes = payload_bytes[45:78]
chaincode_bytes = payload_bytes[13:45]
bip47_data_bytes = bytes([
    # in this case we use payment code version 1
    0x01,

    # in this case we use 0 to indicate we are not using "bitmessage" for notifications
    0x00,

    # unpack the 33-byte compressed public key
    *pubkey_bytes,

    # unpack the 32-byte chain code
    *chaincode_bytes,

    # 13 bytes of zero in the space reserved for future features
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
])
assert len(bip47_data_bytes) == 80  # here we generated the 80 bytes of payment code data ourselves

# create the final payment code payment data the same way as above
PAYMENTCODE_TYPE = bytes.fromhex('03')
bip47_payment_data_bytes = PAYMENTCODE_TYPE + bip47_data_bytes
assert bip47_payment_data_bytes.hex() == '03010002b85034fb08a8bfefd22848238257b252721454bbbfba2c3667f168837ea2cdad671af9f65904632e2dcc0c6ad314e11d53fc82fa4c4ea27a4a14eccecc478fee00000000000000000000000000'
```

### Payment data: Stealth keys (BIP-Stealth)

Sample code: todo

## OP_RETURN

[OP_RETURN test vectors](/test_data/op_return.yaml)

OP_RETURN outline:

- `<OP_PUSH><CASHACCOUNT_PROTOCOL>`
- `<OP_PUSH><name>`
- `<OP_PUSH><payment_data>`
- `[... <OP_PUSH><payment_data>]`

Sample code: create `script_bytes` of two complete OP_RETURN registrations.

```python
# Use the data from above to create a registration with one payment type (keyhash).
account_name_bytes = b'Jonathan'  # b'...' means bytes instead of unicode
keyhash_payment_data_bytes = bytes.fromhex('01ebdeb6430f3d16a9c6758d6c0d7a400c8e6bbee4')

PUSH_4 =   bytes.fromhex('04')
PUSH_8 =   bytes.fromhex('08')
PUSH_21 =  bytes.fromhex('15')  # 0x15 == 21
PROTOCOL = bytes.fromhex('01010101')  # cash account protocol is 0x01010101
script_bytes = (
    PUSH_4 +  PROTOCOL +
    PUSH_8 +  account_name_bytes +
    PUSH_21 + keyhash_payment_data_bytes
)
assert script_bytes.hex() == '0401010101084a6f6e617468616e1501ebdeb6430f3d16a9c6758d6c0d7a400c8e6bbee4'


# Use the data from above to create a registration with two payment types (keyhas + bip47).
bip47_payment_data_bytes = bytes.fromhex('03010002b85034fb08a8bfefd22848238257b252721454bbbfba2c3667f168837ea2cdad671af9f65904632e2dcc0c6ad314e11d53fc82fa4c4ea27a4a14eccecc478fee00000000000000000000000000')

PUSH_DATA1 = bytes.fromhex('4c')  # PUSH_DATA1 means the next 1 byte will set the data size to be pushed
bip47_data_size = bytes.fromhex('51')  # 0x51 == 81
script_bytes = (
    PUSH_4 +  PROTOCOL +
    PUSH_8 +  account_name_bytes +
    PUSH_21 + keyhash_payment_data_bytes +
    PUSH_DATA1 + bip47_data_size + bip47_payment_data_bytes
)
assert script_bytes.hex() == '0401010101084a6f6e617468616e1501ebdeb6430f3d16a9c6758d6c0d7a400c8e6bbee44c5103010002b85034fb08a8bfefd22848238257b252721454bbbfba2c3667f168837ea2cdad671af9f65904632e2dcc0c6ad314e11d53fc82fa4c4ea27a4a14eccecc478fee00000000000000000000000000'
```

## Account number

Sample code: create and validate `account_number`.

```python
BLOCK_MODIFICATION_VALUE = 563620

block_height = 563720
account_number = block_height - BLOCK_MODIFICATION_VALUE
assert account_number >= 100  # 100 is valid

block_height = 600000
account_number = block_height - BLOCK_MODIFICATION_VALUE
assert account_number >= 100  # 36380 is valid

block_height = 563719
account_number = block_height - BLOCK_MODIFICATION_VALUE
assert account_number >=  100  # 99 is invalid so this will raise an exception
```

## Collision hash

Sample code: create `collision_hash`.

```python
import hashlib

block_hash =              '000000000000000002abbeff5f6fb22a0b3b5c2685c6ef4ed2d2257ed54e9dcb'
transaction_hash =        '590d1fdf7e04af0ee08f9194bb9e8d1971bdcbf55d29303d5bf32d4eae5e7136'
concatenated_hash =       block_hash + transaction_hash
sha_bytes =               hashlib.sha256(bytes.fromhex(concatenated_hash)).digest()
assert sha_bytes.hex() == '37f1d9b19e25be4d310f3d4a798091ad38a2fb4a3fb66a82ff1d12e2e29a6230'

first_4_bytes = sha_bytes[:4]
assert first_4_bytes.hex() == '37f1d9b1'

decimal_string = str(int.from_bytes(first_4_bytes, 'big'))
assert decimal_string == '938596785'

reversed_string = ''.join(reversed(decimal_string))
assert reversed_string == '587695839'

right_padded_10 = reversed_string.ljust(10, '0')
collision_hash =  right_padded_10
assert collision_hash == '5876958390'
```

## Collision avoidance part

[Collision avoidance part test vectors](/test_data/collision_avoidance_part.yaml)

Sample code: find `collision_avoidance_part`, the minimal part of the collision hash.

```python
my_collision_hash = '0321123151'
other_collision_hashes = [
    '2501905124',
    '0736985563',
    '3806873923',
    '3401870692',
    '0627868303',
    '8419948552',
    '5363727682',
    '1939867611',
    '4677311172',
]

remaining_hashes = other_collision_hashes
digit = 0
for digit in range(10):
    remaining_hashes = [h for h in remaining_hashes if h[digit] == my_collision_hash[digit]]
    if not remaining_hashes:
        break
collision_avoidance_part = my_collision_hash[:digit+1]
assert collision_avoidance_part == '03'
```

## Optional identicon

[Optional identicon test vectors](/test_data/identicon.yaml)

Sample code: find `identicon` based on the transaction and block hashes.

*A full index of identicons is in the [standard values](/test_data/standard_values.yaml)*

```python
import hashlib

index_to_codepoint = {
    30: 127797,
    96: 9775,
}
block_hash =              '000000000000000002abbeff5f6fb22a0b3b5c2685c6ef4ed2d2257ed54e9dcb'
transaction_hash =        '590d1fdf7e04af0ee08f9194bb9e8d1971bdcbf55d29303d5bf32d4eae5e7136'
concatenated_hash =       block_hash + transaction_hash
sha_bytes =               hashlib.sha256(bytes.fromhex(concatenated_hash)).digest()
assert sha_bytes.hex() == '37f1d9b19e25be4d310f3d4a798091ad38a2fb4a3fb66a82ff1d12e2e29a6230'

last_4_bytes = sha_bytes[-4:]
assert last_4_bytes.hex() == 'e29a6230'

index = int.from_bytes(last_4_bytes, 'big') % 100
assert index == 96

codepoint = index_to_codepoint[index]
assert codepoint == 9775

identicon = chr(codepoint)
assert identicon == '☯'
```

## Identifier

[Identifier test vectors](/test_data/identifier.yaml)

Sample code: build all types of identifier using the results from above.

```python
# use data from the test vectors
parts = {
    'account_name':             'bv1',
    'account_number':           242,
    'collision_hash':           '0321123151',
    'collision_avoidance_part': '03',
    'optional_identicon':       '🥕',
}
collision_avoidance_part = '03'
optional_identicon = '🥕'

complete = '{account_name}#{account_number}.{collision_hash}'.format(**parts)
minimal =  '{account_name}#{account_number}'.format(**parts)
short = minimal
if collision_avoidance_part:
    short = short + '.' + collision_avoidance_part
short_with_identicon = optional_identicon + short
assert complete ==               'bv1#242.0321123151'
assert minimal ==                'bv1#242'
assert short ==                  'bv1#242.03'
assert short_with_identicon == '🥕bv1#242.03'
```

## Identifier equivalence

Sample code: always display in original and test for equivalence in lower case.

```python
display_1 = 'BV1'
display_2 = 'bv1'

assert display_1         != display_2          # do not use simple equivalence testing for account_names
assert display_1.lower() == display_2.lower()  # use lower case equivalence testing
```
