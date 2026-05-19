import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

export const metadata = {
  title: "Inscription",
  description: "Créez votre compte pour acheter des œuvres originales et suivre vos commandes.",
};

function RegisterForm() {
  return <AuthForm mode="register" />;
}

export default function RegisterPage() {
  return (
    <AuthPageShell mode="register">
      <Suspense
        fallback={
          <p className="py-8 text-center text-sm text-stone-500">Chargement du formulaire…</p>
        }
      >
        <RegisterForm />
      </Suspense>
    </AuthPageShell>
  );
}
