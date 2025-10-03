export interface SimpleDetection {
  detected: boolean
  classification: number
  message?: string
  idPhrase?: number
  collaborativeUserDetect?: boolean | null
}
