import { Router } from 'express'
import { registerTaskController } from './controllers/register.task.controller.js'
import { readTaskController } from './controllers/read.task.controller.js'
import { removeTaskController } from './controllers/remove.task.controller.js'
import { updateTaskController } from './controllers/update.task.controller.js'

import { authorize } from '../middlewares/authorize.middleware.js'
import { authenticate } from '../middlewares/authenticate.middleware.js'
import { readTeamTaskController } from './controllers/read.team.task.controller.js'

const router = Router()

router.get('/tasks', authenticate, authorize(['ADMIN']), readTaskController)
router.get(
  '/tasks/:teamId',
  authenticate,
  authorize(['ADMIN', 'MEMBER']),
  readTeamTaskController
)

router.post(
  '/tasks/:teamId/:assignedTo',
  authenticate,
  authorize(['ADMIN']),
  registerTaskController
)

router.put(
  '/tasks/:taskId',
  authenticate,
  authorize(['ADMIN', 'MEMBER']),
  updateTaskController
)

router.delete(
  '/tasks/:taskId',
  authenticate,
  authorize(['ADMIN']),
  removeTaskController
)

export default router
