import { environment } from '@/environments/environment'
import { User } from '@/interfaces/User'
import { HttpStatusCode } from 'axios'
import axiosService from './interceptors/AxiosService'

export class UserService {
  private readonly apiUrl = environment.apiUrl

  async getMe(): Promise<User | null> {
    const res = await axiosService(`${this.apiUrl}/user/@me`)
    
    if (!res || res.status != HttpStatusCode.Ok) {
      return null
    }

    return res.data
  }
}
