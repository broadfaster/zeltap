import React, { useState, useCallback, useEffect, useRef } from 'react'
import cn from 'classnames'
import { useRouter } from 'next/router'
import AppLink from '../AppLink'
import Loader from '../Loader'
import registerFields from '../../utils/constants/registerFields'
import { db, auth } from '../../utils/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { useStateContext } from '../../utils/context/StateContext'
import { setToken } from '../../utils/token'

import styles from './SignupAuth.module.sass'

const SignupAuth = ({
  className,
  handleClose,
  handleOAuth,
  disable,
  setAuthMode,
}) => {
  const { setCosmicUser } = useStateContext()
  const { push } = useRouter()

  const [{ username, email, password }, setFields] = useState(
    () => registerFields
  )
  const [fillFiledMessage, setFillFiledMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [isUsernameValid, setIsUsernameValid] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)

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
    if (name === 'username') {
      // TODO: Use Debounce Login
      validateUsername(value)
    }
  }

  const validateUsername = useCallback(async username => {
    if (!username) {
      setIsUsernameValid(false)
      return
    }
    setCheckingUsername(true)
    try {
      // Check if the username exists as a document ID in the "users" collection
      const docRef = doc(db, 'users', username)
      const docSnap = await getDoc(docRef)

      // Set the validity of the username based on whether the document exists
      setIsUsernameValid(!docSnap.exists())
    } catch (error) {
      console.error('Error checking username:', error)
      setIsUsernameValid(false)
    } finally {
      setCheckingUsername(false)
    }
  }, [])

  const submitForm = useCallback(
    async e => {
      e.preventDefault()
      fillFiledMessage?.length && setFillFiledMessage('')
      setLoading(true)

      if (username && email && password) {
        try {
          // Firebase Authentication: Create user
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          )
          const user = userCredential.user

          // Add user data to Firestore using username as the document ID
          const userDocRef = doc(db, 'users', username)
          await setDoc(userDocRef, {
            username,
            email,
            createdAt: new Date(),
            uid: user.uid, // Optional: Store Firebase UID for reference
          })

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
            setFillFiledMessage('Account created successfully!')
            setFields(registerFields)
            handleOAuth(user)
            handleClose()
          }
          // Redirect to user profile page
          push(`/${username}`)
        } catch (error) {
          if (error.code === 'auth/email-already-in-use') {
            // If email is already in use, redirect to login page
            setFillFiledMessage('Email is already in use. Please try login')
            // TODO:
            // setTimeout(() => {
            //   push('/login') // Redirect to /login after a short delay
            // }, 2000)
          } else {
            console.error('Error creating user:', error)
            setFillFiledMessage(error.message || 'Failed to create account.')
          }
        }
      } else {
        setFillFiledMessage('Please fill all fields.')
      }

      setLoading(false)
    },
    [username, email, password, push]
  )

  return (
    <div className={cn(className, styles.transfer)}>
      <div className={cn('h4', styles.title)}>Signup</div>
      <div className={styles.text}>
        Register an account at{' '}
        <AppLink target="_blank" href="https://www.zeltap.com">
          Zeltap
        </AppLink>
      </div>
      <div className={styles.error}>{fillFiledMessage}</div>
      <form className={styles.form} action="submit" onSubmit={submitForm}>
        <div className={styles.field}>
          <input
            ref={inputElement}
            className={styles.input}
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            value={username}
            required
          />
          {checkingUsername && (
            <span className={styles.loading}>Checking...</span>
          )}
        </div>
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
              [styles.disabled]:
                checkingUsername || !isUsernameValid || loading,
            })}
            disabled={checkingUsername || !isUsernameValid || loading}
          >
            {loading ? <Loader /> : 'Create'}
          </button>
          <button
            onClick={disable ? handleGoHome : undefined}
            className={cn('button-stroke', styles.button)}
          >
            {disable ? 'Return Home Page' : 'Cancel'}
          </button>
        </div>
      </form>
      <div className={styles.toggle}>
        <p className={cn(styles.para)}>Login to an existing account?</p>
        <button
          onClick={() => setAuthMode('login')}
          className={cn(styles.link)}
        >
          click here
        </button>
      </div>
    </div>
  )
}

export default SignupAuth
