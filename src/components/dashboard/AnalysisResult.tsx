"use client";

import {
  Utensils,
  Activity,
  AlertCircle,
  Info,
  Check,
  Droplets,
  Flame,
  Wheat,
  Dumbbell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SurfacePanel,
  GlassPanel,
  NeonSeparator,
} from "@/components/ui/design-system";
import { cn } from "@/lib/utils";

interface AnalysisResultProps {
  result: any;
  preview: string | null;
}

export function AnalysisResult({ result, preview }: AnalysisResultProps) {
  if (!result) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        <SurfacePanel className="overflow-hidden border-primary/20 shadow-2xl bg-card/80 backdrop-blur-sm">
          <div className="relative h-64 md:h-80 w-full overflow-hidden group">
            {preview && (
              <img
                src={preview}
                alt="Specimen Analysis"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}

            <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay" />
            <div className="absolute inset-0 border-[3px] border-emerald-500/50 rounded-xl pointer-events-none z-10" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)] animate-scan-line z-20 opacity-50" />

            <div className="absolute top-4 right-4 rotate-12 opacity-80 z-20">
              <div className="border-[3px] border-emerald-500 p-1 rounded-lg bg-emerald-500/20 backdrop-blur-sm">
                <div className="border border-emerald-500 rounded px-3 py-1 bg-emerald-950/50">
                  <span className="text-xs font-black tracking-widest text-emerald-400">
                    SCANNED
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20 backdrop-blur-md">
                  Analysis Complete
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-2 drop-shadow-lg">
                {result.food_name}
              </h2>
              <p className="text-lg text-muted-foreground/90 max-w-2xl leading-relaxed italic border-l-2 border-primary/50 pl-4">
                &ldquo;{result.description}&rdquo;
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MacroGuage
                label="Calories"
                value={result.nutrition.calories}
                unit="kcal"
                icon={<Flame className="w-4 h-4" />}
                color="text-primary"
                fillColor="bg-primary"
                max={800}
              />
              <MacroGuage
                label="Protein"
                value={result.nutrition.protein}
                unit="g"
                icon={<Dumbbell className="w-4 h-4" />}
                color="text-blue-500"
                fillColor="bg-blue-500"
                max={50}
              />
              <MacroGuage
                label="Carbs"
                value={result.nutrition.carbs}
                unit="g"
                icon={<Wheat className="w-4 h-4" />}
                color="text-orange-500"
                fillColor="bg-orange-500"
                max={100}
              />
              <MacroGuage
                label="Fats"
                value={result.nutrition.fat}
                unit="g"
                icon={<Droplets className="w-4 h-4" />}
                color="text-green-500"
                fillColor="bg-green-500"
                max={40}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-secondary/20 p-4 rounded-2xl border border-secondary/30">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-2">
                Micros:
              </span>
              {result.nutrition.sugar !== undefined && (
                <MicroBadge
                  label="Sugar"
                  value={`${result.nutrition.sugar}g`}
                  color="text-pink-500"
                />
              )}
              <div className="h-4 w-px bg-white/10" />
              {result.nutrition.sodium !== undefined && (
                <MicroBadge
                  label="Sodium"
                  value={`${result.nutrition.sodium}mg`}
                  color="text-purple-500"
                />
              )}
              <div className="h-4 w-px bg-white/10" />
              {result.nutrition.fiber !== undefined && (
                <MicroBadge
                  label="Fiber"
                  value={`${result.nutrition.fiber}g`}
                  color="text-emerald-500"
                />
              )}
            </div>

            <NeonSeparator className="opacity-40" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold mb-4">
                    <Activity className="w-5 h-5 text-accent animate-pulse-slow" />
                    Analysis Verdict
                  </h3>
                  <GlassPanel className="p-5 border-l-4 border-l-accent bg-accent/5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-accent mb-1">
                          Health Grade
                        </h4>
                        <p className="text-lg font-medium leading-tight mb-2 text-foreground/90">
                          {result.health_assessment}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-accent/20">
                          {(result.confidence_score * 100).toFixed(0)}%
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-accent/60">
                          Confidence
                        </div>
                      </div>
                    </div>
                  </GlassPanel>
                </div>

                {result.warnings && result.warnings.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-destructive uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4" /> Risk Factors
                    </h4>
                    <div className="space-y-2">
                      {result.warnings.map((warning: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive-foreground/90"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0 animate-pulse" />
                          {warning}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.affected_organs &&
                  result.affected_organs.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Info className="w-4 h-4" /> Systemic Impact
                      </h4>
                      <div className="grid gap-3">
                        {result.affected_organs.map((organ: any, i: number) => (
                          <div
                            key={i}
                            className="group flex items-start gap-4 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-colors"
                          >
                            <div
                              className={cn(
                                "w-2 h-12 rounded-full shrink-0",
                                organ.risk === "High"
                                  ? "bg-destructive"
                                  : organ.risk === "Moderate"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              )}
                            />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold capitalize">
                                  {organ.organ}
                                </span>
                                <span
                                  className={cn(
                                    "text-[10px] uppercase px-1.5 py-0.5 rounded border font-semibold",
                                    organ.risk === "High"
                                      ? "text-destructive border-destructive/30"
                                      : organ.risk === "Moderate"
                                      ? "text-yellow-500 border-yellow-500/30"
                                      : "text-green-500 border-green-500/30"
                                  )}
                                >
                                  {organ.risk}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {organ.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <Utensils className="w-5 h-5 text-primary" />
                  Composition
                </h3>
                {result.ingredients && result.ingredients.length > 0 ? (
                  <div className="flex flex-wrap gap-2 content-start">
                    {result.ingredients.map((ing: string, i: number) => (
                      <div
                        key={i}
                        className="px-3 py-1.5 rounded-lg bg-secondary/30 border border-white/5 text-sm font-medium hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-all cursor-default"
                      >
                        {ing}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm italic">
                    No specific ingredients detected.
                  </p>
                )}

                <div className="mt-8 p-4 rounded-xl bg-black/20 border border-white/5 font-mono text-[10px] text-primary/40 break-all leading-tight opacity-50 select-none">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="mb-1">
                      {Math.random().toString(36).substring(2)}{" "}
                      {Math.random().toString(16).substring(2)} :{" "}
                      {Math.random().toString(2).substring(2)}
                    </div>
                  ))}
                  <div className="text-center mt-2 text-primary/60 tracking-[0.5em]">
                    --- END OF REPORT ---
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SurfacePanel>
      </motion.div>
    </AnimatePresence>
  );
}

function MacroGuage({ label, value, unit, icon, color, fillColor, max }: any) {
  const valNum = parseFloat(value) || 0;
  const percent = Math.min((valNum / max) * 100, 100);

  return (
    <div className="relative p-4 rounded-2xl bg-secondary/10 border border-border/50 flex flex-col justify-between overflow-hidden group hover:bg-secondary/20 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className={cn("p-1.5 rounded-md bg-background/50", color)}>
          {icon}
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black tracking-tight">{value}</span>
          <span className="text-xs font-medium text-muted-foreground">
            {unit}
          </span>
        </div>

        <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              fillColor
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div
        className={cn(
          "absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity",
          fillColor
        )}
      />
    </div>
  );
}

function MicroBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-bold", color)}>{value}</span>
    </div>
  );
}
