self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let data = { title: "Cesizen", body: "Nouvelle notification" };
  if (e.data) {
    try {
      data = e.data.json();
    } catch {
      data = { title: "Cesizen", body: e.data.text() };
    }
  }
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/web-app-manifest-192x192.png",
    })
  );
});
