import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { AuthSessionRedirect } from "@/components/auth/AuthSessionRedirect";

export const metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace client pour acheter des œuvres et suivre vos commandes.",
};

function LoginForm() {
  return (
    <>
      <AuthSessionRedirect />
      <AuthForm mode="login" />
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthPageShell mode="login">
      <Suspense
        fallback={
          <p className="py-8 text-center text-sm text-stone-500">Chargement du formulaire…</p>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  );
}
