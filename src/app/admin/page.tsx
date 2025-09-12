
import { AdminPanel } from "@/components/admin/admin-panel";
import { Toaster } from "@/components/ui/toaster";

export default function AdminRootPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
        <AdminPanel />
        <Toaster />
    </div>
  );
}
