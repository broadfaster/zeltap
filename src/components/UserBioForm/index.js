import React, { useState, useCallback, useEffect, useRef } from 'react'
import cn from 'classnames'
import Loader from '../Loader'
import { doc, updateDoc } from 'firebase/firestore'
import { getActiveProfileCollectionRef } from '../../utils/firebase'
import { useStateContext } from '../../utils/context/StateContext'
import toast from 'react-hot-toast'

import styles from './UserBioForm.module.sass'

const UserBioForm = ({
  className,
  handleClose,
  disable,
  bioData,
  handleBioUpdate,
}) => {
  const { cosmicUser } = useStateContext()

  const [fields, setFields] = useState({
    name: bioData.name || '',
    description: bioData.description || '',
    subdesc: bioData.subdesc || '',
  })

  const [fillFiledMessage, setFillFiledMessage] = useState('')
  const [loading, setLoading] = useState(false)

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

      const { name, description, subdesc } = fields

      if (name && description && subdesc) {
        try {
          const userDocRef = await getActiveProfileCollectionRef(cosmicUser.username)

          await updateDoc(userDocRef.docs[0].ref, {
            'bio.name': fields.name,
            'bio.description': fields.description,
            'bio.subdesc': fields.subdesc,
          })

          handleBioUpdate({
            name,
            description,
            subdesc,
          })
          toast.success('Bio updated successfully!', {
            position: 'bottom-right',
          })
          setFillFiledMessage('Bio updated successfully!')
          handleClose()
        } catch (error) {
          toast.error('Failed to update bio. Please try again.', {
            position: 'bottom-right',
          })
          console.error('Error updating bio:', error)
          setFillFiledMessage('Failed to update bio. Please try again.')
        }
      } else {
        setFillFiledMessage('Please fill Name and Description fields.')
      }
      setLoading(false)
    },
    [fields, cosmicUser.username, handleClose]
  )

  return (
    <div className={cn(className, styles.transfer)}>
      <div className={cn('h4', styles.title)}>Update Bio</div>

      <div className={styles.error}>{fillFiledMessage}</div>
      <form className={styles.form} action="submit" onSubmit={submitForm}>
        <div className={styles.field}>
          <label className={styles.label}>Name</label>
          <input
            className={styles.input}
            type="text"
            name="name"
            placeholder="Enter Name"
            onChange={handleChange}
            value={fields.name}
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <input
            className={styles.input}
            type="text"
            name="description"
            placeholder="Enter Description"
            onChange={handleChange}
            value={fields.description}
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Sub Description</label>
          <input
            className={styles.input}
            type="text"
            name="subdesc"
            placeholder="Enter SubDescription"
            onChange={handleChange}
            value={fields.subdesc}
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
