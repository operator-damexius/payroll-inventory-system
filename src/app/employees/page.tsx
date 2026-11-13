"use client"

import Layout from "@/components/layout"
import { useState, useEffect, useCallback } from "react"

interface Employee {
  _id: string
  employeeNumber: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  position: string
  department: string
  employmentStatus: string
  basicSalary: number
  hireDate: string
  userId?: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(
        `/api/employees?page=${page}&limit=20&search=${encodeURIComponent(search)}`
      )
      if (!res.ok) throw new Error("Failed to load employees")
      const data = await res.json()
      setEmployees(data.data || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees")
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this employee?")) return
    setDeletingId(id)
    try {
      const csrfToken = (window as any).localStorage?.getItem("csrf_token") || ""
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
        headers: {
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
      })
      if (!res.ok) throw new Error("Failed to delete employee")
      setEmployees((prev) => prev.filter((e) => e._id !== id))
      setTotal((prev) => prev - 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete employee")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="card p-6 text-center">Loading employees…</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Employees</h1>
            <p className="text-sm text-slate-500">
              Manage employee records and salary information.
            </p>
          </div>
          <a
            href="/employees/create"
            className="btn btn-primary"
          >
            Add Employee
          </a>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="form-label">Search employees</label>
          <input
            type="text"
            placeholder="Search by name, email, department, or employee number"
            className="input w-full max-w-md"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Employee No.</th>
                <th>Name</th>
                <th>Email</th>
                <th>Position</th>
                <th>Department</th>
                <th className="text-right">Salary</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-slate-500 py-6">
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50 transition">
                    <td className="font-mono text-xs font-semibold">{emp.employeeNumber}</td>
                    <td>{emp.firstName} {emp.lastName}</td>
                    <td className="text-sm text-slate-500">{emp.email}</td>
                    <td className="text-sm">{emp.position}</td>
                    <td className="text-sm">{emp.department}</td>
                    <td className="text-right font-mono text-xs">
                      {emp.basicSalary.toLocaleString()}
                    </td>
                    <td>
                      <span
                        className={`badge px-2 py-1 rounded-md text-xs font-medium ${
                          emp.employmentStatus === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : emp.employmentStatus === "INACTIVE"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {emp.employmentStatus}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex gap-2 justify-end">
                        <a
                          href={`/employees/${emp._id}/edit`}
                          className="px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-md transition"
                        >
                          Edit
                        </a>
                        <button
                          onClick={() => handleDelete(emp._id)}
                          disabled={deletingId === emp._id}
                          className="px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 rounded-md transition disabled:opacity-50"
                        >
                          {deletingId === emp._id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition text-sm"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
