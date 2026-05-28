"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { authService } from "@/application/auth/auth.service";
import { AutoPublicHeader } from "@/presentation/components/layout";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const normalizedToken = token.trim();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!normalizedToken) {
      setErrorMessage("No se encontro un token de recuperacion valido.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("La confirmacion de contraseña no coincide.");
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await authService.resetPassword(normalizedToken, newPassword);
      setSuccessMessage("Contraseña actualizada correctamente. Redirigiendo...");
      window.setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo restablecer la contraseña.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <AutoPublicHeader />
      <section className="mx-auto flex min-h-screen w-full max-w-[520px] items-center px-6 pb-10 pt-28">
        <div className="w-full rounded-3xl border border-[#2A2A2A] bg-[#141414] p-8 sm:p-10">
          <h1 className="text-3xl font-bold text-white">Restablecer contraseña</h1>
          <p className="mt-2 text-sm text-[#A0A0A0]">
            Crea una nueva contraseña para volver a ingresar a la plataforma.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[#E5E5E5]">Nueva contraseña</span>
              <div className="flex h-12 items-center gap-3 rounded-lg bg-[#0F0F0F] px-4">
                <LockKeyhole className="h-4 w-4 text-[#6A6A6A]" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full bg-transparent text-[15px] text-white placeholder:text-[#666666] outline-none"
                  required
                  autoComplete="new-password"
                />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[#E5E5E5]">
                Confirmar contraseña
              </span>
              <div className="flex h-12 items-center gap-3 rounded-lg bg-[#0F0F0F] px-4">
                <LockKeyhole className="h-4 w-4 text-[#6A6A6A]" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full bg-transparent text-[15px] text-white placeholder:text-[#666666] outline-none"
                  required
                  autoComplete="new-password"
                />
              </div>
            </label>

            {successMessage ? (
              <p className="rounded-lg border border-[#1D4D2C] bg-[#15331F] px-3 py-2 text-sm text-[#9CE7B6]">
                {successMessage}
              </p>
            ) : null}
            {errorMessage ? (
              <p className="rounded-lg border border-[#5A1B1B] bg-[#3C1717] px-3 py-2 text-sm text-[#F9B4B4]">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || !normalizedToken}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-[#5865F2] text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? "Guardando..." : "Guardar nueva contraseña"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link href="/login" className="text-sm font-semibold text-[#8BA3FF]">
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

