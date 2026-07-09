"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { setActiveHouseholdAction } from "@/actions/active-household.actions"
import { createHouseholdAction } from "@/actions/household.actions"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { type HouseholdNameValues, householdNameSchema } from "@/features/households/schemas"

export function CreateHouseholdForm() {
  const form = useForm<HouseholdNameValues>({
    resolver: zodResolver(householdNameSchema),
    defaultValues: { name: "" },
  })

  async function onSubmit(values: HouseholdNameValues) {
    const result = await createHouseholdAction(values)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    await setActiveHouseholdAction(result.data.id)
    toast.success("Grupo criado com sucesso")
    // Navegação real (não router.refresh): com cacheComponents do Next 16, o
    // refresh na mesma rota não re-renderizava o dashboard de forma confiável,
    // deixando o usuário preso no onboarding (e criando grupos duplicados a
    // cada novo clique). window.location garante um render fresco com o cookie
    // de grupo ativo já setado. Espelha o padrão de navegar do accept-invitation.
    window.location.assign("/dashboard")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do grupo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Família, Igreja, Churrasco" autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          Criar grupo
        </Button>
      </form>
    </Form>
  )
}
