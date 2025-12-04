# Full-Stack Hiring Challenge Scaffold

This repository provides a starter kit for a full-stack take-home exercise. The focus is on building out missing features and demonstrating end-to-end proficiency across React, Express, TypeORM, and PostgreSQL.

## Features Included

- JWT authentication with role-based access control (`admin`, `manager`, `user`)
- TypeORM data model showcasing one-to-many and many-to-many relations
- Task management CRUD endpoints and React UI
- File upload endpoint with disk storage and validation
- Responsive dashboard with animated carousel and backside flip interactions

## Tech Overview

- **Backend**: Node.js, Express, TypeORM, PostgreSQL
- **Frontend**: React (Vite, TypeScript), React Router, React Query

## Setup

### Backend

```bash
cd backend
cp env.example .env
npm install
```

#### Option 1: PostgreSQL (default)

```bash
npm run dev
```

The server starts on `http://localhost:4000`. Make sure PostgreSQL is running and the connection values in `.env` are valid.

#### Option 2: SQLite (no external DB required)

```bash
mkdir -p data
sqlite3 data/task_app.sqlite < sql/sqlite-sample.sql   # optional sample data
set DB_TYPE=sqlite # or export for bash/zsh
npm run migration:run                                  # sets up schema via TypeORM
npm run dev
```

When using SQLite you can customise the database location through `DB_PATH` in `.env`. Set `DB_SYNCHRONIZE=true` if you prefer schema auto-sync instead of migrations.

### Frontend

```bash
cd frontend
cp env.example .env
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:4000/api`. Adjust `VITE_API_URL` if the server URL differs.

## Developer Challenges

Complete **3 out of 5** challenges below. Focus on clean code, proper error handling, and thoughtful user experience.

### Challenge 1: Task Assignment UI ⭐
**Difficulty: Medium**

The backend already supports assigning users to tasks via `assigneeIds`, but the frontend UI is missing.

**Requirements:**
- Add a multi-select dropdown or autocomplete component to the task form
- Fetch and display list of users from the backend (create a users API endpoint if needed)
- Show assigned users on task cards in the task list
- Allow filtering tasks by assignee
- Display assignee avatars/initials on task cards

**Bonus:**
- Search/filter users in the assignee selector
- Show user roles next to names
- Add visual indicators for tasks assigned to the current user

---

### Challenge 2: Task Filtering, Search & Pagination ⭐
**Difficulty: Medium**

Enhance the task list with better data management capabilities.

**Requirements:**
- Add search functionality (filter by title and description)
- Add status filter (todo, in_progress, done) with ability to select multiple
- Implement pagination on backend (limit, offset, or cursor-based)
- Add pagination controls on frontend (page numbers, prev/next buttons)
- Show total task count and current page info
- Persist filter/search state in URL query parameters

**Bonus:**
- Add sorting options (by date created, title, status)
- Add "My Tasks" filter (tasks where user is owner or assignee)
- Remember filter preferences in localStorage

---

### Challenge 3: Enhanced RBAC & Task Permissions
**Difficulty: Medium-Hard**

Implement proper role-based access control for task operations.

**Requirements:**
- **Backend:** Add permission checks in task controller:
  - Regular users can only edit/delete tasks they own
  - Managers can edit any task but only delete their own
  - Admins have full access (edit/delete any task)
- **Backend:** Add middleware or helper function to check permissions
- **Frontend:** Hide edit/delete buttons based on user permissions
- **Frontend:** Show appropriate error messages when permission denied
- Add unit tests or integration tests for permission logic

**Bonus:**
- Add audit logging for permission-denied attempts
- Create a permissions matrix documentation
- Add role-based task visibility (users only see tasks they're involved in)

---

### Challenge 4: Task Detail View & Comments
**Difficulty: Medium**

Create a dedicated page for viewing and managing individual tasks.

**Requirements:**
- Create a new route `/tasks/:id` with a task detail page
- Display all task information (title, description, status, owner, assignees, attachments)
- Add a comments/notes section where users can:
  - Add comments to tasks
  - View comment history with timestamps and authors
  - Edit/delete their own comments
- Backend: Create comments entity and API endpoints (CRUD operations)
- Add navigation from task list to detail view
- Show task creation and update timestamps

**Bonus:**
- Add @mention functionality in comments
- Show comment notifications
- Add rich text formatting for comments
- Display task activity timeline

---

### Challenge 5: Input Validation & Error Handling
**Difficulty: Medium**

Improve validation and error handling throughout the application.

**Requirements:**
- **Backend:** Add comprehensive validation using `class-validator`:
  - Email format validation for registration/login
  - Password strength requirements (min length, complexity)
  - Task title/description length limits
  - File upload validation (size, type, count)
- **Backend:** Create custom validation decorators where appropriate
- **Backend:** Return detailed, user-friendly error messages
- **Frontend:** Display validation errors inline in forms
- **Frontend:** Show loading states and handle network errors gracefully
- **Frontend:** Add form field validation before submission
- Handle edge cases: duplicate emails, invalid IDs, missing required fields

**Bonus:**
- Add request rate limiting middleware
- Implement client-side debouncing for search inputs
- Add retry logic for failed API requests
- Create a centralized error handling system

---

## Completed Challenges

This project has completed **3 out of 5** challenges:

### ✅ Challenge 1: Task Assignment UI
**Status: Completed with Bonus Features**

**Requirements Implemented:**
- ✅ Multi-select dropdown component in task form with search functionality
- ✅ Users API endpoint (`GET /api/users`) to fetch list of users
- ✅ Display assigned users on task cards with avatars/initials
- ✅ Filter tasks by assignee
- ✅ Visual indicators for tasks assigned to current user (blue border)
- ✅ Visual indicators for tasks owned by current user (green border)

**Bonus Features:**
- ✅ Search/filter users in the assignee selector
- ✅ Show user roles next to names in the dropdown
- ✅ Visual indicators for tasks assigned to the current user
- ✅ Color-coded avatars based on user ID

### ✅ Challenge 2: Task Filtering, Search & Pagination
**Status: Completed with Bonus Features**

**Requirements Implemented:**
- ✅ Search functionality (filters by title and description)
- ✅ Status filter with ability to select multiple statuses
- ✅ Pagination on backend (limit/offset based)
- ✅ Pagination controls on frontend (prev/next buttons with page info)
- ✅ Total task count and current page info display
- ✅ Filter/search state persisted in URL query parameters

**Bonus Features:**
- ✅ Sorting options (by date created, title) with ASC/DESC order
- ✅ "My Tasks" visual indicator (tasks where user is owner or assignee)
- ✅ Debounced search input for better performance

### ✅ Challenge 5: Input Validation & Error Handling
**Status: Completed**

**Requirements Implemented:**
- ✅ Comprehensive validation using `class-validator`:
  - Email format validation for registration/login
  - Password strength requirements (min 8 chars, uppercase, lowercase, number)
  - Task title/description length limits (200/2000 chars)
- ✅ Custom validation decorators via DTOs
- ✅ Detailed, user-friendly error messages
- ✅ Frontend form validation with inline error display
- ✅ Loading states and network error handling
- ✅ Form field validation before submission
- ✅ Edge case handling (duplicate emails, invalid IDs, missing fields)

**Backend Implementation:**
- Created DTOs (`CreateTaskDto`, `UpdateTaskDto`, `RegisterDto`, `LoginDto`) with validation decorators
- Validation middleware (`validateDto`) for request validation
- Global error handler for consistent error responses

**Frontend Implementation:**
- Client-side form validation with real-time feedback
- Error message display for API validation errors
- Character count indicators for text fields
- Field-level error highlighting

## Additional Work

### 🔧 Challenge 3: Enhanced RBAC & Task Permissions (Core Logic Implemented)

- Implemented task-level RBAC in the backend `TaskController`:
  - Regular users can only edit/delete tasks they own
  - Managers can edit any task but only delete their own
  - Admins can edit/delete any task
- Added helper methods to encapsulate permission checks and return clear 403 errors when access is denied
- Updated frontend task list and pages to hide edit/delete buttons based on user role and ownership, and to surface permission error messages from the API

### 🔧 Challenge 4: Task Detail View & Comments (Backend Foundations)

- Added `TaskComment` entity and wired relations to `Task` and `User` for future comments functionality
- Updated data source configuration to include the new entity
- This lays the groundwork for a `/tasks/:id` detail page with a comments section as described in the challenge

## Additional Setup

No additional setup required beyond the standard setup instructions. The application uses SQLite by default (configured in `.env` files).

## Submission Guidelines

After completing your challenges:

1. **Update README**: Document which challenges you completed and any additional setup required
2. **Submit Your Work**:
   - Add this repository to your GitHub account
   - Send an email to the hugo@findock.xyz with the repository link
   - We will review your submission and get back to you

**Important Notes:**
- **Quality over quantity**: It's better to complete fewer challenges well than many challenges poorly. Focus on demonstrating your understanding of the stack and best practices.
- **No AI Tools**: Please do not use AI tools like ChatGPT or Copilot for this assessment. We want to evaluate your own coding abilities and problem-solving skills.

