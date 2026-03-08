import {Card, CardHeader, CardContent} from "~/components/ui"
import React, {useContext} from "react"
import {NodesContext} from "~/context/contexts"
import {NodeResolver} from "~/components/node-resolver"
import {AddNodeButton} from "~/components/add-node-button"
import {ScrollArea, ScrollBar} from "~/components/ui/scroll-area.tsx";
import {useTranslation} from "react-i18next"

export function NodesSection() {
    const {t} = useTranslation()
    const nodes = useContext(NodesContext)
    return (
        <Card>
            <CardHeader className="flex flex-row items-center mx-2">
                <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">{t('home-page.nodes')}</h2>
                <AddNodeButton/>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="relative rounded-xl border h-full bg-background overflow-hidden">
                    <div className="flex flex-col min-h-full">
                        <div className="pointer-events-none sticky top-0 z-10 h-8 w-full
                        bg-gradient-to-b from-background via-background/30 to-transparent" />
                        <div className="flex-1 flex flex-col gap-5 m-5 -my-2">
                            {nodes.map((data, index) => (
                                <NodeResolver key={`${data.type}_${index}`} id={data.id}/>
                            ))}
                        </div>
                        <div className="pointer-events-none sticky bottom-0 z-10 h-8 w-full
                        bg-gradient-to-t from-background via-background/30 to-transparent"
                        />
                    </div>
                    <ScrollBar className="mr-1 my-2 pb-4 z-20"/>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
