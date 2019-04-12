# @pigi/codec
`@pigi/codec` is an *abstraction layer* for encoding/decoding values sent to or received from Ethereum.

## What's the point?
It's often necessary to encode/decode structured data so that we can interact with Ethereum.
However, it's important not to tightly couple the encoding process with the actual method used for encoding.
Otherwise you might end up having to carry out a major rewrite just because you're changing your encoding protocol.

So instead of doing encoding/decoding on its own, `@pigi/codec` provides a wrapper for different *codec backends*.
Backends implement a standard interface and do the actual work of encoding/decoding given values.

## Usage
Here's a quick example of how `@pigi/codec` works:

```js
import { EthCodec, AbiCodecBackend } from '@pigi/codec'

const backend = new AbiCodecBackend()
const codec = new EthCodec(backend)

const value = {
  user: '0x4e7819549656810f884e1d079d158039b79a3146',
  message: 'Hello!',
  metadata: {
    tags: ['#ethereum', '#codec'],
    location: ['53.05418', '6.22176'],
    hash: '0x25410cfd1ba32747a25c00fb388654a29a97d79991f1c4cb21fa2992494bc307'
    timestamp: 1555111960
  }
}

const schema = {
  user: 'address',
  message: 'string',
  metadata: {
    tags: 'string[]',
    location: ['string', 'string'],
    hash: 'bytes32',
    timestamp: 'uint256',
  }
}

const model = codec.model(schema)
const encoded = model.encode(value)
console.log(encoded.toString('hex')) // TODO

const decoded = model.decode(encoded)
console.log(decoded) // { user: '0x4e7819549656810f884e1d079d158039b79a3146', message: 'Hello!', ... }
```

## Specification
### Input Values
`@pigi/codec` can encode/decode any values that conform to the [JSON specification](https://www.json.org/).
It automatically handles things like object representation or nested arrays.

### Schemas
`@pigi/codec` doesn't guess at the types necessary to encode or decode your data.
Instead, you need to provide a *schema* that tells `@pigi/codec` how to deal with your input.

Schemas are valid JSON objects.
However, the "values" of a schema object can **only** be valid [Ethereum ABI types](https://solidity.readthedocs.io/en/v0.5.3/abi-spec.html#types).
Other standard JSON values (number, "true", "false", "null") cannot be used.

This means you're allowed to use:

1. `object`:

`{ string: value, string: value, string: value... }`

2. `array`:

`[ value, value, value, ]`

3. `value`:

`abi_type` or `object` or `array`

#### Examples
We've provided a few example schema below:

##### Simple String
```js
const schema = 'uint256'
```

##### Simple Array
```js
const schema = ['uint256', 'address', 'bool']
```

##### Simple Object
```js
const schema = {
  sender: 'address',
  recipient: 'address',
  amount: 'uint256'
}
```

##### Nested Array
```js
const schema = ['uint256', ['address', 'bytes'], 'uint256']
```

##### Compound Object
```js
const schema = {
  target: 'address',
  coordinates: ['uint256', 'uint256'],
  authorization: {
    president: 'address',
    signature: 'bytes'
  }
}
```

## Backends
`@pigi/codec` currently just ships with an [ABI encoding](https://solidity.readthedocs.io/en/v0.5.3/abi-spec.html) backend.
Still, the whole point of `@pigi/codec` is that you can write your own backend!
A backend should be able to encode and decode all of the various [Ethereum ABI types](https://solidity.readthedocs.io/en/v0.5.3/abi-spec.html#types).
However, you don't really need to implement anything that you don't need to encode.
