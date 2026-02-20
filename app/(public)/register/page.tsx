"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import { AutoPublicHeader } from "@/presentation/components/layout";
import { useAuthStore } from "@/presentation/stores";

const inputClassName =
  "h-12 w-full rounded-lg border border-transparent bg-[#0f0f0f] px-4 text-sm text-[#e5e5e5] placeholder:text-[#666666] outline-none transition-all duration-300 focus:border-[#5865f2] focus:shadow-[0_0_0_3px_rgba(88,101,242,0.22)]";

const labelClassName = "text-sm font-semibold text-[#e5e5e5]";
const fieldEnterStyle = (delay: number) => ({ animationDelay: `${delay}ms` });

type RegisterFormFields = {
  fullName: string;
  ci: string;
  city: string;
  birthDate: string;
  country: string;
  club: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const initialFormFields: RegisterFormFields = {
  fullName: "",
  ci: "",
  city: "",
  birthDate: "",
  country: "",
  club: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
};

type PasswordStrength = {
  label: string;
  barWidth: string;
  colorClassName: string;
};

const getPasswordStrength = (password: string): PasswordStrength => {
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const score = [hasMinLength, hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;

  if (score <= 2) {
    return {
      label: "Fortaleza baja",
      barWidth: "w-1/3",
      colorClassName: "bg-[#ef4444]",
    };
  }

  if (score === 3 || score === 4) {
    return {
      label: "Fortaleza media",
      barWidth: "w-2/3",
      colorClassName: "bg-[#5865f2]",
    };
  }

  return {
    label: "Fortaleza alta",
    barWidth: "w-full",
    colorClassName: "bg-[#22c55e]",
  };
};

const validateRegisterForm = (form: RegisterFormFields): string | null => {
  if (!form.fullName.trim()) {
    return "Ingresa tu nombre completo.";
  }

  if (!form.ci.trim() || !form.city.trim() || !form.birthDate.trim() || !form.country.trim()) {
    return "Completa los datos personales obligatorios.";
  }

  if (!form.phone.trim()) {
    return "Ingresa un teléfono de contacto.";
  }

  if (!form.email.trim()) {
    return "Ingresa un correo electrónico válido.";
  }

  if (form.password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }

  if (form.password !== form.confirmPassword) {
    return "La confirmación de contraseña no coincide.";
  }

  return null;
};

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);

  const [form, setForm] = useState<RegisterFormFields>(initialFormFields);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const handleChange =
    (field: keyof RegisterFormFields) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((previous) => ({
        ...previous,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrorMessage(null);

    const validationError = validateRegisterForm(form);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const registerError = await register({
        name: form.fullName,
        email: form.email,
        password: form.password,
      });

      if (registerError === "EMAIL_ALREADY_IN_USE") {
        setErrorMessage("Ya existe una cuenta registrada con ese correo electrónico.");
        return;
      }

      router.push("/participante");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#000000] text-white">
      <AutoPublicHeader />

      <section className="relative mx-auto flex w-full max-w-[1522px] justify-center px-6 pb-16 pt-8 md:px-10 md:pt-10">
        <div
          className="register-decor-enter pointer-events-none absolute top-[-120px] left-[-130px] hidden h-[400px] w-[400px] rounded-full bg-[#1a1a1a] opacity-60 lg:block"
          style={fieldEnterStyle(40)}
        />
        <div
          className="register-decor-enter pointer-events-none absolute right-[-150px] bottom-[-140px] hidden h-[500px] w-[500px] rounded-full bg-[#1a1a1a] opacity-50 lg:block"
          style={fieldEnterStyle(120)}
        />
        <div
          className="register-decor-enter pointer-events-none absolute top-[140px] right-[120px] hidden h-[50px] w-[50px] rounded-full bg-[#1a1a1a] lg:block"
          style={fieldEnterStyle(180)}
        />
        <div
          className="register-decor-enter pointer-events-none absolute top-[520px] right-[120px] hidden h-[50px] w-[50px] rounded-full bg-[#1a1a1a] lg:block"
          style={fieldEnterStyle(220)}
        />
        <div
          className="register-decor-enter pointer-events-none absolute top-[340px] left-[90px] hidden h-[40px] w-[40px] rotate-[-20deg] rounded-lg bg-[#1a1a1a] lg:block"
          style={fieldEnterStyle(160)}
        />
        <div
          className="register-decor-enter pointer-events-none absolute bottom-[140px] left-[60px] hidden h-[80px] w-[80px] rotate-[15deg] rounded-2xl bg-[#1a1a1a] lg:block"
          style={fieldEnterStyle(240)}
        />

        <span
          className="register-decor-enter pointer-events-none absolute top-[170px] left-[220px] hidden text-xl text-[#5865f2] opacity-70 lg:block"
          style={fieldEnterStyle(200)}
        >
          ✨
        </span>
        <span
          className="register-decor-enter pointer-events-none absolute top-[370px] right-[260px] hidden text-lg text-[#ff6b9d] opacity-60 lg:block"
          style={fieldEnterStyle(260)}
        >
          ⭐
        </span>
        <span
          className="register-decor-enter pointer-events-none absolute top-[680px] left-[130px] hidden text-base text-[#ffd700] opacity-50 lg:block"
          style={fieldEnterStyle(280)}
        >
          ✨
        </span>
        <span
          className="register-decor-enter pointer-events-none absolute top-[600px] right-[260px] hidden text-xl text-[#5865f2] opacity-60 lg:block"
          style={fieldEnterStyle(300)}
        >
          💫
        </span>

        <div className="relative z-10 flex w-full max-w-[600px] flex-col items-center gap-8">
          <div className="register-title-enter flex flex-col items-center gap-4 text-center">
            <span className="text-5xl">🚀</span>
            <h1 className="text-4xl leading-tight font-bold md:text-6xl">¡Únete a Nosotros!</h1>
            <p className="text-sm text-[#999999] md:text-base">
              Completa tus datos y comienza tu aventura
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="register-form-enter w-full rounded-3xl bg-[#1a1a1a] p-6 md:p-12"
          >
            <div className="flex flex-col gap-6">
              <div
                className="register-field-enter flex flex-col gap-2"
                style={fieldEnterStyle(260)}
              >
                <label htmlFor="fullName" className={labelClassName}>
                  Nombre Completo *
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  placeholder="Ingresa tu nombre completo"
                  className={inputClassName}
                  required
                />
              </div>

              <div
                className="register-field-enter grid grid-cols-1 gap-4 md:grid-cols-2"
                style={fieldEnterStyle(310)}
              >
                <div className="flex flex-col gap-2">
                  <label htmlFor="ci" className={labelClassName}>
                    C.I. *
                  </label>
                  <input
                    id="ci"
                    type="text"
                    value={form.ci}
                    onChange={handleChange("ci")}
                    placeholder="12345678"
                    className={inputClassName}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="city" className={labelClassName}>
                    Ciudad *
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={form.city}
                    onChange={handleChange("city")}
                    placeholder="Tu ciudad"
                    className={inputClassName}
                    required
                  />
                </div>
              </div>

              <div
                className="register-field-enter flex flex-col gap-2"
                style={fieldEnterStyle(360)}
              >
                <label htmlFor="birthDate" className={labelClassName}>
                  Fecha de Nacimiento *
                </label>
                <input
                  id="birthDate"
                  type="text"
                  value={form.birthDate}
                  onChange={handleChange("birthDate")}
                  placeholder="DD/MM/AAAA"
                  className={inputClassName}
                  required
                />
              </div>

              <div
                className="register-field-enter flex flex-col gap-2"
                style={fieldEnterStyle(410)}
              >
                <label htmlFor="country" className={labelClassName}>
                  País *
                </label>
                <select
                  id="country"
                  className={inputClassName}
                  value={form.country}
                  onChange={handleChange("country")}
                  required
                >
                  <option value="" disabled>
                    Selecciona tu país
                  </option>
                  <option value="bolivia">Bolivia</option>
                  <option value="argentina">Argentina</option>
                  <option value="chile">Chile</option>
                  <option value="colombia">Colombia</option>
                  <option value="mexico">México</option>
                </select>
              </div>

              <div
                className="register-field-enter flex flex-col gap-2"
                style={fieldEnterStyle(460)}
              >
                <label htmlFor="club" className={labelClassName}>
                  Club (opcional)
                </label>
                <input
                  id="club"
                  type="text"
                  value={form.club}
                  onChange={handleChange("club")}
                  placeholder="Tu club o institución"
                  className={inputClassName}
                />
              </div>

              <div
                className="register-field-enter flex flex-col gap-2"
                style={fieldEnterStyle(510)}
              >
                <label htmlFor="phone" className={labelClassName}>
                  Teléfono *
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  placeholder="+XX XXX XXX XXX"
                  className={inputClassName}
                  required
                />
              </div>

              <div
                className="register-field-enter flex flex-col gap-2"
                style={fieldEnterStyle(560)}
              >
                <label htmlFor="email" className={labelClassName}>
                  Correo Electrónico *
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="tu@email.com"
                  className={inputClassName}
                  autoComplete="email"
                  required
                />
              </div>

              <div
                className="register-field-enter flex flex-col gap-2"
                style={fieldEnterStyle(610)}
              >
                <label htmlFor="password" className={labelClassName}>
                  Contraseña *
                </label>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder="••••••••"
                  className={inputClassName}
                  autoComplete="new-password"
                  required
                />
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-[#2a2a2a]">
                    <div
                      className={`h-full rounded-full ${passwordStrength.barWidth} ${passwordStrength.colorClassName}`}
                    />
                  </div>
                  <span className="text-xs text-[#999999]">{passwordStrength.label}</span>
                </div>
              </div>

              <div
                className="register-field-enter flex flex-col gap-2"
                style={fieldEnterStyle(660)}
              >
                <label htmlFor="confirmPassword" className={labelClassName}>
                  Confirmar Contraseña *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  placeholder="••••••••"
                  className={inputClassName}
                  autoComplete="new-password"
                  required
                />
              </div>

              {errorMessage ? (
                <p
                  className="register-field-enter rounded-lg border border-[#ef4444]/40 bg-[#7f1d1d]/30 px-3 py-2 text-sm text-[#fca5a5]"
                  style={fieldEnterStyle(690)}
                >
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                className="register-field-enter mt-1 h-14 w-full rounded-xl bg-[#5865f2] text-base font-bold text-white transition-all duration-300 hover:-translate-y-[2px] hover:bg-[#4f5be0] hover:shadow-[0_12px_24px_rgba(88,101,242,0.35)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
                style={fieldEnterStyle(710)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creando cuenta..." : "Registrarse"}
              </button>

              <div
                className="register-field-enter flex items-center justify-center gap-2"
                style={fieldEnterStyle(760)}
              >
                <span className="text-sm text-[#999999]">¿Ya tienes cuenta?</span>
                <Link href="/login" className="text-sm font-semibold text-[#5865f2]">
                  Inicia sesión
                </Link>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
