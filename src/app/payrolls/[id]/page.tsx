"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import { getCsrfTokenFromCookie } from "@/lib/csrf.client"

interface Payroll {
  _id: string
  periodName: string
  startDate: string
  endDate: string
  status: string
  totalGrossPay: number
  totalNetPay: number
  payslipCount: number
  preparedBy?: { name?: string; email?: string }
  approvedBy?: { name?: string; email?: string }
}

interface Payslip {
  _id: string
  employee: {
    employeeNumber: string
    firstName: string
    lastName: string
    position: string
    department: string
    basicSalary: number
  }
  basicPay: number
  allowances: number
  overtimePay: number
  grossPay: number
  totalDeductions: number
  netPay: number
  status: string
}

export default function PayrollDetailPage({ params }: { params: { id: string } }) {
  const [payroll, setPayroll] = useState<Payroll | null>(null)
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/payrolls/${params.id}`)
        if (res.status === 404) {
          setError("Payroll not found. This payroll period may not exist or was deleted.")
          return
        }
        if (!res.ok) {
          const errData = await res.json()
          setError(errData.error || "Failed to load payroll")
          return
        }
        const data = await res.json()
        setPayroll(data.payroll)
        setPayslips(data.payslips || [])
      } catch (err) {
        setError(`Failed to load payroll: ${err instanceof Error ? err.message : "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  async function calculatePayslips() {
    if (!confirm("Calculate payslips for all active employees in this period?")) return

    try {
      const csrfToken = getCsrfTokenFromCookie()
      const res = await fetch("/api/payrolls/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        body: JSON.stringify({ payrollId: params.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to calculate payslips")
        return
      }

      window.location.reload()
    } catch {
      setError("Something went wrong. Please try again.")
    }
  }

  async function approvePayroll() {
    if (!confirm("Approve this payroll period?")) return

    try {
      const csrfToken = getCsrfTokenFromCookie()
      const res = await fetch(`/api/payrolls/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        body: JSON.stringify({ status: "APPROVED" }),
      })

      if (!res.ok) throw new Error("Failed to approve")
      window.location.reload()
    } catch {
      setError("Failed to approve payroll")
    }
  }

  function printPayslip(payslip: Payslip) {
    const printWindow = window.open("", "_blank")
    printWindow?.document.write(`
      <html>
        <head>
          <title>Payslip - ${payslip.employee.employeeNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company { font-size: 24px; font-weight: bold; }
            .title { font-size: 18px; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            .label { font-weight: bold; width: 40%; }
            .total { font-weight: bold; font-size: 16px; margin-top: 20px; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">Payroll & Inventory</div>
            <div class="title">Payslip</div>
            <div>${payroll?.periodName}</div>
          </div>
          <table>
            <tr><td class="label">Employee No.</td><td>${payslip.employee.employeeNumber}</td></tr>
            <tr><td class="label">Name</td><td>${payslip.employee.firstName} ${payslip.employee.lastName}</td></tr>
            <tr><td class="label">Position</td><td>${payslip.employee.position}</td></tr>
            <tr><td class="label">Department</td><td>${payslip.employee.department}</td></tr>
            <tr><td class="label">Period</td><td>${payroll?.periodName}</td></tr>
          </table>
          <table>
            <tr><td class="label">Basic Pay</td><td style="text-align:right">${payslip.basicPay.toLocaleString()}</td></tr>
            <tr><td class="label">Allowances</td><td style="text-align:right">${payslip.allowances.toLocaleString()}</td></tr>
            <tr><td class="label">Overtime Pay</td><td style="text-align:right">${payslip.overtimePay.toLocaleString()}</td></tr>
            <tr><td class="label">Gross Pay</td><td style="text-align:right">${payslip.grossPay.toLocaleString()}</td></tr>
            <tr><td class="label">Total Deductions</td><td style="text-align:right">${payslip.totalDeductions.toLocaleString()}</td></tr>
            <tr class="total"><td>Net Pay</td><td style="text-align:right">${payslip.netPay.toLocaleString()}</td></tr>
          </table>
          <div class="footer">This is a computer-generated payslip. No signature required.</div>
        </body>
      </html>
    `)
    printWindow?.document.close()
    printWindow?.print()
  }

  if (loading) {
    return (
      <Layout>
        <div className="card p-6 text-center">Loading payroll…</div>
      </Layout>
    )
  }

  if (!payroll) {
    return (
      <Layout>
        <div className="card p-6 text-center">{error || "Payroll not found."}</div>
      </Layout>
    )
  }

  const canEdit = payroll.status === "DRAFT"

  return (
    <Layout>
      <nav className="border-b border-slate-200 bg-white px-6 py-3 flex items-center justify-between mb-6">
        <span className="font-semibold text-slate-900">Payroll</span>
        <div className="flex gap-3">
          <button
            onClick={calculatePayslips}
            disabled={!canEdit || payroll.payslipCount > 0}
            className="btn btn-primary"
          >
            Calculate Payslips
          </button>
          <button
            onClick={approvePayroll}
            disabled={payroll.status !== "PROCESSING" || payroll.payslipCount === 0}
            className="btn btn-secondary"
          >
            Approve Payroll
          </button>
          <a href="/payrolls" className="text-sm text-slate-600 hover:text-orange-600">
            Back to list
          </a>
        </div>
      </nav>

      <main className="p-6">
        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-4 rounded-lg border border-slate-200 bg-white">
            <p className="text-sm text-slate-500">Period</p>
            <p className="text-lg font-bold tracking-tight">{payroll.periodName}</p>
            <p className="text-xs text-slate-400 mt-1">
              {new Date(payroll.startDate).toLocaleDateString()} &mdash;
              {new Date(payroll.endDate).toLocaleDateString()}
            </p>
          </div>
          <div className="p-4 rounded-lg border border-slate-200 bg-white">
            <p className="text-sm text-slate-500">Status</p>
            <p className="text-lg font-bold tracking-tight">{payroll.status}</p>
          </div>
          <div className="p-4 rounded-lg border border-slate-200 bg-white">
            <p className="text-sm text-slate-500">Total Net Pay</p>
            <p className="text-lg font-bold text-slate-900">{payroll.totalNetPay.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-slate-200 bg-white mb-6">
          <h2 className="text-sm font-semibold mb-3 text-slate-900">Summary</h2>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Payslips</p>
              <p className="font-mono font-semibold">{payroll.payslipCount}</p>
            </div>
            <div>
              <p className="text-slate-500">Total Gross</p>
              <p className="font-mono font-semibold">{payroll.totalGrossPay.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-500">Total Net</p>
              <p className="font-mono font-semibold">{payroll.totalNetPay.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-500">Prepared By</p>
              <p className="font-mono font-semibold">{payroll.preparedBy?.name || payroll.preparedBy?.email || "—"}</p>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-bold mb-4 text-slate-900">Payslips</h2>
        {payslips.length === 0 ? (
          <p className="text-sm text-slate-500">
            No payslips yet. Configure payroll rules first, then click "Calculate Payslips" to generate them.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee No.</th>
                  <th>Name</th>
                  <th>Position</th>
                  <th className="text-right">Basic Pay</th>
                  <th className="text-right">Allowances</th>
                  <th className="text-right">Overtime</th>
                  <th className="text-right">Gross Pay</th>
                  <th className="text-right">Deductions</th>
                  <th className="text-right">Net Pay</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition">
                    <td className="font-mono text-xs">{p.employee.employeeNumber}</td>
                    <td>{p.employee.firstName} {p.employee.lastName}</td>
                    <td className="text-sm">{p.employee.position}</td>
                    <td className="text-right font-mono text-xs">{p.basicPay.toLocaleString()}</td>
                    <td className="text-right font-mono text-xs">{p.allowances.toLocaleString()}</td>
                    <td className="text-right font-mono text-xs">{p.overtimePay.toLocaleString()}</td>
                    <td className="text-right font-mono text-xs">{p.grossPay.toLocaleString()}</td>
                    <td className="text-right font-mono text-xs">{p.totalDeductions.toLocaleString()}</td>
                    <td className="text-right font-mono text-xs font-semibold">{p.netPay.toLocaleString()}</td>
                    <td>
                      <span
                        className={`badge px-2 py-1 rounded-md text-xs font-medium ${
                          p.status === "CALCULATED"
                            ? "bg-blue-100 text-blue-700"
                            : p.status === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => printPayslip(p)}
                        className="px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-md transition"
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </Layout>
  )
}
