# SMD Grading System

A comprehensive grading system built with Next.js for managing students, teachers, classes, subjects, and grades.

## Features

- Student Management
- Teacher Management
- Class Management
- Subject Management
- Grade Management
- Dashboard with Statistics
- PDF Report Generation

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. Supabase account (free tier available)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd smd-grading-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Copy your project URL and anon key
   - Create a `.env.local` file with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the contents of `supabase-setup.sql`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### Step 1: Prepare Your Repository
1. Make sure all changes are committed to Git
2. Push to GitHub

### Step 2: Set up Supabase (if not done already)
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the database setup script (`supabase-setup.sql`) in Supabase SQL Editor
3. Note your project URL and anon key

### Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Import your repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
6. Click "Deploy"

### Step 4: Verify Deployment
- Your app will be available at `https://your-project-name.vercel.app`
- Test all functionality to ensure everything works

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── admin/          # Admin dashboard
│   ├── teacher/        # Teacher dashboard
│   └── dashboard/      # Main dashboard
├── lib/                # Utility functions and configurations
│   ├── database.ts     # Database service functions
│   └── supabase.ts     # Supabase client configuration
└── pages/
    └── api/            # API routes
        ├── students.ts
        ├── teachers.ts
        ├── classes.ts
        ├── subjects.ts
        └── grades.ts
```

## API Endpoints

- `GET /api/students` - Get all students
- `POST /api/students` - Create a new student
- `PUT /api/students` - Update a student
- `DELETE /api/students` - Delete a student

Similar endpoints exist for teachers, classes, subjects, and grades.

## Database Schema

The system uses the following main tables:
- `students` - Student information
- `teachers` - Teacher information
- `classes` - Class information
- `subjects` - Subject information
- `grades` - Grade records
- `class_subjects` - Many-to-many relationship between classes and subjects

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
