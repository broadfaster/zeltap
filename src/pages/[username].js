import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import WebLinks from '../components/WebLinks/WebLinks'
import UserLayout from '../components/UserLayout/UserLayout'
import { ThemeProvider } from 'styled-components'
import { darkTheme, lightTheme } from '../styles/theme.config'
import useDarkMode from 'use-dark-mode'
import GlobalStyle from '../styles/GlobalStyle'
import allLinks from '../data/LinksData'
import bioData from '../data/BioData'
import { doc, getDoc, Timestamp } from 'firebase/firestore'
import { db } from '../utils/firebase'
import { useStateContext } from '../utils/context/StateContext'
import { getToken } from '../utils/token'

const UserProfile = ({ firestoreData }) => {
  const darkMode = useDarkMode(false, { storageKey: null, onChange: null })
  const theme = darkMode.value ? darkTheme : lightTheme
  const { cosmicUser, setCosmicUser } = useStateContext()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUserName, setCurrentUserName] = useState(null)
  const { username: currentUserFromParam } = router.query

  useEffect(() => {
    let isMounted = true
    const ZeltapUser = getToken()

    if (
      isMounted &&
      !cosmicUser?.hasOwnProperty('uid') &&
      ZeltapUser?.hasOwnProperty('uid')
    ) {
      setCosmicUser(ZeltapUser)
    }

    if (cosmicUser?.hasOwnProperty('uid')) {
      setIsLoggedIn(true)
      setCurrentUserName(cosmicUser?.username)
    } else {
      setIsLoggedIn(false)
      setCurrentUserName(null)
    }
    return () => {
      isMounted = false
    }
  }, [cosmicUser, setCosmicUser])

  if (firestoreData === false) {
    // TODO: Add not found page here
    return <div>User not found</div>
  } else if (firestoreData === null) {
    return <div>Error in fetching data, try again later</div>
  }

  const isUserProfileOwner =
    isLoggedIn && currentUserFromParam === currentUserName

  const bio = firestoreData?.userData?.bio || bioData
  const links = firestoreData?.userData?.links || allLinks

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <UserLayout>
        <WebLinks
          allLinks={links}
          bioData={bio}
          isUserProfileOwner={isUserProfileOwner}
        />
      </UserLayout>
    </ThemeProvider>
  )
}

export default UserProfile

export async function getServerSideProps(context) {
  try {
    const { username } = context.params
    const userDocRef = doc(db, 'users', String(username).toLowerCase())
    const userDocSnap = await getDoc(userDocRef)

    if (!userDocSnap.exists()) {
      return {
        props: {
          firestoreData: false,
        },
      }
    }

    const userData = userDocSnap.data()

    if (userData.createdAt instanceof Timestamp) {
      userData.createdAt = userData.createdAt.toDate().toString()
    }

    return {
      props: {
        firestoreData: {
          userData,
        },
      },
    }
  } catch (error) {
    console.error('Error fetching data from Firestore:', error)
    return {
      props: {
        firestoreData: null,
      },
    }
  }
}
