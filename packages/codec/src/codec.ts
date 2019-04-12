import { Codec, CodecBackend, Schema, Decoded } from './codec.interface'

/**
 * Wrapper for codec backends. Simplifies things like nested types
 * so that the backend can handle critical logic.
 */
export class SimpleCodec implements Codec {
  /**
   * Creates the codec.
   * @param backend Backend to use to encode and decode.
   */
  constructor(private backend: CodecBackend) {}

  /**
   * Encodes a value with a given schema.
   * @param schema Schema to encode with.
   * @param value Value to encode.
   * @returns the encoded value as a Buffer.
   */
  public encode(schema: Schema, value: Decoded<typeof schema>): Buffer {
    if (typeof schema === 'string') {
      return this.backend.encode(schema, [value])
    }

    let encoded = Buffer.from('')
    for (const item of schema) {
      encoded = Buffer.concat([
        encoded,
        this.encode(item.type, value[item.name]),
      ])
    }

    return encoded
  }

  /**
   * Decodes a value with a given schema.
   * @param schema Schema to decode with.
   * @param value Value to decode.
   * @returns the decoded value.
   */
  public decode(schema: Schema, value: Buffer): Decoded<typeof schema> {
    return this._decode(schema, value).result
  }

  /**
   * Recursive method for decoding values.
   * @param schema Schema to decode with.
   * @param value Value to decode.
   * @returns the decoded value and total consumed bytes used to decode.
   */
  private _decode(
    schema: Schema,
    value: Buffer
  ): { result: Decoded<typeof schema>; consumed: number } {
    if (typeof schema === 'string') {
      return this.backend.decode(schema, value)
    }

    let pointer = 0
    const decoded = {}
    for (const item of schema) {
      const slice = value.slice(pointer)
      const { result, consumed } = this.decode(item.type, slice)
      decoded[item.name] = result
      pointer += consumed
    }

    return {
      result: decoded,
      consumed: pointer,
    }
  }
}
