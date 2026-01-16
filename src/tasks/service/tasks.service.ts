import type { TaskFindManyArgs } from '../../../generated/prisma/models.js'
import { BadRequestError } from '../../errors/bad-request-error.js'
import { UnauthorizedError } from '../../errors/unauthorized-error.js'
import { prisma } from '../../lib/prisma.js'
import type {
  RegisterTaskInput,
  UpdateTaskInput
} from '../validators/tasks.validator.js'

export class TasksService {
  static async findTask(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    })

    return task
  }

  static async register({
    assignedTo,
    teamId,
    data
  }: {
    data: RegisterTaskInput
    teamId: string
    assignedTo: string
  }) {
    const { title, priority, status, description } = data

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        teamId,
        assigned_to: assignedTo
      }
    })

    return task
  }

  static async updateTask({
    taskId,
    data,
    userId,
    userRole
  }: {
    taskId: string
    data: UpdateTaskInput
    userId: string
    userRole: 'ADMIN' | 'MEMBER'
  }) {
    const task = await this.findTask(taskId)

    if (!task) throw new BadRequestError('Task not found')

    if (userRole === 'MEMBER') {
      if (task.assigned_to !== userId) {
        throw new UnauthorizedError(
          'You do not have permission to update this task'
        )
      }
    }

    const updatedTask = await prisma.task.update({
      data,
      where: {
        id: taskId
      }
    })

    return updatedTask
  }

  static async readTasks() {
    const tasks = await prisma.task.findMany({
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
    return tasks
  }

  static async readTasksFromTeam({
    teamId,
    userId,
    userRole
  }: {
    teamId: string
    userId: string
    userRole: 'ADMIN' | 'MEMBER'
  }) {
    const whereClause: TaskFindManyArgs['where'] = {
      teamId
    }

    const isMember = userRole === 'MEMBER'

    if (isMember) {
      whereClause.team = {
        members: {
          some: {
            user_id: userId
          }
        }
      }
    }

    const tasks = await prisma.task.findMany({
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

    if (tasks.length === 0 && isMember) {
      throw new UnauthorizedError(
        'You do not have permission to read this tasks'
      )
    }

    return tasks
  }

  static async removeTask(taskId: string) {
    const task = await this.findTask(taskId)

    if (!task) throw new BadRequestError('Task not found')

    await prisma.task.delete({ where: { id: taskId } })
  }
}
