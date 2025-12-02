import { LoginCard } from "@/components/auth/login-card";

export default function LoginPage() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-16">
      <div className="absolute inset-0 -z-10">
        <div className="mx-auto h-[520px] w-[520px] rounded-full bg-astral/20 blur-[160px]" />
      </div>
      <LoginCard />
    </main>
  );
}
