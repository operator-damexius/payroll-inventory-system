import Layout from "@/components/layout"

async function getOverview() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/dashboard/overview`, {
    cache: "no-store",
  })
  if (!res.ok) return null
  return res.json()
}

async function getDeptData() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/dashboard/employees-by-department`, {
    cache: "no-store",
  })
  if (!res.ok) return null
  return res.json()
}

async function getPayrollTrends() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/dashboard/payroll-trends`, {
    cache: "no-store",
  })
  if (!res.ok) return null
  return res.json()
}

async function getStockTrend() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/dashboard/stock-trend`, {
    cache: "no-store",
  })
  if (!res.ok) return null
  return res.json()
}

async function getInventoryValue() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/dashboard/inventory-value-by-category`, {
    cache: "no-store",
  })
  if (!res.ok) return null
  return res.json()
}

export default async function DashboardPage() {
  const [ov, dept, pay, stock, inv] = await Promise.all([
    getOverview(),
    getDeptData(),
    getPayrollTrends(),
    getStockTrend(),
    getInventoryValue(),
  ])

  const stats = [
    {
      title: "Employees",
      value: ov?.employeeCount ?? "—",
      subtitle: "Total employee records",
      status: "info",
    },
    {
      title: "Products",
      value: ov?.productCount ?? "—",
      subtitle: "Products in catalog",
      status: "info",
    },
    {
      title: "Low Stock",
      value: ov?.lowStockCount ?? "—",
      subtitle: "Products at reorder level",
      status: ov?.lowStockCount ? "danger" : "ok",
    },
    {
      title: "Pending Payroll",
      value: ov?.pendingPayrollCount ?? "—",
      subtitle: "Periods awaiting approval",
      status: ov?.pendingPayrollCount ? "warning" : "ok",
    },
  ]

  const statusColors: Record<string, string> = {
    ok: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    info: "bg-blue-100 text-blue-700",
  }

  return (
    <Layout>
      <div className="card">
        <h1 className="text-xl font-bold mb-6">Dashboard</h1>
        <p className="text-sm text-slate-500 mb-6">
          Overview of your payroll and inventory system.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const badgeClass = stat.status ? statusColors[stat.status] : "bg-slate-100 text-slate-500"
            return (
              <div key={stat.title} className="p-4 rounded-lg border border-slate-200 bg-white">
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
                {stat.status && (
                  <span className={`badge px-2 py-1 rounded-md text-xs font-medium mt-2 inline-block ${badgeClass}`}>
                    {stat.status.toUpperCase()}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-4">
            <h2 className="text-sm font-semibold mb-3 text-slate-900">Employees by Department</h2>
            <div className="h-64 w-full">
              {dept?.data && dept.data.labels && dept.data.values ? (
                <div className="flex flex-col h-full">
                  {dept.data.labels.map((label: string, i: number) => {
                    const value = dept.data.values[i] || 0
                    const max = Math.max(...dept.data.values)
                    const percent = max > 0 ? (value / max) * 100 : 0
                    return (
                      <div key={label} className="mb-3">
                        <div className="flex justify-between mb-1 text-xs">
                          <span className="text-slate-600">{label}</span>
                          <span className="font-medium text-slate-900">{value}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  No data available
                </div>
              )}
            </div>
          </div>
          <div className="card p-4">
            <h2 className="text-sm font-semibold mb-3 text-slate-900">Payroll Trends</h2>
            <div className="h-64 w-full">
              {pay?.data && pay.data.labels && pay.data.grossPay ? (
                <div className="flex flex-col h-full">
                  {pay.data.labels.map((label: string, i: number) => {
                    const gross = pay.data.grossPay[i] || 0
                    const net = pay.data.netPay[i] || 0
                    const max = Math.max(...pay.data.grossPay, ...pay.data.netPay)
                    const grossPercent = max > 0 ? (gross / max) * 100 : 0
                    const netPercent = max > 0 ? (net / max) * 100 : 0
                    return (
                      <div key={label} className="mb-4">
                        <div className="flex justify-between mb-1 text-xs">
                          <span className="text-slate-600">{label}</span>
                          <span className="font-medium text-slate-900">{gross.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2 h-3">
                          <div className="h-full bg-primary/60 rounded-full" style={{ width: `${grossPercent}%` }}></div>
                          <div className="h-full bg-slate-900 rounded-full" style={{ width: `${netPercent}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                          <span>Gross</span>
                          <span>Net</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-4">
            <h2 className="text-sm font-semibold mb-3 text-slate-900">Stock Movements by Month</h2>
            <div className="h-64 w-full">
              {stock?.data && stock.data.labels && stock.data.stockIn ? (
                <div className="flex flex-col h-full">
                  {stock.data.labels.map((label: string, i: number) => {
                    const stockIn = stock.data.stockIn[i] || 0
                    const stockOut = stock.data.stockOut[i] || 0
                    const adj = stock.data.adjustments[i] || 0
                    const total = Math.max(stockIn + Math.abs(stockOut) + Math.abs(adj), 1)
                    const inPercent = Math.max(stockIn, 0) / total * 100
                    const outPercent = Math.max(Math.abs(stockOut), 0) / total * 100
                    const adjPercent = Math.max(Math.abs(adj), 0) / total * 100
                    return (
                      <div key={label} className="mb-3">
                        <div className="flex justify-between mb-1 text-xs">
                          <span className="text-slate-600">{label}</span>
                          <span className="font-medium text-slate-900">{stockIn}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-600 rounded-full" style={{ width: `${inPercent}%` }}></div>
                          <div className="h-full bg-rose-600 rounded-full" style={{ width: `${outPercent}%` }}></div>
                          <div className="h-full bg-amber-600 rounded-full" style={{ width: `${adjPercent}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  No data available
                </div>
              )}
            </div>
          </div>
          <div className="card p-4">
            <h2 className="text-sm font-semibold mb-3 text-slate-900">Inventory Value by Category</h2>
            <div className="h-64 w-full">
              {inv?.data && inv.data.labels && inv.data.values ? (
                <div className="flex flex-col h-full gap-2">
                  {inv.data.labels.map((label: string, i: number) => {
                    const value = inv.data.values[i] || 0
                    const quantities = inv.data.quantities || []
                    const max = Math.max(...inv.data.values, 1)
                    const percent = (value / max) * 100
                    return (
                      <div key={label} className="flex items-center gap-3">
                        <div className="w-8 text-right text-xs text-slate-600">{label}</div>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${percent}%` }}></div>
                        </div>
                        <div className="w-16 text-right text-xs font-mono text-slate-900">
                          {value.toLocaleString()}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card p-6 mt-8">
          <h2 className="text-sm font-semibold mb-4 text-slate-900">Quick Actions</h2>
          <div className="space-y-3">
            <a href="/employees/create" className="btn btn-primary w-full">
              Add Employee
            </a>
            <a href="/payrolls/create" className="btn btn-primary w-full">
              New Payroll Period
            </a>
            <a href="/inventory/products" className="btn btn-outline w-full">
              View Products
            </a>
            <a href="/inventory/low-stock" className="btn btn-outline w-full">
              Check Low Stock
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}
