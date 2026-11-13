# Testing and Acceptance Criteria

This document covers functional testing for the Payroll and Inventory Management System
(PRD v1.0). Follow each test case, record the result (Pass/Fail), and note any issues.

## Test Environment

- **App URL:** http://localhost:3000
- **Admin account:** Email `admin@payroll.local`, Password `admin`
- **Database:** MongoDB Atlas (configured in `.env`)

## Test Accounts Needed

Create these accounts via the Register page before running role-based tests:

| Role | Email | Password | Used For |
|------|-------|----------|----------|
| Admin | admin@payroll.local | admin | Full system access |
| HR/Payroll | hr@test.local | Test123! | Payroll module |
| Inventory | inv@test.local | Test123! | Inventory module |
| Employee | emp@test.local | Test123! | Employee self-view |

---

## Test Cases

### A. Authentication

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|----|-----------|-------|-----------------|-----------|
| A-01 | Valid login | Go to /login, enter admin@payroll.local / admin | Redirected to /dashboard, session cookie set | |
| A-02 | Invalid password | Enter correct email, wrong password | Error: "Invalid email or password", stay on login page | |
| A-03 | Invalid email | Enter non-existent email | Error: "Invalid email or password" | |
| A-04 | Empty fields | Submit login with blank email/password | Error: "Email and password are required" | |
| A-05 | Valid registration | Go to /register, fill all fields, submit | Account created, redirected to /dashboard | |
| A-06 | Duplicate registration | Register with an existing email | Error: "Email already registered" | |
| A-07 | Logout | Click Sign out on dashboard | Redirected to /login, session cleared | |
| A-08 | Protected route without login | Visit /employees while logged out | Redirected to /login | |

### B. Role-Based Access Control

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|----|-----------|-------|-----------------|-----------|
| B-01 | Employee opens admin route | Log in as Employee, visit /payroll-rules | Redirected to /unauthorized | |
| B-02 | Employee opens payroll | Log in as Employee, visit /payrolls | Redirected to /unauthorized | |
| B-03 | Employee opens inventory | Log in as Employee, visit /inventory | Redirected to /unauthorized | |
| B-04 | HR opens payroll | Log in as HR_PAYROLL, visit /payrolls | Access granted | |
| B-05 | Inventory opens inventory | Log in as INVENTORY, visit /inventory | Access granted | |
| B-06 | Admin opens all modules | Log in as Admin, visit all module pages | Access granted to all | |
| B-07 | Employee views own record | Log in as Employee, visit /employees | Only sees own linked record | |

### C. Employee Management

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|----|-----------|-------|-----------------|-----------|
| C-01 | Add employee | /employees/create, fill valid data | Employee saved, appears in list | |
| C-02 | Duplicate employee number | Create employee with existing number | Error: "Employee number or email already exists" | |
| C-03 | Duplicate email | Create employee with existing email | Error: "Employee number or email already exists" | |
| C-04 | Edit employee | /employees/[id]/edit, change salary | Changes saved and reflected in list | |
| C-05 | Delete employee | Click Delete on list, confirm | Employee removed from list | |
| C-06 | Search employees | Type name in search box | List filters to matching employees | |
| C-07 | Pagination | Add 25+ employees, click Next | Page 2 shows remaining employees | |

### D. Payroll

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|----|-----------|-------|-----------------|-----------|
| D-01 | Create payroll period | /payrolls/create, select dates | Period created with status DRAFT | |
| D-02 | Overlapping period | Create period overlapping existing | Error: "Payroll period overlaps..." | |
| D-03 | Configure payroll rules | /payroll-rules, set allowances/deductions | Rule saved as ACTIVE | |
| D-04 | Calculate payslips | On payroll detail, click Calculate | Payslips generated for all active employees | |
| D-05 | Gross pay formula | Basic + Allowances + Overtime | Matches manual calculation | |
| D-06 | Net pay formula | Gross − Deductions | Matches manual calculation | |
| D-07 | Duplicate payslip | Calculate payslips twice for same period | No duplicate payslips created | |
| D-08 | Approve payroll | Click Approve on PROCESSING period | Status changes to APPROVED | |
| D-09 | Payslip print | Click Print on a payslip | Print dialog opens with correct data | |
| D-10 | Payroll report | /api/payrolls/report?payrollId=X | Returns summary totals and per-employee breakdown | |

### E. Inventory

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|----|-----------|-------|-----------------|-----------|
| E-01 | Add product | /inventory/products, fill valid data | Product saved with unique SKU | |
| E-02 | Duplicate SKU | Create product with existing SKU | Error: "SKU already exists" | |
| E-03 | Stock-in | Record Stock-In movement | Quantity increases, transaction logged | |
| E-04 | Stock-out | Record Stock-Out movement | Quantity decreases, transaction logged | |
| E-05 | Insufficient stock | Stock-Out exceeding quantity | Error: "Insufficient stock", rejected | |
| E-06 | Stock adjustment | Record Adjustment movement | Quantity set to adjustment value | |
| E-07 | Low stock alert | Product qty <= reorder level | Shows "LOW STOCK" badge in red | |
| E-08 | Stock history | View stock movements for product | All movements listed with dates | |
| E-09 | Add category | /inventory/categories, add name | Category saved and listed | |
| E-10 | Add supplier | /inventory/suppliers, add details | Supplier saved and listed | |

### F. Data Persistence

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|----|-----------|-------|-----------------|-----------|
| F-01 | Refresh after save | Create employee, refresh page | Employee still appears in list | |
| F-02 | Database restart | Stop and restart dev server | All previously saved data remains | |

### G. Audit Logs

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|----|-----------|-------|-----------------|-----------|
| G-01 | Login logged | Log in, visit /audit-logs | LOGIN entry with user email and timestamp | |
| G-02 | Employee create logged | Add employee, visit /audit-logs | CREATE entry under EMPLOYEE module | |
| G-03 | Payroll approve logged | Approve payroll, visit /audit-logs | APPROVE entry under PAYROLL module | |
| G-04 | Stock movement logged | Record stock movement, visit /audit-logs | Entry under STOCK module with details | |
| G-05 | Filter by module | Select a module in dropdown | List shows only that module's entries | |

### H. Additional Edge Cases

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|----|-----------|-------|-----------------|-----------|
| H-01 | Concurrent stock update | Two users stock-out same product simultaneously | Second update reflects correct quantity | |
| H-02 | Validation failure | Submit employee form with missing required field | Field-level error messages shown | |
| H-03 | Delete non-draft payroll | Try to delete APPROVED payroll | Error: "Can only delete draft payrolls" | |
| H-04 | Negative salary | Enter negative basic salary | Validation error: salary must be positive | |

---

## How to Record Results

1. Run each test case in order
2. Mark **Pass** or **Fail** in the table
3. For failures, note:
   - What happened vs. expected
   - Steps to reproduce
   - Screenshot (if applicable)
4. Fix failures and re-test

## Sign-Off

| | Name | Date | Signature |
|---|------|------|-----------|
| Developer | | | |
| Adviser | | | |

---

## Test Data Examples (for manual verification)

**Payroll calculation example:**
- Basic Pay: 20,000.00
- Allowances: 2,000.00 (Rice 1,500 + Transport 500)
- Overtime: 0.00
- **Gross Pay: 22,000.00**
- Deductions: 1,500.00 (SSS 500 + PhilHealth 400 + Pag-IBIG 200 + Tax 400)
- **Net Pay: 20,500.00**

**Stock movement example:**
- Product: SKU "PEN-001", Qty 100
- Stock-Out 30 → Qty becomes 70
- Stock-In 50 → Qty becomes 120
- Adjustment to 95 → Qty becomes 95
