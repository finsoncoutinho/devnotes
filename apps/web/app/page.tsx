'use client'

import { FC } from 'react'
import { Button } from '@/components/ui/button'

interface pageProps {}

const page: FC<pageProps> = ({}) => {
  const handleClick = () => {
    console.log('clicked')
  }
  return (
    <h1 className='text-3xl font-bold underline'>
      Welcome to devnotes
      <Button variant='default' onClick={handleClick}>
        Sign up
      </Button>
    </h1>
  )
}

export default page
