# 🚀 Local Development Setup - QUICK START

## Problem Identified

The React frontend is running on `localhost:3000` but calling API endpoints that are pointing to the production domain. This is blocked by CORS and the API doesn't exist there.

## Solution

I've updated both the **CourseManagement** and **StudentCourseRegistration** components to automatically detect local development and route API calls to your local CodeIgniter backend.

---

## 📋 Setup Steps

### Step 1: Start Your CodeIgniter Backend

The backend API (CodeIgniter) needs to be running on your local machine. Find out what port it's using:

**Option A: If using PHP built-in server**

```bash
cd c:\DEV\html\mcchst-app-backend\
php -S localhost:8080
```

**Option B: If using XAMPP/WAMP**

- Apache is typically on `localhost:80` or `localhost:8080`
- Your CodeIgniter is at: `http://localhost:XXXX/index.php/`

**Option C: If using another server**

- Find the port your local server is using

### Step 2: Update the Port in Components

Open the updated components and change the port if needed:

**File 1:** `src/features/officers/hod/CourseManagement.jsx`

```javascript
// Line 7-10, find:
const getApiUrl = () => {
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:8080/index.php/"; // ← CHANGE 8080 to your port
  }
  return baseUrl;
};
```

**File 2:** `src/pages/students/registration/StudentCourseRegistration.jsx`

```javascript
// Line 7-10, find:
const getApiUrl = () => {
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:8080/index.php/"; // ← CHANGE 8080 to your port
  }
  return baseUrl;
};
```

### Step 3: Verify Backend Routes

Make sure your CodeIgniter backend has the routes configured. Add to `application/config/routes.php`:

```php
$route['course_management/(:any)'] = 'course_management/$1';
$route['student_registration/(:any)'] = 'student_registration/$1';
$route['student_exam/(:any)'] = 'student_exam/$1';
```

### Step 4: Run Database Migrations

```bash
cd c:\DEV\html\mcchst-app-backend\
php index.php migrations latest
```

### Step 5: Start React Frontend

```bash
cd c:\DEV\mcchst\
npm start
```

**Should open:** `http://localhost:3000`

### Step 6: Test the Connection

1. **Log in as HOD**
   - Username: Your HOD test account
   - Password: Your password

2. **Navigate to Admin Dashboard**
   - Go to: `http://localhost:3000/admin`

3. **Click "Course Management" from sidebar**
   - Left sidebar → Office → Course Management
   - Should load without error ✅

---

## 🔍 Troubleshooting

### Error: "Failed to fetch courses"

**Cause:** Backend API not responding  
**Solution:**

1. Check if PHP/CodeIgniter server is running
2. Test API directly: `http://localhost:8080/index.php/course_management/list_courses`
3. Verify port number is correct in component

### Error: "Unauthorized: Only HOD can access this resource"

**Cause:** Not logged in as HOD, or wrong session  
**Solution:**

1. Log in as HOD first
2. Check that `office_role` in users table is set to 'hod'
3. Make sure session is active

### Error: CORS error in browser console

**Cause:** Frontend and backend on different domains  
**Solution:**

- Verify backend has CORS headers:
  ```php
  ->set_header('Access-Control-Allow-Origin: *')
  ->set_header('Access-Control-Allow-Headers: Content-Type, Authorization')
  ->set_header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
  ```

### Components not appearing in sidebar

**Cause:** Session/localStorage not set correctly  
**Solution:**

1. Check `localStorage.getItem("officeRole")` returns 'hod'
2. Clear browser cache
3. Log out and log back in

---

## 🧪 Quick Test

### Test API Endpoint Directly

Open browser console and run:

```javascript
// Test with correct port (change 8080 if needed)
fetch("http://localhost:8080/index.php/course_management/get_sessions", {
  credentials: "include",
})
  .then((r) => r.json())
  .then((d) => console.log(d));
```

**Expected output should be:**

```json
{
  "status": true,
  "message": "Sessions fetched successfully",
  "data": [{ "session": "2023/2024" }]
}
```

---

## ⚙️ Configuration Summary

| Component      | Type  | Value                              | File                 |
| -------------- | ----- | ---------------------------------- | -------------------- |
| React Frontend | Port  | 3000                               | localhost:3000       |
| PHP Backend    | Port  | 8080\*                             | localhost:8080       |
| Database       | MySQL | localhost:3306                     | Your DB              |
| API Base URL   | Local | `http://localhost:8080/index.php/` | CourseManagement.jsx |

\*Change 8080 to match your actual server port

---

## 📝 Files Modified

- ✅ `src/features/officers/hod/CourseManagement.jsx` - Updated with apiUrl
- ✅ `src/pages/students/registration/StudentCourseRegistration.jsx` - Updated with apiUrl
- ✅ All API calls now use local backend automatically

---

## 🎯 What Should Happen

1. **Frontend** (React) makes request to `http://localhost:8080/index.php/course_management/...`
2. **Backend** (CodeIgniter) receives request and processes it
3. **Database** (MySQL) provides/stores data
4. **Response** returns to Frontend in JSON format
5. **UI** updates with courses, buttons become active

---

## Next Steps

1. ✅ Ensure PHP backend is running
2. ✅ Verify correct port in component files
3. ✅ Run database migrations
4. ✅ Start React dev server
5. ✅ Log in as HOD
6. ✅ Click "Course Management" in sidebar
7. ✅ Add a test course to verify it works

---

## Still Having Issues?

Check these in order:

1. **Is PHP server running?**

   ```bash
   # If using built-in server
   php -S localhost:8080
   ```

2. **Can you access the backend?**
   - Visit: `http://localhost:8080/index.php`
   - Should show your CodeIgniter welcome page

3. **Are migrations run?**

   ```bash
   cd c:\DEV\html\mcchst-app-backend\
   php index.php migrations latest
   ```

4. **Is the session active?**
   - Log out and log back in as HOD
   - Check browser cookies/session storage

5. **Do you have course data?**
   - Open database and check `courses` table
   - Should have rows after creating courses

---

**Status:** Ready to test! 🎉

Let me know if the Course Management menu loads and works!
