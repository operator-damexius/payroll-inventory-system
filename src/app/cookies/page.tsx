import Layout from "@/components/layout"

export default function CookiesPage() {
  return (
    <Layout>
      <div className="card max-w-3xl">
        <h1 className="text-xl font-bold mb-6">Cookies Policy</h1>
        <p className="mb-4">
          This Cookies Policy explains how the Payroll and Inventory Management System
          uses cookies and similar technologies.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">1. What Are Cookies</h2>
        <p className="mb-4">
          Cookies are small text files placed on your device when you visit a website.
          They help the system remember your preferences and improve your experience.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">2. Cookies We Use</h2>
        <p className="mb-4">
          We use session cookies to maintain your login session and remember your
          authentication status while you use the system. No tracking or advertising
          cookies are used.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">3. Managing Cookies</h2>
        <p className="mb-4">
          You can control or delete cookies through your browser settings. Disabling
          cookies may prevent you from logging in or using certain features of the system.
        </p>
      </div>
    </Layout>
  )
}
