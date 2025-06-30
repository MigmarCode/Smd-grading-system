# Database Migrations Guide

## Overview
This directory contains database migration scripts to safely update your database schema without losing data.

## Migration Process

### 1. Development Workflow
1. **Create a new migration file** when you need to change the database schema
2. **Test locally** with your development database
3. **Review the migration** to ensure it's safe for production data
4. **Deploy** the migration to production

### 2. Migration File Naming
Use the format: `YYYY-MM-DD-description.sql`
Example: `2024-01-15-add-student-email.sql`

### 3. Safe Migration Practices
- Always use `IF NOT EXISTS` for new tables/columns
- Use `ALTER TABLE` to add columns instead of recreating tables
- Test migrations on a copy of production data first
- Include rollback scripts when possible

## Current Migrations
- `001-initial-schema.sql` - Initial database setup
- `002-add-sample-data.sql` - Sample data insertion

## Running Migrations
1. Copy the migration SQL to your Supabase SQL Editor
2. Run the migration
3. Test your application
4. Commit the migration file to your repository

## Rollback Strategy
If a migration fails or causes issues:
1. Immediately stop the deployment
2. Use the rollback script (if available)
3. Fix the migration and test again
4. Re-deploy when safe 