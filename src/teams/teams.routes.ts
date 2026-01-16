import { Router } from 'express'
import { registerTeamController } from './controllers/register.team.controller.js'
import { updateTeamController } from './controllers/update.team.controller.js'
import { addUserTeamController } from './controllers/add.team.user.controller.js'
import { removeUserTeamController } from './controllers/remove.team.user.controller.js'

import { authorize } from '../middlewares/authorize.middleware.js'
import { authenticate } from '../middlewares/authenticate.middleware.js'
import { readTeamsController } from './controllers/read.teams.controller.js'
import { readTeamMembersController } from './controllers/read.team.members.controller.js'

const router = Router()

router.get('/teams', authenticate, authorize(['ADMIN']), readTeamsController)
router.get(
  '/teams/:teamId/members',
  authenticate,
  authorize(['ADMIN']),
  readTeamMembersController
)

router.post(
  '/teams',
  authenticate,
  authorize(['ADMIN']),
  registerTeamController
)

router.put(
  '/teams/:teamId',
  authenticate,
  authorize(['ADMIN']),
  updateTeamController
)

router.post(
  '/teams/:teamId/member/add',
  authenticate,
  authorize(['ADMIN']),
  addUserTeamController
)

router.delete(
  '/teams/:teamId/member/remove',
  authenticate,
  authorize(['ADMIN']),
  removeUserTeamController
)

export default router
