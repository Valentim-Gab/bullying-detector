import { Injectable } from '@nestjs/common'
import { readdir, unlink, readFile } from 'fs-extra'
import { DefaultImageSaveStrategy } from './strategies/default-image-save.strategy'
import * as path from 'path'
import { ImageSave } from 'src/utils/image-util/image-save.interface'
import { FileConstants } from 'src/constants/file.constant'
import { existsSync } from 'fs'

@Injectable()
export class ImageUtil {
  private readonly rootDirectory = FileConstants.ROOT_DIRECTORY
  private saveStrategy: ImageSave

  constructor() {
    this.saveStrategy = new DefaultImageSaveStrategy(this)
  }

  setSaveStrategy(strategy: ImageSave) {
    this.saveStrategy = strategy
  }

  async save(
    multipartFile: Express.Multer.File,
    id: string | number,
    lastDir: string,
  ): Promise<string> {
    return this.saveStrategy.save(multipartFile, id, lastDir)
  }

  async get(imgName: string, lastDir: string) {
    try {
      const dir = path.join(this.rootDirectory, lastDir, imgName)
      const buffer = await readFile(dir)

      return Buffer.from(buffer)
    } catch (error) {
      throw error
    }
  }

  async deleteImage(dir: string, id: string): Promise<void> {
    try {
      if (existsSync(dir)) {
        const files = await readdir(dir)
        const filesToDelete = files.filter((image) =>
          image.includes(`id=${id}`),
        )

        for (const image of filesToDelete) {
          const imagePath = path.join(dir, image)

          await unlink(imagePath)
        }
      }
    } catch (error) {
      console.error('Error deleting images:', error)
    }
  }
}
