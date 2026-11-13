"use client"

import { useState } from "react"
import { getCsrfTokenFromCookie } from "@/lib/csrf.client"
import Layout from "@/components/layout"

export default function CreatePayrollPage() {
  const [form, setForm] = useState({
    periodName: "",
    startDate: "",
    endDate: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function generatePeriodName() {
    if (!form.startDate || !form.endDate) return ""
    const start = new Date(form.startDate)
    const end = new Date(form.endDate)
    const startStr = start.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    const endStr = end.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    return `${startStr} – ${endStr}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const csrfToken = getCsrfTokenFromCookie()
      const res = await fetch("/api/payrolls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create payroll period")
        return
      }

      window.location.href = `/payrolls/${data.payroll._id}`
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="card max-w-lg">
        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-tight">New Payroll Period</h1>
          <p className="text-sm text-slate-500">Create a new payroll period.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                required
                className="input"
                value={form.startDate}
                onChange={(e) => {
                  const val = e.target.value
                  setForm({
                    ...form,
                    startDate: val,
                    periodName: generatePeriodNameWith(val, form.endDate),
                  })
                }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                required
                className="input"
                value={form.endDate}
                onChange={(e) => {
                  const val = e.target.value
                  setForm({
                    ...form,
                    endDate: val,
                    periodName: generatePeriodNameWith(form.startDate, val),
                  })
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Period Name</label>
            <input
              type="text"
              required
              readOnly
              className="input bg-slate-50"
              value={form.periodName}
            />
            <p className="text-xs text-slate-400 mt-1">
              Auto-generated from the dates above.
            </p>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              disabled={loading || !form.startDate || !form.endDate}
              className="btn btn-primary"
            >
              {loading ? "Creating…" : "Create Period"}
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/payrolls")}
              className="btn btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

function generatePeriodNameWith(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return ""
  const start = new Date(startDate)
  const end = new Date(endDate)
  const startStr = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const endStr = end.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  return `${startStr} – ${endStr}`
}
