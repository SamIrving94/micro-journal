import { redirect } from 'next/navigation'

export default async function Home() {
  // You can add authentication check here
  const isAuthenticated = false // Replace with your actual auth check
  
  if (!isAuthenticated) {
    redirect('/auth/signup')
  }

  // If authenticated, check if onboarding is completed
  const hasCompletedOnboarding = false // Replace with your actual onboarding check
  
  if (!hasCompletedOnboarding) {
    redirect('/journal/onboarding')
  }

  // If both authenticated and onboarded, redirect to main journal
  redirect('/journal')
}
