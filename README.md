# FlowBoard

FlowBoard is a lightweight personal task manager with a Trello-style Kanban board. It includes:

- 3 default columns on first launch: `Todo`, `In Progress`, and `Done`
- custom columns like `Ideas`, `New Features`, or `Bugs`
- real horizontal Kanban board with Trello-style lists and cards
- inline `+ Add a card` inside each list for fast card creation
- inline `+ Add another list` at the end of the board
- create, edit, and move tasks with drag and drop across any column
- edit column names, descriptions, and accent colors inline
- task title, description, priority, optional link, optional due date/time, and automatic created timestamp
- priority badges: `Critical`, `Important`, and `Not Important`
- search plus filtering by priority
- dark mode
- browser notifications for tasks due soon
- MongoDB-backed persistence

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB

## Project Structure

```text
Task_menager/
  backend/
    src/
      config/
      controllers/
      models/
      routes/
      utils/
  frontend/
    src/
      components/
      lib/
```

## Local Run

### 1. Install dependencies

Open two terminals and run:

```powershell
cd backend
npm install
```

```powershell
cd frontend
npm install
```

If you hit Windows cache-permission issues, this variant works too:

```powershell
npm install --cache .npm-cache
```

### 2. Configure environment variables

Copy the example env files.

Backend:

```powershell
cd backend
Copy-Item .env.example .env
```

Frontend:

```powershell
cd frontend
Copy-Item .env.example .env
```

Update the backend `.env` values:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/personal-task-manager
CLIENT_ORIGIN=http://localhost:5173
```

If you do not want to run MongoDB locally, you can use a MongoDB Atlas connection string here instead.

### 3. Start the backend

```powershell
cd backend
npm run dev
```

The API will be available at `http://localhost:5000/api`.

### 4. Start the frontend

```powershell
cd frontend
npm run dev
```

Open the URL Vite prints in the terminal, usually `http://localhost:5173`.

## Production Build

```powershell
cd frontend
npm run build
```

## API Endpoints

- `GET /api/health`
- `GET /api/board`
- `GET /api/columns`
- `POST /api/columns`
- `PATCH /api/columns/:id`
- `DELETE /api/columns/:id`
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `PATCH /api/tasks/:id/move`
- `DELETE /api/tasks/:id`

## Board Data Shape

The app exposes a nested board payload from `GET /api/board` in this style:

```json
{
  "columns": [
    {
      "id": "todo-column-id",
      "name": "Todo",
      "accent": "coral",
      "isDefault": true,
      "cards": [
        {
          "id": "task1",
          "title": "Build login",
          "description": "",
          "priority": "critical",
          "createdAt": "2026-04-30T18:00:00.000Z"
        }
      ]
    }
  ]
}
```

## Free-Tier Deployment Guide

This setup uses only free-tier services:

- Database: MongoDB Atlas Free Tier
- Backend: Render Free Web Service
- Frontend: Vercel Hobby

### Step 1. Create a MongoDB Atlas database

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a free shared cluster.
3. Create a database user with username and password.
4. In `Network Access`, allow access from `0.0.0.0/0` for quick setup.
5. In `Database`, click `Connect`, choose `Drivers`, and copy the connection string.
6. Replace `<password>` and, if you want, change the database name to `personal-task-manager`.

Example:

```text
mongodb+srv://your-user:your-password@cluster0.xxxxx.mongodb.net/personal-task-manager?retryWrites=true&w=majority&appName=Cluster0
```

### Step 2. Deploy the backend to Render

1. Push this project to GitHub.
2. Create an account at [Render](https://render.com/).
3. Click `New` > `Web Service`.
4. Connect your GitHub repository.
5. Set:
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add environment variables:
   - `PORT=10000`
   - `MONGODB_URI=<your Atlas connection string>`
   - `CLIENT_ORIGIN=<your Vercel frontend URL>`
7. Deploy the service.

After deploy, your API URL will look like:

```text
https://your-render-service.onrender.com/api
```

Render free services can sleep after inactivity, so the first request may take a little longer.

### Step 3. Deploy the frontend to Vercel

1. Create an account at [Vercel](https://vercel.com/).
2. Import the same GitHub repository.
3. Set:
   - Root Directory: `frontend`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add this environment variable:
   - `VITE_API_BASE_URL=https://your-render-service.onrender.com/api`
5. Deploy.

Your app URL will look like:

```text
https://your-project-name.vercel.app
```

### Step 4. Update CORS on Render

Once Vercel gives you the final frontend URL:

1. Go back to Render.
2. Update `CLIENT_ORIGIN` to your exact Vercel URL.
3. Redeploy the backend if Render does not do it automatically.

### Step 5. Test the live app

1. Open the Vercel URL.
2. Confirm the board starts with `Todo`, `In Progress`, and `Done`.
3. Add a custom column like `Ideas` or `New Features`.
4. Add a card inline using `+ Add a card`.
5. Open the card to edit details like description, due date, and priority.
6. Filter the board by priority.
7. Drag the card into another column and refresh to confirm MongoDB persistence.

## Notes

- The board disables drag-and-drop while search filtering is active so task order stays correct.
- The board also pauses drag-and-drop while a priority filter is active so task order stays correct.
- Columns can be renamed and new ones can be added at any time.
- Default columns are protected from deletion.
- Card creation is intentionally inline and lightweight; the modal is used for full card details only.
- Due-date notifications use the browser Notification API and work after the user grants permission.
- Mobile is supported; drag-and-drop works best on touch-capable modern browsers, and every task can also be updated from the task modal.

## Live Demo Link

This workspace is deployment-ready, but no live demo URL is included because deployment requires your own Vercel, Render, and MongoDB Atlas accounts.
