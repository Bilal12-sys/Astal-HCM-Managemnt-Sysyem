export const getScopeFilter = (user, field = "employeeId") => {
  if (!user || user.role === "employee") {
    return user?.employeeId ? { [field]: user.employeeId } : { [field]: null };
  }

  return {};
};
