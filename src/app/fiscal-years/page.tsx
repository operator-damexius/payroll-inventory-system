"use client"

import Layout from "@/components/layout"
import { useState, useEffect } from "react"
import { getCsrfTokenFromCookie } from "@/lib/csrf.client"

interface FiscalYear {
  _id: string
  name: string
  startDate: string
  endDate: string
  status: string
  isDefault: boolean
  createdAt: string
}

export default function FiscalYearsPage() {
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/fiscal-years")
      .then((r) => r.json())
      .then((d) => { setFiscalYears(d.data || []); setLoading(false) })
      .catch(() => { setError("Failed to load fiscal years"); setLoading(false) })
  }, [])

  async function deleteFiscalYear(id: string) {
    if (!window.confirm("Delete this fiscal year?")) return
    setDeletingId(id)
    try {
      const csrfToken = getCsrfTokenFromCookie()
      const res = await fetch(`/api/fiscal-years/${id}`, {
        method: "DELETE",
        headers: {
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
      })
      if (!res.ok) throw new Error("Failed to delete")
      setFiscalYears((prev) => prev.filter((f) => f._id !== id))
    } catch {
      setError("Failed to delete fiscal year")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <div className="card p-6">Loading fiscal years…</div>

  return (
    <Layout>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold tracking-tight">Fiscal Years</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? "Cancel" : "Add Fiscal Year"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.target as HTMLFormElement)
              const startDate = fd.get("startDate") as string
              const endDate = fd.get("endDate") as string

              const csrfToken = getCsrfTokenFromCookie()
              fetch("/api/fiscal-years", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
                },
                body: JSON.stringify({
                  name: fd.get("name"),
                  startDate: new Date(startDate).toISOString(),
                  endDate: new Date(endDate).toISOString(),
                  status: fd.get("status"),
                  isDefault: fd.get("isDefault") === "on",
                }),
              })
                .then(async (r) => {
                  if (!r.ok) {
                    const d = await r.json()
                    setError(d.error || "Failed to add fiscal year")
                    return
                  }
                  setShowForm(false)
                  window.location.reload()
                })
                .catch(() => setError("Something went wrong."))
            }}
            className="space-y-4 mb-6 max-w-lg"
          >
            <div className="form-group">
              <label className="form-label">Fiscal Year Name</label>
              <input
                required
                placeholder="e.g. FY 2026"
                className="input"
                name="name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input required type="date" className="input" name="startDate" />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input required type="date" className="input" name="endDate" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="input" name="status" defaultValue="OPEN">
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div className="form-group flex items-center gap-2">
              <input
                type="checkbox"
                name="isDefault"
                defaultChecked={false}
              />
              <label className="text-sm text-slate-500">Set as default fiscal year</label>
            </div>
            <button type="submit" className="btn btn-primary">Save Fiscal Year</button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Default</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fiscalYears.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-500 py-6">
                    No fiscal years found.
                  </td>
                </tr>
              ) : (
                fiscalYears.map((fy) => (
                  <tr key={fy._id} className={`${fy.isDefault ? "bg-orange-50" : ""} hover:bg-slate-50 transition`}>
                    <td>{fy.name}</td>
                    <td className="text-sm">{new Date(fy.startDate).toLocaleDateString()}</td>
                    <td className="text-sm">{new Date(fy.endDate).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`badge px-2 py-1 rounded-md text-xs font-medium ${
                          fy.status === "OPEN" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {fy.status}
                      </span>
                    </td>
                    <td>
                      {fy.isDefault ? (
                        <span className="badge px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700">DEFAULT</span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex gap-2 justify-end">
                        <a
                          href={`/fiscal-years/${fy._id}/edit`}
                          className="px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-md transition"
                        >
                          Edit
                        </a>
                        <button
                          onClick={() => deleteFiscalYear(fy._id)}
                          disabled={deletingId === fy._id}
                          className="px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 rounded-md transition disabled:opacity-50"
                        >
                          {deletingId === fy._id ? "Deleting…" : "Delete"}
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
