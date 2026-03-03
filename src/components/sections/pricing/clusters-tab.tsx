"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Clock, Sparkles, Zap } from "lucide-react"
import type { Dictionary } from "@/lib/get-dictionary"
import { containerVariants, itemVariants, EXIT_ANIMATION } from "./constants"
import { PricingCalculator } from "./pricing-calculator"
import { CustomRequestForm } from "./custom-request-form"

interface ClustersTabProps {
  dict: Dictionary["pricing"]
}

export function ClustersTab({ dict }: ClustersTabProps) {
  const [selectedCluster, setSelectedCluster] = useState("cluster-120")
  const [billing, setBilling] = useState("ondemand")
  const [reservedPeriod, setReservedPeriod] = useState("month")

  const discounts = dict.rates.discounts

  const billingModes = [
    { id: "ondemand", name: dict.billingModes.onDemand.name, icon: Clock },
    {
      id: "spot",
      name: dict.billingModes.spot.name,
      icon: Sparkles,
      label: dict.billingModes.spot.label,
    },
    { id: "reserved", name: dict.billingModes.reserved.name, icon: Zap },
  ]

  const reservedOptions = [
    { id: "week", ...dict.reservedOptions.week, discount: discounts.reserved.week },
    { id: "month", ...dict.reservedOptions.month, discount: discounts.reserved.month },
    { id: "year", ...dict.reservedOptions.year, discount: discounts.reserved.year },
  ]

  const customOption = {
    id: "custom-cluster",
    name: dict.customize,
    vram: dict.customClusterVram,
    description: dict.customClusterDescription,
  }

  const getDiscount = (): number => {
    if (billing === "spot") return discounts.spot
    if (billing === "reserved") {
      return reservedOptions.find((r) => r.id === reservedPeriod)?.discount || 0
    }
    return 0
  }

  const getBillingName = (): string => {
    if (billing === "spot") return dict.billingModes.spot.name
    if (billing === "reserved") {
      const opt = reservedOptions.find((r) => r.id === reservedPeriod)
      return `Reserved ${opt?.name || ""}`
    }
    return dict.billingModes.onDemand.name
  }

  const currentCluster = dict.clusters.find((c) => c.id === selectedCluster)
  const isCustom = selectedCluster === "custom-cluster"

  return (
    <motion.div
      key="clusters"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={EXIT_ANIMATION}
      className="grid gap-8 lg:grid-cols-2"
    >
      {/* Left: Cluster selection */}
      <motion.div variants={itemVariants} className="space-y-6">
        {/* Cluster Type Selection */}
        <div className="space-y-4">
          <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {dict.clusterConfig}
          </label>
          <div className="grid gap-3">
            {/* Standard clusters from dict */}
            {dict.clusters.map((config) => (
              <button
                key={config.id}
                onClick={() => setSelectedCluster(config.id)}
                className={`group relative rounded-xl border p-4 text-left transition-all duration-300 ${
                  selectedCluster === config.id
                    ? "border-primary bg-primary/5"
                    : "border-[rgba(255,255,255,0.06)] bg-card/50 hover:border-primary/30 hover:bg-card/80"
                } ${config.recommended ? "ring-1 ring-primary/50" : ""}`}
                style={
                  selectedCluster === config.id
                    ? { boxShadow: "0 0 20px 0 rgba(16, 185, 129, 0.15)" }
                    : undefined
                }
              >
                {config.recommended && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">
                    {dict.popular}
                  </span>
                )}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">
                        {config.name}
                      </h4>
                      <span className="text-xs text-primary">{config.vram}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {config.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-secondary px-2 py-0.5">
                        {dict.clusterSpecs.network}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary">
                      {(config.gpuCount * dict.rates.gpuHourly)
                        .toFixed(2)
                        .replace(".", ",")}
                      €
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {dict.perHour}
                    </span>
                  </div>
                </div>
              </button>
            ))}

            {/* Custom cluster option */}
            <button
              onClick={() => setSelectedCluster("custom-cluster")}
              className={`group relative rounded-xl border p-4 text-left transition-all duration-300 ${
                isCustom
                  ? "border-primary bg-primary/5"
                  : "border-[rgba(255,255,255,0.06)] bg-card/50 hover:border-primary/30 hover:bg-card/80"
              }`}
              style={
                isCustom
                  ? { boxShadow: "0 0 20px 0 rgba(16, 185, 129, 0.15)" }
                  : undefined
              }
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">
                      {customOption.name}
                    </h4>
                    <span className="text-xs text-primary">
                      {customOption.vram}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {customOption.description}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Billing Mode (only if not custom) */}
        {!isCustom && (
          <>
            <div className="space-y-4">
              <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {dict.billingMode}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {billingModes.map((mode) => {
                  const Icon = mode.icon
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setBilling(mode.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all duration-300 ${
                        billing === mode.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-[rgba(255,255,255,0.06)] bg-card/50 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <Icon className="size-4" strokeWidth={1.5} />
                      <span className="text-xs font-medium">{mode.name}</span>
                      {"label" in mode && mode.label && (
                        <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          {mode.label}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Reserved Period */}
            {billing === "reserved" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {dict.reservedPeriod}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {reservedOptions.map((period) => (
                    <button
                      key={period.id}
                      onClick={() => setReservedPeriod(period.id)}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-3 transition-all duration-300 ${
                        reservedPeriod === period.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-[rgba(255,255,255,0.06)] bg-card/50 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <span className="text-xs font-medium">{period.name}</span>
                      <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        {period.label}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      {/* Right: Calculator or Custom Form */}
      <motion.div variants={itemVariants}>
        {isCustom ? (
          <CustomRequestForm dict={dict} />
        ) : (
          currentCluster && (
            <PricingCalculator
              baseRate={currentCluster.gpuCount * dict.rates.gpuHourly}
              configName={currentCluster.name}
              billingDiscount={getDiscount()}
              billingName={getBillingName()}
              isReserved={billing === "reserved"}
              dict={dict}
              variant="cluster"
            />
          )
        )}
      </motion.div>
    </motion.div>
  )
}
