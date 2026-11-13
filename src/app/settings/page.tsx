import Layout from "@/components/layout"

export default function SettingsPage() {
  return (
    <Layout>
      <div className="card">
        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500">
            Manage, edit, or delete all records in the system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/employees"
            className="block p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-slate-900 group-hover:text-orange-600">Employees</h2>
              <span className="text-xs text-slate-400">Edit & Delete</span>
            </div>
            <p className="text-sm text-slate-500">
              Employee records, salaries, and status.
            </p>
          </a>

          <a
            href="/payrolls"
            className="block p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-slate-900 group-hover:text-orange-600">Payroll Periods</h2>
              <span className="text-xs text-slate-400">Edit & Delete</span>
            </div>
            <p className="text-sm text-slate-500">
              Payroll periods and calculation status.
            </p>
          </a>

          <a
            href="/payroll-rules"
            className="block p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-slate-900 group-hover:text-orange-600">Payroll Rules</h2>
              <span className="text-xs text-slate-400">Edit & Delete</span>
            </div>
            <p className="text-sm text-slate-500">
              Allowances, deductions, and overtime rates.
            </p>
          </a>

          <a
            href="/inventory/products"
            className="block p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-slate-900 group-hover:text-orange-600">Products</h2>
              <span className="text-xs text-slate-400">Edit & Delete</span>
            </div>
            <p className="text-sm text-slate-500">
              Product catalog, stock, and pricing.
            </p>
          </a>

          <a
            href="/inventory/categories"
            className="block p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-slate-900 group-hover:text-orange-600">Categories</h2>
              <span className="text-xs text-slate-400">Edit & Delete</span>
            </div>
            <p className="text-sm text-slate-500">
              Product classifications.
            </p>
          </a>

          <a
            href="/inventory/suppliers"
            className="block p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-slate-900 group-hover:text-orange-600">Suppliers</h2>
              <span className="text-xs text-slate-400">Edit & Delete</span>
            </div>
            <p className="text-sm text-slate-500">
              Supplier contacts and details.
            </p>
          </a>

          <a
            href="/fiscal-years"
            className="block p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-slate-900 group-hover:text-orange-600">Fiscal Years</h2>
              <span className="text-xs text-slate-400">Edit & Delete</span>
            </div>
            <p className="text-sm text-slate-500">
              Fiscal year periods for payroll reporting.
            </p>
          </a>

          <a
            href="/audit-logs"
            className="block p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-slate-900 group-hover:text-orange-600">Audit Logs</h2>
              <span className="text-xs text-slate-400">View History</span>
            </div>
            <p className="text-sm text-slate-500">
              Record of user and system actions.
            </p>
          </a>
        </div>
      </div>
    </Layout>
  )
}
