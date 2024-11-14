import { Injectable } from '@nestjs/common'
import { exec } from 'child_process'
import { randomUUID } from 'crypto'
import { createWriteStream } from 'fs'
import { ensureDir, readFile } from 'fs-extra'
import { extname } from 'path'
import { FileConstants } from 'src/constants/file.constant'

@Injectable()
export class FileUtil {
  private readonly rootDirectory = FileConstants.ROOT_DIRECTORY

  constructor() {}

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

  async transcribeAudio(filename: string) {
    const audioPath = `${this.rootDirectory}/record/${filename}`

    try {
      const rootDirectory = 'src\\utils\\python\\dist'
      const command = `${rootDirectory}\\transcribeAudio.exe "${audioPath}"`

      return await new Promise<string>((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error('Erro no comando:', stderr)
            reject(new Error('Erro ao transcrever o áudio.'))
          } else {
            resolve(stdout.trim())
          }
        })
      })
    } catch (error) {
      console.error('Erro ao transcrever áudio:', error)
      throw error
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
