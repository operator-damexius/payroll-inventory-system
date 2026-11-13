"use client"

import Layout from "@/components/layout"
import { useState, useEffect } from "react"

interface Product {
  _id: string
  sku: string
  name: string
  quantity: number
  reorderLevel: number
}

export default function LowStockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/products?lowStock=true")
      .then((r) => r.json())
      .then((d) => { setProducts(d.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="card p-6">Loading low stock items…</div>

  return (
    <Layout>
      <div className="card">
        <h1 className="text-xl font-bold mb-6 tracking-tight text-rose-700">Low Stock Alerts</h1>
        <p className="text-sm text-slate-500 mb-6">Products at or below reorder level:</p>

        {products.length === 0 ? (
          <p className="text-green-700">No low stock items. All products are above reorder level.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th className="text-right">Current Qty</th>
                  <th className="text-right">Reorder Level</th>
                  <th className="text-right">Shortfall</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="bg-rose-50">
                    <td className="font-mono text-xs">{p.sku}</td>
                    <td>{p.name}</td>
                    <td className="text-right font-mono text-xs font-semibold">{p.quantity}</td>
                    <td className="text-right font-mono text-xs">{p.reorderLevel}</td>
                    <td className="text-right font-mono text-xs text-rose-700 font-bold">{Math.max(0, p.reorderLevel - p.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
