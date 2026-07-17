import type { SiteData } from '../types/SiteData'

export type TravelTargetGroup = 'portal' | 'town' | 'utility' | 'page'
export type TravelDestination = 'route' | 'local' | 'external'

export interface TravelTarget {
  id: string
  group: TravelTargetGroup
  label: string
  description: string
  icon: string
  href: string
  destination: TravelDestination
  status?: 'open' | 'preparing'
}

export function collectTravelTargets(siteData: SiteData): TravelTarget[]
export function filterTravelTargets(targets: TravelTarget[], query: string): TravelTarget[]
