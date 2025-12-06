import { Suspense } from 'react'
import UrlStateClient from './UrlStateClient'

export default function Page() {
  return (
    <Suspense>
      <UrlStateClient />
    </Suspense>
  )
}
