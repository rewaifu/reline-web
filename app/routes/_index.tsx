import { useReducer } from "react"
import { ModelsContext, NodesContext, NodesDispatchContext } from "~/context/contexts"
import { CodeSection } from "~/components/code-section"
import { NodesSection } from "~/components/nodes-section"
import { nodesReducer } from "~/context/reducer"
import { DEFAULT_NODES, STORAGE_KEY } from "~/constants"
import type { ModelFile } from "~/types/api"
import { useLoaderData } from "@remix-run/react"
import { MODELS, MODELS_URL } from "~/constants.server"

export const loader = async () => {
  const modelsList = await fetch(MODELS_URL)
    .then(async (res) => ((await res.json()) as ModelFile[]).map((model) => model.filename.split(".tar")[0]))
    .catch(() => MODELS)
  return { models: modelsList }
}

export default function HomePage() {
  const loaderData = useLoaderData<typeof loader>()

  const getInitialData = () => {
    if (typeof window === "undefined") {
      return DEFAULT_NODES
    }

    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
    return DEFAULT_NODES
  }

  const [nodes, dispatch] = useReducer(nodesReducer, getInitialData())

  return (
    <main className="p-5 grid grid-cols-2 gap-x-5">
      <NodesContext.Provider value={nodes}>
        <NodesDispatchContext.Provider value={dispatch}>
          <ModelsContext.Provider value={loaderData.models}>
            <NodesSection />
            <CodeSection />
          </ModelsContext.Provider>
        </NodesDispatchContext.Provider>
      </NodesContext.Provider>
    </main>
  )
}
