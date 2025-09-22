import { useCallback, useMemo, useState } from 'react'
import photoStructure from './photo-structure.json'

// Add responsive styles
const styles = `
  .photo-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  @media (max-width: 800px) {
    .photo-grid {
      grid-template-columns: 1fr;
    }
  }
`

// Types
interface PhotoFolder {
  title: string
  slug: string
  photos: string[]
  subfolders?: PhotoFolder[]
}

interface SelectedPhoto {
  category: string
  photoPath: string
}

const labelLookup: Record<string, string> = {
  americana:
    'A small town diner with a counter full of regulars. A main drag constellated by vintage neon. The tight-knit communities, culture, and characters that tell an American story.',
  'road-life':
    'The camp spots and overlook stops, everyday rituals and changes of light—capture the quotidian moments of life on the road.',
  'natural-world':
    'Super Blooms and craggy mountain profiles, hot springs hideaways and butterfly migrations. These are the landscapes and natural wonders that move us.',
  'photo-essay':
    'A sequence of 5-10 images that tell a story from the open road. From a day at the rodeo to a series of vintage motel signs — this is the place for defined photo projects and thematic image collections.'
}

function App() {
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([])
  const [success, setSuccess] = useState(false)
  const [failure, setFailure] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle photo selection/deselection
  const handlePhotoToggle = (category: string, photoPath: string) => {
    setSelectedPhotos(prev => {
      const existingIndex = prev.findIndex(p => p.category === category && p.photoPath === photoPath)

      if (existingIndex >= 0) {
        // Remove if already selected
        return prev.filter((_, index) => index !== existingIndex)
      } else {
        // Add if not selected
        return [...prev, { category, photoPath }]
      }
    })
  }

  // Check if a photo is selected
  const isPhotoSelected = (category: string, photoPath: string) => {
    return selectedPhotos.some(p => p.category === category && p.photoPath === photoPath)
  }

  const submitDisabled = selectedPhotos.length === 0 || isSubmitting || success

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      setIsSubmitting(true)
      const photosByCategory = selectedPhotos.reduce((acc, photo) => {
        if (!acc[photo.category]) {
          acc[photo.category] = []
        }
        acc[photo.category].push(photo.photoPath)
        return acc
      }, {} as Record<string, string[]>)

      const payload = {
        photosByCategory,
        totalSelected: selectedPhotos.length,
        timestamp: new Date().toISOString()
      }

      e.preventDefault()

      const response = await fetch('https://contact-form.nfshost.com/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: '',
          email: '',
          message: JSON.stringify(payload),
          website: 'sam-contest'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        setSuccess(true)
        setSelectedPhotos([])
      } else {
        setFailure(true)
      }
      setIsSubmitting(false)
    },
    [selectedPhotos]
  )

  const buttonText = useMemo(() => {
    if (isSubmitting) return 'Submitting...'
    if (success) return 'Submitted Successfully!'
    if (failure) return 'Submission Failed. Try Again?'
    return `Submit Selection (${selectedPhotos.length} photos)`
  }, [isSubmitting, success, failure, selectedPhotos.length])

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <style>{styles}</style>
      <h1>Photo Selection Survey</h1>
      <p>I've included the themes for each category if you'd like to read more.</p>
      <p>Thank you!</p>

      <div style={{ marginBottom: '20px' }}>
        <strong>Selected: {selectedPhotos.length} photos</strong>
      </div>

      {photoStructure.map((folder: PhotoFolder) => (
        <div key={folder.slug} style={{ marginBottom: '40px' }}>
          <h2>{folder.title}</h2>
          {labelLookup[folder.slug] && <p style={{ fontStyle: 'italic', color: '#555' }}>{labelLookup[folder.slug]}</p>}
          <div className="photo-grid">
            {folder.photos.map(photo => {
              const photoId = `${folder.slug}-${photo}`
              const isSelected = isPhotoSelected(folder.slug, photo)

              return (
                <div
                  key={photoId}
                  style={{
                    border: isSelected ? '3px solid #007bff' : '3px solid #ddd',
                    padding: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexDirection: 'column'
                  }}
                >
                  <img
                    onClick={() => handlePhotoToggle(folder.slug, photo)}
                    src={`/${photo}`}
                    alt={photo}
                    draggable={false}
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'contain',
                      marginBottom: '8px',
                      maxHeight: '400px'
                    }}
                    onError={e => {
                      // Handle missing images gracefully
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handlePhotoToggle(folder.slug, photo)}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {photo.split('/').pop()?.replace(/^\d+-/, '')}
                    </span>
                  </label>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div
        style={{
          position: 'sticky',
          bottom: '0px',
          backgroundColor: 'white',
          padding: '20px',
          borderTop: '2px solid #ddd',
          textAlign: 'center'
        }}
      >
        <button
          onClick={handleSubmit}
          disabled={submitDisabled}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: submitDisabled ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            cursor: submitDisabled ? 'not-allowed' : 'pointer'
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}

export default App
