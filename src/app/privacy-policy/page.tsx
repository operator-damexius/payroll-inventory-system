import Layout from "@/components/layout"

export default function PrivacyPolicyPage() {
  return (
    <Layout>
      <div className="card max-w-3xl">
        <h1 className="text-xl font-bold mb-6">Privacy Policy</h1>
        <p className="mb-4">
          This Privacy Policy describes how the Payroll and Inventory Management System
          collects, uses, and protects your personal information.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">1. Information We Collect</h2>
        <p className="mb-4">
          We collect personal information such as name, email address, employment details,
          and salary information when you register or use the system. This data is stored
          securely in our database.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
        <p className="mb-4">
          Your information is used to manage employee records, process payroll, generate
          payslips, and track inventory transactions. We do not sell your data to third parties.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">3. Data Security</h2>
        <p className="mb-4">
          We implement appropriate security measures to protect your personal information
          against unauthorized access, alteration, or disclosure. Passwords are hashed and
          stored securely.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">4. Your Rights</h2>
        <p className="mb-4">
          You have the right to access, update, or delete your personal information. Contact
          the system administrator to exercise these rights.
        </p>
      </div>
    </Layout>
  )
}
