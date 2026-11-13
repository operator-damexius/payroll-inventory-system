export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md bg-card border p-6 rounded-lg shadow-sm text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">Unauthorized</h2>
        <p className="text-muted-foreground mb-6">
          You don't have permission to access this page.
        </p>
        <a
          href="/dashboard"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
        >
          Go to dashboard
        </a>
      </div>
    </div>
  )
}
