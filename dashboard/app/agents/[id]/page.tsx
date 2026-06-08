import AgentDetails from "./AgentDetails"

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return (
        <AgentDetails id={id}/>
    )

}