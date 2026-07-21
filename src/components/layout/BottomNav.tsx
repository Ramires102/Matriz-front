import { HomeIcon, SearchIcon, UsersIcon } from "@/components/ui/Icons";

interface BottomNavProps {
  onMenuToggle: () => void;
  onDrawerToggle: () => void;
}

export default function BottomNav({ onMenuToggle, onDrawerToggle }: BottomNavProps) {
  return (
    <div
      className="bottom-nav fixed bottom-0 left-0 right-0 h-[60px] hidden items-center justify-around px-3 z-[190] backdrop-blur-[10px]"
      style={{
        background: "var(--header-bg)",
        borderTop: "1px solid var(--header-border)",
      }}
    >
      <button
        className="flex flex-col items-center justify-center gap-1 bg-transparent border-none cursor-pointer px-4 py-2 rounded-xl transition-all"
        style={{ color: "var(--text-40)" }}
      >
        <HomeIcon size={20} />
      </button>
      <button
        className="flex flex-col items-center justify-center gap-1 bg-transparent border-none cursor-pointer px-4 py-2 rounded-xl transition-all"
        style={{ color: "var(--text-40)" }}
        onClick={onMenuToggle}
      >
        <SearchIcon size={20} />
      </button>
      <button
        className="flex flex-col items-center justify-center gap-1 bg-transparent border-none cursor-pointer px-4 py-2 rounded-xl transition-all"
        style={{ color: "var(--text-40)" }}
        onClick={onDrawerToggle}
      >
        <UsersIcon size={20} />
      </button>
    </div>
  );
}
