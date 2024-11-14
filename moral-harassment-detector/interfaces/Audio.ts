export interface AudioDetect {
  idDetection: number
  recordingAudio: string
  recordingTranscribed: string
  mistralResult?: boolean
  mistralMessage?: string
  cohereResult?: boolean
  cohereMessage?: string
  databaseResult?: boolean
  databaseUsername?: string
  similarityResult?: boolean
}
