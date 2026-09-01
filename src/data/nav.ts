export type NavId = "overview" | "basics" | "materials" | "documentation";

export interface NavItem {
  id: NavId;
  label: string;
  href: string;
  mobile?: "hidden" | "show";
}

export const NAV: readonly NavItem[] = [
  { id: "overview", label: "OVERVIEW", href: "/overview", mobile: "hidden" },
  { id: "basics", label: "BASICS", href: "/basics" },
  { id: "materials", label: "MATERIALS", href: "/materials" },
  {
    id: "documentation",
    label: "DOCUMENTATION",
    href: "/documentation",
    mobile: "hidden",
  },
  {
    id: "documentation",
    label: "DOCS",
    href: "/documentation",
    mobile: "show",
  },
];
