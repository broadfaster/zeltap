import React, { useState, useCallback, useEffect, useRef } from 'react'
import cn from 'classnames'
import { useRouter } from 'next/router'
import AppLink from '../AppLink'
import Loader from '../Loader'
import { db, auth } from '../../utils/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useStateContext } from '../../utils/context/StateContext'
import { setToken } from '../../utils/token'
import loginFields from '../../utils/constants/loginFields'

import styles from './LoginAuth.module.sass'

const LoginAuth = ({
  className,
  handleClose,
  handleOAuth,
  disable,
  setAuthMode,
}) => {
  const { cosmicUser, setCosmicUser } = useStateContext()
  const router = useRouter()
  const { push } = router

  const [{ email, password }, setFields] = useState(() => loginFields)
  const [fillFiledMessage, setFillFiledMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const inputElement = useRef(null)

  useEffect(() => {
    if (inputElement.current) {
      inputElement.current.focus()
    }
  }, [disable])

  const handleGoHome = () => {
    push('/')
  }

  const handleChange = ({ target: { name, value } }) => {
    setFields(prevFields => ({
      ...prevFields,
      [name]: value,
    }))
  }

  const submitForm = useCallback(
    async e => {
      e.preventDefault()
      const isItemsPage = router.asPath.includes('/item')
      fillFiledMessage?.length && setFillFiledMessage('')
      setLoading(true)

      if (email && password) {
        try {
          // Firebase Authentication: Sign in user
          const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          )
          const user = userCredential.user

          // Fetch the username from Firestore based on the email (inside users collection)
          const usersRef = collection(db, 'users')
          const q = query(usersRef, where('email', '==', email)) // Find user by email
          const querySnapshot = await getDocs(q)

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data()
            const username = querySnapshot.docs[0].id // Document ID is the username

            if (auth.currentUser) {
              setCosmicUser({
                uid: user.uid,
                username: username,
                email: user.email,
              })
              setToken({
                uid: user.uid,
                username: username,
                email: user.email,
              })
              setFillFiledMessage('Account LoggedIn successfully!')
              setFields(loginFields)
              handleOAuth(cosmicUser)
              // TODO : handle 404 part
              !isItemsPage ? push(`/${username}`) : handleClose()
              handleClose()
            }

            // User found in Firestore, redirect to the profile
          } else {
            setFillFiledMessage('User not found in the system.')
          }
        } catch (error) {
          console.error('Error logging in user:', error)
          setFillFiledMessage(error.message || 'Failed to log in.')
        }
      } else {
        setFillFiledMessage('Please fill all fields.')
      }
      setLoading(false)
    },
    [email, password, push]
  )

  return (
    <div className={cn(className, styles.transfer)}>
      <div className={cn('h4', styles.title)}>Login</div>
      <div className={styles.text}>
        Login to your account at{' '}
        <AppLink target="_blank" href="https://www.zeltap.com">
          Zeltap
        </AppLink>
      </div>
      <div className={styles.error}>{fillFiledMessage}</div>
      <form className={styles.form} action="submit" onSubmit={submitForm}>
        <div className={styles.field}>
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={email}
            required
          />
        </div>
        <div className={styles.field}>
          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            value={password}
            required
          />
        </div>
        <div className={styles.btns}>
          <button
            type="submit"
            className={cn('button', styles.button, {
              [styles.disabled]: loading,
            })}
            disabled={loading}
          >
            {loading ? <Loader /> : 'Login'}
          </button>
          <button
            onClick={handleGoHome}
            className={cn('button-stroke', styles.button)}
          >
            Cancel
          </button>
        </div>
      </form>
      <div className={styles.toggle}>
        <p className={cn(styles.para)}>Create an account?</p>
        <button
          onClick={() => setAuthMode('register')}
          className={cn(styles.link)}
        >
          click here
        </button>
      </div>
    </div>
  )
}

export default LoginAuth
