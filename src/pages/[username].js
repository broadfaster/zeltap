import React, { useState, useEffect } from 'react'
import WebLinks from '../components/WebLinks/WebLinks'
import UserLayout from '../components/UserLayout/UserLayout'
import { ThemeProvider } from 'styled-components'
import { darkTheme, lightTheme } from '../styles/theme.config'
import useDarkMode from 'use-dark-mode'
import GlobalStyle from '../styles/GlobalStyle'
import allLinks from '../data/LinksData'
import bioData from '../data/BioData'

const UserProfile = () => {
  const darkMode = useDarkMode(false, { storageKey: null, onChange: null })
  const theme = darkMode.value ? darkTheme : lightTheme

  return (
    <>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <UserLayout>
          <WebLinks allLinks={allLinks} bioData={bioData} />
        </UserLayout>
      </ThemeProvider>
    </>
  )
}

export default UserProfile
