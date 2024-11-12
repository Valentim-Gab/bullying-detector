export interface AudioDetect {
  idDetection: number
  recordingAudio: string
  recordingTranscribed: string
  mistralResult?: boolean
  cohereResult?: boolean
  databaseResult?: boolean
  similarityResult?: boolean
}
