import { useState } from "react"
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { toast } from "react-hot-toast"
import { useLanguage } from "../../context/LanguageContext"

const SubmitComplaint = () => {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { authFetch } = useAuthenticatedFetch()
    const { t } = useLanguage()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await authFetch("complaints/", {
                method: "POST",
                body: JSON.stringify({ title, description }),
            })

            if (response.ok) {
                toast.success(t('complaints.submitSuccess'))
                setTitle("")
                setDescription("")
            } else {
                throw new Error("Failed to submit complaint")
            }
        } catch (error) {
            toast.error(t('complaints.submitError'))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container max-w-2xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('complaints.submitNew')}</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium">
                                {t('complaints.title')}
                            </label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder={t('complaints.titlePlaceholder')}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium">
                                {t('complaints.description')}
                            </label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                placeholder={t('complaints.descriptionPlaceholder')}
                                rows={4}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting} className="text-white">
                            {isSubmitting ? t('common.submitting') : t('common.submit')}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

export default SubmitComplaint 