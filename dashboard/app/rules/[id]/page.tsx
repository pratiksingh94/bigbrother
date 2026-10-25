import RuleDetails from "./RuleDetails"

export default async function RuleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return <RuleDetails id={Number(id)}/>
}
