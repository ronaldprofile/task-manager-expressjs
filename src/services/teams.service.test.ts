import { TeamService } from "./teams.service.js"
import { TeamRepository } from "../repositories/team.repository.js"
import { BadRequestError } from "../errors/bad-request-error.js"
import { prismaMock } from "../test/setup.js"
import {
  makeRegisterTeam,
  makeTeam,
  makeTeamMember,
  makeTeamWithMembers
} from "../test/factories/team.js"
import { makeUser } from "../test/index.js"

describe("Team Service", () => {
  let teamRepository: TeamRepository
  let teamService: TeamService

  beforeEach(() => {
    vi.clearAllMocks()

    teamRepository = new TeamRepository()
    teamService = new TeamService(teamRepository)
  })

  describe("readTeams", () => {
    it("should return all teams", async () => {
      const teams = [makeTeam(), makeTeam({ id: "team-2" })]
      prismaMock.team.findMany.mockResolvedValue(teams)
      const result = await teamService.readTeams()
      expect(result).toEqual(teams)
    })
  })

  describe("findTeam", () => {
    it("should return team if found", async () => {
      const team = makeTeam()
      prismaMock.team.findUnique.mockResolvedValue(team)
      const result = await teamService.findTeam(team.id)

      expect(result.id).toEqual(team.id)
    })
    it("should throw BadRequestError if not found", async () => {
      prismaMock.team.findUnique.mockResolvedValue(null)
      await expect(teamService.findTeam("no-existing-team-id")).rejects.toThrow(
        BadRequestError
      )
    })
  })

  describe("readTeamMembers", () => {
    it("should return team members", async () => {
      const team = makeTeamWithMembers()
      const teamMembers = team.members.map(m => m.user)
      prismaMock.team.findUnique.mockResolvedValue(team)

      const result = await teamService.readTeamMembers(team.id)

      expect(result).toEqual(teamMembers)
    })
  })

  describe("register", () => {
    it("should create a team", async () => {
      const input = {
        name: "New Team",
        description: "A new team"
      }

      const team = makeTeam({
        name: input.name,
        description: input.description
      })

      prismaMock.team.create.mockResolvedValue(team)

      const teamToCreate = makeRegisterTeam({
        name: input.name,
        description: input.description
      })

      const result = await teamService.register(teamToCreate)

      expect(result.name).toEqual(team.name)
      expect(result.description).toEqual(team.description)
    })
  })

  describe("update", () => {
    it("should update a team", async () => {
      const team = makeTeam()
      prismaMock.team.findUnique.mockResolvedValue(team)

      const updatedTeam = {
        ...team,
        name: "Updated Team",
        description: "Updated description"
      }

      prismaMock.team.update.mockResolvedValue(updatedTeam)
      const result = await teamService.update(team.id, {
        name: "Updated Team",
        description: "Updated description"
      })

      expect(result.name).toBe("Updated Team")
      expect(result.description).toBe("Updated description")
    })

    it("should throw if team not found", async () => {
      prismaMock.team.findUnique.mockResolvedValue(null)
      await expect(
        teamService.update("missing", { name: "X", description: "Y" })
      ).rejects.toThrow(BadRequestError)
    })
  })

  describe("addUserToTeam", () => {
    it("should add users to team and return created members", async () => {
      const team = makeTeam()

      const userIds = ["user-1", "user-2", "user-3"]

      const createdMembers = userIds.map(user_id =>
        makeTeamMember({ user_id, team_id: team.id })
      )

      prismaMock.team.findUnique.mockResolvedValue(team)
      prismaMock.$transaction.mockResolvedValue(createdMembers)

      const result = await teamService.addUserToTeam(team.id, [
        "user-1",
        "user-2"
      ])

      expect(result.length).toEqual(3)
      expect(result).toEqual(createdMembers)
    })
    it("should throw if team not found", async () => {
      prismaMock.team.findUnique.mockResolvedValue(null)
      await expect(
        teamService.addUserToTeam("missing", ["user-1"])
      ).rejects.toThrow(BadRequestError)
    })
  })

  describe("removeUser", () => {
    it("should remove users if all found", async () => {
      const team = makeTeam()
      prismaMock.team.findUnique.mockResolvedValue(team)

      prismaMock.user.findMany.mockResolvedValue([
        makeUser({ id: "user-1", name: "User 1" }),
        makeUser({ id: "user-2", name: "User 2" })
      ])

      const userIds = ["user-1", "user-2"]
      const removedMembers = userIds.map(user_id =>
        makeTeamMember({ user_id, team_id: team.id })
      )

      prismaMock.$transaction.mockResolvedValue(removedMembers)
      await expect(teamService.removeUser(team.id, userIds)).resolves.toEqual(
        removedMembers
      )
    })
    it("should throw if any user missing", async () => {
      const team = makeTeam()
      prismaMock.team.findUnique.mockResolvedValue(team)

      prismaMock.user.findMany.mockResolvedValue([
        makeUser({ id: "user-1", name: "User 1" }),
        makeUser({ id: "user-2", name: "User 2" })
      ])

      await expect(teamService.removeUser(team.id, ["user-3"])).rejects.toThrow(
        BadRequestError
      )
    })

    it("should throw if team not found", async () => {
      prismaMock.team.findUnique.mockResolvedValue(null)
      await expect(
        teamService.removeUser("missing", ["user-1"])
      ).rejects.toThrow(BadRequestError)
    })
  })
})
