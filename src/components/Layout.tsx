import { ReactNode } from "react";
import Topbar from "./TopBar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
<div className="flex flex-col h-screen">
  <Topbar />
  <main className="flex-1 overflow-auto p-6">
    {children}
  </main>
</div>
  );
}