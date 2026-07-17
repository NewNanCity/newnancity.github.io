export type PortalPage =
  | 'home'
  | 'world'
  | 'community'
  | 'archive'
  | 'join'
  | 'map'
  | 'town'
  | 'not-found'

export type PortalRoute =
  | { page: Exclude<PortalPage, 'town' | 'not-found'>; key: string }
  | { page: 'town'; key: string; townSlug: string }
  | { page: 'not-found'; key: string; path: string }

export function parsePortalRoute(hash: string): PortalRoute
export function portalHref(page: Exclude<PortalPage, 'not-found'>, townSlug?: string): string
