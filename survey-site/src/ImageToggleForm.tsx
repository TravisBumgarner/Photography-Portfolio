import React, { useState } from 'react';
import { v4 } from 'uuid'
import { submitContactForm } from './firebase';

interface ImageToggleFormProps {
  images: string[];
}

const NAME = v4()

const ImageToggleForm: React.FC<ImageToggleFormProps> = ({ images }) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false)



  const handleImageToggle = (image: string) => {
    setSelectedImages(prevSelectedImages =>
      prevSelectedImages.includes(image)
        ? prevSelectedImages.filter(img => img !== image)
        : [...prevSelectedImages, image]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setIsSubmitting(true)
    e.preventDefault()

    const imageIndexes = selectedImages
      .map(i => i.replace('https://storage.googleapis.com/photo-survey/', ''))
      .map(i => i.replace('.jpg', ''))

    const response = (await submitContactForm({
      name: NAME,
      email: '',
      website: 'image-survey',
      message: JSON.stringify(imageIndexes)
    })) as any

    if (response.data) {
      setSelectedImages([])
      alert("Thanks!")
    } else {
      alert("Something went wrong :(")
    }
    setIsSubmitting(false)
  }


  return (
    <form onSubmit={handleSubmit}>
      <div>
        {images.map(image => (
          <div key={image} onClick={() => handleImageToggle(image)} style={{ margin: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
            <img
              src={image}
              alt="Toggleable"
              style={{
                border: selectedImages.includes(image) ? '5px solid red' : '2px solid transparent',
                maxWidth: '80vw',
                maxHeight: '80vh'
              }}
            />
          </div>
        ))}
      </div>
      <button disabled={isSubmitting} style={{ width: '200px', height: '50px', fontSize: '36px' }} type="submit">Submit</button>
    </form>
  );
};

export default ImageToggleForm;