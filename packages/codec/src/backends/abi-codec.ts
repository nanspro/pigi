import { ethers } from 'ethers'

import { CodecBackend } from '../codec.interface'

export class AbiCodec implements CodecBackend {
  private abi = new ethers.utils.AbiCoder()

  public encode(schema: string, value: any): Buffer {
    const encoded = this.abi.encode([schema], [value])
    return Buffer.from(encoded, 'hex')
  }

  public decode(schema: string, value: Buffer): any {
    
  }
}
