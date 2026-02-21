import type { TaskModel } from "../../../generated/prisma/models.js"
import type {
  RegisterTaskInput,
  UpdateTaskInput
} from "../../validators/tasks.validator.js"

export const makeRegisterTask = (
  overrides?: Partial<RegisterTaskInput>
): RegisterTaskInput => ({
  title: "Test Task",
  description: "This is a test task",
  status: "PENDING",
  priority: "MEDIUM",
  ...overrides
})

export const makeUpdatedTask = (
  overrides?: Partial<UpdateTaskInput>
): UpdateTaskInput => ({
  title: "Updated Task Title",
  description: "Updated Task Description",
  status: "IN_PROGRESS",
  priority: "HIGH",
  ...overrides
})

export const makeTask = (overrides?: Partial<TaskModel>): TaskModel => ({
  id: "test-task-id",
  title: "Test Task",
  description: "This is a test task",
  status: "PENDING",
  priority: "MEDIUM",
  assigned_to: "test-user-id",
  teamId: "test-team-id",
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides
})
