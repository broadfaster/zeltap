import { Toaster } from 'react-hot-toast'
import { StateContext } from '../utils/context/StateContext'
import Script from 'next/script'

import '../styles/app.sass'

function MyApp({ Component, pageProps }) {
  return (
    <>
    <Script src="https://checkout.razorpay.com/v1/checkout.js"></Script>
    <StateContext>
      <Toaster />
      <Component {...pageProps} />
    </StateContext>
    </>
  )
}

export default MyApp
