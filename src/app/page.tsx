'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Book, MessageSquare, Settings } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  const features = [
    {
      title: 'Journal Your Thoughts',
      description: 'Easily capture your thoughts, experiences, and moments in a clean, simple interface.',
      icon: <Book className="h-12 w-12 text-indigo-600" />,
      href: '/journal',
    },
    {
      title: 'WhatsApp Integration',
      description: 'Send journal entries directly from WhatsApp for a seamless journaling experience.',
      icon: <MessageSquare className="h-12 w-12 text-indigo-600" />,
      href: '/settings',
    },
    {
      title: 'Customize Your Experience',
      description: 'Set your preferences for notifications and customize your journaling experience.',
      icon: <Settings className="h-12 w-12 text-indigo-600" />,
      href: '/settings',
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-indigo-50 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Welcome to</span>
                <span className="block text-indigo-600">Microjournal</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                A simple, beautiful way to journal your thoughts and connect your journaling experience with messaging apps.
              </p>
              <div className="mt-10 max-w-sm mx-auto sm:flex sm:justify-center md:mt-12">
                {isLoaded && !isSignedIn && (
                  <>
                    <div className="rounded-md shadow">
                      <Link 
                        href="/auth/signin" 
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                      >
                        Sign in
                      </Link>
                    </div>
                    <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                      <Link 
                        href="/auth/signup" 
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                      >
                        Sign up
                      </Link>
                    </div>
                  </>
                )}

                {isLoaded && isSignedIn && (
                  <div className="rounded-md shadow">
                    <Link 
                      href="/journal" 
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                    >
                      Go to Journal
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                A better way to journal
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Microjournal combines simplicity with powerful integrations to make journaling a delightful part of your daily routine.
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                {features.map((feature) => (
                  <div key={feature.title} className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-white">
                        {feature.icon}
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">{feature.title}</h3>
                      <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-indigo-700">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block">Start journaling today.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-indigo-200">
              Join thousands of users who are already journaling with Microjournal.
            </p>
            {isLoaded && !isSignedIn ? (
              <Link
                href="/auth/signup"
                className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto"
              >
                Sign up for free
              </Link>
            ) : isLoaded && isSignedIn ? (
              <Link
                href="/journal"
                className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto"
              >
                Go to your journal
              </Link>
            ) : null}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} Microjournal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
