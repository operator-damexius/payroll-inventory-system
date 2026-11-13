"use client"

import Layout from "@/components/layout"
import { useState, useEffect } from "react"
import { getCsrfTokenFromCookie } from "@/lib/csrf.client"

interface PayrollRule {
  _id: string
  ruleName: string
  isActive: boolean
  effectiveDate: string
  riceAllowance: number
  transportAllowance: number
  medicalAllowance: number
  otherAllowance: number
  sssContribution: number
  philhealthContribution: number
  pagibigContribution: number
  taxWithholding: number
  otRegularDay: number
  otRestDay: number
  otSpecialHoliday: number
  otRegularHoliday: number
}

export default function PayrollRulesPage() {
  const [rules, setRules] = useState<PayrollRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    ruleName: "",
    isActive: true,
    effectiveDate: new Date().toISOString().slice(0, 10),
    riceAllowance: "",
    transportAllowance: "",
    medicalAllowance: "",
    otherAllowance: "",
    sssContribution: "",
    philhealthContribution: "",
    pagibigContribution: "",
    taxWithholding: "",
    otRegularDay: "1.25",
    otRestDay: "1.30",
    otSpecialHoliday: "1.30",
    otRegularHoliday: "2.00",
  })
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/payroll-rules")
      .then((r) => r.json())
      .then((d) => { setRules(d.data || []); setLoading(false) })
      .catch(() => { setError("Failed to load payroll rules"); setLoading(false) })
  }, [])

  async function saveRule(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const csrfToken = getCsrfTokenFromCookie()
    const res = await fetch("/api/payroll-rules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      },
      body: JSON.stringify({
        ...form,
        isActive: form.isActive,
        effectiveDate: new Date(form.effectiveDate).toISOString(),
        riceAllowance: Number(form.riceAllowance),
        transportAllowance: Number(form.transportAllowance),
        medicalAllowance: Number(form.medicalAllowance),
        otherAllowance: Number(form.otherAllowance),
        sssContribution: Number(form.sssContribution),
        philhealthContribution: Number(form.philhealthContribution),
        pagibigContribution: Number(form.pagibigContribution),
        taxWithholding: Number(form.taxWithholding),
        otRegularDay: Number(form.otRegularDay),
        otRestDay: Number(form.otRestDay),
        otSpecialHoliday: Number(form.otSpecialHoliday),
        otRegularHoliday: Number(form.otRegularHoliday),
      }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error || "Failed to save payroll rule")
      return
    }
    setShowForm(false)
    window.location.reload()
  }

  async function deleteRule(id: string) {
    if (!window.confirm("Delete this payroll rule?")) return
    setDeletingId(id)
    try {
      const csrfToken = getCsrfTokenFromCookie()
      const res = await fetch(`/api/payroll-rules/${id}`, {
        method: "DELETE",
        headers: {
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
      })
      if (!res.ok) throw new Error("Failed to delete")
      setRules((prev) => prev.filter((r) => r._id !== id))
    } catch {
      setError("Failed to delete payroll rule")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <div className="card p-6">Loading payroll rules…</div>

  const activeRule = rules.find((r) => r.isActive)

  return (
    <Layout>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold tracking-tight">Payroll Rules</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? "Cancel" : "Add Payroll Rule"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-3 text-slate-900 uppercase tracking-wide">Active Payroll Rule</h2>
          <div className="p-4 rounded-lg border border-orange-200 bg-orange-50">
            {activeRule ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Rule Name</p>
                  <p className="font-medium text-slate-900">{activeRule.ruleName}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Effective Date</p>
                  <p className="font-medium text-slate-900">{new Date(activeRule.effectiveDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Total Allowances</p>
                  <p className="font-medium text-slate-900">
                    {(activeRule.riceAllowance + activeRule.transportAllowance + activeRule.medicalAllowance + activeRule.otherAllowance).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Total Deductions</p>
                  <p className="font-medium text-rose-700">
                    {(activeRule.sssContribution + activeRule.philhealthContribution + activeRule.pagibigContribution + activeRule.taxWithholding).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-rose-600 text-sm">No active payroll rule configured.</p>
            )}
          </div>
        </div>

        {showForm && (
          <form onSubmit={saveRule} className="space-y-4 mb-6 max-w-xl">
            <div className="form-group">
              <label className="form-label">Rule Name</label>
              <input required className="input" value={form.ruleName} onChange={(e) => setForm({ ...form, ruleName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Effective Date</label>
              <input type="date" required className="input" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Is Active</label>
              <select className="input" value={form.isActive ? "true" : "false"} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <h3 className="text-xs font-semibold mb-3 text-slate-500 uppercase tracking-wide">Allowances</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Rice Allowance</label>
                <input type="number" className="input" value={form.riceAllowance} onChange={(e) => setForm({ ...form, riceAllowance: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Transport Allowance</label>
                <input type="number" className="input" value={form.transportAllowance} onChange={(e) => setForm({ ...form, transportAllowance: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Medical Allowance</label>
                <input type="number" className="input" value={form.medicalAllowance} onChange={(e) => setForm({ ...form, medicalAllowance: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Other Allowance</label>
                <input type="number" className="input" value={form.otherAllowance} onChange={(e) => setForm({ ...form, otherAllowance: e.target.value })} />
              </div>
            </div>

            <h3 className="text-xs font-semibold mb-3 text-slate-500 uppercase tracking-wide mt-6">Deductions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">SSS Contribution</label>
                <input type="number" className="input" value={form.sssContribution} onChange={(e) => setForm({ ...form, sssContribution: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">PhilHealth Contribution</label>
                <input type="number" className="input" value={form.philhealthContribution} onChange={(e) => setForm({ ...form, philhealthContribution: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Pag-IBIG Contribution</label>
                <input type="number" className="input" value={form.pagibigContribution} onChange={(e) => setForm({ ...form, pagibigContribution: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Tax Withholding</label>
                <input type="number" className="input" value={form.taxWithholding} onChange={(e) => setForm({ ...form, taxWithholding: e.target.value })} />
              </div>
            </div>

            <h3 className="text-xs font-semibold mb-3 text-slate-500 uppercase tracking-wide mt-6">Overtime Multipliers</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Regular Day</label>
                <input type="number" step="0.01" className="input" value={form.otRegularDay} onChange={(e) => setForm({ ...form, otRegularDay: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Rest Day</label>
                <input type="number" step="0.01" className="input" value={form.otRestDay} onChange={(e) => setForm({ ...form, otRestDay: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Special Holiday</label>
                <input type="number" step="0.01" className="input" value={form.otSpecialHoliday} onChange={(e) => setForm({ ...form, otSpecialHoliday: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Regular Holiday</label>
                <input type="number" step="0.01" className="input" value={form.otRegularHoliday} onChange={(e) => setForm({ ...form, otRegularHoliday: e.target.value })} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">Save Payroll Rule</button>
          </form>
        )}

        <h2 className="text-sm font-semibold mb-3 text-slate-900 uppercase tracking-wide">All Payroll Rules</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Rule Name</th>
                <th>Effective Date</th>
                <th className="text-right">Allowances</th>
                <th className="text-right">Deductions</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-slate-500 py-6">No payroll rules found.</td></tr>
              ) : (
                rules.map((r) => (
                  <tr key={r._id} className={`${r.isActive ? "bg-orange-50" : ""} hover:bg-slate-50 transition`}>
                    <td>{r.ruleName}</td>
                    <td className="text-sm">{new Date(r.effectiveDate).toLocaleDateString()}</td>
                    <td className="text-right text-xs">
                      {(r.riceAllowance + r.transportAllowance + r.medicalAllowance + r.otherAllowance).toLocaleString()}
                    </td>
                    <td className="text-right text-xs">
                      {(r.sssContribution + r.philhealthContribution + r.pagibigContribution + r.taxWithholding).toLocaleString()}
                    </td>
                    <td>
                      <span
                        className={`badge px-2 py-1 rounded-md text-xs font-medium ${
                          r.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {r.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex gap-2 justify-end">
                        <a
                          href={`/payroll-rules/${r._id}/edit`}
                          className="px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-md transition"
                        >
                          Edit
                        </a>
                        <button
                          onClick={() => deleteRule(r._id)}
                          disabled={deletingId === r._id}
                          className="px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 rounded-md transition disabled:opacity-50"
                        >
                          {deletingId === r._id ? "Deleting…" : "Delete"}
                        </button>
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
