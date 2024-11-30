import { motion } from 'framer-motion'
import React, { useEffect } from 'react'

export const SHARED_ANIMATION_DURATION = 0.25

const NavigationAnimation = ({ children }: { children: React.ReactNode }) => {
  // For some reason, adding AnimatePresence to the App component
  // causes the page to not scroll to the top when navigating.
  // This hook fixes that. Not sure the actual cause, I sprinkled
  // the key prop around like a madman.
  useEffect(() => {
    return () => {
      window.scrollTo(0, 0)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: SHARED_ANIMATION_DURATION, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

export default NavigationAnimation
