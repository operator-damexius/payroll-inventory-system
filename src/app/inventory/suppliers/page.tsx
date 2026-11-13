"use client"

import Layout from "@/components/layout"
import { useState, useEffect } from "react"
import { getCsrfTokenFromCookie } from "@/lib/csrf.client"

interface Supplier {
  _id: string
  name: string
  contactPerson?: string
  email?: string
  phone?: string
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/suppliers")
      .then((r) => r.json())
      .then((d) => { setSuppliers(d.data || []); setLoading(false) })
      .catch(() => { setError("Failed to load suppliers"); setLoading(false) })
  }, [])

  async function addSupplier(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const csrfToken = getCsrfTokenFromCookie()
    const res = await fetch("/api/suppliers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      },
      body: JSON.stringify({ name, contactPerson, email, phone }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error || "Failed to add supplier")
      return
    }
    setShowForm(false)
    setName("")
    setContactPerson("")
    setEmail("")
    setPhone("")
    window.location.reload()
  }

  async function deleteSupplier(id: string) {
    if (!window.confirm("Delete this supplier?")) return
    setDeletingId(id)
    try {
      const csrfToken = getCsrfTokenFromCookie()
      const res = await fetch(`/api/suppliers/${id}`, {
        method: "DELETE",
        headers: {
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
      })
      if (!res.ok) throw new Error("Failed to delete")
      setSuppliers((prev) => prev.filter((s) => s._id !== id))
    } catch {
      setError("Failed to delete supplier")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <div className="card p-6">Loading suppliers…</div>

  return (
    <Layout>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold tracking-tight">Suppliers</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? "Cancel" : "Add Supplier"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={addSupplier} className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Supplier Name</label>
                <input required className="input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Person</label>
                <input className="input" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary">Save Supplier</button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Contact Person</th><th>Email</th><th>Phone</th><th className="text-right">Actions</th></tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-slate-500 py-6">No suppliers found.</td></tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50 transition">
                    <td>{s.name}</td>
                    <td>{s.contactPerson || "—"}</td>
                    <td>{s.email || "—"}</td>
                    <td>{s.phone || "—"}</td>
                    <td className="text-right">
                      <div className="flex gap-2 justify-end">
                        <a
                          href={`/inventory/suppliers/${s._id}/edit`}
                          className="px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-md transition"
                        >
                          Edit
                        </a>
                        <button
                          onClick={() => deleteSupplier(s._id)}
                          disabled={deletingId === s._id}
                          className="px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 rounded-md transition disabled:opacity-50"
                        >
                          {deletingId === s._id ? "Deleting…" : "Delete"}
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
