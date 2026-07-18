import { useEffect } from 'react'

type ToastVariant = 'success' | 'error'

// Small transient message. Renders nothing when message is null. The success
// variant is used for "Saved"; the error variant surfaces network failures.
export function Toast({
  message,
  onDone,
  variant = 'success',
  duration = variant === 'error' ? 4000 : 2000,
}: {
  message: string | null
  onDone: () => void
  variant?: ToastVariant
  duration?: number
}) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDone, duration)
    return () => clearTimeout(t)
  }, [message, onDone, duration])

  if (!message) return null
  return (
    <div
      className={'toast' + (variant === 'error' ? ' toast-error' : '')}
      data-testid={variant === 'error' ? 'error-toast' : 'save-toast'}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      {message}
    </div>
  )
}
