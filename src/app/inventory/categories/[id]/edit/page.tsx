"use client"

import Layout from "@/components/layout"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCsrfTokenFromCookie } from "@/lib/csrf.client"

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/categories/${params.id}`)
        if (!res.ok) throw new Error("Failed to load category")
        const data = await res.json()
        const c = data.category
        setName(c.name || "")
        setDescription(c.description || "")
      } catch {
        setError("Failed to load category")
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
      const res = await fetch(`/api/categories/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        body: JSON.stringify({ name, description }),
      })

      if (!res.ok) {
        const d = await res.json()
        setError(d.error || "Failed to update category")
        return
      }

      router.push("/inventory/categories")
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
        <h1 className="text-xl font-bold tracking-tight mb-6">Edit Category</h1>
        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex gap-3 pt-6">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/inventory/categories")}
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
