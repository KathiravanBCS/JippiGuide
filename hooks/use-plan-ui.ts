"use client"

import { create } from "zustand"

type PlanUI = {
  open: boolean
  setOpen: (v: boolean) => void
}

export const usePlanUI = create<PlanUI>((set) => ({
  open: false,
  setOpen: (v) => set({ open: v }),
}))
