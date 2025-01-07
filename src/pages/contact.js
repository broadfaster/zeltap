import React, { useState, useCallback } from 'react'
import cn from 'classnames'
import toast from 'react-hot-toast'
import { useStateContext } from '../utils/context/StateContext'
import Layout from '../components/Layout'
import TextInput from '../components/TextInput'
import Loader from '../components/Loader'
import { getAllDataByType } from '../lib/cosmic'
import createFormFields from '../utils/constants/createFormFields'
import styles from '../styles/pages/UploadDetails.module.sass'
import { PageMeta } from '../components/Meta'

const Contact = ({ navigationItems }) => {
  const { navigation } = useStateContext()
  const [fillFiledMessage, setFillFiledMessage] = useState(false)
  const [{ name, phone, email, message }, setFields] = useState(
    () => createFormFields
  )
  const [loading, setLoading] = useState(false)

  const handleChange = ({ target: { name, value } }) => {
    if (name === 'phone') {
      // Remove any non-numeric characters
      const phoneNumber = value.replace(/\D/g, '')

      if (phoneNumber.length <= 10) {
        setFields(prevFields => ({
          ...prevFields,
          [name]: phoneNumber,
        }))
      }
    } else {
      setFields(prevFields => ({
        ...prevFields,
        [name]: value,
      }))
    }
  }

  const submitForm = useCallback(
    async e => {
      e.preventDefault()

      if (name && phone && email && message) {
        setFillFiledMessage(false)
        setLoading(true)
        const leadData = {
          name,
          phone,
          email,
          message,
        }
        try {
          const response = await fetch('/api/form', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(leadData),
          })

          const createdContactDetail = await response.json()

          if (response.ok) {
            setFields(createFormFields)
            toast.success(
              `Thank you, we will reach you soon at ${createdContactDetail['object']['title']}!`,
              {
                position: 'bottom-right',
              }
            )
          } else {
            toast.error(`Error: ${createdContactDetail.error}`, {
              position: 'bottom-right',
            })
          }
        } catch (error) {
          toast.error('Submission failed. Please try again later.', {
            position: 'bottom-right',
          })
        } finally {
          setLoading(false)
        }
      } else {
        setFillFiledMessage(true)
      }
    },
    [name, phone, email, message]
  )
  return (
    <Layout navigationPaths={navigationItems[0]?.metadata || navigation}>
      <PageMeta
        title={'Support'}
        description={
          'Explore electric scooters and e-bikes in India. Choose Zecon that connects the nation from Kashmir to Kerala, a clean mobility solution.'
        }
      />
      <div className={cn('section', styles.section)}>
        <div className={cn('container', styles.container)}>
          <div className={styles.wrapper}>
            <div className={styles.head}>
              <div className={cn('h2', styles.title)}>Contact Us</div>
            </div>
            <form className={styles.form} action="" onSubmit={submitForm}>
              <div className={styles.list}>
                <div className={styles.item}>
                  <div className={styles.category}>
                    Please Enter Your Details
                  </div>
                  <div className={styles.fieldset}>
                    <TextInput
                      className={styles.field}
                      label="Your Name"
                      name="name"
                      type="text"
                      placeholder="e. g. Akshat Kumar"
                      onChange={handleChange}
                      value={name}
                      required
                    />
                    <TextInput
                      className={styles.field}
                      label="Your Phone"
                      name="phone"
                      type="tel"
                      placeholder="e. g. 989783XXXX"
                      onChange={handleChange}
                      value={phone}
                      required
                    />
                    <TextInput
                      className={styles.field}
                      label="Your Email"
                      name="email"
                      type="email"
                      placeholder="e. g. kumar@gmail.com"
                      onChange={handleChange}
                      value={email}
                    />
                    <TextInput
                      className={styles.field}
                      label="Message"
                      name="message"
                      type="text"
                      placeholder="e. g. Hey I have some queries"
                      onChange={handleChange}
                      value={message}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className={styles.foot}>
                <button
                  className={cn('button', styles.button)}
                  onClick={submitForm}
                  type="submit"
                >
                  {loading ? <Loader /> : 'Submit'}
                </button>
                {fillFiledMessage && (
                  <div className={styles.saving}>
                    <span className={styles.fillmessage}>
                      Please fill all fields
                    </span>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Contact

export async function getServerSideProps() {
  const navigationItems = (await getAllDataByType('navigation')) || []
  return {
    props: { navigationItems },
  }
}
