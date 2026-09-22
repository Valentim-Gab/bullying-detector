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
    const fail = {
      detected: false,
      classification: 0,
      message: 'Falha na detecção',
    }

    const [
      mistralResult,
      cohereResult,
      geminiResult,
      collaborativeResult,
      similarityResult,
    ] = await Promise.all([
      // this.detectMistral(detection.mainText, detection.context),
      // this.detectCohere(detection.mainText, detection.context),
      // this.detectGemini(detection.mainText, detection.context),
      fail,
      fail,
      fail,
      this.detectDatabase(detection.mainText),
      this.detectSimilarity(detection.mainText),
    ])

    const iaResults = [mistralResult, cohereResult, geminiResult].filter(
      (result) => result?.detected === true,
    )

    const iaAverage =
      iaResults.length > 0
        ? iaResults.reduce(
            (acc, result) => acc + (result.classification ?? 0),
            0,
          ) / iaResults.length
        : 0

    const collaborativeUserDetect =
      collaborativeResult?.collaborativeUserDetect ?? false

    const collaborative =
      collaborativeUserDetect && collaborativeResult?.classification != null
        ? collaborativeResult.classification
        : null

    const similarity =
      (similarityResult as SimpleDetection)?.classification ?? null

    let finalClassification = iaAverage

    if (collaborativeUserDetect && collaborative != null) {
      finalClassification = collaborative
    } else if (iaResults.length === 0) {
      finalClassification = similarity ?? 0
    }

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
      detectorCollaborativeUserDetect: collaborativeUserDetect,
      detectorCollaborativeUsersApprove: null,
      detectorCollaborativeUsersReject: null,

      detectorSimilarityClassification: similarity,

      finalClassification,

      idPhrase: collaborativeResult?.idPhrase ?? null,
      idUser,
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
    console.log('Detections to process:', detectionBatch.detections.length)

    if (detectionBatch.detections.length > 2000) {
      throw new BadRequestException(
        'O lote não pode conter mais que 2000 detecções.',
      )
    }

    const chunkSize = 50
    const allCreatedDetections: any[] = []

    // Processa cada lote em uma transação separada
    for (let i = 0; i < detectionBatch.detections.length; i += chunkSize) {
      const chunk = detectionBatch.detections.slice(i, i + chunkSize)

      // Monta as detecções do grupo
      const chunkDetections = await Promise.all(
        chunk.map((detection) =>
          this.buildDetection(detection, idUser, undefined),
        ),
      )

      // Salva o grupo no banco dentro de uma transação curta
      await this.prismaUtil.performOperation(
        `Erro ao salvar lote ${i / chunkSize + 1}`,
        async () => {
          await this.prisma.detection.createMany({
            data: chunkDetections,
          })
        },
        60_000,
      )

      allCreatedDetections.push(...chunkDetections)
      console.log(
        `✅ Lote ${i / chunkSize + 1} salvo com ${chunkDetections.length} registros`,
      )
    }

    // Executa hook externo (se configurado)
    if (
      detectionBatch.hook &&
      detectionBatch.hook.hookUrl &&
      detectionBatch.hook.hookMethod &&
      detectionBatch.hook.hookFinalClassificationBodyKey
    ) {
      const updateHookData = allCreatedDetections.map((d) => ({
        [detectionBatch.hook.hookFinalClassificationBodyKey]:
          d.finalClassification,
        [detectionBatch.hook.hookIdBodyKey || 'id']: d.externalId,
      }))

      await this.prismaUtil.performOperation(
        'Erro ao atualizar hook externo',
        async () => {
          await this.updateExternalHook<Array<Record<string, number>>>(
            detectionBatch.hook,
            updateHookData,
          )
        },
      )
    }

    return { totalSaved: allCreatedDetections.length }
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
    const result = await this.prisma.$queryRaw<
      {
        bullying_phrase: boolean
        user_detect: boolean | null
        id_phrase: number | null
        final_classification: number | null
      }[]
    >`
    SELECT
      TRUE AS bullying_phrase,
      bp.user_detect,
      bp.id_phrase,
      (
        SELECT d.final_classification
        FROM DETECTION d
        WHERE d.id_phrase = bp.id_phrase
          AND d.final_classification IS NOT NULL
        ORDER BY d.id_detection DESC
        LIMIT 1
      ) AS final_classification
    FROM BULLYING_PHRASE bp
    WHERE ${text} ILIKE CONCAT('%', bp.phrase, '%')
      AND bp.is_bullying
    LIMIT 1;
  `

    const detection = result[0]

    if (!detection) {
      return null
    }

    const collaborativeUserDetect = detection.user_detect ?? false

    return {
      detected: true,
      classification: collaborativeUserDetect
        ? detection.final_classification
        : 0,
      collaborativeUserDetect,
      idPhrase: detection.id_phrase,
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

  async updateVote(idDetection: number): Promise<Detection> {
    const detection = await this.findById(idDetection)

    if (!detection) {
      throw new BadRequestException('Detecção não encontrada')
    }

    const votes = await this.prisma.vote.findMany({
      where: {
        detectionId: idDetection,
        voteClassification: {
          not: null,
        },
      },
      select: {
        voteClassification: true,
      },
    })

    const classifications = votes
      .map((vote) => vote.voteClassification)
      .filter(
        (classification): classification is number => classification !== null,
      )

    const collaborativeClassification =
      classifications.length > 0
        ? classifications.reduce(
            (sum, classification) => sum + classification,
            0,
          ) / classifications.length
        : null

    const finalClassification =
      collaborativeClassification ?? detection.finalClassification

    return this.prisma.detection.update({
      where: {
        idDetection,
      },
      data: {
        detectorCollaborativeClassification: collaborativeClassification,
        detectorCollaborativeUserDetect: classifications.length > 0,
        detectorCollaborativeUsersApprove: null,
        detectorCollaborativeUsersReject: null,
        finalClassification,
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
