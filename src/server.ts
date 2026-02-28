import "dotenv/config"
import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.routes.js"
import teamsRoutes from "./routes/teams.routes.js"
import tasksRoutes from "./routes/tasks.routes.js"
import { errorHandler } from "./middlewares/error.handler.middleware.js"

const app = express()
const port = process.env.PORT || 3000

app.use(cors({ origin: "*" }))

app.use(express.json())

app.use(authRoutes)
app.use(teamsRoutes)
app.use(tasksRoutes)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`app listening on http://localhost:${port}`)
})
