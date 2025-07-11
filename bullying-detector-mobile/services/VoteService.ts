import { environment } from "@/environments/environment"
import axiosService from "./interceptors/AxiosService"
import { Vote } from "@/interfaces/Vote"
import { HttpStatusCode } from "axios"

export class VoteService {
  private readonly apiUrl = `${environment.apiUrl}/vote`

  async upsert(payload: Vote) {
    const res = await axiosService.post(this.apiUrl, payload)
    
    if (res.status != HttpStatusCode.Created) {
      throw new Error("Não foi possível cadastrar voto")
    }

    return res.data
  }
}
