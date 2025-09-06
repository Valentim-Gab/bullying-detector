import { environment } from '@/environments/environment'
import { HttpStatusCode } from 'axios'
import { Detection, DetectionData } from '@/interfaces/Detection'
import axiosService from './interceptors/AxiosService'

export class DetectionService {
  private readonly apiUrl = `${environment.apiUrl}/detection`

  async detectAudio(recordCover: any): Promise<boolean> {
    const formData = new FormData()
    formData.append('audio', recordCover)

    await axiosService.post(`${this.apiUrl}/audio`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return true
  }

  async create(detection: Detection) {
    const res = await axiosService.post(this.apiUrl, detection)
    return res.data
  }

  async getAll(externalModule?: string): Promise<DetectionData[] | null> {
    const res = await axiosService(this.apiUrl, {
      params: {
        externalModule,
      },
    })

    return res.data
  }

  async find(id: number): Promise<DetectionData | null> {
    const res = await axiosService(`${this.apiUrl}/${id}`)
    return res.data
  }

  async findByExternal(
    id: number,
    module: string
  ): Promise<DetectionData | null> {
    const res = await axiosService(`${this.apiUrl}/${module}/${id}`)
    return res.data
  }
}
