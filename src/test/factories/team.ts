import type {
  TeamModel,
  TeamMemberModel,
  UserModel
} from "../../../generated/prisma/models.js"
import type { RegisterTeamInput } from "../../validators/teams.validator.js"

export const makeRegisterTeam = (overrides?: Partial<RegisterTeamInput>) => ({
  name: "Test Team",
  description: "A team for testing purposes",
  ...overrides
})

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

type TeamWithMembers = TeamModel & {
  members: {
    user: TeamMemberModel & {
      role: UserModel["role"]
    }
  }[]
}

export const makeTeamWithMembers = (
  overrides?: Partial<TeamWithMembers>,
  members?: TeamWithMembers["members"]
) => {
  return {
    ...makeTeam(overrides),
    members: members || [
      {
        user: {
          ...makeTeamMember({
            team_id: overrides?.id || "team-id",
            user_id: "user-id-1"
          })
        }
      },
      {
        user: {
          ...makeTeamMember({
            team_id: overrides?.id || "team-id",
            user_id: "user-id-2"
          })
        }
      }
    ]
  }
}
