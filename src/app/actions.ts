"use server";

import webpush, { PushSubscription } from "web-push";

webpush.setVapidDetails(
  "mailto:admin@cesizen.fr",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

let subscription: PushSubscription | null = null;

export async function subscribeUser(sub: PushSubscription) {
  subscription = sub;
  return { success: true };
}

export async function unsubscribeUser() {
  subscription = null;
  return { success: true };
}

export async function sendNotification(message: string) {
  if (!subscription) return { error: "Aucun abonné" };

  await webpush.sendNotification(
    subscription,
    JSON.stringify({ title: "Cesizen", body: message })
  );

  return { success: true };
}
