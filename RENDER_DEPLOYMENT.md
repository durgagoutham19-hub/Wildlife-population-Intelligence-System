# 🚀 Deploying Wildlife Population Intelligence System to Render

This guide outlines step-by-step instructions to deploy the entire application on [Render](https://render.com).

---

## 🌟 Method 1: Automatic Blueprint Deployment (Recommended)

Because the project includes [`render.yaml`](file:///c:/Users/pulim/Downloads/wildfiles/render.yaml) and [`render-build.sh`](file:///c:/Users/pulim/Downloads/wildfiles/render-build.sh), Render can automatically configure the unified full-stack service:

1. **Push your code to GitHub / GitLab:**
   ```bash
   git add .
   git commit -m "Configure Render unified full-stack deployment"
   git push origin main
   ```

2. **Open Render Dashboard:**
   - Go to [dashboard.render.com](https://dashboard.render.com).
   - Click **New +** in the top right and select **Blueprint**.
   - Connect your GitHub / GitLab repository.
   - Render will detect `render.yaml` and configure:
     - **Build Command:** `./render-build.sh`
     - **Start Command:** `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
     - **Environment Variables:** `PYTHON_VERSION`, `NODE_VERSION`, `OPENBLAS_NUM_THREADS`, etc.

3. **Click "Apply":**
   - Render will install Python dependencies, compile the React Vite frontend, initialize the database, and launch the service.
   - Once deployed, open your `https://your-service.onrender.com` URL!

---

## 🛠️ Method 2: Manual Web Service Setup (Step-by-Step)

If you prefer configuring it manually via the Render UI:

### Step 1: Create a New Web Service
1. In Render Dashboard, click **New +** ➔ **Web Service**.
2. Select **Build and deploy from a Git repository** and connect your repository.

### Step 2: Configure Service Details
- **Name:** `wildlife-population-system`
- **Region:** Any (e.g. `Oregon (US West)` or `Frankfurt (EU)`)
- **Branch:** `main`
- **Runtime:** `Python 3`
- **Build Command:**
  ```bash
  pip install -r requirements.txt && cd frontend && npm install && npm run build && cd ..
  ```
- **Start Command:**
  ```bash
  python -m uvicorn main:app --host 0.0.0.0 --port $PORT
  ```
- **Instance Type:** `Free`

### Step 3: Add Environment Variables
Under **Environment Variables**, add:
| Key | Value | Description |
|-----|-------|-------------|
| `PYTHON_VERSION` | `3.11.8` | Recommended Python version |
| `NODE_VERSION` | `20.11.0` | Node.js for Vite compilation |
| `OPENBLAS_NUM_THREADS` | `1` | Prevents memory allocation limits on Render free tier |
| `MKL_NUM_THREADS` | `1` | Threading protection |
| `OMP_NUM_THREADS` | `1` | Threading protection |
| `JWT_SECRET_KEY` | *(Click "Generate" or enter 32+ random chars)* | Secure JWT token signing |
| `JWT_EXPIRATION_HOURS` | `72` | Session duration |
| `ENVIRONMENT` | `production` | Production mode |
| `DATABASE_URL` | `sqlite:///wildlife.db` | Local SQLite DB path |

### Step 4: Deploy
- Click **Create Web Service**.
- Wait 2–4 minutes for the build to complete.
- Access both your **Frontend Web App** and **API Documentation** at:
  - App: `https://your-service-name.onrender.com/`
  - Swagger Docs: `https://your-service-name.onrender.com/docs`

---

## 📋 Default Credentials on Deployed Instance
- **Email:** `admin@wildlife.org`
- **Password:** `password123`
*(Or use any of the 1-Click Demo buttons on the Login page)*
