import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Detection } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'
import { FileUtil } from 'src/utils/file.util'
import { PrismaUtil } from 'src/utils/prisma.util'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { HttpStatusCode } from 'axios'
import { Detection as IDetection } from 'src/interfaces/detection.interface'
import { Response } from 'express'

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

    return transcribedText
  }

  async save(file: Express.Multer.File) {
    const filename = await this.fileUtil.save(file, 'record')
    const transcribedText = await this.transcribeAudio(filename)
    const databaseResult = await this.detectDatabase(transcribedText)
    const similarityResult = await this.detectSimilarity(transcribedText)
    const mistralResult = null // await this.detectMistral(transcribedText)
    const cohereResult = null // await this.detectCohere(transcribedText)
    const newDetection: Omit<Detection, 'idDetection'> = {
      recordingAudio: filename,
      recordingTranscribed: transcribedText,
      mistralResult: mistralResult.detected ?? false,
      mistralMessage: mistralResult.message,
      cohereResult: cohereResult.detected ?? false,
      cohereMessage: cohereResult.message,
      databaseResult: databaseResult.detected ?? false,
      databaseUsername: databaseResult.username,
      similarityResult: similarityResult.detected ?? false,
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

  async detectDatabase(text: string): Promise<IDetection | null> {
    const result = await this.prisma.$queryRaw` 
      SELECT 
        CASE WHEN EXISTS (
          SELECT 1
          FROM harassment_phrase
          WHERE ${text} ILIKE CONCAT('%', phrase, '%')
        ) THEN TRUE
        ELSE FALSE
        END AS harassment_detected,
        USERNAME
      FROM harassment_phrase
      WHERE ${text} ILIKE CONCAT('%', phrase, '%')
      LIMIT 1;
    `

    return {
      detected: result[0]?.harassment_detected ?? false,
      username: result[0]?.username ?? null,
    }
  }

  async detectSimilarity(text: string): Promise<IDetection | null> {
    const url = `${this.config.get('detectApiUrl')}/detect/similarity/embeddings?text_input=${encodeURIComponent(text)}`

    try {
      const res = await firstValueFrom(this.httpService.get(url))

      if (!res || res.status != HttpStatusCode.Ok) {
        return null
      }

      return res.data
    } catch (error) {
      console.error('Erro ao fazer requisição para FastAPI:', error)
    }
  }

  async detectMistral(text: string): Promise<IDetection | null> {
    const url = `${this.config.get('detectApiUrl')}/detect/mistral/text?text_input=${encodeURIComponent(text)}`

    try {
      const res = await firstValueFrom(this.httpService.get(url))

      if (!res || res.status != HttpStatusCode.Ok) {
        return null
      }

      return res.data
    } catch (error) {
      console.error('Erro ao fazer requisição para FastAPI:', error)
    }
  }

  async detectCohere(text: string): Promise<IDetection | null> {
    const url = `${this.config.get('detectApiUrl')}/detect/cohere/text?text_input=${encodeURIComponent(text)}`

    try {
      const res = await firstValueFrom(this.httpService.get(url))

      if (!res || res.status != HttpStatusCode.Ok) {
        return null
      }

      return res.data
    } catch (error) {
      console.error('Erro ao fazer requisição para FastAPI:', error)
    }
  }

  async download(filename: string, res: Response) {
    try {
      const bytes = await this.fileUtil.getRecord(filename)

      res.setHeader('Content-Type', 'audio/mpeg')
      res.send(bytes)
    } catch (error) {
      throw new BadRequestException(`Gravação não encontrada`)
    }
  }
}
