import { Detection } from '@prisma/client'

export interface SimpleDetection extends Partial<Detection> {
  detected?: boolean
  message?: string
}
