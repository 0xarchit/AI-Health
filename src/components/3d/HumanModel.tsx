"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF, Stage } from "@react-three/drei";
import * as THREE from "three";
import { Suspense } from "react";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";

interface AffectedOrgan {
  organ: string;
  risk: string;
  description: string;
}

const ORGAN_MAPPING: Record<string, string[]> = {
  heart: [
    "vh_m_heart",
    "vh_m_heart_valve",
    "vh_m_mitral_valve",
    "vh_m_tricuspid_valve",
    "vh_m_aortic_valve",
    "vh_m_pulmonary_valve",
    "vh_m_papillary_muscle_of_heart",
    "vh_m_cardiac_chamber",
    "vh_m_left_cardiac_atrium",
    "vh_m_right_cardiac_atrium",
    "vh_m_heart_right_ventricle",
    "vh_m_heart_left_ventricle",
    "vh_m_interventricular_septum",

    "vh_f_heart",
    "vh_f_heart_valve",
    "vh_f_mitral_valve",
    "vh_f_tricuspid_valve",
    "vh_f_aortic_valve",
    "vh_f_pulmonary_valve",
    "vh_f_papillary_muscle_of_heart",
    "vh_f_cardiac_chamber",
    "vh_f_left_cardiac_atrium",
    "vh_f_right_cardiac_atrium",
    "vh_f_heart_right_ventricle",
    "vh_f_heart_left_ventricle",
    "vh_f_interventricular_septum",
  ],
  liver: ["vh_m_liver", "vh_f_liver"],
  stomach: ["stomach", "gastric"],
  kidney: [
    "vh_m_kidney",
    "vh_m_renal_pelvis",
    "vh_m_major_calyx",
    "vh_m_minor_calyx",
    "vh_m_renal_pyramid",
    "vh_m_renal_papilla",
    "vh_m_renal_medulla",
    "vh_m_cortex_of_kidney",
    "vh_m_renal_column",
    "vh_m_ureter",

    "vh_f_kidney",
    "vh_f_renal_pelvis",
    "vh_f_major_calyx",
    "vh_f_minor_calyx",
    "vh_f_renal_pyramid",
    "vh_f_renal_papilla",
    "vh_f_renal_medulla",
    "vh_f_cortex_of_kidney",
    "vh_f_renal_column",
    "vh_f_ureter",
  ],
  large_intestine: [
    "vh_m_colon",
    "vh_m_rectal",
    "vh_m_caecum",
    "vh_m_sigmoid",
    "vh_m_intestine", 
    "vh_f_colon",
    "vh_f_rectal",
    "vh_f_caecum",
    "vh_f_sigmoid",
    "vh_f_intestine",
  ],
  small_intestine: [
    "vh_m_ileum",
    "vh_m_jejunum",
    "vh_m_duodenum",
    "vh_f_ileum",
    "vh_f_jejunum",
    "vh_f_duodenum",
  ],
  brain: ["brain", "cerebral", "cerebellum", "lobe", "skull", "head"],
  lungs: [
    "vh_m_lungs",
    "vh_m_hilum",
    "vh_m_bronchi",
    "vh_m_bronchus",
    "vh_m_trachea",
    "vh_m_larynx",
    "vh_m_bronchopulmonary_segment",
    "vh_m_lobar_bronchus",

    "vh_f_lungs",
    "vh_f_hilum",
    "vh_f_bronchi",
    "vh_f_bronchus",
    "vh_f_trachea",
    "vh_f_larynx",
    "vh_f_bronchopulmonary_segment",
    "vh_f_lobar_bronchus",
  ],
  pancreas: ["vh_m_pancreas", "vh_f_pancreas"],
  spleen: ["vh_m_spleen", "vh_f_spleen"],
  gallbladder: ["vh_m_gallbladder", "vh_f_gallbladder"],
  bladder: [
    "vh_m_urinary_bladder",
    "vh_m_urethra",
    "vh_f_urinary_bladder",
    "vh_f_urethra",
  ],
  thyroid: ["vh_m_thyroid", "vh_f_thyroid"],
  uterus: ["vh_f_uterus"],
  ovary: ["vh_f_ovary"],
  eye: [
    "vh_m_eye",
    "vh_m_ocular",
    "vh_m_retinal",
    "vh_m_optic",
    "vh_f_eye",
    "vh_f_ocular",
    "vh_f_retinal",
    "vh_f_optic",
  ],
  bone: [
    "vh_m_bone",
    "vh_m_femur",
    "vh_m_tibia",
    "vh_m_fibula",
    "vh_m_humerus",
    "vh_m_radius",
    "vh_m_ulna",
    "vh_m_rib",
    "vh_m_vertebra",
    "vh_m_skull",
    "vh_m_pelvis",
    "vh_m_spine",
    "vh_m_skeletal",
    "vh_m_sacrum",
    "vh_m_coccyx",
    "vh_m_sternum",
    "vh_m_scapula",
    "vh_m_clavicle",
    "vh_m_patella",
    "vh_m_ilium",
    "vh_m_ischium",
    "vh_m_pubis",
    "vh_m_hyoid",
    "vh_f_bone",
    "vh_f_femur",
    "vh_f_tibia",
    "vh_f_fibula",
    "vh_f_humerus",
    "vh_f_radius",
    "vh_f_ulna",
    "vh_f_rib",
    "vh_f_vertebra",
    "vh_f_skull",
    "vh_f_pelvis",
    "vh_f_spine",
    "vh_f_skeletal",
    "vh_f_sacrum",
    "vh_f_coccyx",
    "vh_f_sternum",
    "vh_f_scapula",
    "vh_f_clavicle",
    "vh_f_patella",
    "vh_f_ilium",
    "vh_f_ischium",
    "vh_f_pubis",
    "vh_f_hyoid",
  ],
  muscle: ["muscle", "muscular"],
  skin: ["skin", "dermis"],
  blood: ["vein", "artery", "vascular", "vessel", "aorta", "vena_cava"],
};

const Model = ({
  affectedOrgans,
  modelUrl,
  gender,
  selectedOrgan,
}: {
  affectedOrgans: AffectedOrgan[];
  modelUrl: string;
  gender: "male" | "female";
  selectedOrgan: string | null;
}) => {
  const { scene, nodes } = useGLTF(modelUrl);
  const [tooltip, setTooltip] = useState<{
    data: any;
    position: THREE.Vector3;
  } | null>(null);
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme;

  useEffect(() => {
    if (nodes) {
      console.log(`Loaded ${gender} GLB Nodes:`, Object.keys(nodes));
    }
  }, [nodes, gender]);

  const materials = useMemo(() => {
    const glass = new THREE.MeshStandardMaterial({
      color: theme === "dark" ? "#94a3b8" : "#cbd5e1",
      opacity: 0.3,
      transparent: true,
      roughness: 0.2,
      metalness: 0.8,
      side: THREE.DoubleSide,
    });

    const bone = new THREE.MeshStandardMaterial({
      color: theme === "dark" ? "#cbd5e1" : "#f1f5f9",
      opacity: 0.8,
      transparent: true,
      roughness: 0.5,
      side: THREE.DoubleSide,
    });

    const createHighlight = (color: string, transparent: boolean = false) => new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: transparent ? 0.5 : 1.5, 
      roughness: 0.2,
      metalness: 0.5,
      transparent: transparent || false,
      opacity: transparent ? 0.2 : 1, 
      side: THREE.DoubleSide,
    });

    return { 
      glass, 
      bone, 
      highlightHigh: createHighlight("#ef4444"), 
      highlightMod: createHighlight("#eab308"), 
      highlightLow: createHighlight("#22c55e"),
      
      highlightHighTrans: createHighlight("#ef4444", true),
      highlightModTrans: createHighlight("#eab308", true),
      highlightLowTrans: createHighlight("#22c55e", true),
   };
  }, [theme]);

  useMemo(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const nodeName = child.name.toLowerCase();

        if (!child.userData.originalRaycast) {
          child.userData.originalRaycast = child.raycast;
        }

        const affected = affectedOrgans.find((a) => {
          let organKey = a.organ.toLowerCase().trim();

          if (organKey === "kidneys") organKey = "kidney";
          if (organKey === "lungs") organKey = "lungs";
          if (organKey === "arteries" || organKey === "veins")
            organKey = "blood";
          
          
          organKey = organKey.replace(" ", "_");

          if (nodeName.includes(organKey)) return true;

          const keywords = ORGAN_MAPPING[organKey];
          if (keywords) {
            return keywords.some((k) => nodeName.includes(k));
          }
          return false;
        });

        
        let shouldHighlight = false;
        if (affected) {
            if (selectedOrgan) {
                
                 if (affected.organ === selectedOrgan) {
                     shouldHighlight = true;
                 }
            } else {
                
                shouldHighlight = true;
            }
        }

        if (affected && shouldHighlight) {
          const isSkin = affected.organ.toLowerCase() === "skin";
          const hasOtherOrgans = affectedOrgans.length > 1; 

          
          
          
          const useTransparent = !selectedOrgan && isSkin && hasOtherOrgans;

          if (affected.risk.toLowerCase() === "high") {
            child.material = useTransparent ? materials.highlightHighTrans : materials.highlightHigh;
          } else if (affected.risk.toLowerCase() === "moderate") {
            child.material = useTransparent ? materials.highlightModTrans : materials.highlightMod;
          } else {
            child.material = useTransparent ? materials.highlightLowTrans : materials.highlightLow;
          }

          child.userData.isAffected = true;
          child.userData.organName = affected.organ;
          child.userData.risk = affected.risk;
          child.userData.description = affected.description;

          child.raycast = child.userData.originalRaycast;
        } else {
          
          
          

          if (
            nodeName.includes("bone") ||
            nodeName.includes("vertebra") ||
            nodeName.includes("rib") ||
            nodeName.includes("skull") ||
            nodeName.includes("pelvis") ||
            nodeName.includes("sternum") ||
            nodeName.includes("scapula") ||
            nodeName.includes("clavicle")
          ) {
            child.material = materials.bone;
          } else {
            child.material = materials.glass;
          }
          
          child.userData.isAffected = false;
          
          child.raycast = () => null;
        }
      }
    });
  }, [scene, affectedOrgans, materials, selectedOrgan]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.isAffected) {
        if (child.material instanceof THREE.MeshStandardMaterial && child.material.opacity > 0.5) {
            
            child.material.emissiveIntensity = 1.5 + Math.sin(t * 3) * 0.5;
        }
      }
    });
  });

  return (
    <>
      <Stage
        environment={theme === "dark" ? "city" : "studio"}
        intensity={0.5}
        adjustCamera={false}
        shadows={false}
      >
        <primitive
          object={scene}
          onPointerOver={(e: any) => {
            e.stopPropagation();
            if (e.object.userData.isAffected) {
              setTooltip({
                data: e.object.userData,
                position: e.point.clone(),
              });
            }
          }}
          onPointerOut={(e: any) => {
            setTooltip(null);
          }}
        />
      </Stage>

      {tooltip && (
        <Html
          position={tooltip.position}
          style={{ pointerEvents: "none", zIndex: 100 }}
        >
          <div
            className={`
            w-48 p-3 rounded-lg shadow-xl border backdrop-blur-md transform -translate-x-1/2 -translate-y-full mb-4
            ${
              tooltip.data.risk?.toLowerCase() === "high"
                ? "bg-red-950/90 border-red-500 text-red-100"
                : tooltip.data.risk?.toLowerCase() === "moderate"
                ? "bg-yellow-950/90 border-yellow-500 text-yellow-100"
                : "bg-green-950/90 border-green-500 text-green-100"
            }
          `}
          >
            <h4 className="font-bold text-[10px] uppercase tracking-wider mb-1">
              {tooltip.data.organName}
            </h4>
            <div className="text-[9px] font-bold mb-1 opacity-90">
              Risk: {tooltip.data.risk}
            </div>
            <p className="text-[9px] opacity-80 leading-tight">
              {tooltip.data.description}
            </p>
          </div>
        </Html>
      )}
    </>
  );
};

interface HumanModelProps {
  affectedOrgans: AffectedOrgan[];
  modelUrl: string;
  hasAnalyzed?: boolean;
  gender?: "male" | "female";
  serverStatus?: "checking" | "available" | "unavailable";
}

export default function HumanModel({
  affectedOrgans = [],
  modelUrl,
  hasAnalyzed = false,
  gender = "male",
  serverStatus = "available",
}: HumanModelProps) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme;
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);

  
  useEffect(() => {
    setSelectedOrgan(null);
  }, [affectedOrgans]);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full h-[600px] rounded-xl overflow-hidden border border-border bg-transparent shadow-2xl relative transition-colors duration-500">
        <div className="absolute top-4 left-4 z-10">
          <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
            <span
              className={`w-2 h-2 rounded-full ${
                !hasAnalyzed
                  ? "bg-muted-foreground"
                  : affectedOrgans.length === 0
                  ? "bg-green-500"
                  : "bg-red-500"
              } animate-pulse`}
            ></span>
            Body Impact Analysis ({gender === "male" ? "Male" : "Female"})
          </h3>
          <p className="text-muted-foreground text-xs">
            Interactive 3D Visualization
          </p>
        </div>

        {!hasAnalyzed && serverStatus === "available" && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none w-full px-4">
            <div className="backdrop-blur-sm border border-border px-6 py-4 rounded-xl text-center shadow-lg bg-background/80">
              <h3 className="font-bold text-xl mb-1 flex items-center justify-center gap-2 text-foreground">
                <span>👆</span> Select Food to Begin
              </h3>
              <p className="text-muted-foreground text-sm">
                Upload or select a food item to see its impact.
              </p>
            </div>
          </div>
        )}

        {serverStatus === "unavailable" && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none w-full px-4">
            <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 px-6 py-4 rounded-xl text-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <h3 className="text-red-400 font-bold text-xl mb-1 flex items-center justify-center gap-2">
                <span>⚠️</span> Server Unavailable
              </h3>
              <p className="text-red-200/70 text-sm">
                The 3D model server is currently down. Please try again later.
              </p>
            </div>
          </div>
        )}

        {hasAnalyzed && affectedOrgans.length === 0 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none w-full px-4">
            <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/30 px-6 py-4 rounded-xl text-center shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <h3 className="text-green-400 font-bold text-xl mb-1 flex items-center justify-center gap-2">
                <span>✅</span> No Negative Impact
              </h3>
              <p className="text-green-200/70 text-sm">
                This food is healthy for your body!
              </p>
            </div>
          </div>
        )}

        
        {hasAnalyzed && affectedOrgans.length > 0 && (
          <div className="hidden md:flex absolute top-16 right-4 z-30 flex-col gap-2 bg-background/50 backdrop-blur-md p-2 rounded-lg border border-border/50 max-h-[400px] overflow-y-auto">
            <h4 className="text-[10px] uppercase font-bold text-muted-foreground mb-1 px-1">
              Affected Organs
            </h4>

            <button
              onClick={() => setSelectedOrgan(null)}
              className={`text-xs px-3 py-1.5 rounded-md transition-all text-left flex items-center justify-between group ${
                selectedOrgan === null
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-accent/50 text-foreground"
              }`}
            >
              <span>Unknown/All</span>
              <span className="text-[10px] opacity-70 bg-black/20 px-1.5 rounded-full">
                {affectedOrgans.length}
              </span>
            </button>

            <div className="h-px bg-border/50 my-1"></div>

            {affectedOrgans.map((organ, idx) => (
              <button
                key={`${organ.organ}-${idx}`}
                onClick={() => setSelectedOrgan(organ.organ)}
                className={`text-xs px-3 py-1.5 rounded-md transition-all text-left flex items-center justify-between group ${
                  selectedOrgan === organ.organ
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-accent/50 text-foreground"
                }`}
              >
                <span className="capitalize">{organ.organ}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    organ.risk.toLowerCase() === "high"
                      ? "bg-red-500"
                      : organ.risk.toLowerCase() === "moderate"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                ></span>
              </button>
            ))}
          </div>
        )}

        
        <div className="absolute bottom-4 left-4 z-10 flex gap-2 flex-wrap max-w-[80%]">
          <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded text-[10px] text-white">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> High
          </div>
          <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded text-[10px] text-white">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Mod
          </div>
          <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded text-[10px] text-white">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Low
          </div>
        </div>

        <Canvas
          camera={{ position: [0, 0, 2.5], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
        >
          <Suspense
            fallback={
              <Html center>
                <div className="text-foreground text-sm">Loading 3D Model...</div>
              </Html>
            }
          >
            <Model
              affectedOrgans={affectedOrgans}
              modelUrl={modelUrl}
              gender={gender}
              selectedOrgan={selectedOrgan}
            />

            <OrbitControls
              makeDefault
              enableZoom={true}
              enablePan={true}
              enableDamping={true}
              dampingFactor={0.05}
              minPolarAngle={0}
              maxPolarAngle={Math.PI}
              autoRotate={affectedOrgans.length === 0}
              autoRotateSpeed={0.5}
              rotateSpeed={0.5}
              zoomSpeed={0.5}
              panSpeed={0.5}
              touches={{
                ONE: THREE.TOUCH.ROTATE,
                TWO: THREE.TOUCH.DOLLY_PAN,
              }}
            />
          </Suspense>
        </Canvas>
      </div>

      
      {hasAnalyzed && affectedOrgans.length > 0 && (
        <div className="md:hidden grid grid-cols-2 gap-2 bg-background/50 p-2 rounded-lg border border-border/50">
          <div className="col-span-2">
            <h4 className="text-[10px] uppercase font-bold text-muted-foreground mb-1 px-1">
              Affected Organs
            </h4>
          </div>

          <button
            onClick={() => setSelectedOrgan(null)}
            className={`text-xs px-3 py-2 rounded-md transition-all text-left flex items-center justify-between group ${
              selectedOrgan === null
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-background border border-border hover:bg-accent/50 text-foreground"
            }`}
          >
            <span>Unknown/All</span>
            <span className="text-[10px] opacity-70 bg-black/20 px-1.5 rounded-full">
              {affectedOrgans.length}
            </span>
          </button>

          {affectedOrgans.map((organ, idx) => (
            <button
              key={`${organ.organ}-${idx}`}
              onClick={() => setSelectedOrgan(organ.organ)}
              className={`text-xs px-3 py-2 rounded-md transition-all text-left flex items-center justify-between group ${
                selectedOrgan === organ.organ
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-background border border-border hover:bg-accent/50 text-foreground"
              }`}
            >
              <span className="capitalize truncate flex-1 mr-2">{organ.organ}</span>
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  organ.risk.toLowerCase() === "high"
                    ? "bg-red-500"
                    : organ.risk.toLowerCase() === "moderate"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              ></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
