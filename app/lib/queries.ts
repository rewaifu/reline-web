import { queryOptions } from "@tanstack/react-query"
import { MODELS, MODELS_URL } from "~/constants"
import type { ModelFile } from "~/types/api"

export const modelsQueryOptions = queryOptions({
  queryKey: ["models"],
  queryFn: async () => {
    const res = await fetch(MODELS_URL)
    const data = (await res.json()) as ModelFile[]
    return data.map((model) => model.name)
  },
  placeholderData: MODELS,
  staleTime: Number.POSITIVE_INFINITY,
})
