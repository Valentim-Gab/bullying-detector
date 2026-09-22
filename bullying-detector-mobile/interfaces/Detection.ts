import { AiNameEnum } from '@/enums/AiEnum'

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
  hookFinalClassificationBodyKey: string
}

export interface DetectionData extends Detection {
  recordingAudio: string | null
  detectorAi1Name: AiNameEnum
  detectorAi1Classification: number | null
  detectorAi1Message: string | null
  detectorAi2Name: AiNameEnum
  detectorAi2Classification: number | null
  detectorAi2Message: string | null
  detectorAi3Name: AiNameEnum
  detectorAi3Classification: number | null
  detectorAi3Message: string | null
  detectorCollaborativeClassification: number | null
  detectorCollaborativeUserDetect: boolean | null
  detectorCollaborativeUsersApprove: number | null
  detectorCollaborativeUsersReject: number | null
  detectorSimilarityClassification: number | null
  finalClassification: number
  idUser: number
  idPhrase: number | null
}
