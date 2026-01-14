import { Request, Response } from 'express'
import { ZodError } from 'zod'
import { TeamService } from '../service/teams.service.js'

type ReqParams = { teamId: string }
type ReqBody = { usersIds: string[] }

export const removeUserTeamController = async (
  req: Request<ReqParams, any, ReqBody>,
  res: Response
) => {
  try {
    const { teamId } = req.params
    const { usersIds } = req.body

    await TeamService.removeUser(teamId, usersIds)

    return res.status(204).json()
  } catch (error) {
    if (error instanceof Error) {
      if (error.message) {
        return res.status(400).json({ message: error.message })
      }
    }

    if (error instanceof ZodError) {
      return res.status(400).json(error)
    }

    return res.status(500).json({ message: 'Server internal error' })
  }
}
