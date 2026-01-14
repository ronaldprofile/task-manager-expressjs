import { Router } from 'express'
import { registerTeamController } from './controllers/register.controller.js'
import { updateTeamController } from './controllers/update.controller.js'
import { addUserTeamController } from './controllers/add-user.controller.js'
import { removeUserTeamController } from './controllers/remove-user.controller.js'

import { authorize } from '../middlewares/authorize.middleware.js'
import { authenticate } from '../middlewares/authenticate.middleware.js'
import { readTeamsController } from './controllers/read.teams.controller.js'

const router = Router()

router.get('/', authenticate, authorize(['ADMIN']), readTeamsController)
router.post('/', authenticate, authorize(['ADMIN']), registerTeamController)

router.put('/:teamId', authenticate, authorize(['ADMIN']), updateTeamController)

router.post(
  '/:teamId/member/add',
  authenticate,
  authorize(['ADMIN']),
  addUserTeamController
)

router.delete(
  '/:teamId/member/remove',
  authenticate,
  authorize(['ADMIN']),
  removeUserTeamController
)

export default router
