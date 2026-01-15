import { Request, Response } from 'express'
import { ZodError } from 'zod'
import { TeamService } from '../service/teams.service.js'

type ReqParams = {
  teamId: string
}

export const readTeamMembersController = async (
  req: Request<ReqParams, any, any>,
  res: Response
) => {
  try {
    const members = await TeamService.readTeamMembers(req.params.teamId)

    return res.status(200).json({ members })
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
