'use client'

import { useState, useTransition } from 'react'
import {
  Plus, X, Loader2, Mail, Phone, Link as LinkIcon,
  UserCheck, DollarSign, Users, User, Trash2, Pencil, Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { addContact, deleteContact, updateContact } from '@/lib/actions/opportunities'
import type { Contact, ContactRole } from '@/types'

const ROLE_META: Record<ContactRole, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  champion:       { label: 'Champion',       color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', icon: UserCheck  },
  economic_buyer: { label: 'Economic Buyer', color: 'text-green-700',  bg: 'bg-green-50 border-green-200',   icon: DollarSign },
  stakeholder:    { label: 'Stakeholder',    color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',   icon: Users      },
  other:          { label: 'Other',          color: 'text-gray-600',   bg: 'bg-slate-50 border-slate-200',   icon: User       },
}

interface ContactsSectionProps {
  opportunityId: string
  initialContacts: Contact[]
}

export function ContactsSection({ opportunityId, initialContacts }: ContactsSectionProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [showForm, setShowForm]     = useState(false)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError]           = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const inp = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500'

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const form = e.currentTarget

    startTransition(async () => {
      const result = await addContact(opportunityId, fd)
      if (result.error) {
        setError(result.error)
      } else {
        // Optimistic: refetch via revalidation will update on next nav;
        // add a placeholder so the UI updates immediately
        const newContact: Contact = {
          id: crypto.randomUUID(),
          opportunity_id: opportunityId,
          name:         (fd.get('name')         as string) ?? '',
          title:        (fd.get('title')        as string) || null,
          role:         (fd.get('role')         as ContactRole) ?? 'stakeholder',
          email:        (fd.get('email')        as string) || null,
          phone:        (fd.get('phone')        as string) || null,
          linkedin_url: (fd.get('linkedin_url') as string) || null,
          created_at:   new Date().toISOString(),
        }
        setContacts(prev => [...prev, newContact])
        form.reset()
        setShowForm(false)
      }
    })
  }

  function handleEdit(e: React.FormEvent<HTMLFormElement>, contactId: string) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateContact(opportunityId, contactId, fd)
      if (result.error) {
        setError(result.error)
      } else {
        setContacts(prev => prev.map(c => c.id !== contactId ? c : {
          ...c,
          name:         (fd.get('name')         as string) ?? c.name,
          title:        (fd.get('title')        as string) || null,
          role:         (fd.get('role')         as ContactRole) ?? c.role,
          email:        (fd.get('email')        as string) || null,
          phone:        (fd.get('phone')        as string) || null,
          linkedin_url: (fd.get('linkedin_url') as string) || null,
        }))
        setEditingId(null)
      }
    })
  }

  function handleDelete(contactId: string) {
    setDeletingId(contactId)
    startTransition(async () => {
      const result = await deleteContact(opportunityId, contactId)
      if (result.error) {
        setError(result.error)
      } else {
        setContacts(prev => prev.filter(c => c.id !== contactId))
      }
      setDeletingId(null)
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Contacts ({contacts.length})
        </p>
        <button
          onClick={() => { setShowForm(f => !f); setError(null) }}
          className={cn(
            'flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors',
            showForm
              ? 'bg-slate-100 border-slate-200 text-gray-500'
              : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
          )}
        >
          {showForm ? <><X size={12} /> Cancel</> : <><Plus size={12} /> Add Contact</>}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input name="name" required placeholder="Full name" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input name="title" placeholder="e.g. CFO" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <select name="role" defaultValue="stakeholder" className={inp}>
                <option value="champion">Champion</option>
                <option value="economic_buyer">Economic Buyer</option>
                <option value="stakeholder">Stakeholder</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input name="email" type="email" placeholder="email@company.com" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input name="phone" placeholder="+233 xx xxx xxxx" className={inp} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn URL</label>
              <input name="linkedin_url" placeholder="https://linkedin.com/in/…" className={inp} />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            {isPending ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : 'Add Contact'}
          </button>
        </form>
      )}

      {/* Contact list */}
      <div className="space-y-2">
        {contacts.map(c => {
          const meta = ROLE_META[c.role]
          const RoleIcon = meta.icon
          const isDeleting = deletingId === c.id

          const isEditing = editingId === c.id

          return (
            <div
              key={c.id}
              className={cn(
                'rounded-xl border transition-opacity',
                meta.bg,
                isDeleting && 'opacity-40'
              )}
            >
              {isEditing ? (
                <form onSubmit={e => handleEdit(e, c.id)} className="p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                      <input name="name" required defaultValue={c.name} className={inp} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                      <input name="title" defaultValue={c.title ?? ''} placeholder="e.g. CFO" className={inp} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                      <select name="role" defaultValue={c.role} className={inp}>
                        <option value="champion">Champion</option>
                        <option value="economic_buyer">Economic Buyer</option>
                        <option value="stakeholder">Stakeholder</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                      <input name="email" type="email" defaultValue={c.email ?? ''} className={inp} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                      <input name="phone" defaultValue={c.phone ?? ''} className={inp} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn URL</label>
                      <input name="linkedin_url" defaultValue={c.linkedin_url ?? ''} className={inp} />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setEditingId(null)} className="flex items-center gap-1 text-xs text-gray-500 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:text-gray-700 bg-white">
                      <X size={11} /> Cancel
                    </button>
                    <button type="submit" disabled={isPending} className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg px-2.5 py-1.5">
                      {isPending ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Save
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start gap-3 p-3 group">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-white border border-current/20 flex items-center justify-center text-sm font-semibold text-gray-700 shrink-0">
                    {c.name[0].toUpperCase()}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-gray-900 text-sm font-semibold">{c.name}</p>
                      <span className={cn('flex items-center gap-1 text-[11px] font-medium', meta.color)}>
                        <RoleIcon size={10} />
                        {meta.label}
                      </span>
                    </div>
                    {c.title && <p className="text-gray-500 text-xs mt-0.5">{c.title}</p>}
                    <div className="flex flex-wrap gap-3 mt-1.5">
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                          <Mail size={11} />{c.email}
                        </a>
                      )}
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                          <Phone size={11} />{c.phone}
                        </a>
                      )}
                      {c.linkedin_url && (
                        <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                          <LinkIcon size={11} />LinkedIn
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Edit / Delete */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => { setEditingId(c.id); setError(null) }}
                      title="Edit contact"
                      className="text-gray-300 hover:text-indigo-500 transition-colors p-0.5"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={isDeleting}
                      title="Remove contact"
                      className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-50 p-0.5"
                    >
                      {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {contacts.length === 0 && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex flex-col items-center gap-1.5 py-6 rounded-xl border-2 border-dashed border-slate-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">Add first contact</span>
          </button>
        )}
      </div>
    </div>
  )
}
