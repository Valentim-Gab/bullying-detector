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
import { DetectionBaseDto } from './dto/detection-base.dto'
import { DetectionConstants } from 'src/constants/detection.constant'
import { DetectionHookDto } from './dto/detection-hook.dto'
import { DetectionBatchDto } from './dto/detection-batch.dto'

@Injectable()
export class DetectionService {
  constructor(
    private fileUtil: FileUtil,
    private prisma: PrismaService,
    private prismaUtil: PrismaUtil,
    private config: ConfigService,
    private httpService: HttpService,
  ) {}

  async transcribeAudio(file: Express.Multer.File) {
    const transcribedText = await this.fileUtil.transcribeAudio(file)

    return transcribedText
  }

  async buildDetection(
    detection: DetectionBaseDto,
    idUser?: number,
    filename?: string,
  ): Promise<Omit<Detection, 'idDetection'>> {
    // const [databaseResult, similarityResult] = await Promise.all([
    //   this.detectDatabase(detection.mainText),
    //   this.detectSimilarity(detection.mainText),
    // ])

    // const mistralResult = null
    // const cohereResult = null
    // const geminiResult = null

    const [
      mistralResult,
      cohereResult,
      geminiResult,
      collaborativeResult,
      similarityResult,
    ] = await Promise.all([
      null, // this.detectMistral(detection.mainText, detection.context),
      null, // this.detectCohere(detection.mainText, detection.context),
      null, // this.detectDeepSeek(detection.mainText, detection.context),
      null, // this.detectGemini(detection.mainText, detection.context),
      this.detectDatabase(detection.mainText),
      this.detectSimilarity(detection.mainText),
    ])

    // Cria array com IA que retornaram resultado
    const iaResults = [mistralResult, cohereResult, geminiResult].filter(
      (r) => r && r.detected === true,
    )

    // Se não detectou nenhuma IA, média = 0
    const iaAverage =
      iaResults.length > 0
        ? iaResults.reduce((acc, curr) => acc + (curr.avaliation ?? 0), 0) /
          iaResults.length
        : 0

    // Extras
    const collaborative =
      (collaborativeResult as SimpleDetection)?.classification ?? 0
    const similarity =
      (similarityResult as SimpleDetection)?.classification ?? 0
    const extras = collaborative + similarity

    // Limita máximo em 5
    const finalClassification = Math.min(
      iaAverage + extras,
      DetectionConstants.FINAL_CLASSIFICATION_MAX_VALUE,
    )

    const newDetection: Omit<Detection, 'idDetection'> = {
      recordingAudio: filename,
      mainText: detection.mainText,
      context: detection.context,
      detectorAi1Name: 'Mistral',
      detectorAi1Classification: mistralResult?.classification ?? null,
      detectorAi1Message: mistralResult?.message,
      detectorAi2Name: 'Cohere',
      detectorAi2Classification: cohereResult?.classification ?? null,
      detectorAi2Message: cohereResult?.message,
      detectorAi3Name: 'Gemini',
      detectorAi3Classification: geminiResult?.classification ?? null,
      detectorAi3Message: geminiResult?.message,
      detectorCollaborativeClassification: collaborative,
      detectorCollaborativeUserDetect:
        collaborativeResult?.collaborativeUserDetect ?? false,
      detectorCollaborativeUsersApprove: null,
      detectorCollaborativeUsersReject: null,
      detectorSimilarityClassification: similarity,
      finalClassification: finalClassification,
      idPhrase: collaborativeResult?.idPhrase ?? null,
      idUser: idUser,
      externalId: detection.external?.id ?? null,
      externalModule: detection.external?.module ?? null,
    }

    return newDetection
  }

  async save(detection: DetectionBaseDto, idUser?: number, filename?: string) {
    const newDetection = await this.buildDetection(detection, idUser, filename)

    return this.prismaUtil.performOperation(
      'Não foi possível realizar a detecção',
      async () => {
        const createdDetection = await this.prisma.detection.create({
          data: newDetection,
        })

        if (
          detection.hook &&
          detection.hook.hookUrl &&
          detection.hook.hookMethod &&
          detection.hook.hookFinalClassificationBodyKey
        ) {
          await this.updateExternalHook<Record<string, number>>(
            detection.hook,
            {
              [detection.hook.hookFinalClassificationBodyKey]:
                newDetection.finalClassification,
              [detection.hook.hookIdBodyKey || 'id']: detection.external.id,
            },
          )
        }

        return createdDetection
      },
    )
  }

  async saveBatch(detectionBatch: DetectionBatchDto, idUser?: number) {
    if (detectionBatch.detections.length > 80) {
      throw new BadRequestException(
        'O lote não pode conter mais que 80 detecções.',
      )
    }

    const newDetections = await Promise.all(
      detectionBatch.detections.map((detection) =>
        this.buildDetection(detection, idUser, undefined),
      ),
    )

    return this.prismaUtil.performOperation(
      'Não foi possível realizar a detecção',
      async () => {
        const createdDetection = await this.prisma.detection.createMany({
          data: newDetections,
        })

        if (
          detectionBatch.hook &&
          detectionBatch.hook.hookUrl &&
          detectionBatch.hook.hookMethod &&
          detectionBatch.hook.hookFinalClassificationBodyKey
        ) {
          const updateHookData = newDetections.map((d) => ({
            [detectionBatch.hook.hookFinalClassificationBodyKey]:
              d.finalClassification,
            [detectionBatch.hook.hookIdBodyKey || 'id']: d.externalId,
          }))

          await this.updateExternalHook<Array<Record<string, number>>>(
            detectionBatch.hook,
            updateHookData,
          )
        }

        return createdDetection
      },
    )
  }

  private async updateExternalHook<T>(hook: DetectionHookDto, data: T) {
    try {
      const res = await firstValueFrom(
        this.httpService.request({
          url: hook.hookUrl,
          method: hook.hookMethod,
          headers: {
            Authorization: hook.hookToken
              ? `Bearer ${hook.hookToken}`
              : undefined,
          },
          data: data,
        }),
      )

      return res.data
    } catch (error) {
      console.error('Erro ao chamar webhook:', error)
    }
  }

  async saveFile(file: Express.Multer.File, idUser: number) {
    const filename = await this.fileUtil.save(file, 'record')
    const transcribedText = await this.transcribeAudio(file)

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
      classification:
        result[0]?.bullying_Phrase || result[0]?.user_detect
          ? DetectionConstants.COLLABORATIVE_MAX_VALUE
          : 0,
      collaborativeUserDetect: result[0]?.user_detect ?? null,
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

  async detectGemini(
    text: string,
    context?: string,
  ): Promise<SimpleDetection | null> {
    let url = `${this.config.get('detectApiUrl')}/detect/gemini/text?text_input=${encodeURIComponent(text)}`

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
      console.error('Erro ao fazer requisição para FastAPI Gemini:', error)
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
      (detection.detectorCollaborativeUsersApprove ?? 0) + voteApprove,
      0,
    )
    const newReject = Math.max(
      (detection.detectorCollaborativeUsersReject ?? 0) + voteReject,
      0,
    )

    detection.detectorCollaborativeUsersApprove = newApprove
    detection.detectorCollaborativeUsersReject = newReject
    detection.detectorCollaborativeUserDetect = newApprove > 0 || newReject > 0

    if (
      detection.detectorCollaborativeClassification > 0 &&
      newApprove <= newReject
    ) {
      detection.finalClassification -=
        detection.detectorCollaborativeClassification
    }

    detection.detectorCollaborativeClassification =
      newApprove > newReject ? DetectionConstants.COLLABORATIVE_MAX_VALUE : 0

    const finalClassificarion = Math.min(
      detection.detectorCollaborativeClassification +
        detection.finalClassification,
      DetectionConstants.FINAL_CLASSIFICATION_MAX_VALUE,
    )

    return this.prisma.detection.update({
      where: { idDetection },
      data: {
        detectorCollaborativeUsersApprove:
          detection.detectorCollaborativeUsersApprove,
        detectorCollaborativeUsersReject:
          detection.detectorCollaborativeUsersReject,
        detectorCollaborativeUserDetect:
          detection.detectorCollaborativeUserDetect,
        detectorCollaborativeClassification:
          detection.detectorCollaborativeClassification,
        finalClassification: finalClassificarion,
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

  async deleteAll(): Promise<void> {
    await this.prisma.detection.deleteMany()
  }
}
