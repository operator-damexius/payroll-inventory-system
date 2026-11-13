"use client"

import Layout from "@/components/layout"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCsrfTokenFromCookie } from "@/lib/csrf.client"

export default function EditPayrollRulePage({ params }: { params: { id: string } }) {
  const [form, setForm] = useState({
    ruleName: "",
    effectiveDate: "",
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/payroll-rules/${params.id}`)
        if (!res.ok) throw new Error("Failed to load payroll rule")
        const data = await res.json()
        const r = data.rule
        setForm({
          ruleName: r.ruleName || "",
          effectiveDate: r.effectiveDate?.slice(0, 10) || "",
          riceAllowance: r.riceAllowance || "",
          transportAllowance: r.transportAllowance || "",
          medicalAllowance: r.medicalAllowance || "",
          otherAllowance: r.otherAllowance || "",
          sssContribution: r.sssContribution || "",
          philhealthContribution: r.philhealthContribution || "",
          pagibigContribution: r.pagibigContribution || "",
          taxWithholding: r.taxWithholding || "",
          otRegularDay: r.otRegularDay || "1.25",
          otRestDay: r.otRestDay || "1.30",
          otSpecialHoliday: r.otSpecialHoliday || "1.30",
          otRegularHoliday: r.otRegularHoliday || "2.00",
        })
      } catch {
        setError("Failed to load payroll rule")
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
      const res = await fetch(`/api/payroll-rules/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        body: JSON.stringify({
          ...form,
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
        setError(d.error || "Failed to update payroll rule")
        return
      }

      router.push("/payroll-rules")
    } catch {
      setError("Something went wrong.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="card p-6 text-center">Loading…</div>

  return (
    <Layout>
      <div className="card max-w-lg">
        <h1 className="text-xl font-bold tracking-tight mb-6">Edit Payroll Rule</h1>
        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Rule Name</label>
            <input
              required
              className="input"
              value={form.ruleName}
              onChange={(e) => setForm({ ...form, ruleName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Effective Date</label>
            <input
              type="date"
              required
              className="input"
              value={form.effectiveDate}
              onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
            />
          </div>
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
          <div className="flex gap-3 pt-6">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/payroll-rules")}
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
