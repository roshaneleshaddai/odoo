'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left Side - Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                StackIt
              </Link>
            </div>

            {/* Center - Navigation (Desktop) */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/"
                className={`text-gray-700 hover:text-gray-900 ${
                  pathname === '/' ? 'font-semibold' : ''
                }`}
              >
                Home
              </Link>
            </div>

            {/* Right Side - User Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Notification Bell */}
                  <NotificationDropdown />
                  
                  {/* User Avatar/Profile */}
                  <div className="flex items-center space-x-2">
                    <div className="avatar bg-purple-600">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <button
                      onClick={logout}
                      className="text-gray-700 hover:text-gray-900 text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-full border border-gray-300"
                  >
                    Login
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
                <Link
                  href="/"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Home
                </Link>
                {!user && (
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;
