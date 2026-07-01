"use client"

import type { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { UpdatePantryItemValues } from "@/features/pantry/schemas"

export function PantryItemFields({ form }: { form: UseFormReturn<UpdatePantryItemValues> }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade</FormLabel>
              <FormControl>
                <Input type="number" inputMode="decimal" min={0} step="any" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="minimumQuantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mínimo</FormLabel>
              <FormControl>
                <Input type="number" inputMode="decimal" min={0} step="any" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="unit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Unidade (opcional)</FormLabel>
            <FormControl>
              <Input placeholder="kg, L, un..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="expirationDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Validade (opcional)</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormDescription>Avisamos quando estiver perto de vencer.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
