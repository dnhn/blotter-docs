import type { Material } from "blotter.ts";
import {
  ChannelSplitMaterial,
  FliesMaterial,
  LiquidDistortMaterial,
  RollingDistortMaterial,
  SlidingDoorMaterial,
} from "blotter.ts/materials";
import type { MaterialClassName } from "@/data/materials";

/** Client-side lookup from the metadata's class name to the constructor. */
export const MATERIAL_CLASSES: Record<MaterialClassName, new () => Material> = {
  ChannelSplitMaterial,
  FliesMaterial,
  LiquidDistortMaterial,
  RollingDistortMaterial,
  SlidingDoorMaterial,
};
