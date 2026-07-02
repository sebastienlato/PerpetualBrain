import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { copyToClipboard } from '../utils/copy'
import { Button } from './Button'

export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await copyToClipboard(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <Button type="button" onClick={handleCopy} icon={copied ? <Check size={16} /> : <Copy size={16} />} variant={copied ? 'primary' : 'secondary'}>
      {copied ? 'Copied' : label}
    </Button>
  )
}
