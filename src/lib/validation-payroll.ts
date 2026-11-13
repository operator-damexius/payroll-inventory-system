/**
 * Shared validation schemas for payroll-related routes.
 * Prevents duplication between route files.
 */

import { z } from "zod"

export const payrollRuleSchema = z.object({
  ruleName: z.string().min(1, "Rule name is required"),
  isActive: z.boolean().optional(),
  effectiveDate: z.string().datetime().optional(),
  riceAllowance: z.coerce.number().min(0).optional(),
  transportAllowance: z.coerce.number().min(0).optional(),
  medicalAllowance: z.coerce.number().min(0).optional(),
  otherAllowance: z.coerce.number().min(0).optional(),
  sssContribution: z.coerce.number().min(0).optional(),
  philhealthContribution: z.coerce.number().min(0).optional(),
  pagibigContribution: z.coerce.number().min(0).optional(),
  taxWithholding: z.coerce.number().min(0).optional(),
  otRegularDay: z.coerce.number().min(0).optional(),
  otRestDay: z.coerce.number().min(0).optional(),
  otSpecialHoliday: z.coerce.number().min(0).optional(),
  otRegularHoliday: z.coerce.number().min(0).optional(),
})

export type PayrollRuleInput = z.infer<typeof payrollRuleSchema>

export const fiscalYearSchema = z.object({
  name: z.string().min(1, "Fiscal year name is required"),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(["OPEN", "CLOSED"]).optional(),
  isDefault: z.boolean().optional(),
})

export type FiscalYearInput = z.infer<typeof fiscalYearSchema>

export const createPayrollSchema = z.object({
  periodName: z.string().min(1, "Period name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
})

export type CreatePayrollInput = z.infer<typeof createPayrollSchema>
