import { environment } from '@/environments/environment'
import { HarassmentPhrase } from '@/interfaces/HarassmentPhrase'
import { HttpStatusCode } from 'axios'
import axiosService from './interceptors/AxiosService'
import { DetectionData } from '@/interfaces/Detection'

export class DetectionService {
  private readonly apiUrl = `${environment.apiUrl}/detection`

  async detectAudio(recordCover: any): Promise<boolean> {
    const formData = new FormData()
    formData.append('record', recordCover)

    const res = await axiosService.post(
      `${this.apiUrl}/audio`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )

    if (!res || res.status != HttpStatusCode.Ok) {
      return false
    }

    return true
  }

  async detect(text: string): Promise<boolean> {
    const res = await axiosService.post(this.apiUrl, {
      text,
    })

    if (!res || res.status != HttpStatusCode.Ok) {
      return false
    }

    return true
  }

  async getAll(externalModule?: string): Promise<DetectionData[] | null> {
    const res = await axiosService(this.apiUrl, {
      params: {
        externalModule,
      }
    })

    if (!res || res.status != HttpStatusCode.Ok) {
      return null
    }

    return res.data
  }

  async get(id: number): Promise<DetectionData | null> {
    try {
      const res = await fetch(`${this.apiUrl}/${id}`)

      if (!res || !res.ok) {
        return null
      }

      const data = await res.json()

      return data
    } catch (error) {
      console.error(error)
      return null
    }
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
