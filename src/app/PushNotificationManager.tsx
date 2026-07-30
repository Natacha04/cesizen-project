"use client";

import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { subscribeUser, unsubscribeUser, sendNotification } from "./actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const [supported, setSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      queueMicrotask(() => setSupported(true));
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then(setSubscription);
      });
    }
  }, []);

  async function subscribe() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });
    setSubscription(sub);
    await subscribeUser(sub.toJSON() as Parameters<typeof subscribeUser>[0]);
  }

  async function unsubscribe() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  if (!supported) return null;

  return (
    <Stack spacing={1.5} alignItems="center" sx={{ mt: 2 }}>
      <Typography variant="body2" sx={{ color: "#52616d" }}>
        {subscription ? "Notifications activées" : "Notifications désactivées"}
      </Typography>

      {subscription ? (
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="Message de test..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ borderRadius: "8px" }}
          />
          <Button
            variant="contained"
            disableElevation
            size="small"
            onClick={() => sendNotification(message)}
            sx={{ textTransform: "none", fontWeight: 700, backgroundColor: "#245f42" }}
          >
            Envoyer
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={unsubscribe}
            sx={{ textTransform: "none", borderColor: "#e53935", color: "#e53935" }}
          >
            Désactiver
          </Button>
        </Stack>
      ) : (
        <Button
          variant="outlined"
          size="small"
          onClick={subscribe}
          sx={{ textTransform: "none", fontWeight: 700, borderColor: "#19c26b", color: "#19c26b" }}
        >
          Activer les notifications
        </Button>
      )}
    </Stack>
  );
}
