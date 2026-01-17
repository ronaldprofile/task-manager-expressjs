import type { TaskFindManyArgs } from '../../generated/prisma/models.js'
import { prisma } from '../lib/prisma.js'
import type {
  RegisterTaskInput,
  UpdateTaskInput
} from '../validators/tasks.validator.js'

export class TaskRepository {
  async findAll() {
    return await prisma.task.findMany({
      orderBy: {
        created_at: 'desc'
      },
      include: {
        team: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      omit: {
        assigned_to: true,
        teamId: true
      }
    })
  }

  async findById(taskId: string) {
    return await prisma.task.findUnique({
      where: { id: taskId }
    })
  }

  async register({
    assignedTo,
    teamId,
    data
  }: {
    data: RegisterTaskInput
    teamId: string
    assignedTo: string
  }) {
    const { title, priority, status, description } = data

    return await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        teamId,
        assigned_to: assignedTo
      }
    })
  }

  async update(taskId: string, data: UpdateTaskInput) {
    return await prisma.task.update({
      data,
      where: {
        id: taskId
      }
    })
  }

  async readTasksFromTeam({
    teamId,
    user_id
  }: {
    teamId: string
    user_id?: string
  }) {
    const whereClause: TaskFindManyArgs['where'] = {
      teamId
    }

    if (user_id) {
      whereClause.team = {
        members: {
          some: {
            user_id
          }
        }
      }
    }

    return await prisma.task.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc'
      },
      include: {
        team: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      omit: {
        assigned_to: true,
        teamId: true
      }
    })
  }

  async remove(taskId: string) {
    await prisma.task.delete({ where: { id: taskId } })
  }
}
