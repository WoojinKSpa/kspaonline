import type { Route } from "next";

type NavItem = {
  href: Route;
  label: string;
};

export const siteConfig = {
  name: "Kspa.online",
  description:
    "A modern Korean spa directory with public browsing and a future-ready admin workflow.",
  url: "https://kspa.online",
  mainNav: [
    { href: "/", label: "Home" },
    { href: "/spas", label: "Browse" },
    { href: "/login", label: "Login" },
  ] satisfies NavItem[],
};
