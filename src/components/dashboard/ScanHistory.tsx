import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Image as ImageIcon, Check, RefreshCcw } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  onRefresh: () => void;
}

export function ScanHistory({ history, onSelectScan, onClearHistory, onRefresh }: ScanHistoryProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <>
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="w-5 h-5 text-muted-foreground" />
          Recent Scans
        </CardTitle>
        <div className="flex items-center gap-2">
           <Button 
             variant="ghost" 
             size="sm" 
             onClick={onRefresh}
             className="text-xs text-muted-foreground hover:text-primary h-8 gap-1"
           >
             <RefreshCcw className="w-3 h-3" />
             Refresh
           </Button>
           {history.length > 0 && (
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => setShowClearConfirm(true)}
               className="text-xs text-muted-foreground hover:text-destructive h-8"
             >
               Clear
             </Button>
           )}
        </div>
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
              <div className="relative group/image">
                <div className="bg-primary/10 p-0.5 rounded-md overflow-hidden w-12 h-12 flex-shrink-0 flex items-center justify-center border-2 border-emerald-500/50 group-hover:border-emerald-500 transition-colors relative">
                  {scan.imageUrl ? (
                    <>
                      <img src={scan.imageUrl} alt={scan.foodName} className="w-full h-full object-cover rounded-[3px]" />
                      <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay" />
                    </>
                  ) : (
                    <ImageIcon className="w-6 h-6 text-primary" />
                  )}
                </div>
                
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-background flex items-center justify-center z-10">
                   <Check className="w-2 h-2 text-white" />
                </div>
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

    <ConfirmDialog 
      isOpen={showClearConfirm}
      onClose={() => setShowClearConfirm(false)}
      onConfirm={onClearHistory}
      title="Clear Scan History?"
      description="This action cannot be undone. This will permanently delete your scan history and associated data."
      variant="destructive"
    />
    </>
  );
}
