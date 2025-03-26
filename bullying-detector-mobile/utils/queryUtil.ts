import { QueryClient } from "@tanstack/react-query"

const globalQueryClient = new QueryClient()

export function getGlobalQueryClient() {
  return globalQueryClient
}
