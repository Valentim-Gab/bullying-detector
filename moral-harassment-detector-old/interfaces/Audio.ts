export interface AudioDetect {
  idDetection: number
  recordingAudio: string
  recordingTranscribed: string
  mistralResult?: boolean
  mistralMessage?: string
  cohereResult?: boolean
  cohereMessage?: string
  databaseResult?: boolean
  databaseUserDetect?: boolean
  databaseApproveUserList?: string[]
  databaseRejectUserList?: string[]
  databaseIdPhrase?: number
  similarityResult?: boolean
}
