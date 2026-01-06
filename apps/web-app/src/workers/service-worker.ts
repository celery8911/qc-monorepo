/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import type { PrecacheEntry } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

const precacheManifest = (self.__WB_MANIFEST as Array<PrecacheEntry>).concat([
  { url: '/offline.html', revision: null },
]);

precacheAndRoute(precacheManifest);

clientsClaim();
self.skipWaiting();

registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script',
  new CacheFirst({
    cacheName: 'static-resources',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 100,
      }),
    ],
  }),
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 30,
        maxEntries: 200,
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) =>
    request.destination === '' &&
    (url.pathname.startsWith('/api') || url.hostname === 'api.etherscan.io'),
  new NetworkFirst({
    cacheName: 'api-data',
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 5,
        maxEntries: 50,
      }),
    ],
  }),
);

registerRoute(
  ({ request }) => request.destination === 'document',
  new NetworkFirst({
    cacheName: 'html-pages',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
);

const offlineHandler = createHandlerBoundToURL('/offline.html');
setCatchHandler(async ({ event, request, url, params }) => {
  if (request.destination === 'document') {
    return offlineHandler({ event, request, url, params });
  }
  return Response.error();
});
