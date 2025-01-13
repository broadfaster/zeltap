import React, { useState, useCallback, useEffect, useRef } from 'react'
import cn from 'classnames'
import Loader from '../Loader'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db, auth } from '../../utils/firebase'
import { useStateContext } from '../../utils/context/StateContext'
import toast from 'react-hot-toast'

import styles from './UserLinksForm.module.sass'

const UserBioForm = ({
  className,
  handleClose,
  disable,
  linkData,
  handleLinkUpdate,
}) => {
  const [fields, setFields] = useState({
    id: linkData.id || '',
    title: linkData.title || '',
    url: linkData.url || '',
  })
  const { cosmicUser } = useStateContext()
  const [fillFiledMessage, setFillFiledMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const inputElement = useRef(null)

  useEffect(() => {
    if (inputElement.current) {
      inputElement.current.focus()
    }
    console.log(fields, '################')
  }, [disable, fields])

  const handleChange = ({ target: { name, value } }) => {
    setFields(prevFields => ({
      ...prevFields,
      [name]: value,
    }))
  }

  const submitForm = useCallback(
    async e => {
      e.preventDefault()
      setFillFiledMessage('')
      setLoading(true)

      const { id, title, url } = fields

      if (!title || !url) {
        setFillFiledMessage('Please provide both title and URL.')
        setLoading(false)
        return
      }

      if (title && url) {
        try {
          const userDocRef = doc(db, 'users', cosmicUser.username)
          // Retrieve the current document
          const userDocSnap = await getDoc(userDocRef)

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data()
            const links = userData.links || []
            const linkIndex = links.findIndex(link => link.id === id)
            if (linkIndex === -1) {
              setFillFiledMessage('Link not found.')
              setLoading(false)
              return
            }
            const updatedLinks = [...links]

            updatedLinks[linkIndex] = {
              ...updatedLinks[linkIndex], // Keep all other fields intact
              title, // Update the title
              url, // Update the URL
            }

            // Write the updated links array back to Firestore
            await updateDoc(userDocRef, { links: updatedLinks })

            // console.log(updatedLinks[linkIndex], '################')

            setFields({
              id: updatedLinks[linkIndex].id,
              title: updatedLinks[linkIndex].title,
              url: updatedLinks[linkIndex].url,
            })

            handleLinkUpdate(updatedLinks[linkIndex])

            toast.success('Link updated successfully!', {
              position: 'bottom-right',
            })

            setFillFiledMessage('link updated successfully!')
            handleClose()
          } else {
            throw new Error('User document not found.')
          }
        } catch (error) {
          toast.error('Failed to update Link. Please try again.', {
            position: 'bottom-right',
          })
          setFillFiledMessage('Failed to update Link. Please try again.')
        }
      } else {
        setFillFiledMessage('Please fill URL Field.')
      }
      setLoading(false)
    },
    [cosmicUser.username, fields, linkData.id, handleClose]
  )

  return (
    <div className={cn(className, styles.transfer)}>
      <div className={cn('h4', styles.title)}>Link</div>

      <div className={styles.error}>{fillFiledMessage}</div>
      <form className={styles.form} action="submit" onSubmit={submitForm}>
        <div className={styles.field}>
          <label className={styles.label}>TITLE</label>
          <input
            className={styles.input}
            type="text"
            name="title"
            placeholder="Enter Title"
            onChange={handleChange}
            value={fields.title}
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>URL</label>
          <input
            className={styles.input}
            type="text"
            name="url"
            placeholder="Enter URL"
            onChange={handleChange}
            value={fields.url}
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
            {loading ? <Loader /> : 'Update'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserBioForm
