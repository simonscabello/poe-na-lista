"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { createListAction } from "@/actions/shopping-list.actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { GenerateInviteLink } from "@/features/households/components/generate-invite-link"
import {
  type ShoppingListNameValues,
  shoppingListNameSchema,
} from "@/features/shopping-lists/schemas"

type CreateListDialogProps = {
  householdId: string
  /** Mostra o passo de convite após criar (primeira lista de um grupo solo). */
  showInviteStep?: boolean
}

function getDefaultListName(): string {
  const today = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(
    new Date(),
  )
  return `Compras de ${today}`
}

export function CreateListDialog({ householdId, showInviteStep = false }: CreateListDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"form" | "invite">("form")
  const [createdListId, setCreatedListId] = useState<string | null>(null)
  const form = useForm<ShoppingListNameValues>({
    resolver: zodResolver(shoppingListNameSchema),
    defaultValues: { name: getDefaultListName() },
  })

  async function onSubmit(values: ShoppingListNameValues) {
    const result = await createListAction(householdId, values)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    form.reset({ name: getDefaultListName() })
    if (showInviteStep) {
      setCreatedListId(result.data.id)
      setStep("invite")
      return
    }
    setOpen(false)
    router.push(`/dashboard/lists/${result.data.id}`)
  }

  function goToCreatedList() {
    setOpen(false)
    setStep("form")
    if (createdListId) {
      router.push(`/dashboard/lists/${createdListId}`)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    // Fechar durante o passo de convite não pode "perder" a lista recém-criada.
    if (!nextOpen && step === "invite") {
      goToCreatedList()
      return
    }
    setOpen(nextOpen)
    if (!nextOpen) {
      setStep("form")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="size-4" />
            Nova lista
          </Button>
        }
      />
      <DialogContent>
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Nova lista</DialogTitle>
              <DialogDescription>Dê um nome para sua lista de compras.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Compras da semana"
                          autoFocus
                          {...field}
                          onFocus={(event) => event.target.select()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
                  Criar lista
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Lista criada!</DialogTitle>
              <DialogDescription>
                Chame quem mora com você — a lista fica sincronizada para todos.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <GenerateInviteLink householdId={householdId} />
              <Button className="w-full" onClick={goToCreatedList}>
                Ir para a lista
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
