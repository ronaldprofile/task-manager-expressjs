import { Router } from 'express'

import { authorize } from '../middlewares/authorize.middleware.js'
import { authenticate } from '../middlewares/authenticate.middleware.js'
import { TeamRepository } from '../repositories/team.repository.js'
import { TeamService } from '../services/teams.service.js'
import { TeamsController } from '../controllers/team.controller.js'

const router = Router()

const teamRepository = new TeamRepository()
const teamService = new TeamService(teamRepository)
const teamsController = new TeamsController(teamService)

router.get(
  '/teams',
  authenticate,
  authorize(['ADMIN']),
  teamsController.readTeams
)
router.get(
  '/teams/:teamId/members',
  authenticate,
  authorize(['ADMIN']),
  teamsController.readTeamMembers
)

router.post(
  '/teams',
  authenticate,
  authorize(['ADMIN']),
  teamsController.register
)

router.put(
  '/teams/:teamId',
  authenticate,
  authorize(['ADMIN']),
  teamsController.update
)

router.post(
  '/teams/:teamId/member/add',
  authenticate,
  authorize(['ADMIN']),
  teamsController.addUserToTeam
)

router.delete(
  '/teams/:teamId/member/remove',
  authenticate,
  authorize(['ADMIN']),
  teamsController.removeUser
)

export default router
