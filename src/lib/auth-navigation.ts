type AuthPage = "login" | "register";

interface RouterLike {
  push: (href: string) => void;
}

export function navigateToAuthPage(router: RouterLike, target: AuthPage) {
  if (typeof window === "undefined") {
    router.push(target === "login" ? "/login" : "/register");
    return;
  }

  const { protocol, hostname, port } = window.location;
  const domainParts = hostname.split(".");
  const currentSubdomain = domainParts[0]?.toLowerCase();
  const inAuthSubdomain = currentSubdomain === "login" || currentSubdomain === "register";

  if (inAuthSubdomain && domainParts.length >= 2) {
    domainParts[0] = target;
    const nextHost = domainParts.join(".");
    const nextOrigin = `${protocol}//${nextHost}${port ? `:${port}` : ""}`;
    window.location.assign(`${nextOrigin}/`);
    return;
  }

  router.push(target === "login" ? "/login" : "/register");
}