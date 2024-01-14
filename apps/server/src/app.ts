import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN,
//     // credentials: true,
//   })
// )

app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(express.static('public'))
app.use(cookieParser())

// Routes Imports
import userRoutes from './routes/user.routes'
import categoryRoutes from './routes/category.routes'
import notesRouter from './routes/notes.routes'

app.use('/api/v1/users', userRoutes)
app.use('/api/v1/category', categoryRoutes)
app.use('/api/v1/note', notesRouter)

export { app }
