import 'dotenv/config'
import express from 'express'
import authRoutes from './auth/auth.routes.js'
import teamsRoutes from './teams/teams.routes.js'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.use('/auth', authRoutes)
app.use('/teams', teamsRoutes)

app.listen(port, () => {
  console.log(`app listening on http://localhost:${port}`)
})
