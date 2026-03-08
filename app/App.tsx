import React, {useReducer} from "react"
import {ThemeProvider} from "next-themes"
import {QueryClient, QueryClientProvider, useQuery} from "@tanstack/react-query"
import {Toaster} from "~/components/ui/sonner"
import {NodesContext, NodesDispatchContext, ModelsContext} from "~/context/contexts"
import {nodesReducer} from "~/context/reducer"
import {DEFAULT_NODES, MODELS, STORAGE_KEY} from "~/constants"
import {modelsQueryOptions} from "~/lib/queries"
import {ModeToggle} from "~/components/mode-toggle"
import {CodeSection} from "~/components/code-section"
import {NodesSection} from "~/components/nodes-section"
import {migrateNodes} from "~/lib/config-migration"
import { EnhancrLogo } from "~/svg/enhancr-logo"
import { TooltipProvider } from "./components/ui/tooltip"
import { Button } from "./components/ui/button"
import {CollabLogo} from "~/svg/collab.tsx";
import {IconBrandDiscordFilled, IconBrandGithub} from "@tabler/icons-react"
import {LanguageSelect} from "~/components/language-select.tsx";
import {useTranslation} from "react-i18next"

const queryClient = new QueryClient()

function HomePage() {
    const {t} = useTranslation()
    const {data: models = MODELS} = useQuery(modelsQueryOptions)

    const getInitialData = () => {
        const data = localStorage.getItem(STORAGE_KEY)
        if (data) {
            try {
                const parsedNodes = JSON.parse(data)
                return migrateNodes(parsedNodes)
            } catch (error) {
                console.error("Err parsing from storage:", error)
                return DEFAULT_NODES
            }
        }
        return DEFAULT_NODES
    }

    const [nodes, dispatch] = useReducer(nodesReducer, undefined, getInitialData)

    return (
        <main className="flex flex-col h-screen gap-4">
            <header className="flex justify-between h-15 bg-card rounded-xl ring-1 ring-foreground/10 p-2 px-4 mt-5 mx-5">
                <div className="flex flex-row gap-1 items-center">
                    <EnhancrLogo/>
                    <div className="flex flex-row gap-2">
                        <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight select-none hover:tracking-normal trasition duration-150 active:font-normal"> <b><i>Reline</i></b> {t('home-page.title')}</h1>
                        <h1 className="scroll-m-20 text-xs font-light tracking-tight self-end mb-1 -ml-1 hover:text-primary hover:tracking-widest hover:font-semibold hover:text-sm trasition duration-150 select-none"><i><a href="https://github.com/rewaifu">by rewaifu</a></i></h1>
                    </div>
                </div>
                <div className="flex flex-row gap-1 self-center">
                    <div>
                        <LanguageSelect/>
                    </div>
                    <div className="self-center">
                        <ModeToggle/>
                    </div>
                </div>
            </header>
            <div className="flex-1 overflow-hidden p-1 mx-4">
                <div className="grid grid-cols-2 gap-x-5 h-full">
                    <NodesContext.Provider value={nodes}>
                        <NodesDispatchContext.Provider value={dispatch}>
                            <ModelsContext.Provider value={models}>
                                <NodesSection/>
                                <CodeSection/>
                            </ModelsContext.Provider>
                        </NodesDispatchContext.Provider>
                    </NodesContext.Provider>
                </div>
            </div>
            <footer className="flex h-10 bg-card rounded-xl ring-1 ring-foreground/10 p-2 px-5 mb-5 mx-5 justify-between">
                <div className="flex flex-row gap-2 items-center">
                    <h1 className="text-sm font-semibold tracking-tight">{t('home-page.use-in')}</h1>
                    <Button variant="outline" size="sm">
                        <CollabLogo/>
                        <div/>
                        <a href="https://colab.research.google.com/drive/1-ijaR4Ld_CUkEMb-l2Cbf918TCQOp8D9" target="_blank">{t('home-page.collab')}</a>
                    </Button>
                    <Button variant="outline" size="sm">
                        <IconBrandGithub/>
                        <a href="https://github.com/rewaifu/reline_local" target="_blank">Reline Local</a>
                    </Button>
                    <Button variant="outline" size="sm">
                        <IconBrandGithub/>
                        <a href="https://github.com/breadyk/reline-local-GUI" target="_blank">Reline Local GUI</a>
                    </Button>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1 className="scroll-m-20 text-sm font-semibold tracking-tight">{t('home-page.need-help')}</h1>
                    <Button variant="outline" size="sm">
                        <IconBrandDiscordFilled/>
                        <a href="https://discord.gg/hEgdaVzTs9" target="_blank">RawkumaSR</a>
                    </Button>
                </div>

            </footer>
        </main>
    )
}

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <TooltipProvider delay={150}>
                    <HomePage/>
                    <Toaster position="top-center" />
                </TooltipProvider>
            </ThemeProvider>
        </QueryClientProvider>
    )
}
