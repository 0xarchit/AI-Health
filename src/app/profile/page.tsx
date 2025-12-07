"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  User,
  Mail,
  Shield,
  FileText,
  Activity,
  ArrowLeft,
} from "lucide-react";
import { MedicalRecordUploader } from "@/components/profile/MedicalRecordUploader";
import { MedicalRecordList, MedicalRecord } from "@/components/profile/MedicalRecordList";
import { HealthContextEditor, HealthContext } from "@/components/profile/HealthContextEditor";
import {
  SurfacePanel,
  GlassPanel,
  NeonSeparator,
  GlowingButton,
} from "@/components/ui/design-system";
import { useCachedFetch, clearApiCache } from "@/hooks/use-fetch-cache";
import { AppLogo } from "@/components/ui/app-logo";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { useInitialLoad } from "@/hooks/use-initial-load";
import { InitialLoadingScreen } from "@/components/ui/initial-loading-screen";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import Link from "next/link";

export default function ProfilePage() {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuthStatus(true);
  const {
    data: userData,
    loading: userLoading,
    error,
  } = useCachedFetch<{ user: any }>(isAuthenticated ? "/api/user" : "");
  
  const {
    data: healthData,
    loading: healthLoading,
    refresh: refreshHealth,
  } = useCachedFetch<{ context: HealthContext }>(isAuthenticated ? "/api/health-context" : "");

  const {
    data: recordData,
    loading: recordLoading,
    refresh: refreshRecords,
  } = useCachedFetch<{ records: MedicalRecord[] }>(isAuthenticated ? "/api/medical-records" : "");

  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (userData && userData.user) {
      setUser(userData.user);
    }
  }, [userData]);



  const { isLoading: initialLoading, message: loadingMessage } = useInitialLoad([
      { key: 'auth', isLoading: authLoading, message: 'VERIFYING CREDENTIALS' },
      { key: 'user', isLoading: userLoading && !user, message: 'FETCHING USER PROFILE' },
      { key: 'health', isLoading: healthLoading && !healthData, message: 'LOADING HEALTH CONTEXT' },
      { key: 'records', isLoading: recordLoading && !recordData, message: 'RETRIEVING MEDICAL RECORDS' },
  ]);

  const handleSignOut = async () => {
    try {
      clearApiCache();
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (initialLoading) {
    return <InitialLoadingScreen message={loadingMessage} />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-6 lg:p-8 font-sans selection:bg-primary/20 relative overflow-x-hidden pb-10">
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
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

          <GlowingButton
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </GlowingButton>
        </header>

        <div className="p-8 relative overflow-hidden group bg-transparent border border-white/10 rounded-3xl shadow-sm">
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
            </div>

            <div className="text-center md:text-left space-y-2">
              <h2 className="text-4xl font-bold tracking-tighter text-foreground">
                {user.name}
              </h2>
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
              <GlowingButton
                variant="outline"
                size="sm"
                onClick={() => setIsLogoutDialogOpen(true)}
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Terminate Session
              </GlowingButton>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SurfacePanel className="p-6 md:p-8 space-y-6 bg-transparent border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Activity className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight">
                  Biological Context
                </h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  Parameters & Variables
                </p>
              </div>
            </div>
            <NeonSeparator className="my-4 opacity-30" />
            <HealthContextEditor 
              data={healthData?.context} 
              onRefresh={refreshHealth} 
            />
          </SurfacePanel>

          <SurfacePanel className="p-6 md:p-8 space-y-6 bg-transparent border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight">
                  Medical Archive
                </h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  Digital Documentation
                </p>
              </div>
            </div>
            <NeonSeparator className="my-4 opacity-30" />

            <div className="space-y-6">
              <MedicalRecordUploader
                onUploadSuccess={refreshRecords}
              />
              <MedicalRecordList 
                records={recordData?.records} 
                onRefresh={refreshRecords} 
              />
            </div>
          </SurfacePanel>
        </div>
        <ConfirmDialog 
          isOpen={isLogoutDialogOpen}
          onClose={() => setIsLogoutDialogOpen(false)}
          onConfirm={handleSignOut}
          title="Terminate Session?"
          description="Are you sure you want to log out? Your secure session will be ended."
          variant="destructive"
        />
      </div>
    </div>
  );
}
