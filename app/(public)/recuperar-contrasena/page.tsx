"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Mail } from "lucide-react";
import { authService } from "@/application/auth/auth.service";
import { AutoPublicHeader } from "@/presentation/components/layout";

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      await authService.forgotPassword(email);
      setMessage(
        "Si el correo existe en nuestra plataforma, enviaremos un enlace de recuperacion.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo procesar tu solicitud.",
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
          <h1 className="text-3xl font-bold text-white">Recuperar contraseña</h1>
          <p className="mt-2 text-sm text-[#A0A0A0]">
            Ingresa tu correo y te enviaremos un enlace para restablecerla.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[#E5E5E5]">Correo electrónico</span>
              <div className="flex h-12 items-center gap-3 rounded-lg bg-[#0F0F0F] px-4">
                <Mail className="h-4 w-4 text-[#6A6A6A]" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-transparent text-[15px] text-white placeholder:text-[#666666] outline-none"
                  required
                  autoComplete="email"
                />
              </div>
            </label>

            {message ? (
              <p className="rounded-lg border border-[#1D4D2C] bg-[#15331F] px-3 py-2 text-sm text-[#9CE7B6]">
                {message}
              </p>
            ) : null}
            {errorMessage ? (
              <p className="rounded-lg border border-[#5A1B1B] bg-[#3C1717] px-3 py-2 text-sm text-[#F9B4B4]">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-[#5865F2] text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? "Enviando..." : "Enviar enlace"}
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

