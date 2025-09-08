import { environment } from '@/environments/environment'
import { Avaliation } from '@/interfaces/Avaliation'
import axiosService from './interceptors/AxiosService'
import { Pagination } from '@/interfaces/Pagintation'

export class AvaliationService {
  private readonly apiUrl = environment.apiUrl

  async getAll(): Promise<Avaliation[] | null> {
    const res = await axiosService(`${this.apiUrl}/avaliation`)
    return res.data
  }

  async getAllPagination(
    page: number,
    perPage: number,
    search: string,
    detected?: boolean
  ): Promise<Pagination<Avaliation> | null> {
    const res = await axiosService(`${this.apiUrl}/avaliation/pagination`, {
      params: {
        page,
        perPage,
        search,
        detected,
      },
    })

    return res.data
  }
}
