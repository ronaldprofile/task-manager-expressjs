import { Request, Response } from 'express'
import { ZodError } from 'zod'
import { registerTeamSchema } from '../validators/teams.validator.js'
import { TeamService } from '../service/teams.service.js'

export const updateTeamController = async (req: Request, res: Response) => {
  try {
    const teamId = req.params.teamId as string

    const result = registerTeamSchema.parse(req.body)

    const team = await TeamService.update(teamId, result)

    return res.status(201).json({ team })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message) {
        return res.status(400).json({
          message: error.message
        })
      }
    }

    if (error instanceof ZodError) {
      return res.status(400).json(error)
    }

    return res.status(500).json({ message: 'Server internal error' })
  }
}
