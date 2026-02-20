import Link from "next/link";
import { AutoPublicHeader } from "@/presentation/components/layout";

const inputClassName =
  "h-12 w-full rounded-lg border border-transparent bg-[#0f0f0f] px-4 text-sm text-[#e5e5e5] placeholder:text-[#666666] outline-none transition-all duration-300 focus:border-[#5865f2] focus:shadow-[0_0_0_3px_rgba(88,101,242,0.22)]";

const labelClassName = "text-sm font-semibold text-[#e5e5e5]";
const fieldEnterStyle = (delay: number) => ({ animationDelay: `${delay}ms` });

export default function RegisterPage() {
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

          <form className="register-form-enter w-full rounded-3xl bg-[#1a1a1a] p-6 md:p-12">
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
                  placeholder="Ingresa tu nombre completo"
                  className={inputClassName}
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
                  <input id="ci" type="text" placeholder="12345678" className={inputClassName} />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="city" className={labelClassName}>
                    Ciudad *
                  </label>
                  <input id="city" type="text" placeholder="Tu ciudad" className={inputClassName} />
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
                  placeholder="DD/MM/AAAA"
                  className={inputClassName}
                />
              </div>

              <div
                className="register-field-enter flex flex-col gap-2"
                style={fieldEnterStyle(410)}
              >
                <label htmlFor="country" className={labelClassName}>
                  País *
                </label>
                <select id="country" className={inputClassName} defaultValue="">
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
                  placeholder="+XX XXX XXX XXX"
                  className={inputClassName}
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
                  placeholder="tu@email.com"
                  className={inputClassName}
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
                  placeholder="••••••••"
                  className={inputClassName}
                />
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-[#2a2a2a]">
                    <div className="h-full w-2/3 rounded-full bg-[#5865f2]" />
                  </div>
                  <span className="text-xs text-[#999999]">Fortaleza media</span>
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
                  placeholder="••••••••"
                  className={inputClassName}
                />
              </div>

              <button
                type="submit"
                className="register-field-enter mt-1 h-14 w-full rounded-xl bg-[#5865f2] text-base font-bold text-white transition-all duration-300 hover:-translate-y-[2px] hover:bg-[#4f5be0] hover:shadow-[0_12px_24px_rgba(88,101,242,0.35)] active:translate-y-0"
                style={fieldEnterStyle(710)}
              >
                Registrarse
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
