export interface ImageSave {
  save(
    multipartFile: Express.Multer.File,
    id: string | number,
    lastDir: string,
  ): Promise<string>
}
