"use client"

import Layout from "@/components/layout"
import { useState, useEffect } from "react"

interface AuditLog {
  _id: string
  userEmail?: string
  userRole?: string
  action: string
  module: string
  recordId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [moduleFilter, setModuleFilter] = useState("")

  useEffect(() => {
    fetchLogs()
  }, [page, moduleFilter])

  async function fetchLogs() {
    setLoading(true)
    setError("")
    try {
      const url = new URL("/api/audit-logs", window.location.origin)
      url.searchParams.set("page", String(page))
      url.searchParams.set("limit", "50")
      if (moduleFilter) url.searchParams.set("module", moduleFilter)

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error("Failed to load audit logs")
      const data = await res.json()
      setLogs(data.data || [])
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="card p-6">Loading audit logs…</div>

  const modules = ["AUTH", "EMPLOYEE", "PAYROLL", "PAYSLIP", "INVENTORY", "STOCK", "FISCAL_YEAR", "SETTINGS", "SYSTEM"]

  return (
    <Layout>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Audit Logs</h1>
            <p className="text-sm text-slate-500">
              Record of important user and system actions.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="form-label">Filter by module</label>
          <select
            className="input w-full max-w-md"
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value)
              setPage(1)
            }}
          >
            <option value="">All modules</option>
            {modules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Module</th>
                <th>Record ID</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-slate-500 py-6">
                    No audit log entries found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition">
                    <td className="text-xs font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="text-sm">{log.userEmail || "—"}</td>
                    <td className="text-xs text-slate-400">{log.userRole || "—"}</td>
                    <td className="font-mono text-xs">{log.action}</td>
                    <td className="text-xs">{log.module}</td>
                    <td className="text-xs font-mono">{log.recordId || "—"}</td>
                    <td className="text-xs text-slate-500 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details).slice(0, 80) : "—"}
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
              Page {page} of {totalPages}
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
