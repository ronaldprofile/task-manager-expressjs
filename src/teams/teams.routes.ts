import { Router } from 'express'
import { registerTeamController } from './controllers/register.controller.js'
import { updateTeamController } from './controllers/update.controller.js'
import { addUserTeamController } from './controllers/add-user.controller.js'
import { removeUserTeamController } from './controllers/remove-user.controller.js'

import { authorize } from '../middlewares/authorize.middleware.js'
import { authenticate } from '../middlewares/authenticate.middleware.js'

const router = Router()

router.post('/', authenticate, authorize(['ADMIN']), registerTeamController)

router.put('/:teamId', authenticate, authorize(['ADMIN']), updateTeamController)
router.post(
  '/:teamId/users/add',
  authenticate,
  authorize(['ADMIN']),
  addUserTeamController
)

router.delete(
  '/:teamId/users/remove',
  authenticate,
  authorize(['ADMIN']),
  removeUserTeamController
)

export default router
