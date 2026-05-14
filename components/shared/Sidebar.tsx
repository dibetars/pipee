'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { cn, initials } from '@/lib/utils'
import { logout } from '@/lib/actions/auth'
import type { Profile } from '@/types'
import {
  LayoutDashboard,
  Columns3,
  List,
  CalendarDays,
  Users,
  LogOut,
  ChevronRight,
  Loader2,
  BookOpen,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard',   label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pipeline',    label: 'Pipeline',  icon: Columns3 },
  { href: '/opportunities', label: 'All Deals', icon: List },
  { href: '/calendar',    label: 'Calendar',  icon: CalendarDays },
  { href: '/walkthrough', label: 'Get Started', icon: BookOpen },
]

interface SidebarProps {
  profile: Profile
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await logout()
    })
  }

  return (
    <aside className="flex flex-col w-60 shrink-0 bg-white border-r border-slate-200 h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-200">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shrink-0">
          <span className="text-white font-bold text-sm">K</span>
        </div>
        <div>
          <p className="text-gray-900 font-semibold text-sm leading-none">Krongage BD</p>
          <p className="text-gray-400 text-xs mt-0.5">Pipeline</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-500 hover:bg-slate-100 hover:text-gray-800'
              )}
            >
              <Icon size={16} />
              {label}
              {active && <ChevronRight size={12} className="ml-auto opacity-60" />}
            </Link>
          )
        })}

        {profile.role === 'admin' && (
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:bg-slate-100 hover:text-gray-800'
            )}
          >
            <Users size={16} />
            Admin
            {pathname.startsWith('/admin') && <ChevronRight size={12} className="ml-auto opacity-60" />}
          </Link>
        )}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-semibold shrink-0">
            {initials(profile.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 text-sm font-medium truncate">{profile.name}</p>
            <p className="text-gray-400 text-xs truncate capitalize">{profile.role.replace('_', ' ')}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            title="Sign out"
          >
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
          </button>
        </div>
      </div>
    </aside>
  )
}
