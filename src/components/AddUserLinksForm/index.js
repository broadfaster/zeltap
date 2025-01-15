import React, { useState, useCallback, useEffect, useRef } from 'react'
import cn from 'classnames'
import { useStateContext } from '../../utils/context/StateContext'
import styled from 'styled-components'

import styles from './AddUserLinksForm.module.sass'
import Modal from '../Modal'
import UserLinksForm from '../UserLinksForm'

const AddUserLinksForm = ({
  className,
  handleClose,
  disable,
  allLinksData,
  handleAllLinksUpdate,
}) => {
  const [fields, setFields] = useState(
    allLinksData.filter(el => {
      return !el.on
    })
  )

  const [links, setLinks] = useState({
    id: '',
    title: '',
    url: '',
    icon: '',
    on: '',
    type: '',
  })

  const inputElement = useRef(null)
  const [visibleToAddLinksModal, setVisibleToAddLinksModal] = useState(false)

  const groupedLinks = fields.reduce((acc, link) => {
    if (!acc[link.type]) {
      acc[link.type] = []
    }
    acc[link.type].push(link)
    return acc
  }, {})

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

  return (
    <div className={cn(className, styles.transfer)}>
      <div className={cn('h4', styles.title)}>Add Links</div>
      {Object.keys(groupedLinks).map(type => (
        <div key={type}>
          <h3>{type.toUpperCase()}</h3>
          <LinkSection className="social">
            <div className="iconsonly">
              {groupedLinks[type].map((data, index) => (
                <LinkBox
                  key={data.id}
                  className="socialIcon"
                  onClick={() => {
                    setLinks({
                      ...groupedLinks[type][index],
                      id: `${Date.now().toString(36) + Math.random().toString(36).slice(2, 7)}`,
                      title: data.title,
                      url: '',
                    })
                    setVisibleToAddLinksModal(true)
                  }}
                >
                  <label className="label">{data?.title}</label>
                  <img
                    src={data.icon}
                    style={{
                      filter: 'var(--img)',
                      width: '50px',
                      height: '50px',
                      padding: '10px',
                    }}
                    alt={data.title}
                  />
                </LinkBox>
              ))}
            </div>
          </LinkSection>
        </div>
      ))}
      <Modal
        visible={visibleToAddLinksModal}
        onClose={() => setVisibleToAddLinksModal(false)}
      >
        <UserLinksForm
          linkData={links}
          handleLinkUpdate={handleAllLinksUpdate}
          handleClose={() => setVisibleToAddLinksModal(false)}
          postData={true}
        />
      </Modal>
    </div>
  )
}

export default AddUserLinksForm

const LinkSection = styled.div`
  padding: 12px 0;
  display: flex;
  margin: 0 auto;
  max-width: 400px;
  flex-direction: column;

  &.social {
    max-width: max-content;
    padding: 0;
    margin-bottom: 18px;
  }

  .iconsonly {
    display: flex;
    justify-content: flex-start;
    overflow-x: auto;
    white-space: nowrap;
    scrollbar-width: thin;

    ::-webkit-scrollbar {
      height: 8px;
    }

    ::-webkit-scrollbar-thumb {
      background: #888;
    }
  }

  h3 {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 4px;
    margin-bottom: 4px;
    color: ${({ theme }) => theme.text.secondary};

    @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
      font-size: 11px;
    }
  }
`

const LinkBox = styled.div`
  padding: 18px 20px;
  border-radius: 12px;
  margin: 8px 18px;
  border: 1px solid ${({ theme }) => theme.bg.secondary};
  flex-direction: row;
  display: flex;
  align-items: center;
  color: blue;
  justify-content: space-between;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.5px;
  position: relative;
  text-align: center;
  transition: all 0.3s ease;

  &::before {
    content: '';
    border-radius: 12px;
    display: block;
    position: absolute;
    z-index: -1;
    inset: -2px;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.3s ease;
  }

  /* Desktop hover effect */
  &:hover {
    border-color: transparent;
    &::before {
      opacity: 1;
      background: ${({ theme }) => theme.bg.hover};
      transform: scale(1);
    }
  }

  /* For mobile/tablet: Use :active and :focus for interaction */
  &:active,
  &:focus {
    border-color: transparent;
    &::before {
      opacity: 1;
      background: ${({ theme }) => theme.bg.hover};
      transform: scale(1);
    }
  }

  .new-up {
    transform: scale(0.8);
    opacity: 0.7;
  }

  &.socialIcon {
    padding: 16px;
    border-radius: 10%;
    border: 2px solid ${({ theme }) => theme.bg.secondary};
    margin: 4px;
    img {
      height: 24px;
    }

    @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
      padding: 10px;
      margin: 2px;
      img {
        height: 20px;
      }
    }
  }

  @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
    padding: 12px 16px;
    font-size: 16px;
  }
`
