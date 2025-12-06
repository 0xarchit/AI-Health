"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Activity, Plus, X, Loader2 } from "lucide-react";

interface HealthContext {
  allergies: string[];
  conditions: string[];
  medications: string[];
  additionalNotes: string;
  gender: string;
}

import { useCachedFetch } from "@/hooks/use-fetch-cache";
import { fetchWithAuth } from "@/lib/api-client";

export function HealthContextEditor() {
  const [context, setContext] = useState<HealthContext>({
    allergies: [],
    conditions: [],
    medications: [],
    additionalNotes: "",
    gender: "male",
  });
  const [newItems, setNewItems] = useState({
    allergies: "",
    conditions: "",
    medications: "",
  });
  const [saving, setSaving] = useState(false);

  const {
    data: fetchedData,
    loading,
    refresh,
  } = useCachedFetch<{ context: HealthContext }>("/api/health-context", {
    withAuth: true,
  });

  useEffect(() => {
    if (fetchedData && fetchedData.context) {
      setContext({
        allergies: fetchedData.context.allergies || [],
        conditions: fetchedData.context.conditions || [],
        medications: fetchedData.context.medications || [],
        additionalNotes: fetchedData.context.additionalNotes || "",
        gender: fetchedData.context.gender || "male",
      });
    }
  }, [fetchedData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetchWithAuth("/api/health-context", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(context),
      });
      refresh();
    } catch (err) {
      console.error("Failed to save context", err);
    } finally {
      setSaving(false);
    }
  };

  const addItem = (field: "allergies" | "conditions" | "medications") => {
    const value = newItems[field].trim();
    if (value) {
      setContext((prev) => ({
        ...prev,
        [field]: [...prev[field], value],
      }));
      setNewItems((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const removeItem = (
    field: "allergies" | "conditions" | "medications",
    index: number
  ) => {
    setContext((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  if (loading)
    return (
      <div className="text-center p-4">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </div>
    );

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-primary" />
          Health Context
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Gender</Label>
          <RadioGroup
            value={context.gender}
            onValueChange={(val) =>
              setContext((prev) => ({ ...prev, gender: val }))
            }
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Female</Label>
            </div>
          </RadioGroup>
        </div>

        {["allergies", "conditions", "medications"].map((field) => (
          <div key={field} className="space-y-2">
            <Label className="capitalize">{field}</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {context[field as keyof HealthContext] instanceof Array &&
                (context[field as keyof HealthContext] as string[]).map(
                  (item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm"
                    >
                      {item}
                      <button
                        type="button"
                        aria-label={`Remove ${item}`}
                        title={`Remove ${item}`}
                        onClick={() => removeItem(field as any, i)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                )}
            </div>
            <div className="flex gap-2">
              <Input
                value={newItems[field as keyof typeof newItems]}
                onChange={(e) =>
                  setNewItems((prev) => ({ ...prev, [field]: e.target.value }))
                }
                placeholder={`Add ${field.slice(0, -1)}...`}
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem(field as any);
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => addItem(field as any)}
                className="h-8"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}

        <div className="space-y-2">
          <label className="text-sm font-medium">Additional Notes</label>
          <textarea
            className="w-full min-h-[100px] p-3 rounded-md border bg-background"
            value={context.additionalNotes}
            onChange={(e) =>
              setContext((prev) => ({
                ...prev,
                additionalNotes: e.target.value,
              }))
            }
            placeholder="Any other health details..."
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}
