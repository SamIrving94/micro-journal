'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, Save, Check, Bell, Mail } from 'lucide-react'
import { getUser } from '@/lib/supabase/client'
import { getUserSettings, updateUserSettings } from '@/lib/services/settings'
import { UserSettings } from '@/lib/types/settings'

export default function SettingsPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    sms: false,
    whatsapp: false,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const { user, error: userError } = await getUser()
      if (userError || !user) {
        router.push('/auth/signin')
        return
      }

      const { data, error } = await getUserSettings(user.id)
      if (error) throw error

      if (data) {
        setPhoneNumber(data.phone_number || '')
        setNotificationPreferences(data.notification_preferences)
      }
    } catch (err) {
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const { user, error: userError } = await getUser()
      if (userError || !user) {
        router.push('/auth/signin')
        return
      }

      const { error } = await updateUserSettings(user.id, {
        phone_number: phoneNumber,
        notification_preferences: notificationPreferences,
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

      {error && (
        <div className="p-3 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 mb-6 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center">
          <Check className="w-4 h-4 mr-2" />
          Settings saved successfully
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp Integration</h2>
        <p className="text-gray-600 mb-4">
          Connect your WhatsApp number to journal by sending messages or voice notes.
        </p>

        <div className="space-y-4">
          <div className="relative">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="+1234567890"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Include your country code (e.g., +1 for US, +44 for UK)
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
        <p className="text-gray-600 mb-4">
          Choose how you'd like to receive notifications about your journal entries.
        </p>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="email-notifications"
              type="checkbox"
              checked={notificationPreferences.email}
              onChange={(e) =>
                setNotificationPreferences({
                  ...notificationPreferences,
                  email: e.target.checked,
                })
              }
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="email-notifications" className="ml-3 flex items-center">
              <Mail className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">Email Notifications</span>
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="sms-notifications"
              type="checkbox"
              checked={notificationPreferences.sms}
              onChange={(e) =>
                setNotificationPreferences({
                  ...notificationPreferences,
                  sms: e.target.checked,
                })
              }
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="sms-notifications" className="ml-3 flex items-center">
              <Phone className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">SMS Notifications</span>
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="whatsapp-notifications"
              type="checkbox"
              checked={notificationPreferences.whatsapp}
              onChange={(e) =>
                setNotificationPreferences({
                  ...notificationPreferences,
                  whatsapp: e.target.checked,
                })
              }
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="whatsapp-notifications" className="ml-3 flex items-center">
              <Bell className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">WhatsApp Notifications</span>
            </label>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? (
          'Saving...'
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </>
        )}
      </button>
    </div>
  )
} 