import { useState } from 'react'
import { Icon } from '@iconify/react'

export default function GroupeCode({ code, canRenew = false, onRenew }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10"
        title="Copier le code"
      >
        <Icon icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold'} width={14} />
        {copied ? 'Copié' : code || '—'}
      </button>

      {canRenew ? (
        <button
          type="button"
          onClick={onRenew}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10"
          title="Renouveler le code"
        >
          <Icon icon="solar:refresh-circle-linear" width={14} />
          Renouveler
        </button>
      ) : null}
    </div>
  )
}
