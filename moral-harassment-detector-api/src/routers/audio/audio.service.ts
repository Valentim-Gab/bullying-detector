import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Detection } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'
import { FileUtil } from 'src/utils/file.util'
import { PrismaUtil } from 'src/utils/prisma.util'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { HttpStatusCode } from 'axios'

@Injectable()
export class AudioService {
  constructor(
    private fileUtil: FileUtil,
    private prisma: PrismaService,
    private prismaUtil: PrismaUtil,
    private config: ConfigService,
    private httpService: HttpService,
  ) {}

  async transcribeAudio(filename: string) {
    const transcribedText = await this.fileUtil.transcribeAudio(filename)
    console.log('[TRANSCRIBED TEXT]: ', transcribedText)

    return transcribedText
  }

  async save(file: Express.Multer.File) {
    const filename = await this.fileUtil.save(file, 'record')
    const transcribedText = await this.transcribeAudio(filename)
    const databaseResult = await this.detectDatabase(transcribedText)
    const similarityResult = await this.detectSimilarity(transcribedText)
    const mistralResult = false //await this.detectMistral(transcribedText)
    const cohereResult = false //await this.detectCohere(transcribedText)
    const newDetection: Omit<Detection, 'idDetection'> = {
      recordingAudio: filename,
      recordingTranscribed: transcribedText,
      mistralResult: mistralResult,
      cohereResult: cohereResult,
      databaseResult: databaseResult,
      similarityResult: similarityResult,
    }

    return this.prismaUtil.performOperation(
      'Não foi possível realizar a detecção',
      async () => {
        const detection = await this.prisma.detection.create({
          data: newDetection,
        })

        console.log('[DETECTION]: ', detection)

        return detection
      },
    )
  }

  async getAll() {
    return this.prismaUtil.performOperation(
      'Não foi possível listar as detecções',
      async () => {
        const detections = await this.prisma.detection.findMany({
          orderBy: { idDetection: 'desc' },
        })

        return detections
      },
    )
  }

  async getOne(id: number) {
    return this.prismaUtil.performOperation(
      'Não foi possível encontrar a detecção',
      async () => {
        const detection = await this.prisma.detection.findUnique({
          where: { idDetection: id },
        })

        return detection
      },
    )
  }

  async detectDatabase(text: string) {
    const result = await this.prisma.$queryRaw` 
      SELECT 
        CASE WHEN EXISTS (
          SELECT 1
          FROM harassment_phrase
          WHERE ${text} ILIKE CONCAT('%', phrase, '%')
        ) THEN TRUE
        ELSE FALSE
        END AS harassment_detected;
    `

    return result[0]?.harassment_detected ?? false
  }

  async detectSimilarity(text: string) {
    const url = `${this.config.get('detectApiUrl')}/detect/similarity/embeddings?text_input=${encodeURIComponent(text)}`

    try {
      const res = await firstValueFrom(this.httpService.get(url))

      if (!res || res.status != HttpStatusCode.Ok) {
        return false
      }

      console.log(res.data)

      return res.data.detected
    } catch (error) {
      console.error('Erro ao fazer requisição para FastAPI:', error)
    }
  }

  async detectMistral(text: string) {
    const url = `${this.config.get('detectApiUrl')}/detect/mistral/text?text_input=${encodeURIComponent(text)}`

    try {
      const res = await firstValueFrom(this.httpService.get(url))

      if (!res || res.status != HttpStatusCode.Ok) {
        return false
      }

      console.log(res.data)

      return res.data.detected
    } catch (error) {
      console.error('Erro ao fazer requisição para FastAPI:', error)
    }
  }

  async detectCohere(text: string) {
    const url = `${this.config.get('detectApiUrl')}/detect/cohere/text?text_input=${encodeURIComponent(text)}`

    try {
      const res = await firstValueFrom(this.httpService.get(url))

      if (!res || res.status != HttpStatusCode.Ok) {
        return false
      }

      console.log(res.data)

      return res.data.detected
    } catch (error) {
      console.error('Erro ao fazer requisição para FastAPI:', error)
    }
  }
}
