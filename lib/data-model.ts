// 用户数据模型
export interface TwitterSocial {
  scope: string[]
  _id: string
  twitter_id: string
  __v: number
  access_token: string
  created_at: string
  displayName: string
  expiresIn: string
  refresh_token: string
  updated_at: string
  user_id: string
  username: string
}

export interface DiscordSocial {
  _id: string
  discord_id: string
  __v: number
  accent_color: number
  access_token: string
  avatar: string
  avatar_decoration_data: null
  banner: null
  banner_color: string
  clan: null
  created_at: string
  discriminator: string
  email: string
  fetchedAt: string
  flags: number
  global_name: string
  locale: string
  mfa_enabled: boolean
  premium_type: number
  public_flags: number
  refresh_token: string
  updated_at: string
  username: string
  verified: boolean
  user_id: string
}

export interface TelegramSocial {
  _id: string
  telegram_id: string
  __v: number
  auth_date: string
  created_at: string
  first_name: string
  last_name: string
  photo_url: string
  updated_at: string
  username: string
  photos: any[]
  user_id: string
}

export interface Social {
  wallet_address: string
  twitter?: TwitterSocial
  discord?: DiscordSocial
  telegram?: TelegramSocial
}

export interface TelegramAuth {
  identity: string
}

export interface Auth {
  telegram?: TelegramAuth
}

export interface User {
  userId: string
  avatar: string
  nickName: string
  description: string
  email: string
  interestedTags: string[]
  handler: string
  social: Social
  lastLoginTime: string
  createdAt: string
  humanVerify: boolean
  registerTime: string
  language: string
  auth: Auth
  isAdmin: boolean
}
