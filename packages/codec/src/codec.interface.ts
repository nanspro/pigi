export interface NamedType {
  name: string
  type: Schema
}

export type ObjectType = NamedType[]

export type Schema = string | ObjectType

export type Decoded<T extends Schema> = T extends string
  ? any
  : { [K in keyof T]: any }

export interface CodecBackend {
  encode(schema: string, value: any[]): Buffer
  decode(schema: string, value: Buffer): { result: any; consumed: number }
}

export interface Codec {
  encode(schema: Schema, value: Decoded<typeof schema>): Buffer
  decode(schema: Schema, value: Buffer): Decoded<typeof schema>
}
