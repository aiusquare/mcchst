# HOD Course Management - Frontend Implementation Guide

## Overview

This guide covers the frontend React components for the HOD Course Management system, which includes:

1. **CourseManagement.jsx** - HOD interface for creating and managing courses
2. **StudentCourseRegistration.jsx** - Student interface for registering courses and generating exam cards

---

## CourseManagement Component

### Location

`src/features/officers/hod/CourseManagement.jsx`

### Purpose

Allows Heads of Department to manage courses for their department across different levels, semesters, and academic sessions.

### Features

#### 1. Course Listing

- Displays all courses for HOD's department
- Shows course code, title, level, semester, and units
- Color-coded badges for level and semester
- Search/filter functionality

#### 2. Filtering

- **Session Filter** - Select academic session (auto-populated from backend)
- **Level Filter** - Filter by 100, 200, or 300 level
- **Semester Filter** - Filter by semester 1 or 2

#### 3. Create Course

- Modal dialog for adding new courses
- Form fields:
  - Course Code (auto-uppercase, required)
  - Course Title (required)
  - Level (dropdown: 100, 200, 300)
  - Semester (dropdown: 1, 2)
  - Units (positive integer)
  - Session (dropdown, required; locked when editing)
- Validation and error messages
- Success/error alerts

#### 4. Edit Course

- Click edit icon to open modal with existing course data
- Cannot edit course code or session (prevents data corruption)
- Can update title, level, semester, and units
- Duplicate check excludes current course

#### 5. Delete Course

- Click delete icon with confirmation dialog
- One-click removal from interface
- Backend validation ensures security

### Component State

```javascript
const [courses, setCourses] = useState([]); // Current courses list
const [sessions, setSessions] = useState([]); // Available sessions
const [loading, setLoading] = useState(true); // Loading indicator
const [error, setError] = useState(""); // Error messages
const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility
const [editingCourse, setEditingCourse] = useState(null); // Current edit course
const [selectedSession, setSelectedSession] = useState("");
const [selectedLevel, setSelectedLevel] = useState("");
const [selectedSemester, setSelectedSemester] = useState("");
```

### API Integration

**Base URL:** From `services/setup.js` - `baseUrl` constant

**Endpoints:**

- `GET /course_management/get_sessions` - Fetch available sessions
- `GET /course_management/list_courses` - Fetch filtered courses
- `POST /course_management/create_course` - Create new course
- `POST /course_management/update_course` - Update existing course
- `POST /course_management/delete_course` - Delete course

**Authentication:** Automatic via credentials (withCredentials: true)

### Request/Response Examples

#### Fetch Courses

```javascript
GET /course_management/list_courses?session=2023/2024&level=100&semester=1
Response:
{
  "status": true,
  "message": "Courses fetched successfully",
  "data": [
    {
      "id": 1,
      "course_code": "GST101",
      "course_title": "General Studies 1",
      "department": "Health Information Management",
      "level": "100",
      "semester": "1",
      "session": "2023/2024",
      "units": 3,
      "status": "active",
      "created_by": "hod_user",
      "created_at": "2024-03-17 10:30:00",
      "updated_at": "2024-03-17 10:30:00"
    }
  ],
  "count": 1
}
```

#### Create Course

```javascript
POST /course_management/create_course
Body:
{
  "course_code": "GST101",
  "course_title": "General Studies 1",
  "level": "100",
  "semester": "1",
  "session": "2023/2024",
  "units": 3
}

Response:
{
  "status": true,
  "message": "Course created successfully",
  "data": { /* full course object */ }
}
```

### Usage Example

```jsx
import CourseManagement from "./features/officers/hod/CourseManagement";

function AdminDashboard() {
  return (
    <div>
      <CourseManagement />
    </div>
  );
}
```

### Styling

Uses Bootstrap 5 classes:

- `.card` - Container
- `.table` - Course list
- `.btn-primary`, `.btn-outline-primary` - Buttons
- `.badge` - Level/semester indicators
- `.form-select`, `.form-control` - Form inputs
- `.modal` - Modal dialogs

### Error Handling

- Network errors display generic message + backend error details
- Duplicate course codes show 409 conflict message
- Invalid form data shows 422 validation messages
- Toast notifications for success/error feedback

### Loading States

- Loading spinner during initial data fetch
- "Saving..." button text during submission
- Disabled buttons during async operations

---

## StudentCourseRegistration Component

### Location

`src/pages/students/registration/StudentCourseRegistration.jsx`

### Purpose

Enables students to:

1. View available courses
2. Register for courses
3. Generate exam cards
4. View course registration summary

### Features

#### 1. Student Information Display

- Shows student name, matric number, level, department
- Auto-populated from localStorage or session

#### 2. Course Filters

- **Session** - Select academic session
- **Semester** - Select semester (1 or 2)
- **Level** - Select academic level (100, 200, 300)

#### 3. Course Selection

- Individual course checkboxes with course details
- "Select All" / "Deselect All" functionality
- Color-coded course cards
- Course code, title, and units display

#### 4. Registration Summary

- Shows total courses selected
- Calculates total credit units
- Real-time update on selection changes

#### 5. Actions

- **Register Courses** - Submit selected courses for approval
- **Generate Exam Card** - Generate exam card after approval

### Component State

```javascript
const [courses, setCourses] = useState([]);
const [selectedCourses, setSelectedCourses] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [studentInfo, setStudentInfo] = useState({
  fullname: "",
  matric_number: "",
  level: "",
  department: "",
  email: "",
});
const [filters, setFilters] = useState({
  session: "",
  semester: "",
  level: "",
});
const [sessions, setSessions] = useState([]);
const [submitting, setSubmitting] = useState(false);
```

### API Integration

**Endpoints:**

- `GET /course_management/list_courses` - Fetch courses
- `POST /student_registration/register_courses` - Register for courses
- `GET /student_exam/generate_exam_card` - Generate exam card data

### Request/Response Examples

#### Register Courses

```javascript
POST /student_registration/register_courses
Body:
{
  "registrations": [
    {
      "course_id": 1,
      "student_email": "student@edu.ng",
      "matric_number": "2023/001",
      "level": "100",
      "semester": "1",
      "session": "2023/2024",
      "department": "Health Information Management"
    },
    {
      "course_id": 2,
      "student_email": "student@edu.ng",
      "matric_number": "2023/001",
      "level": "100",
      "semester": "1",
      "session": "2023/2024",
      "department": "Health Information Management"
    }
  ]
}

Response:
{
  "status": true,
  "message": "2 courses registered successfully",
  "registered": 2,
  "skipped": 0
}
```

#### Generate Exam Card

```javascript
GET /student_exam/generate_exam_card?
  student_email=student@edu.ng&
  level=100&
  semester=1&
  session=2023/2024

Response:
{
  "status": true,
  "message": "Exam card generated successfully",
  "data": {
    "student": {
      "Fullname": "John Doe",
      "MatricNumber": "2023/001",
      "Department": "Health Information Management",
      "Level": "100",
      "Email": "john@edu.ng"
    },
    "courses": [
      {
        "course_code": "GST101",
        "course_title": "General Studies 1",
        "units": 3
      }
    ],
    "summary": {
      "total_courses": 15,
      "total_units": 42
    },
    "generated_at": "2024-03-17 10:30:00"
  }
}
```

### Usage Example

```jsx
import StudentCourseRegistration from "./pages/students/registration/StudentCourseRegistration";

function StudentRegistration() {
  return <StudentCourseRegistration />;
}
```

### Styling

Uses Bootstrap 5:

- Card components for sections
- Responsive grid layout (col-md-\*)
- Color-coded badges
- Responsive tables for course display
- Button states (disabled, loading)

### Data Storage

Student information retrieved from:

- `localStorage.getItem('studentEmail')`
- `localStorage.getItem('studentName')`
- `localStorage.getItem('matricNumber')`
- `localStorage.getItem('level')`
- `localStorage.getItem('department')`

**Note:** Ensure these values are set during student login/authentication

### Error Scenarios

1. **Missing student email** - Shows login prompt
2. **No courses available** - Shows message to check filters
3. **Registration failure** - Shows backend error message
4. **Network error** - Generic error with retry option

---

## Integration Points

### With Existing System

#### Authentication

- Uses session from HOD/Admin login
- Credentials automatically sent with `withCredentials: true`
- Session stores office_role='hod' and department

#### Student Data

- Fetches from admission table via student email
- Links to pre_application wallet if needed
- Uses matric_number for identification

#### Academic Data

- Academic sessions from university setup
- Student level from admission record
- Department matching for authorization

### Routing

Add to `App.js`:

```jsx
import CourseManagement from "./features/officers/hod/CourseManagement";
import StudentCourseRegistration from "./pages/students/registration/StudentCourseRegistration";

<Route
  path="hod/course-management"
  element={
    <ProtectedAdminRoute>
      <CourseManagement />
    </ProtectedAdminRoute>
  }
/>

<Route
  path="course-registration"
  element={
    <ProtectedRoute>
      <StudentCourseRegistration />
    </ProtectedRoute>
  }
/>
```

---

## Dependencies

### External Libraries

- `axios` - HTTP requests
- `react` - Component framework
- `bootstrap` - Styling

### Custom Components

- `Toast` from `errorNotifier` - Success/error notifications
- `loader` from `LoadingSpinner` - Loading overlay
- `baseUrl` from `services/setup` - API base URL
- `ProtectedRoute` - Authentication wrapper

---

## Common Issues & Solutions

### Issue: "Department information not found"

**Solution:** Ensure HOD is logged in with office_role='hod' and has department set in users table

### Issue: "No courses found"

**Solution:** Check:

1. Session exists and is correct
2. HOD has created courses for that session/level/semester
3. Filters are set correctly

### Issue: "Cannot register - already registered"

**Solution:** Student already registered for that specific course in that session/semester. Remove existing registration first.

### Issue: "API not responding"

**Solution:** Verify:

1. Backend server is running
2. `baseUrl` in services/setup.js is correct
3. Session/authentication is still valid
4. CORS headers are configured

### Issue: "Session expired"

**Solution:** User needs to refresh and re-login. Component will show "Please log in" message.

---

## Future Improvements

1. **CSV Import** - Bulk import courses from file
2. **PDF Export** - Download exam card and registration form as PDF
3. **Real-time Sync** - WebSocket updates for course changes
4. **Print Preview** - Preview before printing
5. **Course Descriptions** - Add course overview/objectives
6. **Prerequisites** - Show course dependencies
7. **Course Schedules** - Display class times and locations
8. **Waitlist** - Support course capacity limits

---

## Testing

### Manual Testing Checklist

#### HOD Course Management

- [ ] Login as HOD
- [ ] View courses for a session
- [ ] Filter by level
- [ ] Filter by semester
- [ ] Create new course
- [ ] Edit course details
- [ ] Delete course
- [ ] Verify duplicate prevention
- [ ] Test all validation errors

#### Student Course Registration

- [ ] Login as student
- [ ] View available courses
- [ ] Select/deselect courses
- [ ] Select all courses
- [ ] View total units
- [ ] Register for courses
- [ ] Generate exam card
- [ ] Verify error handling

---

## Performance Considerations

1. **Lazy Loading** - Courses loaded on demand with filters
2. **Pagination** (optional) - Add if course lists get large
3. **Caching** - Consider caching sessions list
4. **Debouncing** - Filter changes debounced to prevent excessive API calls

---

## Accessibility

- Uses semantic HTML
- Form labels associated with inputs
- Keyboard navigation supported
- Color contrast meets WCAG standards
- Loading states clearly communicated

---

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## File Structure

```
src/
├── features/
│   └── officers/
│       └── hod/
│           └── CourseManagement.jsx (NEW)
├── pages/
│   └── students/
│       └── registration/
│           └── StudentCourseRegistration.jsx (NEW)
└── services/
    └── setup.js (existing - provides baseUrl)
```

---

## Support & Troubleshooting

For issues or questions:

1. Check browser console for JavaScript errors
2. Check Network tab for failed API calls
3. Review backend API logs
4. Verify authentication session is valid
5. Check database for data integrity
