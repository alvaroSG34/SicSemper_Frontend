import Link from "next/link";

const navItems = ["Inicio", "Acerca de", "Agenda", "Equipo", "Contacto"] as const;

export function LandingHeader() {
  return (
    <header className="h-[90px] w-full bg-[rgba(26,26,26,0.6)]">
      <div className="mx-auto flex h-full w-full max-w-[1686px] items-center px-[120px]">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#ff6b9d_0%,#ff8fab_100%)]">
            <span className="text-base font-bold text-white">▼</span>
          </div>
          <span className="text-[22px] font-bold tracking-[-0.5px] text-white">
            SicSemper
          </span>
        </div>

        <nav className="ml-[315px] flex items-center gap-[50px]">
          {navItems.map((item, index) => (
            <span
              key={item}
              className={`text-[15px] font-medium ${index === 0 ? "text-white" : "text-[#b0b0b0]"}`}
            >
              {item}
            </span>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-[5px]">
          <Link
            href="/login"
            className="flex h-11 w-[130px] items-center justify-center rounded-[22px] border border-white text-[12px] font-bold tracking-[0.5px] text-white"
          >
            INICIAR SESIÓN
          </Link>
          <Link
            href="/register"
            className="flex h-11 w-[140px] items-center justify-center rounded-[22px] border border-white text-[12px] font-bold tracking-[0.5px] text-white"
          >
            REGISTRARSE
          </Link>
        </div>
      </div>
    </header>
  );
}
