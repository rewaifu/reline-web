import {useCallback, useEffect, useReducer, useState} from "react"
import { ModelsContext, NodesContext, NodesDispatchContext } from "../context/contexts.ts"
import { CodeSection } from "~/components/code-section.tsx"
import { NodesSection } from "~/components/nodes-section.tsx"
import { nodesReducer } from "~/context/reducer.ts"
import {DEFAULT_NODES, MODELS, MODELS_URL, STORAGE_KEY} from "~/constants.ts"

const getInitialData = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  if (data) {
    return JSON.parse(data)
  }
  return DEFAULT_NODES
}

export default function HomePage() {
  const [nodes, dispatch] = useReducer(nodesReducer, getInitialData())
  const [models, setModels] = useState<string[]>([])
  const handleModelsChange: (models: string[]) => void = useCallback((models) => {
    setModels(models)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const result = []
      const modelsList = await fetch(MODELS_URL).catch((err) => {
        handleModelsChange(MODELS)
        throw new Error(err)
      })
      const json = await modelsList.json() as {filename: string, url: string}[]
      for(const model of json) {
        result.push(model.filename.split('.tar')[0])
      }
      handleModelsChange(result)
    }
    void fetchData()
  }, [handleModelsChange])

  return (
    <main className="p-5 grid grid-cols-2 gap-x-5">
      <NodesContext.Provider value={nodes}>
        <NodesDispatchContext.Provider value={dispatch}>
          <ModelsContext.Provider value={models}>
            <NodesSection />
            <CodeSection />
          </ModelsContext.Provider>
        </NodesDispatchContext.Provider>
      </NodesContext.Provider>
    </main>
  )
}
