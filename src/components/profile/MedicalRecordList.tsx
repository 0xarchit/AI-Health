"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, FileText, Loader2, Edit2, Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export interface MedicalRecord {
  id: string;
  fileName: string;
  summary: string;
  createdAt: string;
}

import { fetchWithAuth } from "@/lib/api-client";

interface MedicalRecordListProps {
  records?: MedicalRecord[];
  onRefresh: () => void;
}

export function MedicalRecordList({
  records = [],
  onRefresh,
}: MedicalRecordListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSummary, setEditSummary] = useState("");



  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      await fetchWithAuth(`/api/medical-records?id=${id}`, {
        method: "DELETE",
      });
      onRefresh();
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
      await fetchWithAuth("/api/medical-records", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, summary: editSummary }),
      });

      setEditingId(null);
      onRefresh();
    } catch (err) {
      console.error("Failed to update record", err);
    }
  };



  if (records.length === 0) {
    return (
      <Card className="bg-transparent border-none shadow-none">
        <CardContent className="p-6 text-center text-muted-foreground">
          No medical records uploaded yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <Card
          key={record.id}
          className="bg-card/10 backdrop-blur-sm border-white/10"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              {record.fileName}
            </CardTitle>
            <div className="flex gap-1">
              {editingId === record.id ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUpdate(record.id)}
                  >
                    <Check className="w-4 h-4 text-green-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={cancelEditing}>
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEditing(record)}
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(record.id)}
                  >
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
