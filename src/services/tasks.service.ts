import { BadRequestError } from '../errors/bad-request-error.js'
import { UnauthorizedError } from '../errors/unauthorized-error.js'
import type { TaskRepository } from '../repositories/task.repository.js'
import type { TeamRepository } from '../repositories/team.repository.js'
import type {
  RegisterTaskInput,
  UpdateTaskInput
} from '../validators/tasks.validator.js'

export class TasksService {
  constructor(
    private taskRepository: TaskRepository,
    private teamRepository: TeamRepository
  ) {}

  async readTasks() {
    const tasks = await this.taskRepository.findAll()
    return tasks
  }

  async findTask(taskId: string) {
    const task = await this.taskRepository.findById(taskId)
    if (!task) throw new BadRequestError('Task not found')

    return task
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

    const task = await this.taskRepository.register({
      data: {
        title,
        description,
        status,
        priority
      },
      teamId,
      assignedTo
    })

    return task
  }

  async update({
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

    if (userRole === 'MEMBER') {
      if (task.assigned_to !== userId) {
        throw new UnauthorizedError(
          'You do not have permission to update this task'
        )
      }
    }

    const updatedTask = await this.taskRepository.update(taskId, data)

    return updatedTask
  }

  async readTasksFromTeam({
    teamId,
    userId,
    userRole
  }: {
    teamId: string
    userId: string
    userRole: 'ADMIN' | 'MEMBER'
  }) {
    const teamExists = await this.teamRepository.findById(teamId)

    if (!teamExists) throw new BadRequestError('Team not found')

    if (userRole === 'MEMBER') {
      const isMember = await this.teamRepository.isMemberOfTeam(teamId, userId)

      if (!isMember) {
        throw new UnauthorizedError('You are not a member of this team')
      }

      return await this.taskRepository.readTasksFromTeam({
        teamId,
        user_id: userId
      })
    }

    return await this.taskRepository.readTasksFromTeam({
      teamId
    })
  }

  async remove(taskId: string) {
    await this.findTask(taskId)

    await this.taskRepository.remove(taskId)
  }
}
