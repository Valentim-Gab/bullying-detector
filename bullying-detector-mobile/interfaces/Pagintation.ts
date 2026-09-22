export interface Pagination<TDataItem> {
  data: TDataItem[]
  total: number
  page: number
  perPage: number
  lastPage: number
}
