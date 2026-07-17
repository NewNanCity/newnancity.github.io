import type {
  PortalContentSource,
  PortalContentSourceKind,
  PortalFeedItem,
  PortalTownDirectoryEntry,
} from '../types/SiteData'

export interface ResolvedHomeFeedSource {
  kind: PortalContentSourceKind | 'town'
  name: string
  href: string
}

export function nextHomeFeedIndex(currentIndex: number, itemCount: number): number
export function selectHomeFeedItems(
  items: PortalFeedItem[],
  homeFeedIds?: string[],
): PortalFeedItem[]
export function resolveHomeFeedSource(
  sourceRef: string | undefined,
  towns: PortalTownDirectoryEntry[],
  pages: PortalContentSource[],
): ResolvedHomeFeedSource | null
