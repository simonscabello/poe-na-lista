"use server"

import { getActionErrorMessage } from "@/lib/errors"
import { requireHouseholdMember } from "@/lib/permissions"
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notification.service"
import { type ActionResult, actionError, actionOk } from "@/types/action"
import type { NotificationDTO } from "@/types/domain"

export async function getNotificationsAction(
  householdId: string,
): Promise<ActionResult<{ notifications: NotificationDTO[]; unreadCount: number }>> {
  try {
    const { user } = await requireHouseholdMember(householdId)
    const [notifications, unreadCount] = await Promise.all([
      getNotifications(user.id, householdId),
      getUnreadNotificationCount(user.id, householdId),
    ])
    return actionOk({ notifications, unreadCount })
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function markNotificationReadAction(
  notificationId: string,
  householdId: string,
): Promise<ActionResult> {
  try {
    const { user } = await requireHouseholdMember(householdId)
    await markNotificationRead(notificationId, user.id)
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}

export async function markAllNotificationsReadAction(householdId: string): Promise<ActionResult> {
  try {
    const { user } = await requireHouseholdMember(householdId)
    await markAllNotificationsRead(user.id, householdId)
    return actionOk(undefined)
  } catch (error) {
    return actionError(getActionErrorMessage(error))
  }
}
