import { initializeApp } from 'firebase/app'
import { getFunctions, httpsCallable } from 'firebase/functions'

const firebaseConfig = {
  apiKey: 'AIzaSyDt0Ex79klTYUgVhPYdoKPD9GgoWKJTCvE',
  authDomain: 'silly-side-projects.firebaseapp.com',
  projectId: 'silly-side-projects',
  storageBucket: 'silly-side-projects.appspot.com',
  messagingSenderId: '459270365237',
  appId: '1:459270365237:web:02ff428aa45142a029d17c'
}

initializeApp(firebaseConfig)

const functions = getFunctions()
export const submitContactForm = httpsCallable(
  functions,
  'contactForm'
)
