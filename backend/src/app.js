import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import employeesRouter from './routes/employees.js'

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1

  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'ok' : 'unavailable',
    database: databaseConnected ? 'connected' : 'disconnected',
  })
})

app.use('/api/employees', employeesRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((error, _req, res, _next) => {
  if (!error.status || error.status >= 500) console.error(error)
  if (error.code === 11000) {
    return res.status(409).json({ error: 'An employee with this email already exists' })
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ error: error.message })
  }
  res.status(error.status || 500).json({
    error: error.status ? error.message : 'Internal server error',
  })
})

export default app
