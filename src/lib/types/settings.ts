export interface UserSettings {
  id: string
  user_id: string
  phone_number: string | null
  notification_preferences: {
    email: boolean
    sms: boolean
    whatsapp: boolean
  }
  created_at: string
  updated_at: string
}

export interface UserSettingsInput {
  user_id: string
  phone_number?: string
  notification_preferences?: {
    email?: boolean
    sms?: boolean
    whatsapp?: boolean
  }
}

export interface UserSettingsUpdate {
  phone_number?: string
  notification_preferences?: {
    email?: boolean
    sms?: boolean
    whatsapp?: boolean
  }
}

export interface UserSettingsResponse {
  data: UserSettings | null
  error: Error | null
} 