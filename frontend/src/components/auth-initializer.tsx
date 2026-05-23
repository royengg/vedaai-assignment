"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  return <>{children}</>;
}
