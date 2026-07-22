import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

// Shared, deliberately short (150–260ms) motion primitives. Everything here
// degrades to a plain, static element when the user prefers reduced motion.

const pageVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.045 },
  },
  exit: { opacity: 0, y: -12, transition: { duration: 0.16, ease: 'easeIn' } },
}

const itemVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
}

/** Wizard step wrapper: fades/slides the whole screen in and out. Renders the
 *  standard `.app` card so pages keep their layout. */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className="app">{children}</div>
  return (
    <motion.div
      className="app"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}

/** Section/field entrance. Inside a PageTransition these stagger in gently. */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  )
}

type TapButtonProps = HTMLMotionProps<'button'>

/** A button with a subtle press-down feedback; identical API to <button>. */
export function TapButton({ children, disabled, ...rest }: TapButtonProps) {
  const reduce = useReducedMotion()
  return (
    <motion.button
      {...rest}
      disabled={disabled}
      whileTap={reduce || disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
    >
      {children}
    </motion.button>
  )
}
