'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { Home, Settings, Book } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                MicroJournal
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/dashboard')
                    ? 'border-b-2 border-indigo-500 text-gray-900'
                    : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Home className="mr-1 h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/journal"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/journal')
                    ? 'border-b-2 border-indigo-500 text-gray-900'
                    : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Book className="mr-1 h-4 w-4" />
                Journal
              </Link>
              <Link
                href="/settings"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/settings')
                    ? 'border-b-2 border-indigo-500 text-gray-900'
                    : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Settings className="mr-1 h-4 w-4" />
                Settings
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="relative ml-3">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden border-t">
        <div className="flex justify-between">
          <Link
            href="/dashboard"
            className={`flex-1 text-center py-2 px-3 text-xs font-medium ${
              isActive('/dashboard') ? 'text-indigo-600' : 'text-gray-500'
            }`}
          >
            <Home className="mx-auto h-5 w-5 mb-1" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/journal"
            className={`flex-1 text-center py-2 px-3 text-xs font-medium ${
              isActive('/journal') ? 'text-indigo-600' : 'text-gray-500'
            }`}
          >
            <Book className="mx-auto h-5 w-5 mb-1" />
            <span>Journal</span>
          </Link>
          <Link
            href="/settings"
            className={`flex-1 text-center py-2 px-3 text-xs font-medium ${
              isActive('/settings') ? 'text-indigo-600' : 'text-gray-500'
            }`}
          >
            <Settings className="mx-auto h-5 w-5 mb-1" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 