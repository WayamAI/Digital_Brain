import { useEffect, useState } from "react";
import { ROLES } from "@/data/db";

const KEY = "db.role";

export type RoleId = (typeof ROLES)[number]["id"];

export function getRole(): RoleId {
  if (typeof window === "undefined") return "manager";
  const v = window.localStorage.getItem(KEY);
  return (ROLES.find((r) => r.id === v)?.id ?? "manager") as RoleId;
}

export function setRole(id: RoleId) {
  window.localStorage.setItem(KEY, id);
  window.dispatchEvent(new Event("db-role-change"));
}

export function useRole() {
  const [role, setRoleState] = useState<RoleId>("manager");

  useEffect(() => {
    setRoleState(getRole());
    const onChange = () => setRoleState(getRole());
    window.addEventListener("db-role-change", onChange);
    return () => window.removeEventListener("db-role-change", onChange);
  }, []);

  return ROLES.find((r) => r.id === role)!;
}
