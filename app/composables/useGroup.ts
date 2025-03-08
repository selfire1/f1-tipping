import type { Database } from "~~/types/db";

export const useGroup = () => {
  const allUserGroups = useState<Database.Group[] | undefined>(
    STATE_KEYS.usersGroupCache,
    () => [],
  );
  const currentUserGroup = useState<Database.Group | undefined>(
    "currentUserGroup",
    () => allUserGroups.value?.[0],
  );
  return {
    allUserGroups,
    currentUserGroup,
  };
};
