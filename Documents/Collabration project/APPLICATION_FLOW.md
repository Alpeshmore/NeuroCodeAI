# ProjectBridge - Application Flow Diagram

## 🔄 Complete Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER REGISTRATION                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   Select Role:        │
                    │   • Company           │
                    │   • Developer         │
                    └───────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
    ┌───────────────────┐           ┌───────────────────┐
    │  COMPANY ROLE     │           │  DEVELOPER ROLE   │
    └───────────────────┘           └───────────────────┘
                │                               │
                ▼                               ▼


═══════════════════════════════════════════════════════════════════
                        COMPANY WORKFLOW
═══════════════════════════════════════════════════════════════════

    ┌─────────────────────────────────────────────────────┐
    │              COMPANY DASHBOARD                      │
    │  • View all my projects                            │
    │  • Project statistics                              │
    │  • Create new project button                       │
    └─────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────┐
    │              CREATE PROJECT                         │
    │  • Title                                           │
    │  • Description                                     │
    │  • Required Skills                                 │
    │  • Tech Stack                                      │
    │  • Timeline                                        │
    │  • Deadline                                        │
    └─────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────┐
    │         PROJECT POSTED (Status: Open)               │
    │  • Visible to all developers                       │
    │  • Waiting for applications                        │
    └─────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────┐
    │         RECEIVE APPLICATIONS                        │
    │  • View all applicants                             │
    │  • See developer profiles                          │
    │  • Read proposals                                  │
    └─────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────┐
    │         REVIEW & SHORTLIST                          │
    │  • Shortlist promising developers                  │
    │  • Reject unsuitable applications                  │
    │  • Send messages to shortlisted                    │
    └─────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────┐
    │         RECEIVE SUBMISSIONS                         │
    │  • View GitHub repositories                        │
    │  • Check Figma designs                             │
    │  • Test live demos                                 │
    │  • Review other links                              │
    └─────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────┐
    │         SELECT WINNER                               │
    │  • Choose best submission                          │
    │  • Project status → Completed                      │
    │  • Winner marked as Selected                       │
    └─────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════
                      DEVELOPER WORKFLOW
═══════════════════════════════════════════════════════════════════

    ┌─────────────────────────────────────────────────────┐
    │            DEVELOPER DASHBOARD                      │
    │  Tab 1: Browse Projects                            │
    │  Tab 2: My Applications                            │
    └─────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────┐
    │            BROWSE PROJECTS                          │
    │  • View all open projects                          │
    │  • See company details                             │
    │  • Check required skills                           │
    │  • Review deadlines                                │
    └─────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────┐
    │            APPLY TO PROJECT                         │
    │  • Write proposal                                  │
    │  • Explain qualifications                          │
    │  • Submit application                              │
    └─────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────┐
    │         APPLICATION SUBMITTED                       │
    │  Status: Applied                                   │
    │  • Wait for company review                         │
    │  • Track in "My Applications"                      │
    └─────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
    ┌──────────────────┐    ┌──────────────────┐
    │   SHORTLISTED    │    │    REJECTED      │
    │   Status: ✅     │    │    Status: ❌    │
    └──────────────────┘    └──────────────────┘
                │                       │
                ▼                       ▼
    ┌──────────────────┐         [End of Process]
    │ SUBMIT SOLUTION  │
    │ • GitHub link    │
    │ • Figma link     │
    │ • Demo link      │
    │ • Other links    │
    └──────────────────┘
                │
                ▼
    ┌──────────────────────────────────┐
    │    WAIT FOR WINNER SELECTION     │
    │    Status: Shortlisted           │
    └──────────────────────────────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
    ┌────────┐    ┌──────────┐
    │SELECTED│    │NOT CHOSEN│
    │Status:🏆│    │          │
    └────────┘    └──────────┘


═══════════════════════════════════════════════════════════════════
                    APPLICATION STATUS FLOW
═══════════════════════════════════════════════════════════════════

    Developer Applies
           │
           ▼
    ┌─────────────┐
    │   APPLIED   │ ← Initial status after application
    └─────────────┘
           │
           ▼
    Company Reviews
           │
    ┌──────┴──────┐
    ▼             ▼
┌──────────┐  ┌──────────┐
│SHORTLIST │  │ REJECTED │ ← End state
└──────────┘  └──────────┘
    │
    ▼
Developer Submits Solution
    │
    ▼
Company Reviews Submissions
    │
    ▼
┌──────────┐
│ SELECTED │ ← Winner (End state)
└──────────┘


═══════════════════════════════════════════════════════════════════
                      PROJECT STATUS FLOW
═══════════════════════════════════════════════════════════════════

    ┌──────────────┐
    │     OPEN     │ ← Project created, accepting applications
    └──────────────┘
           │
           ▼
    ┌──────────────┐
    │ IN_PROGRESS  │ ← Optional: Company can manually set
    └──────────────┘
           │
           ▼
    ┌──────────────┐
    │  COMPLETED   │ ← Automatically set when winner selected
    └──────────────┘
           │
           ▼
    ┌──────────────┐
    │    CLOSED    │ ← Optional: Company can manually close
    └──────────────┘


═══════════════════════════════════════════════════════════════════
                      MESSAGING FLOW
═══════════════════════════════════════════════════════════════════

    ┌─────────────────────────────────────────────────────┐
    │         MESSAGING REQUIREMENTS                      │
    │  • Only between company and shortlisted developers  │
    │  • Project-based conversations                      │
    │  • Both parties can send messages                   │
    └─────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────┐
    │              MESSAGE FLOW                           │
    │                                                     │
    │  Company ←──────────────────────→ Developer        │
    │           (Shortlisted only)                        │
    │                                                     │
    │  • Ask questions                                    │
    │  • Clarify requirements                             │
    │  • Discuss timeline                                 │
    │  • Share feedback                                   │
    └─────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════
                    AUTHENTICATION FLOW
═══════════════════════════════════════════════════════════════════

    ┌─────────────────┐
    │  Landing Page   │
    └─────────────────┘
            │
    ┌───────┴────────┐
    ▼                ▼
┌────────┐      ┌──────────┐
│ Login  │      │ Register │
└────────┘      └──────────┘
    │                │
    │                ▼
    │         ┌──────────────┐
    │         │ Select Role: │
    │         │ • Company    │
    │         │ • Developer  │
    │         └──────────────┘
    │                │
    └────────┬───────┘
             ▼
    ┌─────────────────┐
    │  JWT Token      │
    │  Generated      │
    └─────────────────┘
             │
             ▼
    ┌─────────────────┐
    │  Role-Based     │
    │  Dashboard      │
    └─────────────────┘


═══════════════════════════════════════════════════════════════════
                    DATA FLOW DIAGRAM
═══════════════════════════════════════════════════════════════════

    ┌──────────────┐
    │   FRONTEND   │
    │   (React)    │
    └──────────────┘
           │
           │ HTTP Requests (Axios)
           │ Authorization: Bearer Token
           ▼
    ┌──────────────┐
    │   BACKEND    │
    │  (Express)   │
    └──────────────┘
           │
           │ Auth Middleware
           │ Validates JWT
           ▼
    ┌──────────────┐
    │   ROUTES     │
    │  • Auth      │
    │  • Projects  │
    │  • Apps      │
    │  • Messages  │
    │  • Users     │
    └──────────────┘
           │
           │ Mongoose Queries
           ▼
    ┌──────────────┐
    │   MONGODB    │
    │  • Users     │
    │  • Projects  │
    │  • Apps      │
    │  • Messages  │
    └──────────────┘


═══════════════════════════════════════════════════════════════════
                    COMPONENT HIERARCHY
═══════════════════════════════════════════════════════════════════

    App.jsx
    │
    ├── AuthProvider (Context)
    │   │
    │   ├── Navbar
    │   │
    │   └── Routes
    │       │
    │       ├── Login
    │       ├── Register
    │       │
    │       ├── PrivateRoute
    │       │   │
    │       │   ├── CompanyDashboard
    │       │   │   ├── Project Cards
    │       │   │   └── Create Project Modal
    │       │   │
    │       │   ├── DeveloperDashboard
    │       │   │   ├── Browse Projects Tab
    │       │   │   └── My Applications Tab
    │       │   │
    │       │   ├── ProjectDetails
    │       │   │   ├── Project Info
    │       │   │   ├── Applications List (Company)
    │       │   │   ├── Apply Modal (Developer)
    │       │   │   └── Submit Modal (Developer)
    │       │   │
    │       │   └── Profile
    │       │       ├── View Mode
    │       │       └── Edit Mode


═══════════════════════════════════════════════════════════════════
                    DATABASE RELATIONSHIPS
═══════════════════════════════════════════════════════════════════

    ┌──────────────┐
    │    USER      │
    │  • Company   │
    │  • Developer │
    └──────────────┘
           │
           │ 1:N (Company creates many Projects)
           ▼
    ┌──────────────┐
    │   PROJECT    │
    │  • company   │──────┐
    │  • winner    │      │
    └──────────────┘      │
           │              │
           │ 1:N          │ N:1
           ▼              ▼
    ┌──────────────┐      │
    │ APPLICATION  │      │
    │  • project   │──────┘
    │  • developer │──────┐
    └──────────────┘      │
                          │ N:1
                          ▼
                   ┌──────────────┐
                   │    USER      │
                   │  (Developer) │
                   └──────────────┘

    ┌──────────────┐
    │   MESSAGE    │
    │  • project   │───→ Project
    │  • sender    │───→ User
    │  • receiver  │───→ User
    └──────────────┘


═══════════════════════════════════════════════════════════════════
                    SECURITY LAYERS
═══════════════════════════════════════════════════════════════════

    ┌─────────────────────────────────────────────────────┐
    │  Layer 1: Frontend Route Protection                 │
    │  • PrivateRoute component                           │
    │  • Redirect to login if not authenticated           │
    └─────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────┐
    │  Layer 2: JWT Token Validation                      │
    │  • Auth middleware on backend                       │
    │  • Verify token signature                           │
    │  • Extract user ID and role                         │
    └─────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────┐
    │  Layer 3: Role-Based Access Control                 │
    │  • isCompany middleware                             │
    │  • isDeveloper middleware                           │
    │  • Check user role matches requirement              │
    └─────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────┐
    │  Layer 4: Resource Ownership                        │
    │  • Verify user owns the resource                    │
    │  • Check project belongs to company                 │
    │  • Check application belongs to developer           │
    └─────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════
                    SUCCESS METRICS
═══════════════════════════════════════════════════════════════════

    ┌─────────────────────────────────────────────────────┐
    │              PLATFORM METRICS                       │
    │                                                     │
    │  • Total Projects Posted                           │
    │  • Total Applications Submitted                    │
    │  • Shortlist Rate                                  │
    │  • Completion Rate                                 │
    │  • Average Time to Hire                            │
    │  • User Satisfaction                               │
    │  • Active Users                                    │
    │  • Messages Exchanged                              │
    └─────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════

This diagram shows the complete flow of the ProjectBridge application,
from user registration through project completion, including all
interactions between companies and developers.

═══════════════════════════════════════════════════════════════════
