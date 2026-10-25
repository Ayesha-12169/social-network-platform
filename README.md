# CircleUp — Social Network Platform (Frontend Demo)

A responsive React + Vite social network UI with profile editing, posts, likes, comments, saved posts, friend requests, notifications, privacy preference controls, and image attachments.

## Run locally

1. Install Node.js (LTS).
2. Extract this folder.
3. Open a terminal inside the extracted folder.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the local URL Vite prints (usually `http://localhost:5173`).

## Important scope note

This is a frontend-only demo. Data is stored in the browser's `localStorage`; it is not a secure account system or shared database. Cross-tab updates use the browser `storage` event and are not WebSockets. Real multi-user WebSocket updates, server-enforced privacy, authentication, and shared media storage require a backend.

Image uploads are limited to 3 MB and stored locally in this browser. For a production version, use a backend and cloud media storage.
