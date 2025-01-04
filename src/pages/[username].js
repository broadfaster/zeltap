import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getDoc, doc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '../utils/firebase'

const UserProfile = ({ user }) => {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setIsLoggedIn(true)
        setCurrentUserId(user.uid)
      } else {
        setIsLoggedIn(false)
        setCurrentUserId(null)
      }
    })

    return () => unsubscribe()
  }, [])

  // Check if the logged-in user is viewing their own profile
  const isUserProfileOwner = isLoggedIn && currentUserId === user.uid

  return (
    <div>
      <h1>{user.username}'s Profile</h1>
      <p>Email: {user.email}</p>
      {/* Display "Add Links" and "Update" buttons only for the profile owner */}
      {isUserProfileOwner && (
        <div>
          <button onClick={() => router.push('/add-links')}>Add Links</button>
          <button onClick={() => router.push('/update-profile')}>
            Update Profile
          </button>
        </div>
      )}
    </div>
  )
}

export async function getServerSideProps(context) {
  const { username } = context.params

  // Fetch user data from Firestore
  const userDocRef = doc(db, 'users', username)
  const userDoc = await getDoc(userDocRef)

  if (!userDoc.exists()) {
    return {
      notFound: true,
    }
  }

  const user = userDoc.data()

  return {
    props: {
      user: {
        ...user,
        createdAt: user.createdAt.toMillis(), // Convert Date to timestamp
      },
    },
  }
}

export default UserProfile
