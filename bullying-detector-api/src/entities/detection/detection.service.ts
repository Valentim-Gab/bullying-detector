import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Detection } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'
import { FileUtil } from 'src/utils/file.util'
import { PrismaUtil } from 'src/utils/prisma.util'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { HttpStatusCode } from 'axios'
import { Response } from 'express'
import { SimpleDetection } from 'src/interfaces/detection.interface'
import { DetectionBaseDto } from './dto/detection-base-dto'

@Injectable()
export class DetectionService {
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

  async save(detection: DetectionBaseDto, idUser: number, filename?: string) {
    const databaseResult = await this.detectDatabase(detection.text)
    const similarityResult = await this.detectSimilarity(detection.context)
    const mistralResult = null // await this.detectMistral(mainText)
    const cohereResult = null // await this.detectCohere(mainText)
    const avaliation =
      mistralResult.avaliation +
      cohereResult +
      databaseResult.avaliation +
      similarityResult.avaliation

    const newDetection: Omit<Detection, 'idDetection'> = {
      recordingAudio: filename ?? '',
      mainText: detection.text,
      context: detection.context,
      mistralResult: mistralResult?.avaliatiion,
      mistralMessage: mistralResult?.message,
      cohereResult: cohereResult?.avaliatiion,
      cohereMessage: cohereResult?.message,
      databaseResult: databaseResult.avaliation,
      databaseUserDetect: databaseResult.databaseUserDetect,
      databaseUsersApprove: null,
      databaseUsersReject: null,
      similarityResult: similarityResult.avaliation,
      avaliation: avaliation,
      idPhrase: databaseResult.idPhrase ?? null,
      idUser: idUser,
      externalId: detection.externalId,
      externalModule: detection.externalModule,
    }

    return this.prismaUtil.performOperation(
      'Não foi possível realizar a detecção',
      async () => {
        const detection = await this.prisma.detection.create({
          data: newDetection,
        })

        return detection
      },
    )
  }

  async saveFile(file: Express.Multer.File, idUser: number) {
    const filename = await this.fileUtil.save(file, 'record')
    const transcribedText = await this.transcribeAudio(filename)
    const detection = {
      text: transcribedText,
    }

    return this.save(detection, idUser, filename)
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

  async detectDatabase(text: string): Promise<SimpleDetection | null> {
    const result = await this.prisma.$queryRaw` 
      SELECT 
        CASE WHEN EXISTS (
          SELECT 1
          FROM BULLYING_PHRASE
          WHERE ${text} ILIKE CONCAT('%', phrase, '%')
        ) THEN TRUE
        ELSE FALSE
        END AS BULLYING_PHRASE, USER_DETECT, ID_PHRASE
      FROM BULLYING_PHRASE
      WHERE ${text} ILIKE CONCAT('%', phrase, '%')
      LIMIT 1;
    `

    return {
      detected: result[0]?.bullying_Phrase ?? false,
      avaliation:
        result[0]?.bullying_Phrase || result[0]?.user_detect ? 0.5 : 0,
      databaseUserDetect: result[0]?.user_detect ?? null,
      idPhrase: result[0]?.id_phrase,
    }
  }

  async detectSimilarity(text: string): Promise<SimpleDetection | null> {
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

  async detectMistral(
    text: string,
    context?: string,
  ): Promise<SimpleDetection | null> {
    let url = `${this.config.get('detectApiUrl')}/detect/mistral/text?text_input=${encodeURIComponent(text)}`

    if (context) {
      url += `&context_input=${encodeURIComponent(context)}`
    }

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

  async detectCohere(
    text: string,
    context?: string,
  ): Promise<SimpleDetection | null> {
    let url = `${this.config.get('detectApiUrl')}/detect/cohere/text?text_input=${encodeURIComponent(text)}`

    if (context) {
      url += `&context_input=${encodeURIComponent(context)}`
    }

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

  async updateVote(
    voteApprove: number,
    voteReject: number,
    idDetection: number,
  ) {
    const detection = await this.getOne(idDetection)

    if (!detection) {
      throw new BadRequestException('Detecção não encontrada')
    }

    const newApprove = Math.max(
      (detection.databaseUsersApprove ?? 0) + voteApprove,
      0,
    )
    const newReject = Math.max(
      (detection.databaseUsersReject ?? 0) + voteReject,
      0,
    )

    detection.databaseUsersApprove = newApprove
    detection.databaseUsersReject = newReject
    detection.databaseUserDetect = newApprove > 0 || newReject > 0

    return this.prisma.detection.update({
      where: { idDetection },
      data: {
        databaseUsersApprove: detection.databaseUsersApprove,
        databaseUsersReject: detection.databaseUsersReject,
        databaseUserDetect: detection.databaseUserDetect,
      },
    })
  }
}
