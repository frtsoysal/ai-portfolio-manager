'use client'

import { useState } from 'react'
import { Button } from './ui/button'

interface CopyLinkButtonProps {
  className?: string
}

export default function CopyLinkButton({ className = '' }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      const currentUrl = window.location.href
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = window.location.href
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr)
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <Button
      onClick={handleCopyLink}
      variant="outline"
      size="sm"
      className={`${copied ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300'} ${className}`}
    >
      <span className="mr-2">{copied ? '✅' : '🔗'}</span>
      {copied ? 'Copied!' : 'Copy Link'}
    </Button>
  )
}
