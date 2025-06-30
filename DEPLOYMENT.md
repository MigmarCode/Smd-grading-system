# 🚀 Deployment Guide - SMD Grading System

## 🚀 Deployment Status: READY FOR TESTING

Your application has been successfully migrated from SQLite to Supabase and is now deployed on Vercel.

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

## ✅ What's Been Fixed

### 1. **Database Schema Migration**
- ✅ Updated all API routes to use UUIDs instead of TEXT IDs
- ✅ Removed manual UUID generation (Supabase handles this automatically)
- ✅ Updated foreign key relationships to match Supabase schema
- ✅ Fixed data type mismatches between SQLite and Supabase

### 2. **API Routes Updated**
- ✅ `/api/classes` - Fixed UUID handling and error logging
- ✅ `/api/subjects` - Fixed UUID handling and error logging  
- ✅ `/api/teachers` - Updated schema (class_id instead of email/phone) + class information
- ✅ `/api/students` - Fixed UUID handling and error logging
- ✅ `/api/grades` - Fixed UUID handling and conflict resolution
- ✅ `/api/class-subjects` - Fixed UUID handling and error logging
- ✅ `/api/student-stats` - Added error logging

### 3. **Frontend Updates**
- ✅ Updated teacher forms to use class selection instead of email/phone
- ✅ Fixed form validation and error handling
- ✅ Updated all API calls to handle new schema
- ✅ Teacher display now shows assigned class information

### 4. **Environment Variables**
- ✅ Supabase URL and API key configuration
- ✅ Proper error handling for missing environment variables

## 🧪 Testing Checklist

### Step 1: Environment Test
Visit: `https://your-domain.vercel.app/api/test-env`

Expected response:
```json
{
  "message": "Comprehensive environment and database test",
  "environment": {
    "supabaseUrl": "Present",
    "supabaseAnonKey": "Present"
  },
  "database": {
    "status": "Connected successfully"
  },
  "tables": {
    "status": "Completed",
    "tables": {
      "classes": {"status": "OK"},
      "subjects": {"status": "OK"},
      "teachers": {"status": "OK"},
      "students": {"status": "OK"},
      "grades": {"status": "OK"},
      "class_subjects": {"status": "OK"}
    }
  }
}
```

### Step 2: Core Functionality Test

#### Admin Dashboard (`/admin/dashboard`)
1. **Classes Management**
   - ✅ Create a new class
   - ✅ Edit existing class
   - ✅ Delete class
   - ✅ View all classes

2. **Subjects Management**
   - ✅ Create a new subject
   - ✅ Edit existing subject
   - ✅ Delete subject
   - ✅ View all subjects

3. **Teachers Management**
   - ✅ Create a new teacher (with class assignment)
   - ✅ Edit existing teacher (change class assignment)
   - ✅ Delete teacher
   - ✅ View all teachers with their assigned classes
   - ✅ No private information (email/phone) stored

4. **Students Management**
   - ✅ Create a new student
   - ✅ Edit existing student
   - ✅ Delete student
   - ✅ View students by class

#### Teacher Dashboard (`/teacher/dashboard`)
1. **Grade Management**
   - ✅ Select class
   - ✅ View students in class
   - ✅ Enter grades for students
   - ✅ Submit grades
   - ✅ Generate reports

### Step 3: Data Integrity Test

1. **Create Test Data**
   ```
   Class: "Class 1" - "A"
   Subject: "Mathematics"
   Teacher: "John Doe" (assigned to Class 1A)
   Student: "Alice Brown" (Roll: 1, Admission: STU001, assigned to Class 1A)
   ```

2. **Verify Relationships**
   - ✅ Student assigned to class
   - ✅ Teacher assigned to class
   - ✅ Subject assigned to class
   - ✅ Grades linked to student/class/teacher

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to fetch" errors
**Solution**: Check browser console for specific error messages. Most likely environment variables not set in Vercel.

### Issue 2: "Class not found" when editing
**Solution**: This is expected - the ID format changed from TEXT to UUID. Old data needs to be recreated.

### Issue 3: Teacher form validation errors
**Solution**: Make sure first name and last name are filled. Class assignment is optional.

### Issue 4: Grades not saving
**Solution**: Check that student_id, class_id, and teacher_id are valid UUIDs.

### Issue 5: Teacher not showing assigned class
**Solution**: The API now includes class information. Refresh the page to see updated data.

## 📊 Performance Monitoring

### Vercel Analytics
- Monitor API response times
- Check for 500 errors
- Track user interactions

### Supabase Dashboard
- Monitor database performance
- Check for slow queries
- Review error logs

## 🔧 Maintenance

### Regular Tasks
1. **Weekly**: Check Vercel deployment logs
2. **Monthly**: Review Supabase usage and performance
3. **Quarterly**: Update dependencies

### Backup Strategy
- Supabase provides automatic backups
- Consider exporting data monthly for additional safety

## 🎯 Next Steps

1. **Teacher Training**: Schedule training sessions for teachers
2. **Data Migration**: Import existing student/class data
3. **User Feedback**: Collect feedback from teachers after 1 week
4. **Performance Optimization**: Monitor and optimize based on usage

## 📞 Support

If you encounter any issues:
1. Check the test endpoint first: `/api/test-env`
2. Review browser console for errors
3. Check Vercel deployment logs
4. Contact support with specific error messages

---

**Status**: ✅ Ready for teacher testing
**Last Updated**: $(date)
**Version**: 2.1 (Teacher Form Update)

**Need Help?**
- Check Vercel documentation
- Review Next.js deployment guide
- Contact support if needed 