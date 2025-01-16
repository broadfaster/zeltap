import React, { useState, useCallback, useEffect, useRef } from 'react'
import cn from 'classnames'
import Loader from '../Loader'
import { runTransaction, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../utils/firebase'
import { useStateContext } from '../../utils/context/StateContext'
import toast from 'react-hot-toast'
import { NewUp } from '../icons'

import styles from './UserLinksForm.module.sass'

const UserLinksForm = ({
  className,
  handleClose,
  disable,
  linkData,
  handleLinkUpdate,
  handleLinkDelete,
  postData = false,
}) => {
  const [fields, setFields] = useState({
    id: linkData.id || '',
    title: linkData.title || '',
    url: linkData.url || '',
    icon: linkData.icon || '',
    on: true || false,
    type: linkData.type || '',
  })
  const { cosmicUser } = useStateContext()
  const [fillFiledMessage, setFillFiledMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const inputElement = useRef(null)

  useEffect(() => {
    if (inputElement.current) {
      inputElement.current.focus()
    }
  }, [disable])

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
              if (postData) {
                const updatedUserLinksArray = [...links, fields]
                // Write the updated links array back to Firestore
                await updateDoc(userDocRef, { links: updatedUserLinksArray })

                const userDocSnap = await getDoc(userDocRef)
                const userData = userDocSnap.data()
                const newLinks = userData.links || []
                const newLinkIndex = newLinks.findIndex(link => link.id === id)

                setFields({
                  id: updatedUserLinksArray[newLinkIndex].id,
                  title: updatedUserLinksArray[newLinkIndex].title,
                  url: updatedUserLinksArray[newLinkIndex].url,
                })

                handleLinkUpdate(updatedUserLinksArray[newLinkIndex])

                toast.success('Link updated successfully!', {
                  position: 'bottom-right',
                })

                setFillFiledMessage('link updated successfully!')

                handleClose()

                return
              } else {
                setFillFiledMessage('Link not found.')
                setLoading(false)
                return
              }
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

  const handleDelete = useCallback(async () => {
    setDeleteLoading(true)
    try {
      const { id } = fields
      const userDocRef = doc(db, 'users', cosmicUser.username)
      await runTransaction(db, async transaction => {
        const userDoc = await transaction.get(userDocRef)
        if (!userDoc.exists()) {
          throw new Error('User document not found.')
        }
        const userData = userDoc.data()
        const links = userData.links || []
        const updatedLinks = links.filter(link => link.id !== id)

        transaction.update(userDocRef, { links: updatedLinks })
        // Notify the parent
        handleLinkDelete(updatedLinks) // Send updated array
      })
      toast.success('Link deleted successfully!', {
        position: 'bottom-right',
      })
      handleClose()
    } catch (error) {
      toast.error('Failed to delete Link. Please try again.', {
        position: 'bottom-right',
      })
      console.error('Delete Error:', error)
    } finally {
      setDeleteLoading(false)
    }
  }, [cosmicUser.username, fields.id, handleClose])

  return (
    <div className={cn(className, styles.transfer)}>
      <div className={cn('h4', styles.title)}>Link</div>

      <div className={styles.error}>{fillFiledMessage}</div>
      <form className={styles.form} action="submit" onSubmit={submitForm}>
        <div className={styles.field}>
          <label className={styles.label}>TITLE</label>
          <div className={styles.inputWrapper}>
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
        </div>
        <div className={styles.field}>
          <label className={styles.label}>URL</label>
          <div className={styles.inputWrapper}>
            <input
              className={styles.input}
              type="text"
              name="url"
              placeholder="Enter URL"
              onChange={handleChange}
              value={fields.url}
              required
            />
            <a
              className={styles.icon}
              href={fields.url}
              target="_blank"
              rel="noreferrer"
            >
              <NewUp />
            </a>
          </div>
        </div>

        <div className={styles.btns}>
          {postData ? (
            <button
              type="submit"
              className={cn('button', styles.button)}
              disabled={loading}
            >
              {loading ? <Loader /> : 'Add'}
            </button>
          ) : (
            <>
              <button
                type="submit"
                className={cn('button', styles.button)}
                disabled={loading}
              >
                {loading ? <Loader /> : 'Update'}
              </button>
              <button
                onClick={deleteLoading ? null : handleDelete}
                className={cn('button-stroke', styles.button)}
                disabled={deleteLoading}
              >
                {deleteLoading ? <Loader /> : 'Delete'}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}

export default UserLinksForm
