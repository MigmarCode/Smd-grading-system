# 🚀 Deployment Guide - SMD Grading System

## **Prerequisites**

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Database Solution** - Since SQLite won't work on Vercel, you'll need a cloud database

## **Database Options for Vercel Deployment**

### **Option 1: Supabase (Recommended)**
- Free tier available
- PostgreSQL database
- Easy to set up
- Good for educational projects

### **Option 2: PlanetScale**
- MySQL database
- Free tier available
- Serverless-friendly

### **Option 3: Neon**
- PostgreSQL database
- Free tier available
- Serverless-friendly

## **Deployment Steps**

### **Step 1: Set up Cloud Database**

1. **For Supabase:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your database URL and API keys
   - Run the database setup script in Supabase SQL editor

2. **For PlanetScale:**
   - Go to [planetscale.com](https://planetscale.com)
   - Create a new database
   - Get your connection string
   - Run the database setup script

### **Step 2: Update Environment Variables**

Create a `.env.local` file with your database credentials:

```env
# For Supabase
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# For PlanetScale
DATABASE_URL=your_planetscale_connection_string
```

### **Step 3: Deploy to Vercel**

1. **Connect GitHub to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables:**
   - In your Vercel project settings
   - Add the same environment variables from `.env.local`

3. **Deploy:**
   - Vercel will automatically build and deploy your project
   - Your app will be available at `https://your-project-name.vercel.app`

## **Database Migration Required**

The current code uses SQLite which won't work on Vercel. You need to:

1. **Replace SQLite with a cloud database client**
2. **Update all API routes to use the new database**
3. **Run database migrations**

## **Current Issues to Fix**

1. **SQLite Dependency**: Remove `better-sqlite3` and `sqlite3` from package.json
2. **Database Connection**: Update `src/lib/database.ts` to use cloud database
3. **API Routes**: Update all API routes in `src/pages/api/` to use cloud database
4. **Environment Variables**: Add proper environment variable handling

## **Quick Fix Commands**

```bash
# Remove SQLite dependencies
npm uninstall better-sqlite3 sqlite3 @types/sqlite3 @types/better-sqlite3

# Add cloud database client (example for Supabase)
npm install @supabase/supabase-js

# Or for PlanetScale
npm install mysql2
```

## **Testing Locally**

Before deploying, test your changes locally:

```bash
npm run dev
```

Make sure all API endpoints work with the new database setup.

## **Post-Deployment Checklist**

✅ **Test all features:**
- Landing page loads
- Admin dashboard works
- Teacher dashboard works
- Database operations work
- Mobile responsiveness

✅ **Performance:**
- Page load times are acceptable
- Images are optimized
- API responses are fast

✅ **Security:**
- No sensitive data exposed
- API endpoints are secure
- Database is properly configured

## **Monitoring & Maintenance**

### **Vercel Analytics**
- Built-in performance monitoring
- Real user metrics
- Error tracking

### **Database Management**
- SQLite file is automatically managed
- Consider regular backups
- Monitor database size

### **Updates**
- Keep dependencies updated
- Monitor for security patches
- Test updates locally first

## **Troubleshooting**

### **Build Failures**
- Check ESLint errors
- Verify all imports are correct
- Test locally with `npm run build`

### **Runtime Errors**
- Check Vercel function logs
- Verify API routes work
- Test database connections

### **Performance Issues**
- Optimize images
- Reduce bundle size
- Use proper caching strategies

## **Next Steps After Deployment**

1. **Add Authentication** (Recommended)
   - Implement session-based auth
   - Add login/logout functionality
   - Secure admin routes

2. **Add Real Data**
   - Import actual student data
   - Set up teacher accounts
   - Configure classes and subjects

3. **Backup Strategy**
   - Set up database backups
   - Document data export process
   - Plan for data migration

4. **Monitoring**
   - Set up error tracking
   - Monitor usage patterns
   - Plan for scaling

---

**Need Help?**
- Check Vercel documentation
- Review Next.js deployment guide
- Contact support if needed 