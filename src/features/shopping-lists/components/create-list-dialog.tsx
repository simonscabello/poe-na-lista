"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDown, Plus, ShoppingCart, Target } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { createListAction } from "@/actions/shopping-list.actions"
import { CurrencyInput } from "@/components/common/currency-input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

type Mode = "grocery" | "project"

function getDefaultListName(): string {
  const today = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(
    new Date(),
  )
  return `Compras de ${today}`
}

export function CreateListDialog({ householdId, showInviteStep = false }: CreateListDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("grocery")
  const [budgetCap, setBudgetCap] = useState<number | null>(null)
  const [step, setStep] = useState<"form" | "invite">("form")
  const [createdListId, setCreatedListId] = useState<string | null>(null)
  const form = useForm<ShoppingListNameValues>({
    resolver: zodResolver(shoppingListNameSchema),
    defaultValues: { name: getDefaultListName() },
  })

  const isProject = mode === "project"

  function startCreate(nextMode: Mode) {
    setMode(nextMode)
    setBudgetCap(null)
    setStep("form")
    form.reset({ name: nextMode === "grocery" ? getDefaultListName() : "" })
    setOpen(true)
  }

  async function onSubmit(values: ShoppingListNameValues) {
    const result = await createListAction(householdId, {
      name: values.name,
      kind: isProject ? "PROJECT" : "GROCERY",
      budgetCap: isProject ? budgetCap : null,
    })
    if (!result.success) {
      toast.error(result.error)
      return
    }
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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button>
              <Plus className="size-4" />
              Nova lista
              <ChevronDown className="size-4 opacity-80" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => startCreate("grocery")}>
            <ShoppingCart className="size-4" />
            Lista de compras
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => startCreate("project")}>
            <Target className="size-4" />
            Projeto com teto
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          {step === "form" ? (
            <>
              <DialogHeader>
                <DialogTitle>{isProject ? "Novo projeto" : "Nova lista"}</DialogTitle>
                <DialogDescription>
                  {isProject
                    ? "Uma compra pontual, como uma reforma ou o enxoval do bebê."
                    : "Dê um nome para sua lista de compras."}
                </DialogDescription>
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
                            placeholder={isProject ? "Reforma da cozinha" : "Compras da semana"}
                            autoFocus
                            {...field}
                            onFocus={(event) => event.target.select()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isProject && (
                    <div className="space-y-2">
                      <Label htmlFor="project-budget">Teto de gasto (opcional)</Label>
                      <CurrencyInput
                        id="project-budget"
                        variant="full"
                        value={budgetCap}
                        onCommit={setBudgetCap}
                        onValueChange={setBudgetCap}
                        placeholder="0,00"
                        aria-label="Teto de gasto do projeto"
                      />
                      <p className="text-xs text-muted-foreground">
                        Projetos ficam à parte: não entram no orçamento do mês nem na despensa.
                      </p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
                    {isProject ? "Criar projeto" : "Criar lista"}
                  </Button>
                </form>
              </Form>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{isProject ? "Projeto criado!" : "Lista criada!"}</DialogTitle>
                <DialogDescription>
                  Chame quem mora com você — tudo fica sincronizado para o grupo.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <GenerateInviteLink householdId={householdId} />
                <Button className="w-full" onClick={goToCreatedList}>
                  {isProject ? "Ir para o projeto" : "Ir para a lista"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
