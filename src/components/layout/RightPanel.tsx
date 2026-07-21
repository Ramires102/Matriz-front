export default function RightPanel() {
  return (
    <aside
      className="hidden xl:block w-[310px] shrink-0 p-6 sticky top-[65px]"
      style={{
        borderLeft: "1px solid var(--border-light)",
        height: "calc(100vh - 65px)",
      }}
    >
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold tracking-[0.05em]" style={{ color: "var(--body-text)" }}>Eventos top</span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--text-35)" }}>Trending</span>
          </div>
          <div className="text-[12px] py-4 text-center" style={{ color: "var(--text-40)" }}>
            No hay eventos destacados aún.
          </div>
        </section>

        <section className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold tracking-[0.05em]" style={{ color: "var(--body-text)" }}>Tus amigos</span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--text-35)" }}>Actividad</span>
          </div>
          <div className="text-[12px] py-4 text-center" style={{ color: "var(--text-40)" }}>
            No hay actividad de amigos todavía.
          </div>
        </section>
      </div>
    </aside>
  );
}
