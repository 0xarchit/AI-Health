"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Utensils, Activity, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
        <Card className="overflow-hidden border-primary/20 shadow-lg">
          <div className="relative h-48 bg-muted">
            {preview && (
              <img 
                src={preview} 
                alt="Food preview" 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
            <div className="absolute bottom-4 left-6">
              <h2 className="text-3xl font-bold text-foreground">{result.food_name}</h2>
              <p className="text-muted-foreground">{result.description}</p>
            </div>
          </div>
          
          <CardContent className="p-6 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-primary/5 p-4 rounded-xl text-center border border-primary/10">
                <div className="text-2xl font-bold text-primary">{result.nutrition.calories}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Calories</div>
              </div>
              <div className="bg-blue-500/5 p-4 rounded-xl text-center border border-blue-500/10">
                <div className="text-2xl font-bold text-blue-500">{result.nutrition.protein}g</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Protein</div>
              </div>
              <div className="bg-orange-500/5 p-4 rounded-xl text-center border border-orange-500/10">
                <div className="text-2xl font-bold text-orange-500">{result.nutrition.carbs}g</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Carbs</div>
              </div>
              <div className="bg-green-500/5 p-4 rounded-xl text-center border border-green-500/10">
                <div className="text-2xl font-bold text-green-500">{result.nutrition.fat}g</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Fats</div>
              </div>
              {result.nutrition.sugar !== undefined && (
                <div className="bg-pink-500/5 p-4 rounded-xl text-center border border-pink-500/10">
                  <div className="text-2xl font-bold text-pink-500">{result.nutrition.sugar}g</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Sugar</div>
                </div>
              )}
              {result.nutrition.sodium !== undefined && (
                <div className="bg-purple-500/5 p-4 rounded-xl text-center border border-purple-500/10">
                  <div className="text-2xl font-bold text-purple-500">{result.nutrition.sodium}mg</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Sodium</div>
                </div>
              )}
              {result.nutrition.fiber !== undefined && (
                <div className="bg-emerald-500/5 p-4 rounded-xl text-center border border-emerald-500/10">
                  <div className="text-2xl font-bold text-emerald-500">{result.nutrition.fiber}g</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Fiber</div>
                </div>
              )}
            </div>

            {result.ingredients && result.ingredients.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-lg">
                  <Utensils className="w-5 h-5 text-primary" /> Ingredients
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.ingredients.map((ing: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium border">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
               <h3 className="font-semibold flex items-center gap-2 text-lg">
                 <Activity className="w-5 h-5 text-primary" /> Health Assessment
               </h3>
               <div className="bg-muted/30 p-4 rounded-xl border">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-primary">Verdict:</span>
                    <span className="font-medium">{result.health_assessment}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">Confidence:</span>
                    <span className="font-medium">{(result.confidence_score * 100).toFixed(0)}%</span>
                 </div>
               </div>
            </div>

            {result.affected_organs && result.affected_organs.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-primary" /> Body Impact
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.affected_organs.map((organ: any, i: number) => (
                    <div key={i} className="bg-card p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold capitalize flex items-center gap-2">
                          {organ.organ}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                          organ.risk === 'High' ? 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900' : 
                          organ.risk === 'Moderate' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-900' : 
                          'bg-green-500/10 text-green-600 border-green-200 dark:border-green-900'
                        }`}>
                          {organ.risk} Risk
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {organ.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.warnings && result.warnings.length > 0 && (
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                <h4 className="font-semibold text-yellow-600 dark:text-yellow-500 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> Warnings
                </h4>
                <ul className="space-y-2">
                  {result.warnings.map((warning: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
