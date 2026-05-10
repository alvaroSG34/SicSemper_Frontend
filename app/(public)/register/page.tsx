"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Rocket, Sparkles, Star } from "lucide-react";
import { listRegisterClubs, type RegisterClubOption } from "@/application/auth/auth.service";
import { CITIES_BY_COUNTRY, COUNTRY_OPTIONS } from "@/core/constants";
import { AutoPublicHeader } from "@/presentation/components/layout";
import { ImageWithSkeleton } from "@/presentation/components/ui";
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
  clubId: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FieldName = keyof RegisterFormFields;
type FieldErrors = Partial<Record<FieldName, string>>;
type RegisterDraft = Omit<RegisterFormFields, "password" | "confirmPassword">;

const initialFormFields: RegisterFormFields = {
  fullName: "",
  ci: "",
  city: "",
  birthDate: "",
  country: "",
  clubId: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ciPattern = /^[0-9A-Za-z-]{5,20}$/;
const phonePattern = /^\+?[0-9\s-]{6,20}$/;
const registerDraftStorageKey = "nombre.register.draft.v1";

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

const getFieldErrors = (form: RegisterFormFields): FieldErrors => {
  const errors: FieldErrors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Ingresa tu nombre completo.";
  }

  if (!form.email.trim()) {
    errors.email = "Ingresa un correo electronico valido.";
  } else if (!emailPattern.test(form.email.trim())) {
    errors.email = "Ingresa un correo electronico valido.";
  }

  if (form.ci.trim() && !ciPattern.test(form.ci.trim())) {
    errors.ci = "Ingresa un CI valido (5 a 20 caracteres, solo letras, numeros o guion).";
  }

  if (form.phone.trim() && !phonePattern.test(form.phone.trim())) {
    errors.phone = "Ingresa un numero de telefono valido (solo digitos).";
  }

  if (form.password.length < 8) {
    errors.password = "La contraseña debe tener al menos 8 caracteres.";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Confirma tu contraseña.";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "La confirmacion de contraseña no coincide.";
  }

  return errors;
};

const getFirstInvalidField = (fieldErrors: FieldErrors): FieldName | null => {
  const orderedFields: FieldName[] = [
    "fullName",
    "ci",
    "phone",
    "email",
    "password",
    "confirmPassword",
  ];

  for (const field of orderedFields) {
    if (fieldErrors[field]) {
      return field;
    }
  }

  return null;
};

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);

  const [form, setForm] = useState<RegisterFormFields>(initialFormFields);
  const [clubs, setClubs] = useState<RegisterClubOption[]>([]);
  const [clubsError, setClubsError] = useState<string | null>(null);
  const [isLoadingClubs, setIsLoadingClubs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<FieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<Partial<Record<FieldName, boolean>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const countryMenuRef = useRef<HTMLDivElement | null>(null);
  const [isClubMenuOpen, setIsClubMenuOpen] = useState(false);
  const clubMenuRef = useRef<HTMLDivElement | null>(null);

  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);
  const fieldErrors = useMemo(() => getFieldErrors(form), [form]);
  const canSubmit = useMemo(
    () =>
      !isSubmitting &&
      Object.keys(fieldErrors).length === 0 &&
      Object.keys(serverFieldErrors).length === 0,
    [fieldErrors, isSubmitting, serverFieldErrors],
  );
  const selectedCountry = useMemo(
    () => COUNTRY_OPTIONS.find((country) => country.value === form.country) ?? null,
    [form.country],
  );
  const selectedClub = useMemo(
    () => clubs.find((club) => club.id === form.clubId) ?? null,
    [clubs, form.clubId],
  );
  const phonePrefix = selectedCountry?.phoneCode ?? null;
  const citiesForCountry = form.country ? (CITIES_BY_COUNTRY[form.country] ?? []) : [];

  const getVisibleFieldError = (field: FieldName): string | undefined =>
    serverFieldErrors[field] ?? (touchedFields[field] ? fieldErrors[field] : undefined);

  const focusField = (field: FieldName) => {
    const element = document.getElementById(field);
    if (element instanceof HTMLElement) {
      element.focus();
    }
  };

  useEffect(() => {
    try {
      const rawDraft = window.sessionStorage.getItem(registerDraftStorageKey);
      if (!rawDraft) {
        return;
      }

      const parsed = JSON.parse(rawDraft) as Partial<RegisterDraft>;
      setForm((previous) => ({
        ...previous,
        fullName: typeof parsed.fullName === "string" ? parsed.fullName : previous.fullName,
        ci: typeof parsed.ci === "string" ? parsed.ci : previous.ci,
        city: typeof parsed.city === "string" ? parsed.city : previous.city,
        birthDate: typeof parsed.birthDate === "string" ? parsed.birthDate : previous.birthDate,
        country: typeof parsed.country === "string" ? parsed.country : previous.country,
        clubId: typeof parsed.clubId === "string" ? parsed.clubId : previous.clubId,
        phone: typeof parsed.phone === "string" ? parsed.phone : previous.phone,
        email: typeof parsed.email === "string" ? parsed.email : previous.email,
      }));
    } catch {
      // Ignore malformed drafts.
    }
  }, []);
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (countryMenuRef.current && !countryMenuRef.current.contains(event.target as Node)) {
        setIsCountryMenuOpen(false);
      }
      if (clubMenuRef.current && !clubMenuRef.current.contains(event.target as Node)) {
        setIsClubMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const draft: RegisterDraft = {
      fullName: form.fullName,
      ci: form.ci,
      city: form.city,
      birthDate: form.birthDate,
      country: form.country,
      clubId: form.clubId,
      phone: form.phone,
      email: form.email,
    };

    const hasDraftContent = Object.values(draft).some((value) => value.trim().length > 0);
    if (!hasDraftContent) {
      window.sessionStorage.removeItem(registerDraftStorageKey);
      return;
    }

    window.sessionStorage.setItem(registerDraftStorageKey, JSON.stringify(draft));
  }, [
    form.birthDate,
    form.ci,
    form.city,
    form.clubId,
    form.country,
    form.email,
    form.fullName,
    form.phone,
  ]);

  useEffect(() => {
    let isMounted = true;

    const loadClubs = async () => {
      try {
        const nextClubs = await listRegisterClubs();

        if (!isMounted) {
          return;
        }

        setClubs(nextClubs);
        setClubsError(null);
      } catch {
        if (!isMounted) {
          return;
        }

        setClubs([]);
        setClubsError("No pudimos cargar los clubes. Puedes continuar sin seleccionar uno.");
      } finally {
        if (isMounted) {
          setIsLoadingClubs(false);
        }
      }
    };

    void loadClubs();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange =
    (field: FieldName) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (errorMessage) {
        setErrorMessage(null);
      }
      if (successMessage) {
        setSuccessMessage(null);
      }

      setServerFieldErrors((previous) => {
        if (!previous[field]) {
          return previous;
        }

        const next = { ...previous };
        delete next[field];
        return next;
      });

      setForm((previous) => ({
        ...previous,
        [field]: field === "email" ? event.target.value.trimStart() : event.target.value,
      }));
    };

  const handleBlur = (field: FieldName) => () => {
    setTouchedFields((previous) => ({
      ...previous,
      [field]: true,
    }));
  };

  const handleCountrySelect = (countryValue: string) => {
    if (errorMessage) {
      setErrorMessage(null);
    }
    if (successMessage) {
      setSuccessMessage(null);
    }

    setServerFieldErrors((previous) => {
      if (!previous.country) {
        return previous;
      }

      const next = { ...previous };
      delete next.country;
      return next;
    });

    setTouchedFields((previous) => ({
      ...previous,
      country: true,
    }));

    setForm((previous) => ({
      ...previous,
      country: countryValue,
      phone: "",
      city: "",
    }));
    setIsCountryMenuOpen(false);
  };

  const handleClubSelect = (clubId: string) => {
    if (errorMessage) {
      setErrorMessage(null);
    }
    if (successMessage) {
      setSuccessMessage(null);
    }

    setForm((previous) => ({
      ...previous,
      clubId,
    }));
    setIsClubMenuOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setServerFieldErrors({});

    const firstInvalidField = getFirstInvalidField(fieldErrors);
    if (firstInvalidField) {
      const invalidTouched: Partial<Record<FieldName, boolean>> = {};
      (Object.keys(fieldErrors) as FieldName[]).forEach((field) => {
        invalidTouched[field] = true;
      });

      setTouchedFields((previous) => ({
        ...previous,
        ...invalidTouched,
      }));
      focusField(firstInvalidField);
      return;
    }

    setIsSubmitting(true);

    try {
      const registerError = await register({
        name: form.fullName.trim(),
        birthDate: form.birthDate || undefined,
        ci: form.ci.trim() || undefined,
        country: form.country || undefined,
        city: form.city.trim() || undefined,
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim()
          ? phonePrefix
            ? `${phonePrefix} ${form.phone.trim()}`
            : form.phone.trim()
          : undefined,
        clubId: form.clubId || undefined,
        password: form.password,
      });

      if (registerError === "EMAIL_ALREADY_IN_USE") {
        setTouchedFields((previous) => ({
          ...previous,
          email: true,
        }));
        setServerFieldErrors({ email: "Ya existe una cuenta registrada con ese correo electronico." });
        focusField("email");
        return;
      }

      if (registerError === "CI_ALREADY_IN_USE") {
        setTouchedFields((previous) => ({
          ...previous,
          ci: true,
        }));
        setServerFieldErrors({ ci: "Ya existe una cuenta registrada con ese CI." });
        focusField("ci");
        return;
      }

      window.sessionStorage.removeItem(registerDraftStorageKey);
      setSuccessMessage("Cuenta creada correctamente. Redirigiendo...");
      await new Promise((resolve) => {
        setTimeout(resolve, 700);
      });
      router.push("/participante/inicio");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo completar el registro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#000000] text-white">
      <AutoPublicHeader />

      <section className="relative mx-auto flex w-full max-w-[1522px] justify-center px-6 pb-16 pt-8 md:px-10 md:pt-10">
        <div
          className="register-decor-enter pointer-events-none absolute left-[-130px] top-[-120px] hidden h-[400px] w-[400px] rounded-full bg-[#1a1a1a] opacity-60 lg:block"
          style={fieldEnterStyle(40)}
        />
        <div
          className="register-decor-enter pointer-events-none absolute bottom-[-140px] right-[-150px] hidden h-[500px] w-[500px] rounded-full bg-[#1a1a1a] opacity-50 lg:block"
          style={fieldEnterStyle(120)}
        />
        <div
          className="register-decor-enter pointer-events-none absolute right-[120px] top-[140px] hidden h-[50px] w-[50px] rounded-full bg-[#1a1a1a] lg:block"
          style={fieldEnterStyle(180)}
        />
        <div
          className="register-decor-enter pointer-events-none absolute right-[120px] top-[520px] hidden h-[50px] w-[50px] rounded-full bg-[#1a1a1a] lg:block"
          style={fieldEnterStyle(220)}
        />
        <div
          className="register-decor-enter pointer-events-none absolute left-[90px] top-[340px] hidden h-[40px] w-[40px] rotate-[-20deg] rounded-lg bg-[#1a1a1a] lg:block"
          style={fieldEnterStyle(160)}
        />
        <div
          className="register-decor-enter pointer-events-none absolute bottom-[140px] left-[60px] hidden h-[80px] w-[80px] rotate-[15deg] rounded-2xl bg-[#1a1a1a] lg:block"
          style={fieldEnterStyle(240)}
        />

        <Sparkles
          className="register-decor-enter pointer-events-none absolute left-[220px] top-[170px] hidden h-5 w-5 text-[#5865f2] opacity-70 lg:block"
          style={fieldEnterStyle(200)}
        />
        <Star
          className="register-decor-enter pointer-events-none absolute right-[260px] top-[370px] hidden h-5 w-5 text-[#ff6b9d] opacity-60 lg:block"
          style={fieldEnterStyle(260)}
        />
        <Sparkles
          className="register-decor-enter pointer-events-none absolute left-[130px] top-[680px] hidden h-4 w-4 text-[#ffd700] opacity-50 lg:block"
          style={fieldEnterStyle(280)}
        />
        <Sparkles
          className="register-decor-enter pointer-events-none absolute right-[260px] top-[600px] hidden h-5 w-5 text-[#5865f2] opacity-60 lg:block"
          style={fieldEnterStyle(300)}
        />

        <div className="relative z-10 flex w-full max-w-[600px] flex-col items-center gap-8">
          <div className="register-title-enter flex flex-col items-center gap-4 text-center">
            <Rocket className="h-12 w-12 text-[#5865f2]" />
            <h1 className="text-4xl leading-tight font-bold md:text-6xl">Unete a nosotros</h1>
            <p className="text-sm text-[#999999] md:text-base">
              Completa tus datos y comienza tu aventura
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="register-form-enter w-full rounded-3xl bg-[#1a1a1a] p-6 md:p-12"
          >
            <div className="flex flex-col gap-6">
              <div className="register-field-enter flex flex-col gap-2" style={fieldEnterStyle(260)}>
                <label htmlFor="fullName" className={labelClassName}>
                  Nombre completo *
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  onBlur={handleBlur("fullName")}
                  placeholder="Ingresa tu nombre completo"
                  className={inputClassName}
                  autoComplete="name"
                  required
                />
                {getVisibleFieldError("fullName") ? (
                  <p className="text-xs text-[#fca5a5]">{getVisibleFieldError("fullName")}</p>
                ) : null}
              </div>

              <div
                className="register-field-enter grid grid-cols-1 gap-4 md:grid-cols-2"
                style={fieldEnterStyle(310)}
              >
                <div className="flex flex-col gap-2">
                  <label htmlFor="ci" className={labelClassName}>
                    C.I.
                  </label>
                  <input
                    id="ci"
                    type="text"
                    value={form.ci}
                    onChange={handleChange("ci")}
                    onBlur={handleBlur("ci")}
                    placeholder="12345678"
                    className={inputClassName}
                    inputMode="numeric"
                  />
                  {getVisibleFieldError("ci") ? (
                    <p className="text-xs text-[#fca5a5]">{getVisibleFieldError("ci")}</p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="city" className={labelClassName}>
                    Ciudad
                  </label>
                  {citiesForCountry.length > 0 ? (
                    <select
                      id="city"
                      value={form.city}
                      onChange={handleChange("city")}
                      onBlur={handleBlur("city")}
                      className={inputClassName}
                    >
                      <option value="">Selecciona tu ciudad</option>
                      {citiesForCountry.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="city"
                      type="text"
                      value={form.city}
                      onChange={handleChange("city")}
                      onBlur={handleBlur("city")}
                      placeholder="Tu ciudad"
                      className={inputClassName}
                      autoComplete="address-level2"
                    />
                  )}
                </div>
              </div>

              <div className="register-field-enter flex flex-col gap-2" style={fieldEnterStyle(360)}>
                <label htmlFor="birthDate" className={labelClassName}>
                  Fecha de nacimiento
                </label>
                <input
                  id="birthDate"
                  type="date"
                  value={form.birthDate}
                  onChange={handleChange("birthDate")}
                  onBlur={handleBlur("birthDate")}
                  className={inputClassName}
                  autoComplete="bday"
                />
              </div>

              <div className="register-field-enter flex flex-col gap-2" style={{ ...fieldEnterStyle(410), ...(isCountryMenuOpen ? { position: 'relative', zIndex: 50 } : {}) }}>
                <label htmlFor="country" className={labelClassName}>
                  Pais
                </label>
                <div className="relative" ref={countryMenuRef}>
                  <button
                    id="country"
                    type="button"
                    onClick={() => setIsCountryMenuOpen((previous) => !previous)}
                    onBlur={handleBlur("country")}
                    className={`${inputClassName} flex items-center justify-between text-left`}
                    aria-haspopup="listbox"
                    aria-expanded={isCountryMenuOpen}
                  >
                    <span className={`flex items-center gap-2 ${selectedCountry ? "text-[#e5e5e5]" : "text-[#666666]"}`}>
                      {selectedCountry ? (
                        <span
                          aria-hidden
                          className="h-4 w-6 rounded-[2px] bg-cover bg-center"
                          style={{ backgroundImage: `url(${selectedCountry.flagUrl})` }}
                        />
                      ) : (
                        <span aria-hidden>🌎</span>
                      )}
                      {selectedCountry ? selectedCountry.label : "Selecciona tu pais"}
                    </span>
                    <span aria-hidden className="text-[#9a9a9a]">
                      ▾
                    </span>
                  </button>

                  {isCountryMenuOpen ? (
                    <ul
                      role="listbox"
                      aria-label="Paises"
                      className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-[#2A2A2A] bg-[#0f0f0f] py-1 shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
                    >
                      {COUNTRY_OPTIONS.map((country) => (
                        <li key={country.value}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={form.country === country.value}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleCountrySelect(country.value)}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
                              form.country === country.value
                                ? "bg-[#1d1d1d] text-white"
                                : "text-[#d6d6d6] hover:bg-[#181818]"
                            }`}
                          >
                            <span
                              aria-hidden
                              className="h-4 w-6 rounded-[2px] bg-cover bg-center"
                              style={{ backgroundImage: `url(${country.flagUrl})` }}
                            />
                            <span>{country.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>

              <div className="register-field-enter flex flex-col gap-2" style={{ ...fieldEnterStyle(460), ...(isClubMenuOpen ? { position: 'relative', zIndex: 50 } : {}) }}>
                <label className={labelClassName}>
                  Club (opcional)
                </label>
                {isLoadingClubs ? (
                  <p className="text-sm text-[#666666]">Cargando clubes...</p>
                ) : (
                  <div ref={clubMenuRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsClubMenuOpen((previous) => !previous)}
                      className="flex h-12 w-full items-center justify-between rounded-lg border border-transparent bg-[#0f0f0f] px-4 text-sm outline-none transition-all duration-300 focus:border-[#5865f2] focus:shadow-[0_0_0_3px_rgba(88,101,242,0.22)]"
                      aria-haspopup="listbox"
                      aria-expanded={isClubMenuOpen}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {selectedClub?.logoUrl ? (
                          <ImageWithSkeleton
                            src={selectedClub.logoUrl}
                            alt={selectedClub.name}
                            width={24}
                            height={24}
                            sizes="24px"
                            className="h-6 w-6 shrink-0 rounded border border-[#2a2a2a] bg-[#181818] object-contain p-0.5"
                            unoptimized
                          />
                        ) : (
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[#2a2a2a] bg-[#181818] text-[10px] font-bold text-[#666]">
                            {selectedClub ? selectedClub.name.charAt(0).toUpperCase() : "S"}
                          </span>
                        )}
                        <span className="truncate text-left text-[#d6d6d6]">
                          {selectedClub ? selectedClub.name : "Sin club"}
                        </span>
                      </span>
                      <span aria-hidden className="text-[#9a9a9a]">
                        ▾
                      </span>
                    </button>

                    {isClubMenuOpen ? (
                      <ul
                        role="listbox"
                        aria-label="Clubes"
                        className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-[#2A2A2A] bg-[#0f0f0f] py-1 shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
                      >
                        <li>
                          <button
                            type="button"
                            role="option"
                            aria-selected={form.clubId === ""}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleClubSelect("")}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
                              form.clubId === "" ? "bg-[#1d1d1d] text-white" : "text-[#d6d6d6] hover:bg-[#181818]"
                            }`}
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[#2a2a2a] bg-[#181818] text-[10px] font-bold text-[#666]">
                              S
                            </span>
                            <span className="truncate">Sin club</span>
                          </button>
                        </li>
                        {clubs.map((club) => (
                          <li key={club.id}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={form.clubId === club.id}
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => handleClubSelect(club.id)}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
                                form.clubId === club.id
                                  ? "bg-[#1d1d1d] text-white"
                                  : "text-[#d6d6d6] hover:bg-[#181818]"
                              }`}
                            >
                              {club.logoUrl ? (
                                <ImageWithSkeleton
                                  src={club.logoUrl}
                                  alt={club.name}
                                  width={24}
                                  height={24}
                                  sizes="24px"
                                  className="h-6 w-6 shrink-0 rounded border border-[#2a2a2a] bg-[#181818] object-contain p-0.5"
                                  unoptimized
                                />
                              ) : (
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[#2a2a2a] bg-[#181818] text-[10px] font-bold text-[#666]">
                                  {club.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                              <span className="min-w-0">
                                <span className="block truncate text-sm">{club.name}</span>
                                <span className="block truncate text-xs text-[#888]">{club.place}</span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )}
                {clubsError ? <p className="text-xs text-[#fca5a5]">{clubsError}</p> : null}
              </div>

              <div className="register-field-enter flex flex-col gap-2" style={fieldEnterStyle(510)}>
                <label htmlFor="phone" className={labelClassName}>
                  Telefono
                </label>
                <div className="flex overflow-hidden rounded-lg border border-transparent bg-[#0f0f0f] transition-all duration-300 focus-within:border-[#5865f2] focus-within:shadow-[0_0_0_3px_rgba(88,101,242,0.22)]">
                  {phonePrefix ? (
                    <span className="flex h-12 select-none items-center border-r border-[#2a2a2a] bg-[#181818] px-3 text-sm font-medium text-[#9a9a9a] whitespace-nowrap">
                      {phonePrefix}
                    </span>
                  ) : null}
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    onBlur={handleBlur("phone")}
                    placeholder={phonePrefix ? "XXX XXX XXX" : "+XX XXX XXX XXX"}
                    className="h-12 w-full bg-transparent px-4 text-sm text-[#e5e5e5] placeholder:text-[#666666] outline-none"
                    autoComplete="tel-national"
                    inputMode="tel"
                  />
                </div>
                {getVisibleFieldError("phone") ? (
                  <p className="text-xs text-[#fca5a5]">{getVisibleFieldError("phone")}</p>
                ) : null}
              </div>

              <div className="register-field-enter flex flex-col gap-2" style={fieldEnterStyle(560)}>
                <label htmlFor="email" className={labelClassName}>
                  Correo electronico *
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  onBlur={handleBlur("email")}
                  placeholder="tu@email.com"
                  className={inputClassName}
                  autoComplete="email"
                  required
                />
                {getVisibleFieldError("email") ? (
                  <p className="text-xs text-[#fca5a5]">{getVisibleFieldError("email")}</p>
                ) : null}
              </div>

              <div className="register-field-enter flex flex-col gap-2" style={fieldEnterStyle(610)}>
                <label htmlFor="password" className={labelClassName}>
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange("password")}
                    onBlur={handleBlur("password")}
                    placeholder="Minimo 8 caracteres"
                    className={`${inputClassName} pr-12`}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] transition-colors hover:text-[#e5e5e5]"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-[#2a2a2a]">
                    <div
                      className={`h-full rounded-full ${passwordStrength.barWidth} ${passwordStrength.colorClassName}`}
                    />
                  </div>
                  <span className="text-xs text-[#999999]">{passwordStrength.label}</span>
                </div>
                <p className="text-xs text-[#999999]">
                  Usa al menos 8 caracteres. Mayusculas, numeros o simbolos hacen la contraseña mas fuerte.
                </p>
                {getVisibleFieldError("password") ? (
                  <p className="text-xs text-[#fca5a5]">{getVisibleFieldError("password")}</p>
                ) : null}
              </div>

              <div className="register-field-enter flex flex-col gap-2" style={fieldEnterStyle(660)}>
                <label htmlFor="confirmPassword" className={labelClassName}>
                  Confirmar contraseña *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                    placeholder="Repite tu contraseña"
                    className={`${inputClassName} pr-12`}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((previous) => !previous)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] transition-colors hover:text-[#e5e5e5]"
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar confirmacion de contraseña"
                        : "Mostrar confirmacion de contraseña"
                    }
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {getVisibleFieldError("confirmPassword") ? (
                  <p className="text-xs text-[#fca5a5]">{getVisibleFieldError("confirmPassword")}</p>
                ) : null}
              </div>

              {successMessage ? (
                <p className="register-field-enter rounded-lg border border-[#14532d] bg-[#052e16]/40 px-3 py-2 text-sm text-[#86efac]">
                  {successMessage}
                </p>
              ) : null}

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
                disabled={!canSubmit}
              >
                {isSubmitting ? "Creando cuenta..." : "Registrarse"}
              </button>

              <div
                className="register-field-enter flex items-center justify-center gap-2"
                style={fieldEnterStyle(760)}
              >
                <span className="text-sm text-[#999999]">Ya tienes cuenta?</span>
                <Link href="/login" className="text-sm font-semibold text-[#5865f2]">
                  Inicia sesion
                </Link>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

















