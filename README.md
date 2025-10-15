# Unicardealer Service Assistant — Frontend (User)

This is the user-facing chat UI. It connects to the backend at:

`REACT_APP_API` (env) — default: https://service-chat-backend.onrender.com

Deployment (no terminal):
1. Create a new GitHub repository and upload the `frontend-user` folder contents (Upload files → Commit).
2. On Vercel, click **New Project → Import Git Repository** and connect this repo.
3. In Project Settings → Environment Variables, set:
   - `REACT_APP_API` = https://service-chat-backend.onrender.com
4. Deploy and open the produced URL.
