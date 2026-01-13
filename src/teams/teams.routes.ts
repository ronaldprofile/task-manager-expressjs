import { Router } from 'express'
import { registerTeamController } from './controllers/register.controller.js'
import { updateTeamController } from './controllers/update.controller.js'

const router = Router()

import { authenticate } from '../middlewares/authenticate.middleware.js'
import { authorize } from '../middlewares/authorize.middleware.js'

router.post('/', authenticate, authorize(['ADMIN']), registerTeamController)

router.put('/:teamId', authenticate, authorize(['ADMIN']), updateTeamController)

export default router
