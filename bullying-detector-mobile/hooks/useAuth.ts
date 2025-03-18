import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync("auth_token");
      setIsAuthenticated(!!token);
    };

    checkAuth();
  }, []);

  return { isAuthenticated };
}
