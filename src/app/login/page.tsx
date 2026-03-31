import { AuthShell } from "@/features/auth/views/AuthShell";
import { LoginForm } from "@/features/auth/views/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Connexion"
      description="Un point d’entrée dédié à l’authentification, sans mélanger le routing et la logique de formulaire."
    >
      <LoginForm />
    </AuthShell>
  );
}
