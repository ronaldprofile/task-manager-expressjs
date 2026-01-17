import { Router } from 'express'

import { authorize } from '../middlewares/authorize.middleware.js'
import { authenticate } from '../middlewares/authenticate.middleware.js'
import { TaskRepository } from '../repositories/task.repository.js'
import { TasksService } from '../services/tasks.service.js'
import { TasksController } from '../controllers/task.controller.js'
import { TeamRepository } from '../repositories/team.repository.js'

const router = Router()

const taskRepository = new TaskRepository()
const teamRepository = new TeamRepository()

const taskService = new TasksService(taskRepository, teamRepository)

const taskController = new TasksController(taskService)

router.get(
  '/tasks',
  authenticate,
  authorize(['ADMIN']),
  taskController.readTasks
)
router.get(
  '/tasks/:teamId',
  authenticate,
  authorize(['ADMIN', 'MEMBER']),
  taskController.readTasksFromTeam
)

router.post(
  '/tasks/:teamId/:assignedTo',
  authenticate,
  authorize(['ADMIN']),
  taskController.register
)

router.put(
  '/tasks/:taskId',
  authenticate,
  authorize(['ADMIN', 'MEMBER']),
  taskController.update
)

router.delete(
  '/tasks/:taskId',
  authenticate,
  authorize(['ADMIN']),
  taskController.remove
)

export default router
