import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Admin() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login page
    router.replace('/admin/login')
  }, [router])

  return (
    <>
      <Head>
        <title>Admin - Redirecting...</title>
      </Head>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Redirecting to login...</p>
      </div>
    </>
  )
}

