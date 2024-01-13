'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useForm, SubmitHandler } from 'react-hook-form'

type loginInputs = {
  email: string
  password: string
}
const page = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<loginInputs>()
  const onSubmit: SubmitHandler<loginInputs> = (data) => console.log(data)
  return (
    <div>
      <Card className='w-[350px]'>
        <CardHeader>
          <CardTitle>Welcome Back!</CardTitle>
          <CardDescription>Sign in to your DevNotes Account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              type='email'
              placeholder='Email'
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && <span>{errors.email.message}</span>}
            <Input
              type='password'
              placeholder='Password'
              {...register('password', {
                required: 'Password is required',
              })}
            />
            {errors.password && <span>{errors.password.message}</span>}
            <Button type='submit'>Login</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default page
