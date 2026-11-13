"use client"

import Layout from "@/components/layout"
import { useState, useEffect } from "react"
import { getCsrfTokenFromCookie } from "@/lib/csrf.client"

interface Category {
  _id: string
  name: string
  description?: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => { setCategories(d.data || []); setLoading(false) })
      .catch(() => { setError("Failed to load categories"); setLoading(false) })
  }, [])

  async function addCategory(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const csrfToken = getCsrfTokenFromCookie()
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      },
      body: JSON.stringify({ name, description }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error || "Failed to add category")
      return
    }
    setShowForm(false)
    setName("")
    setDescription("")
    window.location.reload()
  }

  async function deleteCategory(id: string) {
    if (!window.confirm("Delete this category?")) return
    setDeletingId(id)
    try {
      const csrfToken = getCsrfTokenFromCookie()
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
      })
      if (!res.ok) throw new Error("Failed to delete")
      setCategories((prev) => prev.filter((c) => c._id !== id))
    } catch {
      setError("Failed to delete category")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <div className="card p-6">Loading categories…</div>

  return (
    <Layout>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold tracking-tight">Categories</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? "Cancel" : "Add Category"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={addCategory} className="space-y-4 mb-6">
            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input
                required
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">Save Category</button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Description</th><th className="text-right">Actions</th></tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={3} className="text-center text-slate-500 py-6">No categories found.</td></tr>
              ) : (
                categories.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 transition">
                    <td>{c.name}</td>
                    <td>{c.description || "—"}</td>
                    <td className="text-right">
                      <div className="flex gap-2 justify-end">
                        <a
                          href={`/inventory/categories/${c._id}/edit`}
                          className="px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-md transition"
                        >
                          Edit
                        </a>
                        <button
                          onClick={() => deleteCategory(c._id)}
                          disabled={deletingId === c._id}
                          className="px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 rounded-md transition disabled:opacity-50"
                        >
                          {deletingId === c._id ? "Deleting…" : "Delete"}
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
