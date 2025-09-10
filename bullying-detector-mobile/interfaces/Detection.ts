export interface Detection {
  idDetection?: number
  mainText: string
  context: string | null
  external?: DetectionExternal
  hook?: DetectionHook
}

export interface DetectionExternal {
  id: number
  module: string
}

export interface DetectionHook {
  hookMethod: 'POST' | 'PUT' | 'PATCH'
  hookUrl: string
  hookIdBodyKey: string
  hookAvaliationBodyKey: string
}

export interface DetectionData extends Detection {
  recordingAudio: string | null
  mistralResult: number | null
  mistralMessage: string | null
  cohereResult: number | null
  cohereMessage: string | null
  geminiResult: number | null
  geminiMessage: string | null
  deepseekResult: number | null
  deepseekMessage: string | null
  databaseResult: number | null
  databaseUserDetect: boolean | null
  databaseUsersApprove: number | null
  databaseUsersReject: number | null
  similarityResult: number | null
  avaliation: number
  idUser: number
  idPhrase: number | null
}
