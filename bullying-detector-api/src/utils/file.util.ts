import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpStatusCode } from 'axios'
import { randomUUID } from 'crypto'
import { createWriteStream } from 'fs'
import { ensureDir, readFile } from 'fs-extra'
import { extname } from 'path'
import { firstValueFrom } from 'rxjs'
import { FileConstants } from 'src/constants/file.constant'
import * as FormData from 'form-data'

@Injectable()
export class FileUtil {
  private readonly rootDirectory = FileConstants.ROOT_DIRECTORY

  constructor(
    private config: ConfigService,
    private httpService: HttpService,
  ) {}

  async save(
    multipartFile: Express.Multer.File,
    destination: string,
    newFilename?: string,
  ): Promise<string> {
    const dir = `${this.rootDirectory}/${destination}`

    try {
      const filename = multipartFile.originalname
      const fileExternsion = extname(filename)
      const uuid = randomUUID()
      const newFileName =
        newFilename ?? `${destination}=${uuid}${fileExternsion}`

      await ensureDir(dir)

      const writeStream = createWriteStream(`${dir}/${newFileName}`)

      writeStream.write(multipartFile.buffer)
      writeStream.end()

      return newFileName
    } catch (error) {
      throw error
    }
  }

  // async transcribeAudio(filename: string) {
  //   const audioPath = `${this.rootDirectory}/record/${filename}`

  //   try {
  //     const rootDirectory = 'src\\utils\\python\\dist'
  //     const command = `${rootDirectory}\\transcribeAudio.exe "${audioPath}"`

  //     return await new Promise<string>((resolve, reject) => {
  //       exec(command, (error, stdout, stderr) => {
  //         if (error) {
  //           console.error('Erro no comando:', stderr)
  //           reject(new Error('Erro ao transcrever o áudio.'))
  //         } else {
  //           resolve(stdout.trim())
  //         }
  //       })
  //     })
  //   } catch (error) {
  //     console.error('Erro ao transcrever áudio:', error)
  //     throw error
  //   }
  // }

  async transcribeAudio(file: Express.Multer.File): Promise<string> {
    try {
      const formData = new FormData()

      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      })

      const headers = formData.getHeaders()

      const res = await firstValueFrom(
        this.httpService.post(
          `${this.config.get('detectApiUrl')}/transcribe-audio`,
          formData,
          { headers },
        ),
      )

      const data = res.data

      if (res.status !== HttpStatusCode.Ok && res.status !== 200) {
        throw new Error(data.message || 'Erro ao transcrever áudio')
      }

      return data.text || ''
    } catch (error) {
      console.error('Erro ao fazer requisição para FastAPI:', error)
      return ''
    }
  }

  async getRecord(filename: string) {
    const audioPath = `${this.rootDirectory}/record/${filename}`

    try {
      const buffer = await readFile(audioPath)

      return Buffer.from(buffer)
    } catch (error) {
      throw error
    }
  }
}
