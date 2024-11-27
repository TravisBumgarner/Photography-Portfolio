import { useEffect } from 'react'

const usePreventAppScroll = (shouldPreventScroll: boolean) => {
  // Prevent scroll off app while navigation is open.
  useEffect(() => {
    if (shouldPreventScroll) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [shouldPreventScroll])
}

export default usePreventAppScroll
