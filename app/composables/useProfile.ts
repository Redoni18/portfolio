/**
 * Site owner profile (`content/profile.yml`). Shared by the header and the social
 * links under one key, so it is fetched once and served from the payload.
 */
export function useProfile() {
  return useAsyncData('profile', () => queryCollection('profile').first())
}
