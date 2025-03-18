export interface AudioDetect {
  idDetection: number
  recordingAudio: string
  mainText: string
  mistralResult?: boolean
  mistralMessage?: string
  cohereResult?: boolean
  cohereMessage?: string
  databaseResult?: boolean
  databaseUserDetect?: boolean
  databaseUsersApprove?: string[]
  databaseUsersReject?: string[]
  similarityResult?: boolean
  idPhrase?: number
  idUser?: number
}
