import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  ref,
  getDownloadURL,
  getStorage,
  uploadBytesResumable,
} from 'firebase/storage'
import {
  doc,
  getDoc,
  collection,
  getDocs,
  Timestamp,
  getFirestore,
  setDoc,
  addDoc,
} from 'firebase/firestore'


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
const parentCollection = 'users'
const userUrl = 'https://www.zeltap.com/'

const initSchemaOnSignUp = async (username, email, profileId, user) => {
  const userDocRef = doc(db, parentCollection, username)

  // Set initial data
  await setDoc(userDocRef, {
    activeProfile: profileId,
    createdAt: new Date(),
    email,
  })

  // Create subcollection
  createSubcollection(username, profileId, user.uid)
}

async function createSubcollection(username, profileId, userUid) {
  const postsCollectionRef = collection(
    db,
    parentCollection,
    username,
    profileId
  )

  const newPostRef = await addDoc(postsCollectionRef, {
    bio: {
      name: username,
      username: username,
      url: `${userUrl + username}`,
      avatarImg: '',
      nftAvatar: false,
      description: 'Please Add Description',
      descShow: true,
      subdesc: 'Please Add Sub Description',
      subdescShow: true,
      newProductUrl: `${userUrl + 'search'}`,
      newProduct: false,
    },
    createdAt: new Date(),
    links: [],
    uid: userUid,
  })
}

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

const getActiveProfileCollectionRef = async username => {
  const userDocRef = doc(db, 'users', String(username).toLowerCase())
  const userDocSnap = await getDoc(userDocRef)

  if (!userDocSnap.exists()) {
    return null
  }

  const activeProfile = userDocSnap.data()?.activeProfile
  if (!activeProfile) {
    return null
  }

  const profileCollectionRef = collection(
    userDocRef,
    userDocSnap.data()?.activeProfile
  )
  const activeProfileCollectionSnap = await getDocs(profileCollectionRef)

  return activeProfileCollectionSnap || null
}

export {
  auth,
  db,
  storage,
  initSchemaOnSignUp,
  uploadImageForUser,
  getActiveProfileCollectionRef,
}
