import Layout from "@/components/layout"

export default function InventoryPage() {
  return (
    <Layout>
      <div className="card">
        <h1 className="text-xl font-bold mb-6 tracking-tight">Inventory</h1>
        <p className="text-sm text-slate-500 mb-6">
          Manage your product catalog, stock movements, and suppliers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/inventory/products"
            className="block p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-left"
          >
            <h2 className="font-semibold text-slate-900">Products</h2>
            <p className="text-sm text-slate-500 mt-1">Manage product catalog</p>
          </a>
          <a
            href="/inventory/categories"
            className="block p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-left"
          >
            <h2 className="font-semibold text-slate-900">Categories</h2>
            <p className="text-sm text-slate-500 mt-1">Product classifications</p>
          </a>
          <a
            href="/inventory/suppliers"
            className="block p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-left"
          >
            <h2 className="font-semibold text-slate-900">Suppliers</h2>
            <p className="text-sm text-slate-500 mt-1">Supplier contacts</p>
          </a>
          <a
            href="/inventory/stock-movements"
            className="block p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-left"
          >
            <h2 className="font-semibold text-slate-900">Stock Movements</h2>
            <p className="text-sm text-slate-500 mt-1">Stock-in, stock-out, adjustments</p>
          </a>
          <a
            href="/inventory/low-stock"
            className="block p-4 rounded-lg border border-rose-200 hover:bg-rose-50 transition text-left"
          >
            <h2 className="font-semibold text-rose-700">Low Stock Alerts</h2>
            <p className="text-sm text-slate-500 mt-1">Products at reorder level</p>
          </a>
        </div>
      </div>
    </Layout>
  )
}
