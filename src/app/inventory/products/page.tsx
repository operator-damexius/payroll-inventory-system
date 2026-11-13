"use client"

import Layout from "@/components/layout"
import { useState, useEffect } from "react"
import { getCsrfTokenFromCookie } from "@/lib/csrf.client"

interface Product {
  _id: string
  sku: string
  name: string
  description?: string
  quantity: number
  reorderLevel: number
  unitPrice: number
  category?: { name?: string }
  supplier?: { name?: string }
  isActive: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/products?lowStock=false")
      .then((r) => r.json())
      .then((d) => { setProducts(d.data || []); setLoading(false) })
      .catch(() => { setError("Failed to load products"); setLoading(false) })
  }, [])

  async function addProduct(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const fd = new FormData(e.target as HTMLFormElement)
    const csrfToken = getCsrfTokenFromCookie()
    const res = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      },
      body: JSON.stringify({
        sku: fd.get("sku"),
        name: fd.get("name"),
        description: fd.get("description"),
        quantity: Number(fd.get("quantity")),
        reorderLevel: Number(fd.get("reorderLevel")),
        unitPrice: Number(fd.get("unitPrice")),
      }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error || "Failed to add product")
      return
    }
    setShowForm(false)
    window.location.reload()
  }

  async function deleteProduct(id: string) {
    if (!window.confirm("Delete this product?")) return
    setDeletingId(id)
    try {
      const csrfToken = getCsrfTokenFromCookie()
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
      })
      if (!res.ok) throw new Error("Failed to delete")
      setProducts((prev) => prev.filter((p) => p._id !== id))
    } catch {
      setError("Failed to delete product")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <div className="card p-6">Loading products…</div>

  return (
    <Layout>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold tracking-tight">Products</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? "Cancel" : "Add Product"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={addProduct} className="space-y-4 mb-6">
            <div className="form-group">
              <label className="form-label">SKU</label>
              <input name="sku" required className="input" />
            </div>
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input name="name" required className="input" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input name="description" className="input" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input name="quantity" type="number" defaultValue="0" className="input" />
              </div>
              <div className="form-group">
                <label className="form-label">Reorder Level</label>
                <input name="reorderLevel" type="number" defaultValue="5" className="input" />
              </div>
              <div className="form-group">
                <label className="form-label">Unit Price</label>
                <input name="unitPrice" type="number" step="0.01" defaultValue="0" className="input" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Save Product</button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Supplier</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Reorder</th>
                <th className="text-right">Price</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-slate-500 py-6">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className={`${p.quantity <= p.reorderLevel ? "bg-rose-50" : ""} hover:bg-slate-50 transition`}>
                    <td className="font-mono text-xs">{p.sku}</td>
                    <td>{p.name}</td>
                    <td className="text-xs">{p.category?.name || "—"}</td>
                    <td className="text-xs">{p.supplier?.name || "—"}</td>
                    <td className="text-right font-mono text-xs">{p.quantity}</td>
                    <td className="text-right font-mono text-xs">{p.reorderLevel}</td>
                    <td className="text-right font-mono text-xs">{p.unitPrice.toLocaleString()}</td>
                    <td>
                      <span
                        className={`badge px-2 py-1 rounded-md text-xs font-medium ${
                          p.quantity <= p.reorderLevel ? "bg-rose-100 text-rose-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {p.quantity <= p.reorderLevel ? "LOW STOCK" : "OK"}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex gap-2 justify-end">
                        <a
                          href={`/inventory/products/${p._id}/edit`}
                          className="px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-md transition"
                        >
                          Edit
                        </a>
                        <button
                          onClick={() => deleteProduct(p._id)}
                          disabled={deletingId === p._id}
                          className="px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 rounded-md transition disabled:opacity-50"
                        >
                          {deletingId === p._id ? "Deleting…" : "Delete"}
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
