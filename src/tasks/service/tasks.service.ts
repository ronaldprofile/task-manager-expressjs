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

    if (!task) throw new Error('Task not found')

    if (userRole === 'MEMBER') {
      if (task.assigned_to !== userId) {
        throw new Error('You do not have permission to update this task')
      }
    }

    const updatedTask = await prisma.task.update({
      data,
      where: {
        id: task.id
      }
    })

    return updatedTask
  }

  static async readTasks() {
    const tasks = await prisma.task.findMany()
    return tasks
  }

  static async removeTask(taskId: string) {
    const task = this.findTask(taskId)

    if (!task) throw new Error('Task not found')

    await prisma.task.delete({ where: { id: taskId } })
  }
}
