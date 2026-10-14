'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/AuthContext';
import { 
  Sparkles, 
  Bookmark, 
  Briefcase, 
  LayoutDashboard, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon,
<<<<<<< HEAD
  Search,
  FileText,
  Compass
=======
  Search
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Search Jobs', href: '/', icon: Search },
<<<<<<< HEAD
    { name: 'Jobs For Me', href: '/recommendations', icon: Sparkles, authRequired: true },
=======
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
    { name: 'Saved Jobs', href: '/saved', icon: Bookmark, authRequired: true },
    { name: 'Applications', href: '/applications', icon: Briefcase, authRequired: true },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, authRequired: true },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
<<<<<<< HEAD
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-7">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">JobSpace</span>
                <span className="inline-flex items-center rounded-md bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-orange-600 border border-orange-200/60">
                  INDIA
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase mt-1">
                AI Job Intelligence
              </span>
=======
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs group-hover:bg-blue-700 transition">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">JobSpace</span>
              <span className="text-[10px] font-medium text-blue-600 tracking-wider uppercase mt-0.5">Semantic Job Engine</span>
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
<<<<<<< HEAD
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50/80 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
=======
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-blue-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side user action */}
        <div className="hidden md:flex items-center gap-3">
          {isLoading ? (
            <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-md" />
          ) : user ? (
            <div className="flex items-center gap-3">
<<<<<<< HEAD
              <Link
                href="/profile"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                  pathname === '/profile'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileText className="h-3.5 w-3.5 text-blue-600" />
                <span>Profile & Resume</span>
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium">
                <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                <span className="max-w-[130px] truncate">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Exit</span>
=======
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium">
                <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                <span className="max-w-[140px] truncate">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-600 px-2 py-1.5 rounded hover:bg-red-50 transition"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
<<<<<<< HEAD
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
=======
                className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-50 transition"
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
              >
                Sign In
              </Link>
              <Link
                href="/register"
<<<<<<< HEAD
                className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm shadow-blue-500/20 transition"
              >
                Get Started
=======
                className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-md shadow-xs transition"
              >
                Register
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
<<<<<<< HEAD
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
=======
            className="p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100"
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
<<<<<<< HEAD
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-5 space-y-2">
=======
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
<<<<<<< HEAD
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
=======
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="h-5 w-5" />
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
                {link.name}
              </Link>
            );
          })}
<<<<<<< HEAD
          {user && (
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                pathname === '/profile'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className="h-4 w-4" />
              Profile & Resume
            </Link>
          )}
=======
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <div className="space-y-2">
                <div className="text-xs text-slate-500 px-3 truncate">Signed in as {user.email}</div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
<<<<<<< HEAD
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-semibold"
=======
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md font-medium"
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
<<<<<<< HEAD
                  className="w-full text-center py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
=======
                  className="w-full text-center py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50"
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
<<<<<<< HEAD
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
                >
                  Get Started
=======
                  className="w-full text-center py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Register
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
