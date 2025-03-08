'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiHome, FiBookmark, FiUser } from 'react-icons/fi';
import { useAuth } from '@/app/context/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard/dashboard', icon: FiHome },
    { name: 'Saved Captions', href: '/dashboard/saved', icon: FiBookmark },
    { name: 'Profile', href: '/dashboard/profile', icon: FiUser },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex justify-around">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-3 px-2 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Main content - full width */}
      <div className="pt-20">
        <main className="pb-16 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
} 