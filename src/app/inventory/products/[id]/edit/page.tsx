"use client"

import Layout from "@/components/layout"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCsrfTokenFromCookie } from "@/lib/csrf.client"

interface Product {
  _id: string
  sku: string
  name: string
  description?: string
  category?: string
  supplier?: string
  quantity: number
  reorderLevel: number
  unitPrice: number
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [form, setForm] = useState({
    sku: "",
    name: "",
    description: "",
    category: "",
    supplier: "",
    quantity: "",
    reorderLevel: "",
    unitPrice: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${params.id}`)
        if (!res.ok) throw new Error("Failed to load product")
        const data = await res.json()
        const p = data.product
        setForm({
          sku: p.sku || "",
          name: p.name || "",
          description: p.description || "",
          category: p.category?.name || "",
          supplier: p.supplier?.name || "",
          quantity: p.quantity || "",
          reorderLevel: p.reorderLevel || "",
          unitPrice: p.unitPrice || "",
        })
      } catch {
        setError("Failed to load product")
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
      const res = await fetch(`/api/products/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          reorderLevel: Number(form.reorderLevel),
          unitPrice: Number(form.unitPrice),
        }),
      })

      if (!res.ok) {
        const d = await res.json()
        setError(d.error || "Failed to update product")
        return
      }

      router.push("/inventory/products")
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
        <h1 className="text-xl font-bold tracking-tight mb-6">Edit Product</h1>
        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">SKU</label>
              <input
                required
                className="input"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input
                required
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Description</label>
              <input
                className="input"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Supplier</label>
              <input
                className="input"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                className="input"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reorder Level</label>
              <input
                type="number"
                className="input"
                value={form.reorderLevel}
                onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit Price</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={form.unitPrice}
                onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-6">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/inventory/products")}
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
