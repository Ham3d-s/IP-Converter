## 2025-02-28 - [Next.js XSS Sanitization]
**Vulnerability:** Found Cross-Site Scripting (XSS) vulnerability via `dangerouslySetInnerHTML` in `components/NetworkAnalysis.tsx`
**Learning:** Initial fix attempt using standard `dompurify` caused a Next.js SSR build failure because `DOMPurify` requires the browser's `window` object which is not present during server-side rendering.
**Prevention:** Use `isomorphic-dompurify` package which automatically handles the Node.js/JSDOM fallback in SSR environments like Next.js, safely sanitizing HTML without build crashes.
