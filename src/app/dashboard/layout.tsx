import "./dashboard-shell.css";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="dashboard-shell-root min-h-screen">{children}</div>;
}
