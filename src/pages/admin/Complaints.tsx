import { useEffect, useState } from "react"
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"

const Complaints = () => {
    const {authFetch} = useAuthenticatedFetch()

    const [complaints, setComplaints] = useState([])

    const fetchComplaints = async () => {
        const response = await authFetch('complaints/')
        const data = await response.json()
        setComplaints(data.results)
    }

    useEffect(() => {
        fetchComplaints()
    }, [])

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Complaints</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {complaints.map((complaint: any) => (
                    <Card key={complaint.id}>
                        <CardHeader>
                            <CardTitle>{complaint.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                {complaint.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default Complaints