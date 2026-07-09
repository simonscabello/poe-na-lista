import { redirect } from "next/navigation"

// A home canônica é /dashboard/lists; esta rota existe só para links antigos.
export default function DashboardPage() {
  redirect("/dashboard/lists")
}
