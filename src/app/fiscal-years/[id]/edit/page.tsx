"use client"

import Layout from "@/components/layout"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCsrfTokenFromCookie } from "@/lib/csrf.client"

interface FiscalYear {
  _id: string
  name: string
  startDate: string
  endDate: string
  status: string
  isDefault: boolean
}

export default function EditFiscalYearPage({ params }: { params: { id: string } }) {
  const [form, setForm] = useState<FiscalYear>({
    _id: "",
    name: "",
    startDate: "",
    endDate: "",
    status: "OPEN",
    isDefault: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/fiscal-years/${params.id}`)
        if (!res.ok) throw new Error("Failed to load fiscal year")
        const data = await res.json()
        const fy = data.fiscalYear
        setForm({
          ...fy,
          startDate: fy.startDate?.slice(0, 10) || "",
          endDate: fy.endDate?.slice(0, 10) || "",
        })
      } catch {
        setError("Failed to load fiscal year")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const csrfToken = getCsrfTokenFromCookie()
      const res = await fetch(`/api/fiscal-years/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        body: JSON.stringify({
          name: form.name,
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
          status: form.status,
          isDefault: form.isDefault,
        }),
      })

      if (!res.ok) {
        const d = await res.json()
        setError(d.error || "Failed to update fiscal year")
        return
      }

      router.push("/fiscal-years")
    } catch {
      setError("Something went wrong.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="card p-6 text-center">Loading…</div>

  return (
    <Layout>
      <div className="card max-w-md">
        <h1 className="text-xl font-bold tracking-tight mb-6">Edit Fiscal Year</h1>
        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Fiscal Year Name</label>
            <input
              required
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                required
                type="date"
                className="input"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                required
                type="date"
                className="input"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              required
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div className="form-group flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            <label className="text-sm text-slate-500">Set as default fiscal year</label>
          </div>
          <div className="flex gap-3 pt-6">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/fiscal-years")}
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
