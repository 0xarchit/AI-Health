"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, User, Mail, Shield, FileText, Activity, ArrowLeft } from "lucide-react";
import { MedicalRecordUploader } from "@/components/profile/MedicalRecordUploader";
import { MedicalRecordList } from "@/components/profile/MedicalRecordList";
import { HealthContextEditor } from "@/components/profile/HealthContextEditor";
import { SurfacePanel, GlassPanel, NeonSeparator, GlowingButton } from "@/components/ui/design-system";
import { AtmosphericBackground } from "@/components/ui/atmospheric-background";
import { useCachedFetch, clearApiCache } from "@/hooks/use-fetch-cache";
import { AppLogo } from "@/components/ui/app-logo";
import { useAuthStatus } from "@/hooks/use-auth-status";
import Link from "next/link";

export default function ProfilePage() {
  const { isAuthenticated } = useAuthStatus(true);
  const { data: userData, loading: userLoading, error } = useCachedFetch<{ user: any }>(isAuthenticated ? "/api/user" : "");
  const [user, setUser] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (userData && userData.user) {
      setUser(userData.user);
    }
  }, [userData]);

  const loading = userLoading && !user; 

  const handleSignOut = async () => {
    try {
      clearApiCache();
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <AtmosphericBackground />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-primary font-mono text-sm animate-pulse">AUTHENTICATING...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 font-sans selection:bg-primary/20 relative overflow-hidden">
      <AtmosphericBackground />
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        


        {}
        <header className="flex items-center justify-between pb-6 border-b border-border/40">
          <div className="flex items-center gap-6">
             <Link href="/">
               <AppLogo />
             </Link>
             <div className="hidden md:block w-px h-8 bg-border/50" />
             <div>
               <h1 className="text-xl font-bold tracking-tight text-foreground">
                 Subject Profile
               </h1>
             </div>
          </div>

          <GlowingButton variant="outline" size="sm" onClick={() => router.push("/dashboard")} className="gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors">
             <ArrowLeft className="w-4 h-4" />
             <span className="hidden sm:inline">Back to Dashboard</span>
             <span className="sm:hidden">Back</span>
          </GlowingButton>
        </header>

        {}
        <GlassPanel className="p-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-3 opacity-30 group-hover:opacity-100 transition-opacity">
              <Shield className="w-24 h-24 text-primary rotate-12 -translate-y-8 translate-x-8" />
           </div>
           
           <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="relative">
                 <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary to-accent opacity-50 blur-md group-hover:opacity-80 transition-opacity" />
                 {user.picture ? (
                   <img 
                     src={user.picture} 
                     alt={user.name} 
                     className="relative w-32 h-32 rounded-full border-2 border-background object-cover shadow-2xl"
                   />
                 ) : (
                   <div className="relative w-32 h-32 rounded-full bg-background flex items-center justify-center text-4xl font-bold text-primary border-2 border-primary/20">
                     {user.name?.[0] || "U"}
                   </div>
                 )}
                 <div className="absolute bottom-1 right-1 w-6 h-6 bg-primary rounded-full border-4 border-background animate-pulse" title="Online" />
              </div>
              
              <div className="text-center md:text-left space-y-2">
                <h2 className="text-4xl font-bold tracking-tighter text-foreground">{user.name}</h2>
                <div className="flex flex-col md:flex-row items-center gap-4 text-muted-foreground">
                   <div className="flex items-center gap-2">
                     <Mail className="w-4 h-4 text-accent" />
                     <span>{user.email}</span>
                   </div>
                   <span className="hidden md:block text-white/10">|</span>
                   <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                     <Shield className="w-3 h-3" />
                     Verified Subject
                   </div>
                </div>
              </div>
              
              <div className="md:ml-auto">
                 <GlowingButton variant="outline" size="sm" onClick={handleSignOut} className="border-destructive/30 text-destructive hover:bg-destructive/10">
                   <LogOut className="w-4 h-4 mr-2" />
                   Terminate Session
                 </GlowingButton>
              </div>
           </div>
        </GlassPanel>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {}
          <SurfacePanel className="p-6 md:p-8 space-y-6">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-accent/10 rounded-lg">
                   <Activity className="w-5 h-5 text-accent" />
                </div>
                <div>
                   <h3 className="text-lg font-bold tracking-tight">Biological Context</h3>
                   <p className="text-xs text-muted-foreground uppercase tracking-widest">Parameters & Variables</p>
                </div>
             </div>
             <NeonSeparator className="my-4 opacity-30" />
             <HealthContextEditor />
          </SurfacePanel>

          {}
          <SurfacePanel className="p-6 md:p-8 space-y-6">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                   <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                   <h3 className="text-lg font-bold tracking-tight">Medical Archive</h3>
                   <p className="text-xs text-muted-foreground uppercase tracking-widest">Digital Documentation</p>
                </div>
             </div>
             <NeonSeparator className="my-4 opacity-30" />
             
             <div className="space-y-6">
               <MedicalRecordUploader onUploadSuccess={() => setRefreshTrigger(prev => prev + 1)} />
               <MedicalRecordList refreshTrigger={refreshTrigger} />
             </div>
          </SurfacePanel>
        </div>
      </div>
    </div>
  );
}
