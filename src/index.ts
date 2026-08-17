import app from './app'

const port = parseInt(process.env.PORT || '3000')

Bun.serve({
  port,
  hostname: '127.0.0.1',
  fetch(req) {
    return app.fetch(req, { env: { ...process.env } })
  },
})

console.log(`Server running on http://localhost:${port}`)
