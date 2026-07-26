type UserWithAppMetadata = {
  app_metadata?: Record<string, unknown>;
};

export function isSuperAdmin(user: UserWithAppMetadata | null | undefined) {
  return user?.app_metadata?.is_super_admin === true;
}

export function getAuthenticatedHome(user: UserWithAppMetadata | null | undefined) {
  return isSuperAdmin(user) ? "/admin" : "/dashboard";
}

export function getAuthorizedRedirect(
  requestedPath: string | null | undefined,
  user: UserWithAppMetadata | null | undefined,
) {
  const fallback = getAuthenticatedHome(user);

  if (
    !requestedPath ||
    !requestedPath.startsWith("/") ||
    requestedPath.startsWith("//")
  ) {
    return fallback;
  }

  if (isSuperAdmin(user) && requestedPath.startsWith("/dashboard")) {
    return "/admin";
  }

  if (!isSuperAdmin(user) && requestedPath.startsWith("/admin")) {
    return "/dashboard";
  }

  return requestedPath;
}
