'use client'

import { useState, useTransition } from 'react'
import { Key, Eye, EyeOff, CheckCircle2, Loader2, ExternalLink } from 'lucide-react'
import { saveApiKey } from '@/lib/actions/reports'

const GROQ_KEY_NAME = 'groq_api_key'

interface AdminSettingsProps {
  grokKeySet: boolean
}

export function AdminSettings({ grokKeySet }: AdminSettingsProps) {
  const [grokKey, setGrokKey] = useState('')
  const [show, setShow] = useState(false)
  const [saved, setSaved] = useState(grokKeySet)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    if (!grokKey.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await saveApiKey(GROQ_KEY_NAME, grokKey.trim())
      if (result.error) {
        setError(result.error)
      } else {
        setSaved(true)
        setGrokKey('')
      }
    })
  }

  const inp = 'flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono'

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Key size={14} className="text-gray-500" />
          <label className="text-xs font-medium text-gray-600">Groq API Key</label>
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-[10px] text-indigo-500 hover:text-indigo-700 flex items-center gap-1"
          >
            Get key <ExternalLink size={10} />
          </a>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={show ? 'text' : 'password'}
              value={grokKey}
              onChange={e => setGrokKey(e.target.value)}
              placeholder={saved ? '••••••••••••••••••••••• (key is set)' : 'gsk_xxxxxxxxxxxxxxxxxxxx'}
              className={inp + ' pr-10'}
            />
            <button
              type="button"
              onClick={() => setShow(s => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={isPending || !grokKey.trim()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium px-4 rounded-lg transition-colors"
          >
            {isPending ? <Loader2 size={13} className="animate-spin" /> : 'Save'}
          </button>
        </div>

        {saved && !grokKey && (
          <p className="flex items-center gap-1.5 text-xs text-green-600 mt-1.5">
            <CheckCircle2 size={12} /> Groq API key is configured — report generation is enabled.
          </p>
        )}
        {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
        <p className="text-[11px] text-gray-400 mt-2">
          Used for AI-powered report generation. Your key is stored in the database and never exposed to the frontend.
          Model: <code className="bg-slate-100 px-1 rounded">llama-3.3-70b-versatile</code> via Groq.
        </p>
      </div>
    </div>
  )
}
