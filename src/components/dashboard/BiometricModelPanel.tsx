import { Button } from "@/components/ui/button";
import { Activity, Trash2, Box, Download } from "lucide-react";
import HumanModel from "@/components/3d/HumanModel";

interface BiometricModelPanelProps {
  modelUrl: string | null;
  deleteModel: () => void;
  result: any;
  gender: "male" | "female";
  serverStatus: any;
  setHasSkippedModel: (skipped: boolean) => void;
}

export function BiometricModelPanel({
  modelUrl,
  deleteModel,
  result,
  gender,
  serverStatus,
  setHasSkippedModel,
}: BiometricModelPanelProps) {
  return (
    <div className="min-h-[600px] flex flex-col relative overflow-visible border border-primary/10 bg-transparent rounded-3xl shadow-sm">
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-50" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent opacity-30" />

      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
            Biometric Projection
          </span>
        </div>
        {modelUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors hidden lg:flex"
            onClick={() => {
              if (confirm("Purge 3D model data?")) deleteModel();
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      <div className="flex-1 relative min-h-[500px] flex items-center justify-center">
        {modelUrl ? (
          <>
            <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
            <HumanModel
              affectedOrgans={result?.affected_organs || []}
              modelUrl={modelUrl}
              hasAnalyzed={!!result}
              gender={gender}
              serverStatus={serverStatus}
            />
          </>
        ) : (
          <div className="text-center p-8 space-y-4 max-w-[280px]">
            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto border border-white/5">
              <Box className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <p className="text-sm text-muted-foreground">
              Biometric model offline.
              <br />
              Please download to visualize organic impact.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHasSkippedModel(false)}
              className="text-xs border-primary/30 text-primary hover:bg-primary/10"
            >
              <Download className="w-3.5 h-3.5 mr-2" />
              Initialize Download
            </Button>
          </div>
        )}
      </div>

      {result && (
        <div className="p-4 border-t border-white/5 bg-background/40 backdrop-blur-md">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">
              Analysis Confidence
            </span>
            <span className="text-primary font-mono">
              {(result.confidence_score * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-1 w-full bg-secondary mt-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${result.confidence_score * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
