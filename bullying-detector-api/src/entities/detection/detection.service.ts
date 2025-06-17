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
import { DetectionConstants } from 'src/constants/detection.constant'

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

    console.log('Transcribed text:', transcribedText)

    return transcribedText
  }

  async save(detection: DetectionBaseDto, idUser?: number, filename?: string) {
    console.log('detection', detection)
    const databaseResult = await this.detectDatabase(detection.mainText)
    console.log('databaseResult', databaseResult)
    const similarityResult = await this.detectSimilarity(detection.mainText)
    console.log('similarityResult', similarityResult)

    // const mistralResult = await this.detectMistral(
    //   detection.mainText,
    //   detection.context,
    // )
    // const cohereResult = await this.detectCohere(
    //   detection.mainText,
    //   detection.context,
    // )
    // const deepSeekResult = await this.detectDeepSeek(
    //   detection.mainText,
    //   detection.context,
    // )

    const mistralResult = null
    const cohereResult = null
    const deepSeekResult = null

    console.log('mistralResult', mistralResult)
    console.log('cohereResult', cohereResult)
    console.log('deepSeekResult', deepSeekResult)

    // Cria array com IA que retornaram resultado
    const iaResults = [mistralResult, cohereResult, deepSeekResult].filter(
      (r) => r && r.detected === true,
    )

    // Se não detectou nenhuma IA, média = 0
    const iaAverage =
      iaResults.length > 0
        ? iaResults.reduce((acc, curr) => acc + (curr.avaliation ?? 0), 0) /
          iaResults.length
        : 0

    // Extras
    const database = databaseResult?.avaliation ?? 0
    const similarity = similarityResult?.avaliation ?? 0
    const extras = database + similarity

    // Limita máximo em 5
    const avaliation = Math.min(
      iaAverage + extras,
      DetectionConstants.AVALIATION_MAX_VALUE,
    )

    const newDetection: Omit<Detection, 'idDetection'> = {
      recordingAudio: filename,
      mainText: detection.mainText,
      context: detection.context,
      mistralResult: mistralResult?.avaliation ?? null,
      mistralMessage: mistralResult?.message,
      cohereResult: cohereResult?.avaliation ?? null,
      cohereMessage: cohereResult?.message,
      deepseekResult: deepSeekResult?.avaliation ?? null,
      deepseekMessage: deepSeekResult?.message,
      databaseResult: databaseResult.avaliation ?? null,
      databaseUserDetect: databaseResult.databaseUserDetect,
      databaseUsersApprove: null,
      databaseUsersReject: null,
      similarityResult: similarityResult?.avaliation ?? null,
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
      mainText: transcribedText,
    }

    return this.save(detection, idUser, filename)
  }

  async findAll(externalModule?: string) {
    const moduleFilter = externalModule
      ? {
          equals: externalModule,
          mode: 'insensitive' as const,
        }
      : null

    return this.prismaUtil.performOperation(
      'Não foi possível listar as detecções',
      async () => {
        const detections = await this.prisma.detection.findMany({
          where: {
            externalModule: moduleFilter,
          },
          orderBy: { idDetection: 'desc' },
        })

        return detections
      },
    )
  }

  async findById(id: number): Promise<Detection | null> {
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

  async findByExternal(externalId: number, externalModule: string) {
    return this.prismaUtil.performOperation(
      'Não foi possível encontrar a detecção',
      async () => {
        const detection = await this.prisma.detection.findFirst({
          where: {
            externalId,
            externalModule: {
              equals: externalModule,
              mode: 'insensitive',
            },
          },
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
          AND IS_BULLYING
        ) THEN TRUE
        ELSE FALSE
        END AS BULLYING_PHRASE, USER_DETECT, ID_PHRASE
      FROM BULLYING_PHRASE
      WHERE ${text} ILIKE CONCAT('%', phrase, '%')
      AND IS_BULLYING
      LIMIT 1;
    `

    return {
      detected: result[0]?.bullying_Phrase ?? false,
      avaliation:
        result[0]?.bullying_Phrase || result[0]?.user_detect
          ? DetectionConstants.DATABASE_MAX_VALUE
          : 0,
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

  async detectDeepSeek(
    text: string,
    context?: string,
  ): Promise<SimpleDetection | null> {
    let url = `${this.config.get('detectApiUrl')}/detect/openrouter/text?text_input=${encodeURIComponent(text)}`

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
    idDetection: number,
    voteApprove: number,
    voteReject: number,
  ): Promise<Detection> {
    const detection = await this.findById(idDetection)

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

    if (detection.databaseResult > 0 && newApprove <= newReject) {
      detection.avaliation -= detection.databaseResult
    }

    detection.databaseResult =
      newApprove > newReject ? DetectionConstants.DATABASE_MAX_VALUE : 0

    const avaliation = Math.min(
      detection.databaseResult + detection.avaliation,
      DetectionConstants.AVALIATION_MAX_VALUE,
    )

    return this.prisma.detection.update({
      where: { idDetection },
      data: {
        databaseUsersApprove: detection.databaseUsersApprove,
        databaseUsersReject: detection.databaseUsersReject,
        databaseUserDetect: detection.databaseUserDetect,
        databaseResult: detection.databaseResult,
        avaliation: avaliation,
      },
    })
  }

  async updateIdPhrase(
    idDetection: number,
    idPhrase: number | null,
  ): Promise<Detection> {
    return this.prisma.detection.update({
      where: { idDetection },
      data: {
        idPhrase: idPhrase,
      },
    })
  }
}
