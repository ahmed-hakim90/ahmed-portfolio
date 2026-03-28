import "./dashboard-shell.css";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      dir="rtl"
      className="dashboard-shell-root min-h-screen min-w-0 overflow-x-hidden"
    >
      {children}
    </div>
  );
}
