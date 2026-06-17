import DetectionDetails from "./DetectionDetails"

export default async function DetectionDetailsPage({ params }: { params: Promise<{ id: number }> }) {
    const { id } = await params

    return <DetectionDetails id={id}/>
}