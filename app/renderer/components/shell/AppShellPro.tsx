import Sidebar from "./Sidebar";

export default function AppShellPro(props: any) {
  return (
    <div className="relative flex h-screen overflow-hidden knoux-app-shell">
      <Sidebar activeTab={props.activeTab} setActiveTab={props.setActiveTab} collapsed={props.collapsed} setCollapsed={props.setCollapsed} privacyMode={false} language={props.language} />
      <main className="relative z-10 flex-1 overflow-y-auto bg-white">{props.children}</main>
    </div>
  );
}
