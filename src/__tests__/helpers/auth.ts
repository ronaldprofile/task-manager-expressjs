import jwt from "jsonwebtoken"
import { makeJWTPayload } from "../../test/index.js"

export function makeAuthToken(
  overrides?: Partial<ReturnType<typeof makeJWTPayload>>
) {
  const payload = makeJWTPayload(overrides)

  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1h"
  })
}
