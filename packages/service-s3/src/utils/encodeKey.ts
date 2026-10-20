import { UploError } from '@uplo/server'

// Encode each path segment, so characters like `?` or `#` in a key cannot
// change which object the URL points to. URLs always resolve `.` and `..`
// segments (even encoded), so such keys have no safe public URL.
export const encodeKey = (key: string) =>
  key
    .split('/')
    .map((segment) => {
      if (segment === '.' || segment === '..') {
        throw new UploError(`Cannot build public URL for key with "${segment}" segment: ${key}`)
      }
      return encodeURIComponent(segment)
    })
    .join('/')
