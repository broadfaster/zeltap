import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import WebLinks from '../components/WebLinks/WebLinks'
import UserLayout from '../components/UserLayout/UserLayout'
import { ThemeProvider } from 'styled-components'
import { darkTheme, lightTheme } from '../styles/pages/theme.config'
import useDarkMode from 'use-dark-mode'
import GlobalStyle from '../styles/pages/GlobalStyle'
import allLinks from '../data/LinksData'
import bioDataTemplate from '../data/bioDataTemplate'
import { doc, getDoc, Timestamp } from 'firebase/firestore'
import { db } from '../utils/firebase'
import { useStateContext } from '../utils/context/StateContext'
import { getToken } from '../utils/token'
import { ClipLoader } from 'react-spinners'

const UserProfile = ({ firestoreData }) => {
  const darkMode = useDarkMode(false, {
    storageKey: 'darkMode',
    onChange: null,
  })
  const theme = darkMode ? darkTheme : lightTheme
  const { cosmicUser, setCosmicUser } = useStateContext()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUserName, setCurrentUserName] = useState(null)
  const [bioData, setBioData] = useState(bioDataTemplate)
  const [allLinksData, setAllLinksData] = useState(allLinks)
  const [loading, setLoading] = useState(true)
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

    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    if (
      firestoreData &&
      firestoreData?.userData?.bio &&
      firestoreData?.userData?.links
    ) {
      setBioData(firestoreData?.userData?.bio)
      setAllLinksData(firestoreData?.userData?.links)
    }

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [
    cosmicUser,
    setCosmicUser,
    bioData,
    setBioData,
    allLinksData,
    setAllLinksData,
  ])

  if (firestoreData === false) {
    // TODO: Add not found page here
    return <div>User not found</div>
  } else if (firestoreData === null) {
    return <div>Error in fetching data, try again later</div>
  }

  const isUserProfileOwner =
    isLoggedIn && currentUserFromParam === currentUserName

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <UserLayout>
        {loading ? (
          <ClipLoader
            size={50}
            color="#36D7B7"
            loading={loading}
            cssOverride={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ) : (
          <WebLinks
            allLinks={allLinksData}
            firebaseBioData={bioData}
            isUserProfileOwner={isUserProfileOwner}
          />
        )}
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
