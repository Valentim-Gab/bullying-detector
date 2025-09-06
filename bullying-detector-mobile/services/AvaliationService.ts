import { environment } from '@/environments/environment'
import { Avaliation } from '@/interfaces/Avaliation'
import axiosService from './interceptors/AxiosService'

export class AvaliationService {
  private readonly apiUrl = environment.apiUrl

  async getAll(): Promise<Avaliation[] | null> {
    const res = await axiosService(`${this.apiUrl}/avaliation`)
    return res.data
  }
}
