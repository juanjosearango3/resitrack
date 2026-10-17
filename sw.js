self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("push", event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { body: event.data && event.data.text() }; }
  const title = d.title || "ResiTrack";
  const options = {
    body: d.body || "Hay novedades en una convocatoria que sigues.",
    icon: "icon-192.png",
    badge: "icon-192.png",
    tag: d.tag || "resitrack",
    data: { url: d.url || "/" }
  };
  event.waitUntil(Promise.all([
    self.registration.showNotification(title, options),
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => list.forEach(c => c.postMessage({ type: "rt-refresh" })))
  ]));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      const tab = new URL(url, self.location.origin).searchParams.get("tab");
      for (const c of list) {
        c.postMessage({ type: "rt-refresh", tab });
        if ("focus" in c) return c.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
