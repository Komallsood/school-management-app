# College Management System

A comprehensive college management application built with Next.js, Tailwind CSS, and localStorage. This system supports both student and teacher roles with separate dashboards and functionalities.

## Features

### Student Features
- ✅ View marks and grades
- ✅ Track attendance
- ✅ View enrolled courses
- ✅ Check academic progress
- ✅ Submit queries to teachers

### Teacher Features
- ✅ Create and manage courses
- ✅ Add marks for students
- ✅ Mark student attendance
- ✅ View student progress
- ✅ Answer student queries

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Storage**: localStorage (Browser-based, no database required!)

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

That's it! No database setup needed - everything is stored in your browser's localStorage.

## Usage

### Registration

1. **Student Registration**
   - Click "Register as Student" on the home page
   - Fill in: Name, Student ID, Email, Password
   - Submit to create your account

2. **Teacher Registration**
   - Click "Register as Teacher" on the home page
   - Fill in: Name, Teacher ID, Email, Password
   - Submit to create your account

### Login

- Use the "Login" button on the home page
- Enter your email and password
- You'll be redirected to your respective dashboard

### Student Dashboard

- **Overview**: Quick stats and recent activity
- **Marks**: View all your marks and grades
- **Attendance**: Check your attendance records
- **Courses**: View enrolled courses
- **Queries**: Ask questions to teachers and view responses

### Teacher Dashboard

- **Overview**: Summary of courses, students, and pending queries
- **Courses**: Create new courses and view existing ones
- **Marks**: Add marks for students
- **Attendance**: Mark student attendance
- **Queries**: View and answer student queries
- **Progress**: View student progress by course

## Data Storage

All data is stored in the browser's localStorage. This means:
- ✅ No database setup required
- ✅ Data persists across page refreshes
- ✅ Works offline
- ⚠️ Data is browser-specific (cleared if you clear browser data)
- ⚠️ Data is not shared across devices/browsers

## Project Structure

```
college-management-app/
├── app/
│   ├── dashboard/
│   │   ├── student/      # Student dashboard
│   │   └── teacher/       # Teacher dashboard
│   ├── login/             # Login page
│   ├── register/          # Registration pages
│   └── page.tsx           # Home page
├── lib/
│   └── storage.ts         # localStorage utilities
└── package.json
```

## Development

- Run `npm run dev` for development
- Run `npm run build` to build for production
- Run `npm start` to start production server

## Notes

- Passwords are stored in plain text (for demo purposes). In production, use proper hashing.
- All data is stored locally in your browser.
- To clear all data, clear your browser's localStorage.

## License

This project is open source and available for educational purposes.

