"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Image as ImageIcon } from "lucide-react";

interface Scan {
  id: string;
  foodName: string;
  nutritionJson: string;
  createdAt: string;
  imageUrl?: string | null;
}

interface ScanHistoryProps {
  history: Scan[];
  onSelectScan: (scan: Scan) => void;
  onClearHistory: () => Promise<void>;
}

export function ScanHistory({ history, onSelectScan, onClearHistory }: ScanHistoryProps) {
  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="w-5 h-5 text-muted-foreground" />
          Recent Scans
        </CardTitle>
        {history.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={async () => {
              if (confirm("Are you sure you want to clear your scan history?")) {
                await onClearHistory();
              }
            }} 
            className="text-xs text-muted-foreground hover:text-destructive h-8"
          >
            Clear
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No scans yet.</p>
        ) : (
          history.map((scan) => (
            <div 
              key={scan.id} 
              onClick={() => onSelectScan(scan)}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border cursor-pointer active:scale-[0.98]"
            >
              <div className="bg-primary/10 p-2 rounded-md overflow-hidden w-12 h-12 flex-shrink-0 flex items-center justify-center">
                {scan.imageUrl ? (
                  <img src={scan.imageUrl} alt={scan.foodName} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{scan.foodName}</p>
                <p className="text-xs text-muted-foreground">{new Date(scan.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
