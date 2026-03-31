import { AuthShell } from "@/features/auth/views/AuthShell";
import { RegisterForm } from "@/features/auth/views/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Inscription"
      description="La route reste légère et délègue l’UI métier à la feature auth."
    >
      <RegisterForm />
    </AuthShell>
  );
}
