import Layout from "@/components/layout"

export default function TermsPage() {
  return (
    <Layout>
      <div className="card max-w-3xl">
        <h1 className="text-xl font-bold mb-6">Terms of Service</h1>
        <p className="mb-4">
          These Terms of Service govern your use of the Payroll and Inventory Management System.
          By accessing or using the system, you agree to these terms.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">1. Acceptable Use</h2>
        <p className="mb-4">
          You may use the system only for lawful purposes and in accordance with these terms.
          Unauthorized access or misuse of the system is prohibited.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">2. User Accounts</h2>
        <p className="mb-4">
          You are responsible for maintaining the confidentiality of your account credentials
          and for all activities that occur under your account.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">3. Data Accuracy</h2>
        <p className="mb-4">
          Payroll and inventory data entered into the system is the responsibility of the
          entering user. The system does not guarantee the accuracy of user-entered data.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">4. Limitation of Liability</h2>
        <p className="mb-4">
          The system is provided "as is" without warranties of any kind. The developers are
          not liable for any damages arising from the use of the system.
        </p>
      </div>
    </Layout>
  )
}
