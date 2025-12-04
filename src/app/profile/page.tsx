"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Mail, Shield, FileText, Activity } from "lucide-react";
import { MedicalRecordUploader } from "@/components/profile/MedicalRecordUploader";
import { MedicalRecordList } from "@/components/profile/MedicalRecordList";
import { HealthContextEditor } from "@/components/profile/HealthContextEditor";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/user")
      .then((res) => {
        if (res.status === 401) {
          router.push("/");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Failed to fetch user:", err))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-muted/30 rounded-xl border">
              <div className="relative">
                {user.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-24 h-24 rounded-full border-4 border-background shadow-sm object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary border-4 border-background shadow-sm">
                    {user.name?.[0] || "U"}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-background" title="Active" />
              </div>
              
              <div className="text-center md:text-left space-y-1">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full w-fit mx-auto md:mx-0 mt-2">
                  <Shield className="w-3 h-3" />
                  Authenticated via Google
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <HealthContextEditor />
              </div>
              <div className="space-y-6">
                <MedicalRecordUploader onUploadSuccess={() => setRefreshTrigger(prev => prev + 1)} />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Medical Records
                  </h3>
                  <MedicalRecordList refreshTrigger={refreshTrigger} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Account Actions</h3>
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="w-full sm:w-auto gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
