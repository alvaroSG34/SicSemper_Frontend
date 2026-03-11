"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Outfit } from "next/font/google";
import { Check, Eye, LockKeyhole, Mail, Sparkles, Zap } from "lucide-react";
import type { UserRole } from "@/domain/user/user.types";
import { AutoPublicHeader } from "@/presentation/components/layout";
import { useAuthStore } from "@/presentation/stores";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const dashboardRouteByRole: Record<UserRole, string> = {
  PARTICIPANTE: "/participante",
  JUEZ: "/juez",
  ADMIN: "/admin",
  SUPERADMIN: "/admin",
};

const getDashboardRoute = (role: UserRole | null) => {
  if (!role) {
    return "/";
  }

  return dashboardRouteByRole[role] ?? "/";
};

function LeftPanel() {
  return (
    <section className="login-panel-left-enter relative hidden min-h-screen overflow-hidden bg-[#dcdcdc] xl:block">
      <div className="relative mx-auto h-full min-h-screen w-full max-w-[720px]">
        <div className="absolute inset-0 w-[720px] rounded-[150px] bg-[radial-gradient(circle,rgba(139,92,246,0.15)_0%,rgba(139,92,246,0)_70%)] opacity-60" />
        <div className="absolute bottom-[-26px] right-[-30px] h-[450px] w-[450px] rounded-[175px] bg-[radial-gradient(circle,rgba(236,72,153,0.1)_0%,rgba(236,72,153,0)_70%)] opacity-50" />
        <div className="absolute left-[200px] top-[-50px] h-[400px] w-[400px] rounded-[160px] bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,rgba(59,130,246,0)_70%)] opacity-50" />

        <div className="absolute left-[110px] top-[162px] flex h-[700px] w-[500px] flex-col items-center justify-center gap-12 p-[60px]">
          <p className="text-center text-2xl font-semibold tracking-[3px] text-[#7C3AED] opacity-90">
            Plataforma
          </p>
          <h1
            className={`${outfit.className} text-center text-[64px] leading-none font-bold tracking-[-2px] text-[#1E293B]`}
          >
            NOMBRE
          </h1>

          <div className="relative h-[500px] w-[450px]">
            <div className="absolute left-[-25px] top-0 h-[500px] w-[500px] bg-[radial-gradient(circle,rgba(167,139,250,0.2)_0%,rgba(167,139,250,0)_70%)] opacity-90" />
            <div className="absolute left-[95px] top-[80px] h-[360px] w-[280px] rotate-[-3deg] rounded-3xl bg-black opacity-20" />

            <div className="absolute left-[85px] top-[70px] h-[360px] w-[280px] rotate-[-3deg] rounded-3xl border border-[#E2E8F0] bg-white">
              <div className="flex h-full w-full flex-col items-center gap-5 p-[60px] text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#7C3AED]">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <h2 className={`${outfit.className} text-[24px] font-semibold text-[#1E293B]`}>
                  Participa y unete
                </h2>
                <p className="text-sm text-[#64748B]">Accede al panel del eve</p>
              </div>
            </div>

            <div className="absolute left-[330px] top-[360px] h-[70px] w-[70px] rounded-full border-2 border-[rgba(255,255,255,0.5)] bg-[#EC4899]" />
            <div className="absolute left-[50px] top-[320px] h-[50px] w-[50px] rounded-full border-2 border-[rgba(255,255,255,0.5)] bg-[#3B82F6] opacity-90" />
            <Sparkles className="absolute left-[350px] top-[90px] h-8 w-8 rotate-[15deg] text-[#FDE047]" />
            <Sparkles className="absolute left-[40px] top-[110px] h-9 w-9 rotate-[-15deg] text-[#F472B6]" />
            <Sparkles className="absolute left-[410px] top-[210px] h-8 w-8 rotate-[25deg] text-[#60A5FA] opacity-90" />
          </div>
        </div>
      </div>
    </section>
  );
}

type RightPanelProps = {
  email: string;
  password: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

function RightPanel({
  email,
  password,
  isSubmitting,
  errorMessage,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: RightPanelProps) {
  return (
    <section className="login-panel-right-enter relative min-h-screen bg-[#0a0a0a] px-6 pb-12 pt-28 md:px-10 xl:px-0 xl:pb-0 xl:pt-0">
      <div className="relative mx-auto h-full min-h-screen w-full max-w-[720px]">
        <div className="pointer-events-none absolute left-[100px] top-[200px] h-1 w-1 rounded-full bg-[#8b5cf6] opacity-60" />
        <div className="pointer-events-none absolute left-[600px] top-[300px] h-[3px] w-[3px] rounded-full bg-[#ec4899] opacity-50" />
        <div className="pointer-events-none absolute left-[150px] top-[700px] h-[5px] w-[5px] rounded-full bg-[#a78bfa] opacity-40" />

        <div className="login-form-enter relative mx-auto w-full max-w-[520px] xl:absolute xl:left-[83px] xl:top-[204px]">
          <div className="flex w-full flex-col items-center gap-2 text-center">
            <LockKeyhole className="h-11 w-11 text-[#facc15]" />
            <h2 className="text-[32px] font-bold leading-[1.2] tracking-[-0.5px] text-white">
              ¡Bienvenido de nuevo!
            </h2>
            <p className="text-[15px] text-[#999999]">Inicia sesión para continuar</p>
          </div>

          <form
            onSubmit={onSubmit}
            className="mt-8 flex w-full flex-col gap-5 rounded-3xl border-[1.5px] border-[rgba(139,92,246,0.25)] bg-[rgba(20,20,20,0.9)] p-10"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-[#e5e5e5]">
                Correo electrónico
              </label>
              <div className="flex h-12 items-center gap-3 rounded-lg bg-[#0f0f0f] px-4 py-3">
                <Mail className="h-[18px] w-[18px] text-[#666666]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-transparent text-[15px] text-[#e5e5e5] placeholder:text-[#666666] outline-none"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-[#e5e5e5]">
                Contraseña
              </label>
              <div className="flex h-12 items-center justify-between rounded-lg bg-[#0f0f0f] px-4 py-3">
                <div className="flex w-full items-center gap-3">
                  <LockKeyhole className="h-[18px] w-[18px] text-[#666666]" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => onPasswordChange(event.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-[15px] text-[#e5e5e5] placeholder:text-[#666666] outline-none"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <Eye className="h-[18px] w-[18px] text-[#666666]" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-[#999999]">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-[#0f0f0f] text-sm font-bold text-[#5865f2]">
                  <Check className="h-3.5 w-3.5" />
                </span>
                Recordarme
              </label>
              <button type="button" className="text-sm font-semibold text-[#5865f2]">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {errorMessage ? (
              <p className="rounded-lg border border-[#ef4444]/40 bg-[#7f1d1d]/30 px-3 py-2 text-sm text-[#fca5a5]">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-14 w-full items-center justify-center rounded-xl border border-[rgba(168,85,247,0.3)] bg-[linear-gradient(135deg,#8b5cf6_0%,#7c3aed_100%)] text-base font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
            </button>

            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-[#999999]">¿No tienes cuenta?</span>
              <Link href="/register" className="text-sm font-semibold text-[#5865f2]">
                Regístrate
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const loggedIn = await login(email, password);

      if (!loggedIn) {
        setErrorMessage("Credenciales inválidas. Verifica tu correo y contraseña.");
        return;
      }

      const { currentRole } = useAuthStore.getState();
      router.push(getDashboardRoute(currentRole));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#0a0a0a]">
      <AutoPublicHeader />

      <div className="relative w-full xl:min-h-screen">
        <div className="xl:grid xl:min-h-screen xl:grid-cols-2">
          <LeftPanel />
          <RightPanel
            email={email}
            password={password}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </main>
  );
}
