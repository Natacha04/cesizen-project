import { AuthShell } from "@/features/auth/views/AuthShell";
import { RegisterForm } from "@/features/auth/views/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Inscription"
      description="Découvrez votre espace en vous inscrivant."
    >
      <RegisterForm />
    </AuthShell>
  );
}
