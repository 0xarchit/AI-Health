"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, FileText, Loader2, Edit2, Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface MedicalRecord {
  id: string;
  fileName: string;
  summary: string;
  createdAt: string;
}

export function MedicalRecordList({ refreshTrigger }: { refreshTrigger: number }) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSummary, setEditSummary] = useState("");

  const fetchRecords = useCallback(async () => {
    try {
      const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
      if (!refreshRes.ok) return;
      const { token } = await refreshRes.json();

      const res = await fetch("/api/medical-records", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.records) setRecords(data.records);
    } catch (err) {
      console.error("Failed to fetch records", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    
    try {
      const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
      const { token } = await refreshRes.json();

      await fetch(`/api/medical-records?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRecords();
    } catch (err) {
      console.error("Failed to delete record", err);
    }
  };

  const startEditing = (record: MedicalRecord) => {
    setEditingId(record.id);
    setEditSummary(record.summary);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditSummary("");
  };

  const handleUpdate = async (id: string) => {
    try {
      const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
      const { token } = await refreshRes.json();

      await fetch("/api/medical-records", {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id, summary: editSummary }),
      });
      
      setEditingId(null);
      fetchRecords();
    } catch (err) {
      console.error("Failed to update record", err);
    }
  };

  if (loading) return <div className="text-center p-4"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No medical records uploaded yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <Card key={record.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              {record.fileName}
            </CardTitle>
            <div className="flex gap-1">
              {editingId === record.id ? (
                <>
                  <Button variant="ghost" size="icon" onClick={() => handleUpdate(record.id)}>
                    <Check className="w-4 h-4 text-green-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={cancelEditing}>
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="icon" onClick={() => startEditing(record)}>
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(record.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editingId === record.id ? (
              <Textarea 
                value={editSummary} 
                onChange={(e) => setEditSummary(e.target.value)} 
                className="min-h-[100px]"
              />
            ) : (
              <p className="text-sm text-muted-foreground">{record.summary}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Uploaded on {new Date(record.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
