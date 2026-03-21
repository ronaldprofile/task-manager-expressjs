import jwt from "jsonwebtoken"
import { makeJWTPayload } from "../../test/index.js"

type CookieHeader = string | string[] | undefined

export function parseCookies(cookiesHeader: CookieHeader): string[] {
  if (!cookiesHeader) return []
  return Array.isArray(cookiesHeader) ? cookiesHeader : [cookiesHeader]
}

export function getCookie(
  cookiesHeader: CookieHeader,
  name: string
): string | undefined {
  const cookies = parseCookies(cookiesHeader)
  return cookies.find(cookie => cookie.startsWith(`${name}=`))
}

export function extractTokenFromCookies(
  cookiesHeader: CookieHeader
): string | null {
  const tokenCookie = getCookie(cookiesHeader, "token")
  if (!tokenCookie) return null
  return tokenCookie.split(";")[0].split("=")[1]
}

export function makeAuthToken(
  overrides?: Partial<ReturnType<typeof makeJWTPayload>>
) {
  const payload = makeJWTPayload(overrides)

  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1h"
  })
}
