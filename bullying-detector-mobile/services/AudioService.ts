import { environment } from '@/environments/environment'
import { AudioDetect } from '@/interfaces/Audio'
import { HarassmentPhrase } from '@/interfaces/HarassmentPhrase'
import { HttpStatusCode } from 'axios'
import axiosService from './interceptors/AxiosService'

export class AudioService {
  private readonly apiUrl = environment.apiUrl

  async detect(recordCover: any): Promise<boolean> {
    const formData = new FormData()
    formData.append('record', recordCover)

    const res = await axiosService.post(
      `${this.apiUrl}/audio/detect`,
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

  async detectText(text: string): Promise<boolean> {
    console.log(text)

    const res = await axiosService.post(`${this.apiUrl}/audio/detect/text`, {
      text,
    })

    console.log(res.data)

    if (!res || res.status != HttpStatusCode.Ok) {
      return false
    }

    return true
  }

  async getAll(): Promise<AudioDetect[] | null> {
    const res = await axiosService(`${this.apiUrl}/audio`)

    if (!res || res.status != HttpStatusCode.Ok) {
      return null
    }

    return res.data
  }

  async get(id: number): Promise<AudioDetect | null> {
    try {
      const res = await fetch(`${this.apiUrl}/audio/${id}`)

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

  async saveHarassmentPhrase(phrase: HarassmentPhrase): Promise<boolean> {
    try {
      const res = await fetch(`${this.apiUrl}/harassment-phrase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(phrase),
      })

      if (!res || !res.ok) {
        return false
      }

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async updateHarassmentPhrase(
    phrase: Omit<HarassmentPhrase, 'phrase'>,
    id: number
  ): Promise<boolean> {
    try {
      const res = await fetch(`${this.apiUrl}/harassment-phrase/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(phrase),
      })

      if (!res || !res.ok) {
        return false
      }

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }
}
