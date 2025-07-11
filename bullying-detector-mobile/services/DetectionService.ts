import { environment } from '@/environments/environment'
import { HttpStatusCode } from 'axios'
import { Detection, DetectionData } from '@/interfaces/Detection'
import axiosService from './interceptors/AxiosService'

export class DetectionService {
  private readonly apiUrl = `${environment.apiUrl}/detection`

  async detectAudio(recordCover: any): Promise<boolean> {
    const formData = new FormData()
    formData.append('audio', recordCover)

    const res = await axiosService.post(`${this.apiUrl}/audio`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (!res || res.status != HttpStatusCode.Created) {
      return false
    }

    return true
  }

  async create(detection: Detection) {
    const res = await axiosService.post(this.apiUrl, detection)

    if (!res || res.status != HttpStatusCode.Created) {
      throw new Error('Erro ao realizar detecção')
    }

    return res.data
  }

  async getAll(externalModule?: string): Promise<DetectionData[] | null> {
    const res = await axiosService(this.apiUrl, {
      params: {
        externalModule,
      },
    })

    if (!res || res.status != HttpStatusCode.Ok) {
      return null
    }

    return res.data
  }

  async find(id: number): Promise<DetectionData | null> {
    const res = await axiosService(`${this.apiUrl}/${id}`)

    if (res.status != HttpStatusCode.Ok) {
      throw new Error('Erro ao buscar detecção')
    }

    return res.data
  }

  async findByExternal(
    id: number,
    module: string
  ): Promise<DetectionData | null> {
    const res = await axiosService(`${this.apiUrl}/${module}/${id}`)

    if (res.status != HttpStatusCode.Ok) {
      throw new Error('Erro ao buscar detecção por módulo externo')
    }

    return res.data
  }

  // async saveHarassmentPhrase(phrase: HarassmentPhrase): Promise<boolean> {
  //   try {
  //     const res = await fetch(`${this.apiUrl}/harassment-phrase`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(phrase),
  //     })

  //     if (!res || !res.ok) {
  //       return false
  //     }

  //     return true
  //   } catch (error) {
  //     console.error(error)
  //     return false
  //   }
  // }

  //   async updateHarassmentPhrase(
  //     phrase: Omit<HarassmentPhrase, 'phrase'>,
  //     id: number
  //   ): Promise<boolean> {
  //     try {
  //       const res = await fetch(`${this.apiUrl}/harassment-phrase/${id}`, {
  //         method: 'PATCH',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify(phrase),
  //       })

  //       if (!res || !res.ok) {
  //         return false
  //       }

  //       return true
  //     } catch (error) {
  //       console.error(error)
  //       return false
  //     }
  //   }
}
