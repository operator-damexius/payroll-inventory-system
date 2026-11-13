"use client"

import Layout from "@/components/layout"
import { useState } from "react"
import { getCsrfTokenFromCookie } from "@/lib/csrf.client"

export default function CreateEmployeePage() {
  const [form, setForm] = useState({
    employeeNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    position: "",
    department: "",
    employmentStatus: "ACTIVE",
    basicSalary: "",
    hireDate: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const csrfToken = getCsrfTokenFromCookie()
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        body: JSON.stringify({
          ...form,
          basicSalary: Number(form.basicSalary),
          hireDate: new Date(form.hireDate).toISOString(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.details) {
          const details = data.details as Record<string, string[]>
          const firstError = (Object.values(details).flat()[0] as string) || ""
          setError(firstError || "Validation failed")
        } else {
          setError(data.error || "Failed to create employee")
        }
        return
      }

      window.location.href = "/employees"
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
          <h1 className="text-xl font-bold tracking-tight">Add Employee</h1>
          <p className="text-sm text-slate-500">Create a new employee record.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Employee Number</label>
              <input
                type="text"
                required
                className="input"
                value={form.employeeNumber}
                onChange={(e) => setForm({ ...form, employeeNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                required
                className="input"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                required
                className="input"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                required
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="input"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Position</label>
              <input
                type="text"
                required
                className="input"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                required
                className="input"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Employment Status</label>
              <select
                required
                className="input"
                value={form.employmentStatus}
                onChange={(e) => setForm({ ...form, employmentStatus: e.target.value })}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Basic Salary</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="input"
                value={form.basicSalary}
                onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hire Date</label>
              <input
                type="date"
                required
                className="input"
                value={form.hireDate}
                onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Creating…" : "Create Employee"}
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/employees")}
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
