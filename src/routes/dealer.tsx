import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";

export const Route = createFileRoute("/dealer")({
  component: () => <AdminShell portal="Dealer" />,
});
