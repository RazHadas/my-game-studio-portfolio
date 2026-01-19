const CACHE_NAME = "game-studio-v5";
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./styles.css",
    "./manifest.json",
    "./icons/icon.svg",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./screenshots/mobile.png",
    "./screenshots/desktop.png",

    // Games
    "./games/01-neon-snake/assets/body.png",
    "./games/01-neon-snake/assets/food.png",
    "./games/01-neon-snake/assets/head.png",
    "./games/01-neon-snake/assets/player.png",
    "./games/01-neon-snake/src/snake.html",
    "./games/02-crypto-clicker/assets/coin.png",
    "./games/02-crypto-clicker/src/clicker.html",
    "./games/03-pong/src/pong.html",
    "./games/04-rock-paper-scissors/src/index.html",
    "./games/04-rock-paper-scissors/src/script.js",
    "./games/04-rock-paper-scissors/src/style.css",
    "./games/05-flappy-ghost/index.html",
    "./games/06-pixel-paint-war/src/public/index.html",
    "./games/06-pixel-paint-war/src/public/script.js",
    "./games/06-pixel-paint-war/src/public/style.css"
];

// Install event: cache core assets
self.addEventListener("install", (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        console.log("Opened cache");
        await cache.addAll(ASSETS_TO_CACHE);
    })());
});

// Activate event: clean up old caches
self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(async (cacheName) => {
                if (cacheName !== CACHE_NAME) {
                    console.log("Deleting old cache:", cacheName);
                    await caches.delete(cacheName);
                }
            })
        );
    })());
});

// Fetch event: Network First, falling back to Cache
self.addEventListener("fetch", (event) => {
    event.respondWith((async () => {
        try {
            const response = await fetch(event.request);

            // Return response if valid, and update cache
            // We only cache valid responses with status 200
            // We also check protocol to avoid caching unsupported schemes (like chrome-extension://)
            if (!response || response.status !== 200 || response.type === "error" || !event.request.url.startsWith("http")) {
                return response;
            }

            const responseToCache = response.clone();
            const cache = await caches.open(CACHE_NAME);
            await cache.put(event.request, responseToCache);

            return response;
        } catch (error) {
            // If network fails, try to serve from cache
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
                return cachedResponse;
            }
            // Optional: Return a fallback page or similar here if needed
            throw error;
        }
    })());
});
