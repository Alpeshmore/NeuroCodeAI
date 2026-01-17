# ProjectBridge - API Testing Guide

## Testing with Postman/Thunder Client

### Base URL
```
http://localhost:5000/api
```

---

## 1. Authentication Endpoints

### Register User (Company)

**POST** `/auth/register`

**Body (JSON):**
```json
{
  "name": "Tech Corp",
  "email": "company@example.com",
  "password": "password123",
  "role": "company",
  "industry": "Technology",
  "companyDescription": "We build amazing software"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64abc123...",
    "email": "company@example.com",
    "name": "Tech Corp",
    "role": "company"
  }
}
```

### Register User (Developer)

**POST** `/auth/register`

**Body (JSON):**
```json
{
  "name": "John Developer",
  "email": "dev@example.com",
  "password": "password123",
  "role": "developer",
  "skills": ["React", "Node.js", "MongoDB"],
  "experience": "3 years",
  "bio": "Full-stack developer passionate about web technologies",
  "portfolioLinks": {
    "github": "https://github.com/johndoe",
    "website": "https://johndoe.dev"
  }
}
```

### Login

**POST** `/auth/login`

**Body (JSON):**
```json
{
  "email": "company@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64abc123...",
    "email": "company@example.com",
    "name": "Tech Corp",
    "role": "company"
  }
}
```

**Save the token!** You'll need it for authenticated requests.

---

## 2. Project Endpoints

### Get All Projects

**GET** `/projects`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**
```json
[
  {
    "_id": "64def456...",
    "title": "Build E-commerce Website",
    "description": "Need a full-stack e-commerce platform",
    "requiredSkills": ["React", "Node.js", "MongoDB"],
    "techStack": ["React", "Express", "MongoDB", "Tailwind"],
    "timeline": "2 months",
    "deadline": "2024-03-15T00:00:00.000Z",
    "status": "open",
    "company": {
      "_id": "64abc123...",
      "name": "Tech Corp",
      "email": "company@example.com"
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### Create Project (Company Only)

**POST** `/projects`

**Headers:**
```
Authorization: Bearer COMPANY_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "title": "Build E-commerce Website",
  "description": "We need a full-stack e-commerce platform with payment integration",
  "requiredSkills": ["React", "Node.js", "MongoDB"],
  "techStack": ["React", "Express", "MongoDB", "Tailwind CSS"],
  "timeline": "2 months",
  "deadline": "2024-03-15"
}
```

### Get Single Project

**GET** `/projects/:id`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Example:**
```
GET /projects/64def456789abc123
```

### Update Project (Company Only)

**PUT** `/projects/:id`

**Headers:**
```
Authorization: Bearer COMPANY_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "title": "Updated Project Title",
  "status": "in_progress"
}
```

### Delete Project (Company Only)

**DELETE** `/projects/:id`

**Headers:**
```
Authorization: Bearer COMPANY_TOKEN_HERE
```

---

## 3. Application Endpoints

### Apply to Project (Developer Only)

**POST** `/applications`

**Headers:**
```
Authorization: Bearer DEVELOPER_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "projectId": "64def456789abc123",
  "proposal": "I have 5 years of experience building e-commerce platforms. I can deliver this project within the timeline using React, Node.js, and MongoDB. My portfolio includes similar projects."
}
```

**Response:**
```json
{
  "_id": "64ghi789...",
  "project": "64def456789abc123",
  "developer": {
    "_id": "64xyz123...",
    "name": "John Developer",
    "email": "dev@example.com",
    "skills": ["React", "Node.js", "MongoDB"]
  },
  "proposal": "I have 5 years of experience...",
  "status": "applied",
  "createdAt": "2024-01-16T09:00:00.000Z"
}
```

### Get Applications for Project (Company Only)

**GET** `/applications/project/:projectId`

**Headers:**
```
Authorization: Bearer COMPANY_TOKEN_HERE
```

**Example:**
```
GET /applications/project/64def456789abc123
```

### Get My Applications (Developer Only)

**GET** `/applications/my-applications`

**Headers:**
```
Authorization: Bearer DEVELOPER_TOKEN_HERE
```

**Response:**
```json
[
  {
    "_id": "64ghi789...",
    "project": {
      "_id": "64def456...",
      "title": "Build E-commerce Website",
      "description": "Need a full-stack e-commerce platform",
      "company": {
        "name": "Tech Corp",
        "email": "company@example.com"
      }
    },
    "proposal": "I have 5 years of experience...",
    "status": "shortlisted",
    "createdAt": "2024-01-16T09:00:00.000Z"
  }
]
```

### Shortlist Application (Company Only)

**PUT** `/applications/:id/shortlist`

**Headers:**
```
Authorization: Bearer COMPANY_TOKEN_HERE
```

**Example:**
```
PUT /applications/64ghi789abc123/shortlist
```

### Reject Application (Company Only)

**PUT** `/applications/:id/reject`

**Headers:**
```
Authorization: Bearer COMPANY_TOKEN_HERE
```

### Select Winner (Company Only)

**PUT** `/applications/:id/select`

**Headers:**
```
Authorization: Bearer COMPANY_TOKEN_HERE
```

### Submit Solution (Developer Only)

**PUT** `/applications/:id/submit`

**Headers:**
```
Authorization: Bearer DEVELOPER_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "submissionLinks": {
    "github": "https://github.com/johndoe/ecommerce-project",
    "demo": "https://ecommerce-demo.vercel.app",
    "figma": "https://figma.com/file/abc123",
    "other": "https://docs.google.com/document/xyz"
  }
}
```

---

## 4. User Endpoints

### Get User Profile

**GET** `/users/profile`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**
```json
{
  "_id": "64abc123...",
  "name": "John Developer",
  "email": "dev@example.com",
  "role": "developer",
  "skills": ["React", "Node.js", "MongoDB"],
  "experience": "3 years",
  "bio": "Full-stack developer...",
  "portfolioLinks": {
    "github": "https://github.com/johndoe",
    "website": "https://johndoe.dev"
  },
  "createdAt": "2024-01-15T08:00:00.000Z"
}
```

### Update User Profile

**PUT** `/users/profile`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (JSON) - Developer:**
```json
{
  "name": "John Updated",
  "skills": ["React", "Node.js", "MongoDB", "TypeScript"],
  "experience": "4 years",
  "bio": "Updated bio",
  "portfolioLinks": {
    "github": "https://github.com/johnupdated",
    "website": "https://johnupdated.dev"
  }
}
```

**Body (JSON) - Company:**
```json
{
  "name": "Tech Corp Updated",
  "industry": "Software Development",
  "companyDescription": "Updated description"
}
```

---

## 5. Message Endpoints

### Send Message

**POST** `/messages`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "projectId": "64def456789abc123",
  "receiverId": "64xyz123456abc789",
  "content": "Hi, I have a question about the project requirements."
}
```

### Get Conversation

**GET** `/messages/:projectId/:userId`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Example:**
```
GET /messages/64def456789abc123/64xyz123456abc789
```

**Response:**
```json
[
  {
    "_id": "64msg123...",
    "project": "64def456789abc123",
    "sender": {
      "_id": "64abc123...",
      "name": "Tech Corp",
      "role": "company"
    },
    "receiver": {
      "_id": "64xyz123...",
      "name": "John Developer",
      "role": "developer"
    },
    "content": "Hi, I have a question about the project requirements.",
    "createdAt": "2024-01-17T10:00:00.000Z"
  }
]
```

### Get All Messages for Project

**GET** `/messages/project/:projectId`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Testing Workflow

### Complete Test Scenario

1. **Register Company**
   ```
   POST /auth/register
   Save company token
   ```

2. **Register Developer**
   ```
   POST /auth/register
   Save developer token
   ```

3. **Company Creates Project**
   ```
   POST /projects
   Use company token
   Save project ID
   ```

4. **Developer Views Projects**
   ```
   GET /projects
   Use developer token
   ```

5. **Developer Applies**
   ```
   POST /applications
   Use developer token
   Use project ID
   Save application ID
   ```

6. **Company Views Applications**
   ```
   GET /applications/project/:projectId
   Use company token
   ```

7. **Company Shortlists Developer**
   ```
   PUT /applications/:id/shortlist
   Use company token
   ```

8. **Developer Submits Solution**
   ```
   PUT /applications/:id/submit
   Use developer token
   ```

9. **Company Selects Winner**
   ```
   PUT /applications/:id/select
   Use company token
   ```

10. **Send Messages**
    ```
    POST /messages
    Use either token
    ```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid credentials"
}
```

### 401 Unauthorized
```json
{
  "message": "No authentication token"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. Company role required."
}
```

### 404 Not Found
```json
{
  "message": "Project not found"
}
```

### 500 Server Error
```json
{
  "message": "Server error",
  "error": "Detailed error message"
}
```

---

## Postman Collection

### Import This Collection

Create a new Postman collection with these requests:

1. **Environment Variables:**
   - `baseUrl`: http://localhost:5000/api
   - `companyToken`: (set after company login)
   - `developerToken`: (set after developer login)
   - `projectId`: (set after creating project)
   - `applicationId`: (set after applying)

2. **Use Variables:**
   ```
   {{baseUrl}}/auth/login
   Authorization: Bearer {{companyToken}}
   ```

---

## cURL Examples

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "email": "test@company.com",
    "password": "password123",
    "role": "company"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@company.com",
    "password": "password123"
  }'
```

### Get Projects
```bash
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Project
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Project",
    "description": "Test description",
    "requiredSkills": ["React"],
    "techStack": ["React", "Node.js"],
    "timeline": "1 month"
  }'
```

---

## Testing Tips

1. **Save Tokens:** Always save tokens after login/register
2. **Use Variables:** Set up environment variables in Postman
3. **Test Order:** Follow the workflow order for realistic testing
4. **Check Status:** Verify application status changes
5. **Error Testing:** Try unauthorized access to test security
6. **Data Validation:** Test with invalid data to check validation

---

Happy Testing! 🧪
