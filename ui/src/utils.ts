import { useEffect, useRef } from 'react'

export const getPhotoUrl = ({
  isThumbnail,
  photoSrc
}: {
  isThumbnail: boolean
  photoSrc: string
}) => {
  let url = 'https://storage.googleapis.com/photo21-asdqwd/photos/'

  url += isThumbnail ? 'thumbnail/' : 'large/'
  url += encodeURIComponent(photoSrc)
  return url
}

const usePrevious = (value, initialValue) => {
  const ref = useRef(initialValue)
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

export const useEffectDebugger = (
  effectHook,
  dependencies,
  dependencyNames = []
) => {
  const previousDeps = usePrevious(dependencies, [])

  const changedDeps = dependencies.reduce((accum, dependency, index) => {
    if (dependency !== previousDeps[index]) {
      const keyName = dependencyNames[index] || index
      return {
        ...accum,
        [keyName]: {
          before: previousDeps[index],
          after: dependency
        }
      }
    }

    return accum
  }, {})

  if (Object.keys(changedDeps).length) {
    console.log('[use-effect-debugger] ', changedDeps)
  }

  useEffect(effectHook, dependencies)
}

export const focusFirstSiteElement = () => {
  const focusableElements = document.querySelectorAll(
    'a[href], button, [tabindex]:not([tabindex="-1"])'
  )
  const firstElement = focusableElements[0] as HTMLElement
  firstElement?.focus()
  // blur the first element to remove the focus outline
  firstElement?.blur()
}
