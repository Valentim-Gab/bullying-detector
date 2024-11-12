import { randomUUID } from 'crypto'
import { createWriteStream } from 'fs'
import { ensureDir } from 'fs-extra'
import { extname } from 'path'
import { ImageUtil } from '../image.util'
import { exec } from 'child_process'
import { Injectable } from '@nestjs/common'
import { ImageSave } from 'src/utils/image-util/image-save.interface'
import { FileConstants } from 'src/constants/file.constant'

@Injectable()
export class CompressImageSaveStrategy implements ImageSave {
  private readonly rootDirectory = FileConstants.ROOT_DIRECTORY

  constructor(private imageUtil: ImageUtil) {}

  async save(
    multipartFile: Express.Multer.File,
    id: string,
    lastDir: string,
  ): Promise<string> {
    const dir = `${this.rootDirectory}/${lastDir}`

    try {
      const filename = multipartFile.originalname
      const fileExternsion = extname(filename)
      const uuid = randomUUID()
      const newFileName = `id=${id}-${lastDir}=${uuid}${fileExternsion}`

      this.imageUtil.deleteImage(dir, id)
      await ensureDir(dir)

      const writeStream = createWriteStream(`${dir}/${newFileName}`)

      writeStream.write(multipartFile.buffer)
      writeStream.end()
      this.compressImage(`${dir}/${newFileName}`)

      return newFileName
    } catch (error) {
      throw error
    }
  }

  async compressImage(imagePath: string): Promise<void> {
    try {
      const rootDirectory = 'src\\utils\\python\\dist'
      const command = `${rootDirectory}\\compressImage.exe ${imagePath}`

      await new Promise<void>((resolve, reject) => {
        exec(command, (error) => {
          if (error) reject(new Error('Erro ao comprimir a imagem.'))
          else resolve()
        })
      })
    } catch (error) {
      throw error
    }
  }
}
