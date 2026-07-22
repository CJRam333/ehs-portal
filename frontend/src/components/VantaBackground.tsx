import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * A single, lightweight animated background using Vanta's "fog" effect. Vanta
 * and its three.js dependency are dynamically imported so they never block the
 * first paint. On reduced-motion or low-powered devices we skip the effect
 * entirely and let the CSS gradient fallback (`.vanta-bg`) stand in.
 */
export function VantaBackground() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const cores = navigator.hardwareConcurrency ?? 4
    const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4
    // Treat phones (narrow viewport) as low-powered: skip the three.js effect so
    // the wizard stays snappy there and fall back to the CSS gradient.
    const smallScreen = window.innerWidth <= 560
    const lowPower = cores <= 2 || memory <= 2 || smallScreen
    if (reduce || lowPower) return

    let effect: { destroy: () => void } | null = null
    let cancelled = false

    async function init() {
      try {
        const THREE = await import('three')
        const FOG = (await import('vanta/dist/vanta.fog.min')).default
        if (cancelled || !ref.current) return
        effect = FOG({
          el: ref.current,
          THREE,
          mouseControls: true,
          touchControls: false,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          highlightColor: 0xc79a2e, // gold accent
          midtoneColor: 0x0f7b3f, // green
          lowlightColor: 0x1f2a24, // ink
          baseColor: 0xffffff,
          blurFactor: 0.6,
          speed: 1.0,
          zoom: 0.9,
        })
      } catch {
        /* leave the CSS gradient fallback in place */
      }
    }

    // Defer past first paint / initial interactions so loading three.js never
    // blocks the user's first navigation off this screen.
    const timer = window.setTimeout(() => void init(), 400)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      effect?.destroy()
    }
  }, [])

  // Rendered into <body> (behind #root, z-index:-1, pointer-events:none) so the
  // decorative canvas never overlaps or intercepts clicks on the form card.
  return createPortal(<div ref={ref} className="vanta-bg" aria-hidden="true" />, document.body)
}
