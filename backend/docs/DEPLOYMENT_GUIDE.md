# 🚀 Deployment Guide - Render + Vercel

## ✅ Code Pushed to GitHub
Repository: https://github.com/wkarunakaran/PROEDUVATE-CODEING-MODULE

---

## 🎯 Step 1: Deploy Backend to Render

### 1. Go to Render Dashboard
- Visit: https://dashboard.render.com
- Sign in with your GitHub account

### 2. Create New Web Service
- Click **"New +"** → **"Web Service"**
- Click **"Connect GitHub"** if not already connected
- Find and select: **PROEDUVATE-CODEING-MODULE**

### 3. Configure Service

**Basic Settings:**
- **Name:** `codoai-backend` (or any name)
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** `PROEDUVATE-CODEING-MODULE` (if needed)

**Build & Deploy:**
- **Runtime:** `Python 3`
- **Build Command:** 
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command:**
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

### 4. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these (replace with your actual values from .env):
```
MONGODB_URI=<your_mongodb_uri>
MONGODB_DB_NAME=codo-ai
JWT_SECRET=<your_jwt_secret>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
GOOGLE_API_KEY=<your_google_api_key>
AWS_REGION=<your_aws_region>
AWS_ACCESS_KEY_ID=<your_aws_access_key>
AWS_SECRET_ACCESS_KEY=<your_aws_secret_key>
AWS_LAMBDA_FUNCTION_NAME=python-code-executor
```

⚠️ **Important:** Copy these values from your `.env` file. Never commit actual secrets to the repository!

### 5. Deploy!
- Click **"Create Web Service"**
- Wait 5-10 minutes for deployment
- Your backend URL will be: `https://your-service-name.onrender.com`
- **Save this URL!** You'll need it for frontend

### 6. Test Backend
Visit: `https://your-service-name.onrender.com/docs`
You should see the API documentation!

---

## 🎨 Step 2: Deploy Frontend to Vercel

### 1. Go to Vercel
- Visit: https://vercel.com/new
- Sign in with your GitHub account

### 2. Import Project
- Click **"Import Project"**
- Select **"Import Git Repository"**
- Choose: **PROEDUVATE-CODEING-MODULE**
- Click **"Import"**

### 3. Configure Project

**Project Settings:**
- **Framework Preset:** `Vite`
- **Root Directory:** `PROEDUVATE-CODEING-MODULE` (click Edit, select the folder)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 4. Add Environment Variable

Click **"Environment Variables"**

Add:
```
Name: VITE_API_URL
Value: https://your-render-backend-url.onrender.com
```

**Important:** Replace with your actual Render backend URL from Step 1!

### 5. Deploy!
- Click **"Deploy"**
- Wait 2-3 minutes
- Your frontend URL will be: `https://your-project-name.vercel.app`

### 6. Update CORS (Important!)

Go back to Render → Your Backend Service → Environment

Update `CORS_ORIGINS` to include your Vercel URL:
```
CORS_ORIGINS=http://localhost:5173,https://your-project-name.vercel.app
```

Click **"Save Changes"** - Render will auto-redeploy.

---

## ✅ Step 3: Verify Deployment

### Test Backend
1. Visit: `https://your-backend.onrender.com/docs`
2. Try the `/test` endpoint
3. Should return: `{"message": "CORS test successful"}`

### Test Frontend
1. Visit: `https://your-frontend.vercel.app`
2. Register a new account
3. Create a lobby
4. Open incognito window
5. Join the lobby with Game ID
6. Start the game!

### Check Browser Console
- No CORS errors ✅
- API calls successful ✅
- Lobby features working ✅

---

## 🔧 Troubleshooting

### Backend Issues

**"Application failed to start"**
- Check Render logs for errors
- Verify all environment variables are set
- Check MongoDB connection string
- Ensure build command completed successfully

**"Module not found"**
- Clear build cache in Render
- Trigger manual redeploy

### Frontend Issues

**"Failed to fetch" errors**
- Check VITE_API_URL is correct
- Verify backend is deployed and running
- Check CORS_ORIGINS includes your Vercel URL
- Check browser console for exact error

**Build failures**
- Check Node.js version (Vercel uses 18.x by default)
- Verify package.json has all dependencies
- Check build logs in Vercel dashboard

### CORS Issues

If you see CORS errors:
1. Go to Render → Backend → Environment
2. Update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://your-vercel-url.vercel.app,http://localhost:5173
   ```
3. Save and wait for redeploy
4. Clear browser cache
5. Try again

---

## 🎉 Success Checklist

- ✅ Backend deployed on Render
- ✅ Backend `/docs` accessible
- ✅ Backend environment variables set
- ✅ Frontend deployed on Vercel
- ✅ Frontend environment variable set (VITE_API_URL)
- ✅ CORS configured with Vercel URL
- ✅ Registration/Login works
- ✅ Lobby creation works
- ✅ Lobby joining works
- ✅ Game starts successfully

---

## 📱 Share Your App

Once deployed, share these URLs:

**Frontend (Users access this):**
```
https://your-project-name.vercel.app
```

**Backend API Docs:**
```
https://your-backend.onrender.com/docs
```

---

## 💡 Tips

### Free Tier Limitations

**Render Free Tier:**
- Sleeps after 15 minutes of inactivity
- First request may take 30-60 seconds to wake up
- Limited to 750 hours/month
- Upgrade to keep it always active

**Vercel Free Tier:**
- Unlimited bandwidth
- 100GB bandwidth/month
- Serverless functions
- Perfect for frontend hosting

### Custom Domain (Optional)

**Vercel:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration steps

**Render:**
1. Go to Service Settings → Custom Domains
2. Add your domain
3. Configure DNS records

---

## 🔄 Future Updates

To deploy updates:

1. **Make changes locally**
2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```

3. **Auto-deployment:**
   - Vercel: Deploys automatically on push
   - Render: Deploys automatically on push

---

## 📞 Support

If you encounter issues:
- Check Render logs: Dashboard → Service → Logs
- Check Vercel logs: Dashboard → Deployments → Click deployment → Logs
- Verify environment variables are set correctly
- Test backend endpoints directly
- Check browser console for frontend errors

---

**🎊 Congratulations! Your app is now live!** 🎊
