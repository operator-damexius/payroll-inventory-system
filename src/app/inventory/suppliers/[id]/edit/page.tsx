"use client"

import Layout from "@/components/layout"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCsrfTokenFromCookie } from "@/lib/csrf.client"

export default function EditSupplierPage({ params }: { params: { id: string } }) {
  const [name, setName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/suppliers/${params.id}`)
        if (!res.ok) throw new Error("Failed to load supplier")
        const data = await res.json()
        const s = data.supplier
        setName(s.name || "")
        setContactPerson(s.contactPerson || "")
        setEmail(s.email || "")
        setPhone(s.phone || "")
        setAddress(s.address || "")
      } catch {
        setError("Failed to load supplier")
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
      const res = await fetch(`/api/suppliers/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        body: JSON.stringify({ name, contactPerson, email, phone, address }),
      })

      if (!res.ok) {
        const d = await res.json()
        setError(d.error || "Failed to update supplier")
        return
      }

      router.push("/inventory/suppliers")
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
        <h1 className="text-xl font-bold tracking-tight mb-6">Edit Supplier</h1>
        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Supplier Name</label>
            <input
              required
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Person</label>
            <input
              className="input"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              className="input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-6">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/inventory/suppliers")}
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
