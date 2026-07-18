"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Bell,
  CalendarClock,
  ListPlus,
  Megaphone,
  PackagePlus,
  PiggyBank,
  ShoppingBag,
  UserPlus,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
  getNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/actions/notification.actions"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getNotificationMessage } from "@/lib/notification-text"
import { formatRelativeTime } from "@/lib/relative-time"
import { cn } from "@/lib/utils"
import type { NotificationDTO, NotificationTypeDTO } from "@/types/domain"

type NotificationBellProps = {
  householdId: string
  initialNotifications: NotificationDTO[]
  initialUnreadCount: number
}

type NotificationsData = { notifications: NotificationDTO[]; unreadCount: number }

const ICONS: Record<NotificationTypeDTO, typeof Bell> = {
  LIST_CREATED: ListPlus,
  PURCHASE_FINALIZED: ShoppingBag,
  MEMBER_JOINED: UserPlus,
  ITEM_ADDED: PackagePlus,
  BUDGET_ALERT: PiggyBank,
  PANTRY_EXPIRING: CalendarClock,
  LIST_NUDGE: Megaphone,
}

export function NotificationBell({
  householdId,
  initialNotifications,
  initialUnreadCount,
}: NotificationBellProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const queryKey = ["notifications", householdId]

  const { data } = useQuery<NotificationsData>({
    queryKey,
    queryFn: async () => {
      const result = await getNotificationsAction(householdId)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    initialData: { notifications: initialNotifications, unreadCount: initialUnreadCount },
    refetchInterval: 30_000,
  })

  const { notifications, unreadCount } = data

  function setLocalData(updater: (current: NotificationsData) => NotificationsData) {
    queryClient.setQueryData<NotificationsData>(queryKey, (current) =>
      current ? updater(current) : current,
    )
  }

  function markRead(notification: NotificationDTO) {
    if (notification.read) return
    setLocalData((current) => ({
      notifications: current.notifications.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n,
      ),
      unreadCount: Math.max(0, current.unreadCount - 1),
    }))
    startTransition(async () => {
      const result = await markNotificationReadAction(notification.id, householdId)
      if (!result.success) {
        toast.error(result.error)
        queryClient.invalidateQueries({ queryKey })
      }
    })
  }

  function markAllRead() {
    setLocalData((current) => ({
      notifications: current.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
    startTransition(async () => {
      const result = await markAllNotificationsReadAction(householdId)
      if (!result.success) {
        toast.error(result.error)
        queryClient.invalidateQueries({ queryKey })
      }
    })
  }

  function handleSelect(notification: NotificationDTO) {
    markRead(notification)
    setOpen(false)
    if (notification.link) {
      router.push(notification.link)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Notificações" className="relative">
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.65rem] font-semibold text-primary-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between gap-2 px-3 pt-3">
          <PopoverHeader className="gap-0">
            <PopoverTitle>Notificações</PopoverTitle>
          </PopoverHeader>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="px-3 pt-2 pb-3 text-sm text-muted-foreground">Nenhuma notificação ainda.</p>
        ) : (
          <ul className="max-h-80 overflow-y-auto py-1">
            {notifications.map((notification) => {
              const Icon = ICONS[notification.type]
              return (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(notification)}
                    className={cn(
                      "flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-muted",
                      !notification.read && "bg-accent/60",
                    )}
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm">{getNotificationMessage(notification)}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </span>
                    {!notification.read && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
