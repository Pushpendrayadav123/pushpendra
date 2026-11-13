import 'dotenv/config'
import mongoose from 'mongoose'
import app from './app.js'

const port = Number(process.env.PORT) || 5000
const mongoUri = process.env.MONGODB_URI

if (!mongoUri) {
  throw new Error('MONGODB_URI is required')
}

await mongoose.connect(mongoUri)

const server = app.listen(port, () => {
  console.log(`API server listening on port ${port}`)
})

const shutdown = (signal) => {
  console.log(`${signal} received; shutting down`)
  server.close(async (error) => {
    if (error) {
      console.error('Failed to close HTTP server', error)
      process.exitCode = 1
    }

    await mongoose.disconnect()
  })
}

process.once('SIGINT', () => shutdown('SIGINT'))
process.once('SIGTERM', () => shutdown('SIGTERM'))
