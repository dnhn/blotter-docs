export type NavId = 'guide' | 'materials' | 'api';

export interface NavItem {
  id: NavId;
  label: string;
  href: string;
}

export const NAV: readonly NavItem[] = [
  { id: 'guide', label: 'Guide', href: '/guide/getting-started' },
  { id: 'materials', label: 'Materials', href: '/materials' },
  { id: 'api', label: 'API', href: '/api' },
];

/** An in-page anchor listed under the current sidebar item. */
export interface Section {
  id: string;
  title: string;
}

export interface SidebarItem {
  href: string;
  title: string;
  sections?: readonly Section[];
}

export interface SidebarGroup {
  label: string;
  items: readonly SidebarItem[];
}
