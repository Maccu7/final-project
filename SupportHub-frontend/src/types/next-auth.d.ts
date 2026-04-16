import type { JWT as NextAuthJWT } from "next-auth/jwt"
import { Client } from '@/types/auth'

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image: string | null
      role: string
      token: string
      accessToken: string
      provider: string
      providerId: string
      emailVerified?: Date | null
      client?: Client
    }
  }

  interface User {
    id: string
    name: string
    email: string
    image?: string | null
    role: string
    token?: string
    accessToken?: string
    provider: string
    providerId: string
    firstName?: string
    lastName?: string
    emailVerified?: Date | null
  }
  interface JWT extends NextAuthJWT {
    id: string
    name: string
    email: string
    role: string
    token: string
    accessToken: string
    provider: string
    providerId: string
    picture?: string | null
  }


export interface ExtendedUser extends User {
  firstName?: string
  lastName?: string
  provider?: string
  providerId?: string
  accessToken?: string
}
}
