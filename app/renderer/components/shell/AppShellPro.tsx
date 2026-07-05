import Sidebar from "./Sidebar";
import TopCommandBar from "./TopCommandBar";

export default function AppShellPro(props: any) {
  return (
    <div className="relative flex h-screen overflow-hidden knoux-app-shell">
      <Sidebar activeTab={props.activeTab} setActiveTab={props.setActiveTab} collapsed={props.collapsed} setCollapsed={props.setCollapsed} privacyMode={props.privacyMode} language={props.language} />
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden knoux-window">
        <TopCommandBar activeTab={props.activeTab} setActiveTab={props.setActiveTab} privacyMode={props.privacyMode} setPrivacyMode={props.setPrivacyMode} searchQuery={props.searchQuery} setSearchQuery={props.setSearchQuery} onRefresh={props.onRefresh} isRefreshing={props.isRefreshing} themeMode={props.themeMode} setThemeMode={props.setThemeMode} />
        <main className="flex-1 overflow-y-auto">{props.children}</main>
      </div>
    </div>
  );
}
