export interface User {
  id?: number
  name: string
  lastName?: string
  email: string
  dateBirth?: string | Date
  phoneNumber?: string
  avatar?: string
  verifiedEmail: boolean
  role: string[]
}
