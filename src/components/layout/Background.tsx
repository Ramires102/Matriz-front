export default function Background() {
  return (
    <>
      <div className="fixed left-[-200px] top-[-200px] h-[500px] w-[500px] rounded-full bg-violet-700/20 blur-[90px] pointer-events-none z-0" />
      <div className="fixed right-[-250px] bottom-[-250px] h-[600px] w-[600px] rounded-full bg-fuchsia-600/10 blur-[90px] pointer-events-none z-0" />
    </>
  );
}
