import { Container } from "@/components/layout/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateHouseholdForm } from "@/features/households/components/create-household-form"

export default function NewHouseholdPage() {
  return (
    <Container size="narrow" className="py-10">
      <Card>
        <CardHeader>
          <CardTitle>Novo grupo</CardTitle>
          <CardDescription>Crie outro grupo para organizar listas separadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateHouseholdForm />
        </CardContent>
      </Card>
    </Container>
  )
}
