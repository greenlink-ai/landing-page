"use client"

import { useState } from "react"
import { Calculator, ChevronDown } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import type { Dictionary } from "@/lib/get-dictionary"

interface PricingCalculatorProps {
  baseRate: number
  configName: string
  billingDiscount: number
  billingName: string
  isReserved: boolean
  dict: Dictionary["pricing"]
  variant: "instance" | "cluster"
  isCustomMode?: boolean
  selectedCustomId?: string
  onCustomIdChange?: (id: string) => void
}

export function PricingCalculator({
  baseRate,
  configName,
  billingDiscount,
  billingName,
  isReserved,
  dict,
  variant,
  isCustomMode = false,
  selectedCustomId = "gpu-2",
  onCustomIdChange,
}: PricingCalculatorProps) {
  const isCluster = variant === "cluster"
  const defaultStorage = isCluster ? 1000 : 500
  const maxStorage = isCluster ? 10000 : 2000
  const storageStep = isCluster ? 100 : 50
  const storageMaxLabel = isCluster
    ? dict.calculator.clusterStorageMax
    : dict.calculator.storageMax

  const [hours, setHours] = useState(200)
  const [storage, setStorage] = useState(defaultStorage)

  const effectiveHours = isReserved ? 730 : hours
  const baseGpuCost = baseRate * effectiveHours
  const discountedGpuCost = baseGpuCost * (1 - billingDiscount)
  const storageCost = storage * dict.rates.storageGbMonth
  const totalCost = discountedGpuCost + storageCost
  const savings = baseGpuCost - discountedGpuCost

  const reservedNote = isCluster
    ? dict.calculator.reservedClusterNote
    : dict.calculator.reservedInstanceNote

  const { migSlices, multiGpu } = dict.rates.customOptions
  const allCustomOptions = [...migSlices, ...multiGpu]
  const selectedOption = allCustomOptions.find((o) => o.id === selectedCustomId)

  return (
    <div
      className="rounded-2xl border border-primary/20 bg-card/50 p-6 backdrop-blur-sm lg:p-8"
      style={{ boxShadow: "0 0 40px 0 rgba(16, 185, 129, 0.1)" }}
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/5">
          <Calculator className="size-5 text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          {dict.calculator.title}
        </h3>
      </div>

      <div className="space-y-8">
        {/* Custom config selector (custom instance mode only) */}
        {isCustomMode && onCustomIdChange && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">
              {dict.calculator.customConfig}
            </label>
            <div className="relative">
              <select
                value={selectedCustomId}
                onChange={(e) => onCustomIdChange(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[rgba(255,255,255,0.06)] bg-background/50 px-4 py-3 pr-10 text-sm font-medium text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                <optgroup label={dict.calculator.migSlicesGroup}>
                  {migSlices.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} — {opt.vram} VRAM
                    </option>
                  ))}
                </optgroup>
                <optgroup label={dict.calculator.multiGpuGroup}>
                  {multiGpu.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} — {opt.vram} VRAM
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            </div>
            {selectedOption && (
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="rounded-full bg-secondary px-2 py-1">
                  {selectedOption.cpus} {dict.cpuUnit}
                </span>
                <span className="rounded-full bg-secondary px-2 py-1">
                  {selectedOption.ram}GB {dict.ramUnit}
                </span>
                <span className="rounded-full bg-secondary px-2 py-1">
                  {selectedOption.nvme}GB {dict.nvmeUnit}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Hours slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label
              className={`text-sm font-medium ${isReserved ? "text-muted-foreground/50" : "text-muted-foreground"}`}
            >
              {dict.calculator.hours}
            </label>
            <span
              className={`text-lg font-semibold ${isReserved ? "text-foreground/50" : "text-foreground"}`}
            >
              {isReserved ? dict.calculator.hoursFixed : `${hours}h`}
            </span>
          </div>
          <Slider
            value={[isReserved ? 730 : hours]}
            onValueChange={(v) => !isReserved && setHours(v[0])}
            min={10}
            max={730}
            step={10}
            disabled={isReserved}
            className={`w-full ${isReserved ? "opacity-50 cursor-not-allowed" : ""}`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{dict.calculator.sliderMin}</span>
            <span>{dict.calculator.sliderMax}</span>
          </div>
          {isReserved && (
            <p className="text-xs text-primary">{reservedNote}</p>
          )}
        </div>

        {/* Storage slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground">
              {dict.calculator.storage}
            </label>
            <span className="text-lg font-semibold text-foreground">
              {storage}GB
            </span>
          </div>
          <Slider
            value={[storage]}
            onValueChange={(v) => setStorage(v[0])}
            min={0}
            max={maxStorage}
            step={storageStep}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{dict.calculator.storageMin}</span>
            <span>{storageMaxLabel}</span>
          </div>
        </div>

        {/* Cost breakdown */}
        <div className="space-y-3 border-t border-border pt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {dict.calculator.compute} ({configName})
            </span>
            <span className="text-foreground">
              {discountedGpuCost.toFixed(2).replace(".", ",")}€
            </span>
          </div>
          {savings > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-primary">
                {dict.calculator.savings} ({billingName})
              </span>
              <span className="text-primary">
                -{savings.toFixed(2).replace(".", ",")}€
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {dict.calculator.storageNvme}
            </span>
            <span className="text-foreground">
              {storageCost.toFixed(2).replace(".", ",")}€
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="rounded-xl bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {dict.calculator.estimate}
            </span>
            <div className="text-right">
              <span className="text-3xl font-bold text-primary">
                {totalCost.toFixed(2).replace(".", ",")}€
              </span>
              <span className="ml-1 text-sm text-muted-foreground">
                {dict.perMonth}
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25">
          {dict.calculator.cta}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          {dict.calculator.disclaimer}
        </p>
      </div>
    </div>
  )
}
