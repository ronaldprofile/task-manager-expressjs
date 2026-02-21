import { TaskRepository } from "../repositories/task.repository.js"
import { TeamRepository } from "../repositories/team.repository.js"
import { makeTeam } from "../test/factories/team.js"
import { makeTask, makeRegisterTask, makeUpdatedTask } from "../test/index.js"
import { prismaMock } from "../test/setup.js"
import { TasksService } from "./tasks.service.js"

describe("Task Service", () => {
  let taskRepository: TaskRepository
  let teamRepository: TeamRepository

  let taskService: TasksService

  beforeEach(() => {
    taskRepository = new TaskRepository()
    teamRepository = new TeamRepository()

    taskService = new TasksService(taskRepository, teamRepository)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should return all tasks", async () => {
    const tasksData = [
      makeTask({ title: "Task 1", id: "task-1" }),
      makeTask({ title: "Task 2", id: "task-2" })
    ]

    prismaMock.task.findMany.mockResolvedValue(tasksData)

    const tasks = await taskService.readTasks()

    expect(tasks).toEqual(tasksData)
    expect(tasks.length).toBe(2)
  })

  describe("Read Tasks From Team", () => {
    it("should throw if team not found", async () => {
      prismaMock.team.findUnique.mockResolvedValue(null)

      await expect(
        taskService.readTasksFromTeam({
          teamId: "non-existent-team-id",
          userId: "test-user-id",
          userRole: "MEMBER"
        })
      ).rejects.toThrow("Team not found")
    })

    it("should throw if user is MEMBER and not part of the team", async () => {
      const team = makeTeam()
      prismaMock.team.findUnique.mockResolvedValue(team)

      prismaMock.teamMember.findUnique.mockResolvedValue(null)

      await expect(
        taskService.readTasksFromTeam({
          teamId: team.id,
          userId: "test-user-id",
          userRole: "MEMBER"
        })
      ).rejects.toThrow("You are not a member of this team")
    })

    it("should return tasks if user is MEMBER and is part of the team", async () => {
      const team = makeTeam({ id: "team-A" })
      prismaMock.team.findUnique.mockResolvedValue(team)

      const memberId = "maria-doe-124"

      prismaMock.teamMember.findUnique.mockResolvedValue({
        id: "team-member-id",
        team_id: team.id,
        user_id: memberId,
        created_at: new Date()
      })

      const tasksData = [
        makeTask({
          id: "task-1",
          teamId: "team-B",
          title: "Task 1",
          assigned_to: "john-doe-123"
        }),
        makeTask({
          id: "task-2",
          title: "Task 2",
          assigned_to: memberId,
          teamId: team.id
        })
      ]

      prismaMock.task.findMany.mockResolvedValue(
        tasksData.filter(
          task => task.assigned_to === memberId && task.teamId === team.id
        )
      )

      const tasks = await taskService.readTasksFromTeam({
        teamId: team.id,
        userId: memberId,
        userRole: "MEMBER"
      })

      expect(tasks.length).toBe(1)
    })

    it("should return all tasks if user is ADMIN", async () => {
      const team = makeTeam()
      prismaMock.team.findUnique.mockResolvedValue(team)

      const tasksData = [
        makeTask({
          id: "task-1",
          title: "Task 1",
          assigned_to: "john-doe-123"
        }),
        makeTask({
          id: "task-2",
          title: "Task 2",
          assigned_to: "maria-doe-124"
        })
      ]

      prismaMock.task.findMany.mockResolvedValue(tasksData)

      const tasks = await taskService.readTasksFromTeam({
        teamId: team.id,
        userId: "admin-user-id",
        userRole: "ADMIN"
      })

      expect(tasks.length).toBe(2)
    })
  })

  it("should register a new task", async () => {
    const taskData = makeTask()
    prismaMock.task.create.mockResolvedValue(taskData)

    const taskCreated = await taskService.register({
      data: makeRegisterTask(),
      teamId: "test-team-id",
      assignedTo: "test-user-id"
    })

    expect(taskCreated).toEqual(taskData)

    expect(prismaMock.task.create).toHaveBeenCalledWith({
      data: {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        teamId: "test-team-id",
        assigned_to: "test-user-id"
      }
    })
  })

  describe("Update", () => {
    it("should throw if task not found", async () => {
      prismaMock.task.findUnique.mockResolvedValue(null)

      await expect(
        taskService.update({
          taskId: "non-existent-task-id",
          data: makeUpdatedTask(),
          userId: "test-user-id",
          userRole: "MEMBER"
        })
      ).rejects.toThrow("Task not found")
    })

    it("should throw if user is MEMBER and not assigned to the task", async () => {
      const taskData = makeTask({ assigned_to: "another-user-id" })
      prismaMock.task.findUnique.mockResolvedValue(taskData)

      await expect(
        taskService.update({
          taskId: "non-existent-task-id",
          data: makeUpdatedTask(),
          userId: "test-user-id",
          userRole: "MEMBER"
        })
      ).rejects.toThrow("You do not have permission to update this task")
    })

    it("should update the task", async () => {
      const task = makeTask()
      prismaMock.task.findUnique.mockResolvedValue(task)

      const taskUpdatedData = {
        title: "New Task Title",
        description: "New Task Description",
        status: "IN_PROGRESS" as const,
        priority: "HIGH" as const
      }

      prismaMock.task.update.mockResolvedValue({
        ...task,
        title: taskUpdatedData.title,
        description: taskUpdatedData.description,
        status: taskUpdatedData.status,
        priority: taskUpdatedData.priority
      })

      const updatedTask = await taskService.update({
        taskId: task.id,
        data: taskUpdatedData,
        userId: "test-user-id",
        userRole: "MEMBER"
      })

      expect(updatedTask.title).toEqual(taskUpdatedData.title)
    })
  })

  describe("Delete", () => {
    it("should throw if task not found", async () => {
      prismaMock.task.findUnique.mockResolvedValue(null)

      await expect(taskService.remove("non-existent-task-id")).rejects.toThrow(
        "Task not found"
      )
    })

    it("should delete a task", async () => {
      const task = makeTask()
      prismaMock.task.findUnique.mockResolvedValue(task)
      prismaMock.task.delete.mockResolvedValue(task)

      await taskService.remove(task.id)

      expect(prismaMock.task.delete).toHaveBeenCalledWith({
        where: { id: task.id }
      })
    })
  })
})
