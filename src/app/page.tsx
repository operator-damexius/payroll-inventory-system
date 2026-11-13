import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-700 text-blue-100 text-xs font-semibold mb-4">
            Payroll & Inventory Management System
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Manage Payroll &amp; Inventory in One Place
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            A secure, web-based system for employee records, payroll processing,
            payslip generation, and inventory tracking — built for small and
            medium businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3 bg-white text-blue-900 font-bold rounded-lg hover:bg-gray-100 transition text-lg"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 border border-blue-200 text-white rounded-lg hover:bg-blue-800/30 transition text-lg"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Everything You Need</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Secure role-based access, payroll automation, inventory tracking,
              and real-time reporting — all in one system.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 text-2xl">
                👥
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Employee Management</h3>
              <p className="text-gray-600 text-sm">
                Maintain employee profiles, employment status, salary details,
                and role-based access.
              </p>
            </div>

            <div className="card p-6">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4 text-2xl">
                💰
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Payroll Processing</h3>
              <p className="text-gray-600 text-sm">
                Configure payroll rules, calculate gross/net pay, generate
                payslips, and track approval status.
              </p>
            </div>

            <div className="card p-6">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4 text-2xl">
                📦
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Inventory Tracking</h3>
              <p className="text-gray-600 text-sm">
                Manage products, categories, suppliers, stock-in/out, and
                low-stock alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Controlled Access for Every Role</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Server-side role-based permissions ensure users only see what
              they’re authorized to access.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="card p-6 text-center">
              <h4 className="font-bold text-gray-800 mb-2">Administrator</h4>
              <p className="text-sm text-gray-600">
                Manage accounts, roles, system settings, and oversee all modules.
              </p>
            </div>
            <div className="card p-6 text-center">
              <h4 className="font-bold text-gray-800 mb-2">HR / Payroll Officer</h4>
              <p className="text-sm text-gray-600">
                Maintain employee records and prepare/process payroll.
              </p>
            </div>
            <div className="card p-6 text-center">
              <h4 className="font-bold text-gray-800 mb-2">Inventory Officer</h4>
              <p className="text-sm text-gray-600">
                Maintain products, suppliers, and stock transactions.
              </p>
            </div>
            <div className="card p-6 text-center">
              <h4 className="font-bold text-gray-800 mb-2">Employee</h4>
              <p className="text-sm text-gray-600">
                View permitted personal profile and payslip information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-8">
            Join hundreds of organizations using our payroll and inventory system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3 bg-white text-blue-900 font-bold rounded-lg hover:bg-gray-100 transition text-lg"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 border border-blue-200 text-white rounded-lg hover:bg-blue-800/30 transition text-lg"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
