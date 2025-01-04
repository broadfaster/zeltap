import React from 'react'
import cn from 'classnames'
import Image from '../components/Image'
import styles from '../styles/pages/NotFound.module.sass'
import SignupAuth from '../components/SignupAuth'

const Signup = () => {
  return (
    <>
      <div className={cn('section', styles.section)}>
        <div className={cn('container', styles.container)}>
          <div className={styles.wrap}>
            <div className={styles.preview}>
              <Image
                size={{ width: '100%', height: '10vh' }}
                src="/images/content/figures-dark.png"
                srcDark="/images/content/figures-dark.png"
                alt="Figures"
              />
            </div>
            <SignupAuth />
          </div>
        </div>
      </div>
    </>
  )
}

export default Signup
