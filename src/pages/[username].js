import React, { useState, useEffect } from 'react'
import WebLinks from '../components/WebLinks/WebLinks'
import UserLayout from '../components/UserLayout/UserLayout'
import { ThemeProvider } from 'styled-components'
import { darkTheme, lightTheme } from '../styles/theme.config'
import useDarkMode from 'use-dark-mode'
import GlobalStyle from '../styles/GlobalStyle'
import allLinks from '../data/LinksData'
import bioData from '../data/BioData'
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import {db} from '../utils/firebase'


export async function getServerSideProps(context) {
  try {
    const { username } = context.params;
    
    const userDocRef = doc(db, 'users', username); 
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return {
        props: {
          firestoreData: false,
        },
      };
    }

    const userData = userDocSnap.data();

    if (userData.createdAt instanceof Timestamp) {
      userData.createdAt = userData.createdAt.toDate().toString(); 
    }

    return {
      props: {
        firestoreData: {
          userData, 
        },
      },
    };

  } catch (error) {
    console.error('Error fetching data from Firestore:', error);
    return {
      props: {
        firestoreData: null,
      },
    };
  }
}

const UserProfile = ({firestoreData}) => {
  const darkMode = useDarkMode(false, { storageKey: null, onChange: null })
  const theme = darkMode.value ? darkTheme : lightTheme

  if (firestoreData === false) {
    // TODO: Add not found page here
    return <div>Data not found</div>;
  }else if(firestoreData === null){
    return <div>Error in fetching data try agina later</div>;
  }

  const bio = firestoreData?.userData?.bio || bioData
  const links = firestoreData?.userData?.links || allLinks

  // TODO: Add loading spinner

  return (
    <>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <UserLayout>
          <WebLinks allLinks={links} bioData={bio} />
        </UserLayout>
      </ThemeProvider>
    </>
  )
}

export default UserProfile
