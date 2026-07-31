import { AuthShell } from "@/features/auth/views/AuthShell";
import { LoginForm } from "@/features/auth/views/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Connexion"
      description="Découvrez votre espace en vous connectant."
    >
      <LoginForm />
    </AuthShell>
  );
}
