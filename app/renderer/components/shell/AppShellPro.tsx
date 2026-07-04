import Sidebar from "./Sidebar";

export default function AppShellPro(props: any) {
  return (
    <div>
      <Sidebar activeTab={props.activeTab} setActiveTab={props.setActiveTab} collapsed={props.collapsed} setCollapsed={props.setCollapsed} privacyMode={false} language={props.language} />
      <main>{props.children}</main>
    </div>
  );
}
