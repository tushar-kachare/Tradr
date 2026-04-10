export const getDisplayName = (user) => {
  if (!user) {
    return "Unknown user";
  }

  const fullName = typeof user.fullName === "string" ? user.fullName.trim() : "";
  const username = typeof user.username === "string" ? user.username.trim() : "";
  
  return fullName || username || "Unknown user";
};

export const getUserInitial = (user) => {
  const displayName = getDisplayName(user);
  return displayName.charAt(0).toUpperCase() || "U";
};
