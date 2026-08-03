import { prisma } from "./prisma";
import { NotificationChannel } from "@prisma/client";

export type NotificationEvent =
  | "homework_created"
  | "announcement_created"
  | "homework_due_soon"; // future: scheduled reminders

interface NotifyPayload {
  event: NotificationEvent;
  title: string;
  body: string;
  targetRef: string; // e.g. "homework:<id>"
}

/**
 * Single entry point for triggering a notification, regardless of channel.
 *
 * Today: no channel is actually wired up (no email/SMS/push provider
 * configured), so every call logs a row with status SKIPPED. This means:
 *  - The call sites (e.g. "after creating homework, notify parents") can
 *    be written NOW throughout the app, so nothing needs to change later.
 *  - There's a queryable history of what *would* have been sent, useful
 *    for testing the trigger logic before a real provider is connected.
 *
 * To activate a channel later: implement `sendEmail`/`sendSms`/`sendPush`
 * below and swap the SKIPPED branch for a real dispatch + SENT/FAILED
 * status update. No caller of `notify()` needs to change.
 */
export async function notify(payload: NotifyPayload): Promise<void> {
  const channels: NotificationChannel[] = ["EMAIL"]; // future: read from admin settings

  for (const channel of channels) {
    await prisma.notification.create({
      data: {
        channel,
        status: "SKIPPED", // no provider implemented yet
        title: payload.title,
        body: payload.body,
        targetRef: payload.targetRef,
      },
    });
  }
}

// Placeholder implementations — intentionally unimplemented.
// async function sendEmail(to: string, subject: string, body: string) {}
// async function sendSms(to: string, body: string) {}
// async function sendPush(to: string, title: string, body: string) {}
