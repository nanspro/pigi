export interface NestedArray<T> extends Array<T | NestedArray<T>> {}
export interface CodecType {
  name: string
  type: string
}
export type CodecSchema = string | NestedArray<CodecType>
export type CodecDecoded<T extends CodecSchema> = T extends string
  ? string
  : { [K in keyof T]: any }

export interface CodecBackend {
  encode(schema: string[], value: any[]): string
  decode(schema: string[], value: string): any[]
}

/**
 * Wrapper for codec backends. Simplifies things like nested types
 * so that the backend can handle critical logic.
 */
export class BaseCodec {
  constructor(private backend: CodecBackend) {}

  public encode(
    schema: CodecSchema,
    value: CodecDecoded<typeof schema>
  ): string {
    const types = getSchemaTypes(schema)
    const values =
      typeof schema === 'string'
        ? [value]
        : schema.map((item) => {
            return value[item.name]
          })

    return this.backend.encode(types, values)
  }

  public decode(
    schema: CodecSchema,
    value: string
  ): CodecDecoded<typeof schema> {
    const types = getSchemaTypes(schema)
    const values = this.backend.decode(types, value)

    const decoded =
      typeof schema === 'string'
        ? values[0]
        : schema.reduce((obj, item, i): Object => {
            obj[item.name] = values[i]
            return obj
          }, {})

    return decoded
  }
}
