import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { ref, getDownloadURL, getStorage, uploadBytesResumable } from 'firebase/storage'
import { doc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_ZELTAP_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_ZELTAP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_ZELTAP_FIREBASE_DB_URL,
  projectId: process.env.NEXT_PUBLIC_ZELTAP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_ZELTAP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_ZELTAP_FIREBASE_MSG_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_ZELTAP_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

const uploadImageForUser = async (file, username) => {
  // Ensure the user is authenticated
  const user = auth.currentUser
  if (!user) {
    console.log('User not authenticated')
    return
  }

  // Create a reference to Firebase Storage
  const storageRef = ref(storage, `users/${username}/images/${file.name}`)
  const uploadTask = uploadBytesResumable(storageRef, file)

  // Monitor upload progress
  uploadTask.on(
    'state_changed',
    snapshot => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      console.log(`Upload is ${progress}% done`)
    },
    error => {
      console.error('Upload failed:', error)
    },
    () => {
      // Upload successful, get the download URL
      getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
        console.log('File available at', downloadURL)
        // Store the image URL for the specific user
        storeImageURLForUser(username, downloadURL)
      })
    }
  )
}

const storeImageURLForUser = async (username, downloadURL) => {
  try {
    // Reference to the specific user's document in Firestore
    const userRef = doc(db, 'users', username)

    // Add a new image entry to the user's images subcollection
    await addDoc(collection(userRef, 'bio'), {
      url: downloadURL,
    })

    console.log('Image URL stored in Firestore for user', username)
  } catch (error) {
    console.error('Error storing image URL:', error)
  }
}

export { auth, db, storage, uploadImageForUser }
