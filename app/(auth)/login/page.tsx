import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="flex items-center justify-center px-6 py-12 lg:px-12">
          <LoginForm />
        </section>

        <section className="hidden overflow-hidden border-l border-border bg-sidebar lg:flex">
          <div className="relative flex w-full items-center justify-center p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(80,180,255,0.12),transparent_55%)]" />

            <div className="relative max-w-lg">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-primary">
                AVIAAI
              </p>

              <h2 className="text-4xl font-semibold tracking-tight text-foreground">
                Your real estate operation, powered by intelligent employees.
              </h2>

              <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
                Leads, conversations, properties, and business workflows
                working together in one operational platform.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}