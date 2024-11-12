import { Environment } from '@/environments/environment'
import { AudioDetect } from '@/interfaces/Audio'

export class AudioService {
  private readonly apiUrl = Environment.apiUrl

  async transcribeAudio(recordCover: any): Promise<boolean> {
    try {
      const formData = new FormData()
      formData.append('record', recordCover)

      const res = await fetch(`${this.apiUrl}/audio/detect`, {
        method: 'POST',
        body: formData,
      })

      if (!res || !res.ok) {
        return false
      }

      return true
    } catch (error) {
      return false
    }
  }

  async getAll(): Promise<AudioDetect[] | null> {
    try {
      const res = await fetch(`${this.apiUrl}/audio`)

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
}
