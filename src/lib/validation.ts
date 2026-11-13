import { z } from "zod"

export const employeeSchema = z.object({
  employeeNumber: z.string().min(1, "Employee number is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  position: z.string().min(1, "Position is required"),
  department: z.string().min(1, "Department is required"),
  employmentStatus: z.enum(["ACTIVE", "INACTIVE", "TERMINATED"]),
  basicSalary: z.coerce.number().min(0, "Salary must be positive"),
  hireDate: z.string().datetime(),
})

export type EmployeeInput = z.infer<typeof employeeSchema>

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["ADMIN", "HR_PAYROLL", "INVENTORY", "EMPLOYEE"]).default("EMPLOYEE"),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export type LoginInput = z.infer<typeof loginSchema>
