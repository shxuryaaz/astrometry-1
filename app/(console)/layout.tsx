import { ConsoleHeader } from "@/components/navigation/console-header";

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10">
      <ConsoleHeader />
      <section className="flex-1">{children}</section>
    </div>
  );
}

