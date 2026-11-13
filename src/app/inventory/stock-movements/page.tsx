"use client"

import Layout from "@/components/layout"
import { useState, useEffect } from "react"
import { getCsrfTokenFromCookie } from "@/lib/csrf.client"

interface Transaction {
  _id: string
  type: string
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason?: string
  reference?: string
  createdAt: string
  product?: { sku: string; name: string }
}

interface Product {
  _id: string
  sku: string
  name: string
}

export default function StockMovementsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    productId: "",
    type: "STOCK_IN",
    quantity: "",
    reason: "",
    reference: "",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/stock-transactions?limit=100").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ])
      .then(([t, p]) => {
        setTransactions(t.data || [])
        setProducts(p.data || [])
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load data")
        setLoading(false)
      })
  }, [])

  async function addTransaction(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const csrfToken = getCsrfTokenFromCookie()
    const res = await fetch("/api/stock-transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error || "Failed to record movement")
      return
    }
    setShowForm(false)
    setForm({
      productId: "",
      type: "STOCK_IN",
      quantity: "",
      reason: "",
      reference: "",
    })
    window.location.reload()
  }

  if (loading) return <div className="card p-6">Loading stock movements…</div>

  return (
    <Layout>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold tracking-tight">Stock Movements</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? "Cancel" : "Record Movement"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={addTransaction} className="space-y-4 mb-6 max-w-lg">
            <div className="form-group">
              <label className="form-label">Product</label>
              <select
                required
                className="input"
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.sku} - {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Movement Type</label>
              <select
                required
                className="input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="STOCK_IN">Stock In</option>
                <option value="STOCK_OUT">Stock Out</option>
                <option value="ADJUSTMENT">Adjustment</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                required
                className="input"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reason</label>
              <input
                className="input"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reference</label>
              <input
                className="input"
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Record Movement
            </button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Type</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Prev</th>
                <th className="text-right">New</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-slate-500 py-6">
                    No stock movements recorded.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t._id}>
                    <td className="text-xs">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="font-mono text-xs">
                      {t.product?.sku || "—"}
                    </td>
                    <td>
                      <span
                        className={`badge px-2 py-1 rounded-md text-xs font-medium ${
                          t.type === "STOCK_IN"
                            ? "bg-green-100 text-green-700"
                            : t.type === "STOCK_OUT"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {t.type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="text-right font-mono text-xs">
                      {t.quantity}
                    </td>
                    <td className="text-right font-mono text-xs">
                      {t.previousQuantity}
                    </td>
                    <td className="text-right font-mono text-xs font-semibold">
                      {t.newQuantity}
                    </td>
                    <td className="text-xs">{t.reason || "—"}</td>
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
