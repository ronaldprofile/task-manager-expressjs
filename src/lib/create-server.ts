import express from "express"
import cors from "cors"
import { AuthRepository } from "../repositories/auth.repository.js"
import { AuthService } from "../services/auth.service.js"
import { JWTService } from "../services/jwt.service.js"
import { AuthController } from "../controllers/auth.controller.js"
import { errorHandler } from "../middlewares/error.handler.middleware.js"
import { authenticate } from "../middlewares/authenticate.middleware.js"
import { authorize } from "../middlewares/authorize.middleware.js"
import { TaskRepository } from "../repositories/task.repository.js"
import { TeamRepository } from "../repositories/team.repository.js"
import { TasksService } from "../services/tasks.service.js"
import { TasksController } from "../controllers/task.controller.js"

const app = express()

app.use(express.json())
app.use(cors({ origin: "*" }))

const authRepository = new AuthRepository()
const authService = new AuthService(authRepository)
const jwtService = new JWTService()
const authController = new AuthController(authService, jwtService)

const taskRepository = new TaskRepository()
const teamRepository = new TeamRepository()

const taskService = new TasksService(taskRepository, teamRepository)
const taskController = new TasksController(taskService)

app.post("/auth/register", authController.signUp)
app.post("/auth/login", authController.signIn)

app.get("/tasks", authenticate, authorize(["ADMIN"]), taskController.readTasks)
app.get(
  "/tasks/:teamId",
  authenticate,
  authorize(["ADMIN", "MEMBER"]),
  taskController.readTasksFromTeam
)

app.post(
  "/tasks/:teamId/:assignedTo",
  authenticate,
  authorize(["ADMIN"]),
  taskController.register
)

app.put(
  "/tasks/:taskId",
  authenticate,
  authorize(["ADMIN", "MEMBER"]),
  taskController.update
)

app.delete(
  "/tasks/:taskId",
  authenticate,
  authorize(["ADMIN"]),
  taskController.remove
)

app.use(errorHandler)

export default app
