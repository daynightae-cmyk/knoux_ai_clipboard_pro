import React from "react";

interface State { hasError: boolean; message: string; }

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false, message: "" };
  static getDerivedStateFromError(error: Error) { return { hasError: true, message: error.message || "Runtime error" }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error("KNOUX runtime error", error, info); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#fcfaff",fontFamily:"system-ui"}}>
        <div style={{maxWidth:620,padding:28,borderRadius:28,background:"white",boxShadow:"0 20px 80px rgba(124,58,237,.18)",border:"1px solid rgba(124,58,237,.15)"}}>
          <div style={{fontSize:12,fontWeight:900,color:"#8b2cff",letterSpacing:1,textTransform:"uppercase"}}>KNOUX Recovery Console</div>
          <h1 style={{fontSize:28,margin:"12px 0",color:"#1f1633"}}>Runtime protection is active.</h1>
          <p style={{fontSize:13,lineHeight:1.7,color:"#756b8f"}}>A page error was caught instead of showing a blank screen. Reload after updating the deployment.</p>
          <pre style={{whiteSpace:"pre-wrap",fontSize:12,background:"#f7f2ff",padding:12,borderRadius:14,color:"#4c1d95"}}>{this.state.message}</pre>
          <button onClick={() => window.location.reload()} style={{height:42,padding:"0 18px",borderRadius:14,border:0,background:"#8b2cff",color:"white",fontWeight:800,cursor:"pointer"}}>Reload Workspace</button>
        </div>
      </div>
    );
  }
}
