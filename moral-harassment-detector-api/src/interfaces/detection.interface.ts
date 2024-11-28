export interface Detection {
  detected: boolean
  message?: string
  userDetect?: boolean
  approveUserList?: string[]
  rejectUserList?: string[]
  idPhrase?: number
}
