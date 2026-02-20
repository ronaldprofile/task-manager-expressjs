import type {
  TeamModel,
  TeamMemberModel
} from "../../../generated/prisma/models.js"

export const makeTeam = (overrides?: Partial<TeamModel>): TeamModel => ({
  id: "team-id",
  name: "Test Team",
  description: "A team for testing purposes",
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides
})

export const makeTeamMember = (
  overrides?: Partial<TeamMemberModel>
): TeamMemberModel => ({
  id: "team-member-id",
  team_id: "team-id",
  user_id: "user-id",
  created_at: new Date(),
  ...overrides
})

export const makeTeamWithMembers = (overrides?: Partial<TeamModel>) => ({
  ...makeTeam(overrides),
  members: [
    makeTeamMember({
      team_id: overrides?.id || "team-id",
      user_id: "user-id-1"
    }),
    makeTeamMember({
      team_id: overrides?.id || "team-id",
      user_id: "user-id-2"
    })
  ]
})
