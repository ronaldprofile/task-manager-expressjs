import 'dotenv/config'
import express from 'express'
import authRoutes from './auth/auth.routes.js'
import teamsRoutes from './teams/teams.routes.js'
import tasksRoutes from './tasks/tasks.routes.js'
import { errorHandler } from './middlewares/error.handler.middleware.js'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.use(authRoutes)
app.use(teamsRoutes)
app.use(tasksRoutes)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`app listening on http://localhost:${port}`)
})
