import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { HexIcon, NewUp, OvalIcon } from '../icons'
import { FooterData } from '../../utils/constants/appConstants'
import Icon from '../Icon'
import { auth, uploadImageForUser } from '../../utils/firebase'
import bioDataTemplate from '../../data/bioDataTemplate'
import mergeUserBioData from '../../utils/mergeUserBioData'
import Modal from '../Modal'
import CustModal from '../CustModal'
import UserBioForm from '../UserBioForm'
import linksDataTemplate from '../../data/linksDataTemplate'
import AddUserLinksForm from '../AddUserLinksForm'
import { ClipLoader } from 'react-spinners'

import style from '../AddUserLinksForm/AddUserLinksForm.module.sass'
import UserLinksForm from '../UserLinksForm'

const Links = ({ allLinks, firebaseBioData, isUserProfileOwner }) => {
  const bioData = mergeUserBioData(firebaseBioData, bioDataTemplate)
  const {
    name,
    description,
    subdesc,
    descShow,
    subdescShow,
    avatarImg,
    nftAvatar,
    username,
    url,
    newProduct,
    newProductUrl,
  } = bioData

  const [editableBioData, setEditableBioData] = useState({
    name,
    description,
    subdesc,
  })

  const [addLinksData, setAddLinksData] = useState(allLinks || [])
  const [visibleAddLinksModal, setVisibleAddLinksModal] = useState(false)
  const [linksLoading, setLinksLoading] = useState(false)
  const [visibleBioModal, setVisibleBioModal] = useState(false)
  const [visibleLinkModal, setVisibleLinkModal] = useState(false)
  const [linkData, setLinkData] = useState({
    id: '',
    title: '',
    url: '',
    type: '',
    idx: '',
  })

  // static data
  const footerText = FooterData?.footerText
  const author = FooterData?.author
  const authorURL = FooterData?.authorURL

  // Check what class to use oval or hex for avatar
  const avatarShape = nftAvatar ? `nft-clipped` : `oval-clipped`

  // Description and subdescription goes here
  const descriptionText = descShow
    ? editableBioData.description
    : `Please Add Description`
  const subdescText = subdescShow
    ? editableBioData.subdesc
    : `Please Add Sub Description or Remove`

  // social section
  const social = addLinksData.filter(el => {
    return el.type === 'social' && el.on
  })

  // links section
  const links = addLinksData.filter(el => {
    return el.type === 'links' && el.on
  })

  // nfts
  const nfts = addLinksData.filter(el => {
    return el.type === 'nft' && el.on
  })

  // card section
  const cards = addLinksData.filter(el => {
    return el.type === 'card' && el.on
  })

  const handleEditClick = () => {
    document.getElementById('fileInput').click()
  }

  const handleFileChange = event => {
    const file = event.target.files[0]
    const username = auth.currentUser.username // Get the current authenticated user's UID
    if (file) {
      uploadImageForUser(file, username)
    }
  }

  const handleLinksClick = (e, data, index) => {
    e.preventDefault()
    setLinkData({
      id: data.id,
      title: data.title,
      url: data.url,
      type: data.type,
      idx: index,
    })
    setVisibleLinkModal(true)
  }

  const handleBioUpdate = useCallback(
    updatedBio => {
      setEditableBioData(updatedBio)
      setVisibleBioModal(false)
    },
    [editableBioData, setEditableBioData]
  )

  const handleAllLinksUpdate = useCallback(
    updatedAllLinks => {
      setLinksLoading(true)
      setAddLinksData([...addLinksData, updatedAllLinks])
      setTimeout(() => {
        setLinksLoading(false)
      }, 1500)
      setVisibleAddLinksModal(false)
    },
    [addLinksData, setAddLinksData]
  )

  const handleLinkUpdate = useCallback(
    updatedLink => {
      setLinkData({
        ...linkData,
        id: updatedLink.id,
        title: updatedLink.title,
        url: updatedLink.url,
      })
      setVisibleLinkModal(false)
      // Using switch to set data to user input data state for UserLinks Form on click to edit if profile owner
      switch (linkData.type) {
        case 'links':
          links[linkData.idx].title = updatedLink.title
          links[linkData.idx].url = updatedLink.url
          break
        case 'social':
          social[linkData.idx].title = updatedLink.title
          social[linkData.idx].url = updatedLink.url
          break
        case 'nft':
          nfts[linkData.idx].title = updatedLink.title
          nfts[linkData.idx].url = updatedLink.url
          break
        case 'card':
          cards[linkData.idx].title = updatedLink.title
          cards[linkData.idx].url = updatedLink.url
          break
        default:
          break
      }
    },
    [linkData, setLinkData]
  )

  const handleLinkDelete = useCallback(
    updatedAllLinks => {
      setAddLinksData([...updatedAllLinks])
      setVisibleLinkModal(false)
    },
    [addLinksData, setAddLinksData]
  )

  return (
    <>
      <LinkWrapper>
        {isUserProfileOwner && (
          <MainEditBtn onClick={() => setVisibleBioModal(true)}>
            <Icon name="pencil" size="18" />
          </MainEditBtn>
        )}
        <LinkContainer>
          <TopPart>
            <LinkHeader>
              <Avatar>
                <AvatarWrap>
                  {/* Avatar svg  hex or oval if nftAvatar=true will convert to hex */}
                  <HexIcon />
                  <OvalIcon />
                  <div className={`${avatarShape} avatar-border`}></div>
                  <div className={`${avatarShape} avatar-fill`}></div>
                  {avatarImg ? (
                    <img src={avatarImg} className={avatarShape} />
                  ) : (
                    <img
                      src={'/images/content/avatar.png'}
                      className={avatarShape}
                    />
                  )}
                  {isUserProfileOwner && (
                    <>
                      <EditIcon onClick={handleEditClick}>
                        <Icon name="pencil" size="18" />
                      </EditIcon>

                      <input
                        type="file"
                        id="fileInput"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </>
                  )}
                </AvatarWrap>
              </Avatar>
              <Title>
                <h1>{editableBioData.name}</h1>
                {username ? (
                  <h3>
                    <a href={`${url}`}>{username}</a>
                  </h3>
                ) : (
                  ''
                )}
              </Title>
            </LinkHeader>

            {/* Bio Section */}
            <LinkBio>
              <h1>{descriptionText}</h1>
              <h4>{subdescText}</h4>
            </LinkBio>
            {/* End Bio Section */}

            {/* Weblinks started */}
            {linksLoading ? (
              <ClipLoader
                size={50}
                color="#36D7B7"
                loading={linksLoading}
                cssOverride={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ) : (
              <WebLinkWrap>
                {/* Social Icon */}
                <LinkSection className="social">
                  <div className="iconsonly">
                    {social.map((i, index) => {
                      return isUserProfileOwner ? (
                        <a
                          key={i.id}
                          onClick={e => handleLinksClick(e, i, index)}
                        >
                          <LinkBox className="socialIcon">
                            <img
                              src={i.icon}
                              style={{ filter: 'var(--img)' }}
                            />
                          </LinkBox>
                        </a>
                      ) : (
                        <a
                          href={i.url}
                          key={i.id}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <LinkBox className="socialIcon">
                            <img
                              src={i.icon}
                              style={{ filter: 'var(--img)' }}
                            />
                          </LinkBox>
                        </a>
                      )
                    })}
                  </div>
                </LinkSection>
                {/* Social Icon */}

                {/* Cards Section */}
                {cards.length > 0 ? (
                  <LinkSection>
                    <h3>{cards[0]?.type}</h3>
                    {/* BioData.js > newProduct == true */}
                    {/* New Section will render once newProduct == true */}
                    {newProduct ? (
                      <NewSection>
                        <a
                          href={newProductUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img src={'/newproduct.png'} className="newproduct" />
                        </a>
                      </NewSection>
                    ) : (
                      ''
                    )}
                    {/* End Biodata.js, You can move this section anywhere */}
                    {cards.map(i => {
                      return (
                        <a
                          href={i.url}
                          key={i.id}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <LinkBox>
                            <LinkTitle>
                              <img src={i.icon} /> {i.title}
                            </LinkTitle>{' '}
                            <NewUp />
                          </LinkBox>
                        </a>
                      )
                    })}
                  </LinkSection>
                ) : (
                  ''
                )}
                {/* End Other Section */}
                {/* Links Section */}
                {links.length > 0 ? (
                  <LinkSection>
                    <h3>{links[0]?.type}</h3>
                    {links.map((i, index) => {
                      return isUserProfileOwner ? (
                        <a
                          key={i.id}
                          onClick={e => handleLinksClick(e, i, index)}
                        >
                          <LinkBox>
                            <LinkTitle>
                              <img
                                src={i.icon}
                                style={{ filter: 'var(--img)' }}
                              />{' '}
                              {i.title}
                            </LinkTitle>{' '}
                            <NewUp />
                          </LinkBox>
                        </a>
                      ) : (
                        <a
                          href={i.url}
                          key={i.id}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <LinkBox>
                            <LinkTitle>
                              <img
                                src={i.icon}
                                style={{ filter: 'var(--img)' }}
                              />{' '}
                              {i.title}
                            </LinkTitle>{' '}
                            <NewUp />
                          </LinkBox>
                        </a>
                      )
                    })}
                  </LinkSection>
                ) : (
                  ''
                )}
                {/* End Links Section */}
                {/* NFT Section */}
                {nfts.length > 0 ? (
                  <LinkSection>
                    <h3>{nfts[0]?.type}s</h3>
                    {nfts.map((i, index) => {
                      return isUserProfileOwner ? (
                        <a
                          key={i.id}
                          onClick={e => handleLinksClick(e, i, index)}
                        >
                          <LinkBox>
                            <LinkTitle>
                              <img
                                src={i.icon}
                                style={{ filter: 'var(--img)' }}
                              />{' '}
                              {i.title}
                            </LinkTitle>{' '}
                            <NewUp />
                          </LinkBox>
                        </a>
                      ) : (
                        <a
                          href={i.url}
                          key={i.id}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <LinkBox>
                            <LinkTitle>
                              <img
                                src={i.icon}
                                style={{ filter: 'var(--img)' }}
                              />{' '}
                              {i.title}
                            </LinkTitle>{' '}
                            <NewUp />
                          </LinkBox>
                        </a>
                      )
                    })}
                  </LinkSection>
                ) : (
                  ''
                )}
                {/* End NFT Section */}
              </WebLinkWrap>
            )}
            {/* End Weblinks */}
          </TopPart>
          <BottomPart>
            <LinkFoot>
              <h4>
                {footerText} <a href={authorURL}>{author}</a>
              </h4>
            </LinkFoot>
          </BottomPart>
        </LinkContainer>
        <Modal
          visible={visibleBioModal}
          onClose={() => setVisibleBioModal(false)}
        >
          <UserBioForm
            bioData={editableBioData}
            handleBioUpdate={handleBioUpdate}
            handleClose={() => setVisibleBioModal(false)}
          />
        </Modal>
        <Modal
          visible={visibleLinkModal}
          onClose={() => setVisibleLinkModal(false)}
        >
          <UserLinksForm
            linkData={linkData}
            handleLinkUpdate={handleLinkUpdate}
            handleLinkDelete={handleLinkDelete}
            handleClose={() => setVisibleLinkModal(false)}
          />
        </Modal>
      </LinkWrapper>

      <AddLinksButtonWrapper>
        {isUserProfileOwner && (
          <AddLinksButton onClick={() => setVisibleAddLinksModal(true)}>
            <Icon name="plus" size="18" />
          </AddLinksButton>
        )}
      </AddLinksButtonWrapper>
      <CustModal
        outerClassName={style.outerClass}
        visible={visibleAddLinksModal}
        onClose={() => setVisibleAddLinksModal(false)}
        disable={true}
      >
        <AddUserLinksForm
          allLinksData={linksDataTemplate}
          handleAllLinksUpdate={handleAllLinksUpdate}
          handleClose={() => setVisibleAddLinksModal(false)}
        />
      </CustModal>
    </>
  )
}

export default Links

const LinkWrapper = styled.div`
  position: relative;
  align-items: center;
  justify-content: center;
  width: 650px;
  margin: 0 auto;
  @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
    width: 100%;
  }
`

const AddLinksButtonWrapper = styled.div`
  position: relative;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
    width: 100%;
  }
`

const LinkContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  padding: 24px;
`

const LinkHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60px;
  margin-bottom: 12px;
  @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
    margin-top: 20px;
  }
`

const Avatar = styled.div`
  height: 90px;
  width: 90px;
  position: relative;
  margin-bottom: 12px;
`

const AvatarWrap = styled.div`
  height: 100%;
  width: 100%;
  filter: drop-shadow(0px 1px 2px var(--avatar-shadow));
  img {
    height: calc(100% - 6px);
    width: calc(100% - 6px);
  }
  .avatar-border {
    height: 100%;
    width: 100%;
    position: absolute;
    background: ${({ theme }) => theme.bg.primary};
  }
  .avatar-fill {
    height: calc(100% - 6px);
    width: calc(100% - 6px);
    position: absolute;
    background: ${({ theme }) => theme.bg.primary};
  }
`

const EditIcon = styled.div`
  position: absolute;
  bottom: 5px;
  right: 5px;
  cursor: pointer;
  background-color: white;
  border-radius: 50%;
  padding: 5px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #f0f0f0;
  }
`

const MainEditBtn = styled.div`
  position: fixed; /* Use fixed for consistent positioning relative to the viewport */
  top: 20px; /* Distance from the top */
  right: 30px; /* Distance from the right */
  cursor: pointer;
  background-color: white;
  border-radius: 50%;
  padding: 15px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #f0f0f0;
  }
`

const Title = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  h1 {
    font-size: 38px;
    font-weight: 700;

    letter-spacing: -2px;
    background: linear-gradient(
      90deg,
      #4ab1f1 5.71%,
      #566cec 33.77%,
      #d749af 61.82%,
      #ff7c51 91.21%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
      font-size: 32px;
    }
  }
  h3 {
    margin-top: 6px;
    font-size: 18px;
    font-weight: 500;
    letter-spacing: -0.7px;
    color: ${({ theme }) => theme.text.secondary};
    opacity: 0.5;
    @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
      font-size: 15px;
      margin-top: 2px;
    }
  }

  .name {
    margin-top: 8px;
    @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
      width: 140px;
    }
  }
  .handle {
    height: 32px;
    margin-top: 6px;
    margin-bottom: 6px;
    @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
      height: 26px;
    }
  }
`

const LinkBio = styled.div`
  display: flex;
  flex-direction: column;
  h1 {
    font-size: 22px;
    line-height: 30px;
    font-weight: 500;
    letter-spacing: -0.6px;
    padding: 0 20px;
    @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
      font-size: 18px;
      line-height: 26px;
      padding: 0 8px;
    }
    vertical-align: middle;
    span {
      font-size: 12px;
      vertical-align: bottom;
      line-height: 30px;
      color: ${({ theme }) => theme.text.secondary};
      margin: 0 2px;
      @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
        font-size: 10px;
        line-height: 20px;
      }
    }
  }
  h4 {
    font-size: 18px;
    letter-spacing: -0.5px;
    margin: 10px 0;
    color: ${({ theme }) => theme.text.secondary};
    font-weight: 500;
    @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
      font-size: 15px;
      padding: 0 20px;
      line-height: 24px;
    }
    a {
      font-weight: 700;
      opacity: 0.7;
      &:hover {
        opacity: 1;
      }
    }
  }
`

const TopPart = styled.div``

const BottomPart = styled.div`
  margin-bottom: 40px;
`
const LinkFoot = styled.div`
  h4 {
    color: ${({ theme }) => theme.text.secondary};
    line-height: 32px;
    letter-spacing: -0.2px;
    font-size: 16px;
    font-weight: 500;
    @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
      font-size: 12px;
    }
    span {
      font-size: 10px;
      vertical-align: bottom;
      line-height: 32px;
      margin: 0 2px;
      opacity: 0.6;
      @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
        font-size: 8px;
      }
    }
  }
`

const WebLinkWrap = styled.div`
  @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
    padding: 0 12px;
  }
`

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
    justify-content: center;
    @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
      flex-wrap: wrap;
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
  justify-content: space-between;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.5px;
  position: relative;
  text-align: center;

  &::before {
    content: '';
    border-radius: 12px;
    display: block;
    position: absolute;
    z-index: -1;
    inset: -2px;
    opacity: 0;
    transform: scale(0.8);
  }
  &:hover {
    transition: all 333ms ease 0s;
    border-color: transparent;
    &::before {
      opacity: 1;
      background: ${({ theme }) => theme.bg.hover};
      transition: all 333ms ease 0s;
      transform: scale(1);
    }
  }
  .new-up {
    transform: scale(0.8);
    opacity: 0.7;
  }

  &.socialIcon {
    padding: 16px;
    border-radius: 50%;
    border: none;
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
const LinkTitle = styled.div`
  display: flex;
  font-size: 18px;
  align-items: center;
  @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
    font-size: 14px;
  }
  img {
    height: 20px;
    margin-right: 10px;
  }
`

const NewSection = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border: 1px solid ${({ theme }) => theme.bg.secondary};
    border-radius: 12px;
    cursor: pointer;
    &:hover {
      transform: scale(1.01) rotate3d(1, 1, 0, 2deg);
      transition: transform 0.3s ease-in-out;
    }
  }
`

const AddLinksButton = styled.div`
  position: absolute;
  bottom: 50px;
  right: 30px;
  cursor: pointer;
  background-color: white;
  border-radius: 50%;
  padding: 15px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #f0f0f0;
  }
`

const Loader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`
