"use client"

import Layout from "@/components/layout"
import { useState, useEffect } from "react"
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
  createdAt: string
}

export default function PayrollsPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function fetchPayrolls() {
    try {
      const res = await fetch("/api/payrolls")
      if (!res.ok) throw new Error("Failed to load payrolls")
      const data = await res.json()
      setPayrolls(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payrolls")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayrolls()
  }, [])

  async function deletePayroll(id: string) {
    if (!window.confirm("Delete this payroll period and all its payslips?")) return
    setDeletingId(id)
    try {
      const csrfToken = getCsrfTokenFromCookie()
      const res = await fetch(`/api/payrolls/${id}`, {
        method: "DELETE",
        headers: {
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
      })
      if (!res.ok) throw new Error("Failed to delete")
      setPayrolls((prev) => prev.filter((p) => p._id !== id))
    } catch {
      setError("Failed to delete payroll period")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="card p-6 text-center">Loading payrolls…</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Payroll</h1>
            <p className="text-sm text-slate-500">
              Manage payroll periods, calculation, and payslips.
            </p>
          </div>
          <a href="/payrolls/create" className="btn btn-primary">
            New Payroll Period
          </a>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th className="text-right">Payslips</th>
                <th className="text-right">Total Net Pay</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-slate-500 py-6">
                    No payroll periods found. Create your first period above.
                  </td>
                </tr>
              ) : (
                payrolls.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition">
                    <td className="font-mono text-xs font-semibold">{p.periodName}</td>
                    <td className="text-sm">{new Date(p.startDate).toLocaleDateString()}</td>
                    <td className="text-sm">{new Date(p.endDate).toLocaleDateString()}</td>
                    <td className="text-right">
                      <span
                        className={`badge px-2 py-1 rounded-md text-xs font-medium ${
                          p.status === "DRAFT"
                            ? "bg-amber-100 text-amber-700"
                            : p.status === "PROCESSING"
                              ? "bg-blue-100 text-blue-700"
                              : p.status === "APPROVED"
                                ? "bg-green-100 text-green-700"
                                : p.status === "PAID"
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="text-right font-mono text-xs">{p.payslipCount}</td>
                    <td className="text-right font-mono text-xs">{p.totalNetPay.toLocaleString()}</td>
                    <td className="text-right">
                      <div className="flex gap-2 justify-end">
                        <a
                          href={`/payrolls/${p._id}`}
                          className="px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-md transition"
                        >
                          View
                        </a>
                        {p.status === "DRAFT" && (
                          <button
                            onClick={() => deletePayroll(p._id)}
                            disabled={deletingId === p._id}
                            className="px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 rounded-md transition disabled:opacity-50"
                          >
                            {deletingId === p._id ? "Deleting…" : "Delete"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
