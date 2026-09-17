import React from 'react';
import { CalculatedMetrics } from '../utils/calculations';
import { SiteData, ViewTab } from '../types';
import { getMonthlyApsVolumes } from '../utils/apsSchedule';

interface SummaryCardsProps {
  metrics: CalculatedMetrics;
  apsDemandDL?: number;
  hrActualDL?: number;
  selectedYear?: number;
  selectedMonth?: number;
  currentSite?: SiteData;
  activeTab?: ViewTab;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  metrics,
  apsDemandDL,
  hrActualDL,
  selectedYear = 2026,
  selectedMonth = 9,
  currentSite,
  activeTab = 'overview',
}) => {
  const displayDemand = apsDemandDL !== undefined ? apsDemandDL : metrics.totalDL;
  const displayActual = hrActualDL !== undefined ? hrActualDL : Math.round(metrics.totalDL * 0.98);
  const displayGap = displayActual - displayDemand;
  const hasDeficit = displayGap < 0;

  // Visibility rules per user requirement:
  // 0. Do not display top blocks in IE STANDARD page (Monthly APS Total Demand, SMT Monthly Volume, CPU Monthly Volume)
  if (activeTab === 'ie_forecast') {
    return null;
  }

  // 1. "HR COST CENTER PAID HEADCOUNT" is not shown in IE STANDARD & APS DEMAND pages, only in EXECUTIVE OVERVIEW & HR ACTUAL
  const showHrPaidCard = activeTab === 'overview' || activeTab === 'hr_actual';

  // 2. "NET Manpower GAP" is not shown in IE STANDARD, APS DEMAND, or HR ACTUAL, only in EXECUTIVE OVERVIEW
  const showNetGapCard = activeTab === 'overview';

  // 3. SMT & CPU volume cards: shown independently on the right in APS DEMAND (hidden in IE STANDARD)
  const showSmtCpuCards = activeTab === 'aps_demand';

  // 4. "Monthly APS Demand Total" card is hidden in APS DEMAND and IE STANDARD
  const showApsTotalDemandCard = activeTab !== 'aps_demand' && activeTab !== 'ie_forecast';

  // Total Workforce: DL + IDL
  const totalIDL = metrics?.totalIDL ?? 0;
  const totalWorkforce = displayDemand + totalIDL;
  const onlineDL = metrics?.totalOnlineDL ?? metrics?.manufacturingOnlineDlSum ?? Math.round(displayDemand * 0.85);
  const offlineDL = metrics?.totalOfflineDL ?? metrics?.manufacturingOfflineDlSum ?? Math.max(0, displayDemand - onlineDL);

  // DL & IDL percentages and ratio
  const dlPercent = totalWorkforce > 0 ? Math.round((displayDemand / totalWorkforce) * 100) : 0;
  const idlPercent = 100 - dlPercent;
  const ratioVal = totalIDL > 0 ? (displayDemand / totalIDL).toFixed(1) : '0.0';
  const ratioStr = `${ratioVal} : 1`;

  // HR Payroll Total Workforce & DL/IDL
  const hrActualIDL = currentSite?.actualHrIDL !== undefined ? currentSite.actualHrIDL : metrics.totalIDL;
  const totalHrHeadcount = displayActual + hrActualIDL;
  const hrDlPercent = totalHrHeadcount > 0 ? Math.round((displayActual / totalHrHeadcount) * 100) : 0;
  const hrIdlPercent = 100 - hrDlPercent;
  const hrRatioVal = hrActualIDL > 0 ? (displayActual / hrActualIDL).toFixed(1) : '0.0';
  const hrRatioStr = `${hrRatioVal} : 1`;

  // APS SMT & CPU Production Volumes
  const volumes = React.useMemo(() => {
    return getMonthlyApsVolumes(currentSite as SiteData, selectedMonth);
  }, [currentSite, selectedMonth]);

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const monthLabel = monthNames[selectedMonth - 1] || `M${selectedMonth}`;

  // Dynamically configure grid columns based on active visible cards
  const visibleCardsCount =
    (showApsTotalDemandCard ? 1 : 0) +
    (showSmtCpuCards ? 2 : 0) +
    (showHrPaidCard ? 1 : 0) +
    (showNetGapCard ? 1 : 0);

  if (visibleCardsCount === 0) {
    return null;
  }

  const gridColsClass =
    visibleCardsCount === 3
      ? 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 select-none'
      : visibleCardsCount === 2
      ? 'grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 select-none'
      : visibleCardsCount === 1
      ? 'grid grid-cols-1 gap-6 mb-8 select-none'
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 select-none';

  return (
    <div className={gridColsClass}>
      {/* Card 1: Monthly APS Demand Total (DL + IDL) */}
      {showApsTotalDemandCard && (
        <div className="bg-[#1C1D22] border border-[#524437]/60 p-5 rounded-lg flex flex-col justify-between relative overflow-hidden group hover:border-[#ffb86b]/50 transition-all shadow-lg">
        {/* Top: Monthly APS Total Demand (DL + IDL) */}
        <div className="min-h-[58px]">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#ffb86b] uppercase tracking-wider block">
                  Monthly APS Demand Total
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-['JetBrains_Mono'] font-bold bg-[#ffb86b]/15 text-[#ffb86b] border border-[#ffb86b]/30">
                  DL + IDL
                </span>
              </div>
              <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/70 mt-0.5 block">
                {monthLabel} {selectedYear} Scheduled Total Workforce
              </span>
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="font-['JetBrains_Mono'] text-3xl sm:text-4xl font-extrabold text-[#ffb86b] tracking-tight">
                  {totalWorkforce.toLocaleString()}
                </span>
                <span className="text-xs font-['JetBrains_Mono'] text-[#ffb86b]/90 font-semibold">HC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: DL & IDL breakdown */}
        <div className="pt-3 border-t border-[#524437]/40 space-y-2.5">
          {/* 1. DL and IDL values and ratio */}
          <div className="min-h-[38px] flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs font-['JetBrains_Mono'] mb-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[#ffb86b]">
                  <span className="w-2 h-2 rounded-full bg-[#ffb86b]" />
                  DL: <strong className="font-bold text-white">{displayDemand.toLocaleString()}</strong> HC
                  <span className="text-[10px] text-[#ffb86b]/80">({dlPercent}%)</span>
                </span>
                <span className="text-[#524437]">•</span>
                <span className="inline-flex items-center gap-1 text-[#5de6ff]">
                  <span className="w-2 h-2 rounded-full bg-[#5de6ff]" />
                  IDL: <strong className="font-bold text-white">{totalIDL.toLocaleString()}</strong> HC
                  <span className="text-[10px] text-[#5de6ff]/80">({idlPercent}%)</span>
                </span>
              </div>
              <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/80 bg-[#131316] px-1.5 py-0.5 rounded border border-[#524437]/40">
                DL/IDL Ratio: <strong className="text-[#4edea3]">{ratioStr}</strong>
              </span>
            </div>

            {/* DL vs IDL Progress Bar */}
            <div className="w-full h-1.5 rounded-full overflow-hidden bg-[#131316] flex border border-[#524437]/30">
              <div
                className="h-full bg-[#ffb86b] transition-all duration-300"
                style={{ width: `${dlPercent}%` }}
                title={`DL: ${displayDemand.toLocaleString()} HC (${dlPercent}%)`}
              />
              <div
                className="h-full bg-[#5de6ff] transition-all duration-300"
                style={{ width: `${idlPercent}%` }}
                title={`IDL: ${totalIDL.toLocaleString()} HC (${idlPercent}%)`}
              />
            </div>
          </div>

          {/* 2. Breakdown or SMT & CPU planned output */}
          {activeTab === 'overview' ? (
            <div className="grid grid-cols-2 gap-2 pt-0.5 text-[11px] font-['JetBrains_Mono']">
              {/* SMT Forecast Output */}
              <div className="bg-[#131316]/90 rounded p-2 border border-[#38bdf8]/30 hover:border-[#38bdf8]/60 transition-all flex flex-col justify-between h-[74px]">
                <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                  <span className="flex items-center gap-1 font-semibold text-[#38bdf8]">
                    <span className="material-symbols-outlined text-xs">memory</span>
                    SMT Forecast Vol
                  </span>
                  <span className="px-1 py-0.2 rounded text-[9px] bg-[#38bdf8]/15 text-[#38bdf8] font-bold border border-[#38bdf8]/30">
                    APS
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-['JetBrains_Mono'] text-base font-extrabold text-[#38bdf8]">
                    {(volumes?.smtVolume ?? 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#38bdf8]/80 font-semibold">pcs</span>
                </div>
                <div className="text-[9px] text-[#d7c3b2]/60 flex justify-between items-center">
                  <span>Daily (22D):</span>
                  <span className="text-white font-medium">
                    {Math.round((volumes?.smtVolume ?? 0) / 22).toLocaleString()} pcs/day
                  </span>
                </div>
              </div>

              {/* CPU Forecast Output */}
              <div className="bg-[#131316]/90 rounded p-2 border border-[#a78bfa]/30 hover:border-[#a78bfa]/60 transition-all flex flex-col justify-between h-[74px]">
                <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                  <span className="flex items-center gap-1 font-semibold text-[#a78bfa]">
                    <span className="material-symbols-outlined text-xs">developer_board</span>
                    CPU Forecast Vol
                  </span>
                  <span className="px-1 py-0.2 rounded text-[9px] bg-[#a78bfa]/15 text-[#a78bfa] font-bold border border-[#a78bfa]/30">
                    APS
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-['JetBrains_Mono'] text-base font-extrabold text-[#a78bfa]">
                    {(volumes?.cpuVolume ?? 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#a78bfa]/80 font-semibold">pcs</span>
                </div>
                <div className="text-[9px] text-[#d7c3b2]/60 flex justify-between items-center">
                  <span>Daily (22D):</span>
                  <span className="text-white font-medium">
                    {Math.round((volumes?.cpuVolume ?? 0) / 22).toLocaleString()} pcs/day
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 pt-0.5 text-[11px] font-['JetBrains_Mono']">
              <div className="bg-[#131316]/80 rounded p-2 border border-[#524437]/30 flex flex-col justify-between h-[74px]">
                <div className="flex justify-between items-center text-[#d7c3b2]/60 text-[10px]">
                  <span className="flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-xs">precision_manufacturing</span>
                    Line Direct DL
                  </span>
                  <span className="text-[9px] text-[#ffb86b]/70">Line</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-['JetBrains_Mono'] text-base font-bold text-white">
                    {(onlineDL ?? 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#ffb86b]/80 font-medium">HC</span>
                </div>
                <div className="text-[9px] text-[#d7c3b2]/50 flex justify-between items-center">
                  <span>Share:</span>
                  <span className="text-[#ffb86b]/80 font-medium">
                    {Math.round(((onlineDL ?? 0) / (totalWorkforce || 1)) * 100)}%
                  </span>
                </div>
              </div>

              <div className="bg-[#131316]/80 rounded p-2 border border-[#524437]/30 flex flex-col justify-between h-[74px]">
                <div className="flex justify-between items-center text-[#d7c3b2]/60 text-[10px]">
                  <span className="flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-xs">handyman</span>
                    Offline Direct DL
                  </span>
                  <span className="text-[9px] text-[#ffb86b]/70">Offline</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-['JetBrains_Mono'] text-base font-bold text-white">
                    {(offlineDL ?? 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#ffb86b]/80 font-medium">HC</span>
                </div>
                <div className="text-[9px] text-[#d7c3b2]/50 flex justify-between items-center">
                  <span>Share:</span>
                  <span className="text-[#ffb86b]/80 font-medium">
                    {Math.round(((offlineDL ?? 0) / (totalWorkforce || 1)) * 100)}%
                  </span>
                </div>
              </div>

              <div className="bg-[#131316]/80 rounded p-2 border border-[#524437]/30 flex flex-col justify-between h-[74px]">
                <div className="flex justify-between items-center text-[#d7c3b2]/60 text-[10px]">
                  <span className="flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-xs">support_agent</span>
                    Support IDL
                  </span>
                  <span className="text-[9px] text-[#5de6ff]/70">Indirect</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-['JetBrains_Mono'] text-base font-bold text-white">
                    {totalIDL.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#5de6ff]/80 font-medium">HC</span>
                </div>
                <div className="text-[9px] text-[#d7c3b2]/50 flex justify-between items-center">
                  <span>Share:</span>
                  <span className="text-[#5de6ff]/80 font-medium">
                    {Math.round((totalIDL / (totalWorkforce || 1)) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* SMT Monthly Volume (Standalone Card on Right) */}
      {showSmtCpuCards && (
        <div className="bg-[#1C1D22] border border-[#524437]/60 p-5 rounded-lg flex flex-col justify-between hover:border-[#38bdf8]/50 transition-all shadow-lg select-none">
          {/* Top: SMT Monthly Total */}
          <div className="min-h-[58px]">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#38bdf8] uppercase tracking-wider block">
                    SMT Monthly Production Volume
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-['JetBrains_Mono'] font-bold bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30">
                    APS SMT
                  </span>
                </div>
                <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/70 mt-0.5 block">
                  {monthLabel} {selectedYear} SMT PCBA Planned Volume
                </span>
              </div>
              <div className="text-right">
                <div className="flex items-baseline justify-end gap-1">
                  <span className="font-['JetBrains_Mono'] text-3xl sm:text-4xl font-extrabold text-[#38bdf8] tracking-tight">
                    {(volumes?.smtVolume ?? 0).toLocaleString()}
                  </span>
                  <span className="text-xs font-['JetBrains_Mono'] text-[#38bdf8]/90 font-semibold">pcs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Daily target */}
          <div className="pt-3 border-t border-[#524437]/40 space-y-2.5">
            {/* 1. Daily production target */}
            <div className="min-h-[38px] flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs font-['JetBrains_Mono'] mb-1.5">
                <span className="text-[#d7c3b2]/80 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                  Daily Production Target (22 Workdays):
                </span>
                <span className="font-['JetBrains_Mono'] text-sm font-bold text-white">
                  {Math.round((volumes?.smtVolume ?? 0) / 22).toLocaleString()}{' '}
                  <span className="text-[10px] text-[#38bdf8]/80 font-normal">pcs/day</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-[#131316] flex border border-[#524437]/30">
                <div
                  className="h-full bg-gradient-to-r from-[#0284c7] to-[#38bdf8] transition-all duration-300 rounded-full"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* 2. SMT Process Info */}
            <div className="grid grid-cols-2 gap-2 pt-0.5 text-[11px] font-['JetBrains_Mono']">
              <div className="bg-[#131316]/90 rounded p-2 border border-[#524437]/30 flex flex-col justify-between h-[74px]">
                <div className="flex justify-between items-center text-[#d7c3b2]/60 text-[10px]">
                  <span className="flex items-center gap-1 font-semibold text-[#38bdf8]">
                    <span className="material-symbols-outlined text-xs">precision_manufacturing</span>
                    Process
                  </span>
                  <span className="px-1 py-0.2 rounded text-[9px] bg-[#38bdf8]/15 text-[#38bdf8] font-bold border border-[#38bdf8]/30">
                    PCBA
                  </span>
                </div>
                <div className="mt-1 font-['JetBrains_Mono'] text-sm font-bold text-white truncate">
                  SMT Surface Mount
                </div>
                <div className="text-[9px] text-[#d7c3b2]/50 flex justify-between items-center">
                  <span>Spec:</span>
                  <span className="text-white/80 font-medium">High Density SMT</span>
                </div>
              </div>

              <div className="bg-[#131316]/90 rounded p-2 border border-[#524437]/30 flex flex-col justify-between h-[74px]">
                <div className="flex justify-between items-center text-[#d7c3b2]/60 text-[10px]">
                  <span className="flex items-center gap-1 font-semibold text-[#38bdf8]">
                    <span className="material-symbols-outlined text-xs">tune</span>
                    Schedule Plan
                  </span>
                  <span className="px-1 py-0.2 rounded text-[9px] bg-[#38bdf8]/15 text-[#38bdf8] font-bold border border-[#38bdf8]/30">
                    LOCK
                  </span>
                </div>
                <div className="mt-1 font-['JetBrains_Mono'] text-sm font-bold text-white truncate">
                  APS Master
                </div>
                <div className="text-[9px] text-[#d7c3b2]/50 flex justify-between items-center">
                  <span>Status:</span>
                  <span className="text-white/80 font-medium">Locked Plan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CPU Monthly Volume (Standalone Card on Right) */}
      {showSmtCpuCards && (
        <div className="bg-[#1C1D22] border border-[#524437]/60 p-5 rounded-lg flex flex-col justify-between hover:border-[#a78bfa]/50 transition-all shadow-lg select-none">
          {/* Top: CPU Monthly Total */}
          <div className="min-h-[58px]">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#a78bfa] uppercase tracking-wider block">
                    CPU Monthly Production Volume
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-['JetBrains_Mono'] font-bold bg-[#a78bfa]/15 text-[#a78bfa] border border-[#a78bfa]/30">
                    APS CPU
                  </span>
                </div>
                <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/70 mt-0.5 block">
                  {monthLabel} {selectedYear} System Assembly & Test Planned Volume
                </span>
              </div>
              <div className="text-right">
                <div className="flex items-baseline justify-end gap-1">
                  <span className="font-['JetBrains_Mono'] text-3xl sm:text-4xl font-extrabold text-[#a78bfa] tracking-tight">
                    {(volumes?.cpuVolume ?? 0).toLocaleString()}
                  </span>
                  <span className="text-xs font-['JetBrains_Mono'] text-[#a78bfa]/90 font-semibold">pcs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Daily target */}
          <div className="pt-3 border-t border-[#524437]/40 space-y-2.5">
            {/* 1. Daily production target */}
            <div className="min-h-[38px] flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs font-['JetBrains_Mono'] mb-1.5">
                <span className="text-[#d7c3b2]/80 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#a78bfa]" />
                  Daily Production Target (22 Workdays):
                </span>
                <span className="font-['JetBrains_Mono'] text-sm font-bold text-white">
                  {Math.round((volumes?.cpuVolume ?? 0) / 22).toLocaleString()}{' '}
                  <span className="text-[10px] text-[#a78bfa]/80 font-normal">pcs/day</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-[#131316] flex border border-[#524437]/30">
                <div
                  className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] transition-all duration-300 rounded-full"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* 2. CPU Assembly Info */}
            <div className="grid grid-cols-2 gap-2 pt-0.5 text-[11px] font-['JetBrains_Mono']">
              <div className="bg-[#131316]/90 rounded p-2 border border-[#524437]/30 flex flex-col justify-between h-[74px]">
                <div className="flex justify-between items-center text-[#d7c3b2]/60 text-[10px]">
                  <span className="flex items-center gap-1 font-semibold text-[#a78bfa]">
                    <span className="material-symbols-outlined text-xs">developer_board</span>
                    Process
                  </span>
                  <span className="px-1 py-0.2 rounded text-[9px] bg-[#a78bfa]/15 text-[#a78bfa] font-bold border border-[#a78bfa]/30">
                    SYSTEM
                  </span>
                </div>
                <div className="mt-1 font-['JetBrains_Mono'] text-sm font-bold text-white truncate">
                  System Assembly
                </div>
                <div className="text-[9px] text-[#d7c3b2]/50 flex justify-between items-center">
                  <span>Test:</span>
                  <span className="text-white/80 font-medium">Burn-In & Functional Test</span>
                </div>
              </div>

              <div className="bg-[#131316]/90 rounded p-2 border border-[#524437]/30 flex flex-col justify-between h-[74px]">
                <div className="flex justify-between items-center text-[#d7c3b2]/60 text-[10px]">
                  <span className="flex items-center gap-1 font-semibold text-[#a78bfa]">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    Schedule Plan
                  </span>
                  <span className="px-1 py-0.2 rounded text-[9px] bg-[#a78bfa]/15 text-[#a78bfa] font-bold border border-[#a78bfa]/30">
                    LOCK
                  </span>
                </div>
                <div className="mt-1 font-['JetBrains_Mono'] text-sm font-bold text-white truncate">
                  APS Master
                </div>
                <div className="text-[9px] text-[#d7c3b2]/50 flex justify-between items-center">
                  <span>Status:</span>
                  <span className="text-white/80 font-medium">Locked Plan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card 2: HR COST CENTER PAID HEADCOUNT (DL + IDL) */}
      {showHrPaidCard && (
        <div className="bg-[#1C1D22] border border-[#524437]/60 p-5 rounded-lg flex flex-col justify-between hover:border-[#5de6ff]/50 transition-all shadow-lg">
          {/* Top: HR Paid Total */}
          <div className="min-h-[58px]">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#5de6ff] uppercase tracking-wider block">
                    HR COST CENTER PAID HEADCOUNT
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-['JetBrains_Mono'] font-bold bg-[#5de6ff]/15 text-[#5de6ff] border border-[#5de6ff]/30">
                    DL + IDL
                  </span>
                </div>
                <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/70 mt-0.5 block">
                  {monthLabel} {selectedYear} Month-End Paid Headcount
                </span>
              </div>
              <div className="text-right">
                <div className="flex items-baseline justify-end gap-1">
                  <span className="font-['JetBrains_Mono'] text-3xl sm:text-4xl font-extrabold text-[#5de6ff] tracking-tight">
                    {totalHrHeadcount.toLocaleString()}
                  </span>
                  <span className="text-xs font-['JetBrains_Mono'] text-[#5de6ff]/90 font-semibold">HC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: HR DL and IDL */}
          <div className="pt-3 border-t border-[#524437]/40 space-y-2.5">
            {/* 1. HR DL and IDL values and ratio */}
            <div className="min-h-[38px] flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs font-['JetBrains_Mono'] mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[#5de6ff]">
                    <span className="w-2 h-2 rounded-full bg-[#5de6ff]" />
                    DL: <strong className="font-bold text-white">{displayActual.toLocaleString()}</strong> HC
                    <span className="text-[10px] text-[#5de6ff]/80">({hrDlPercent}%)</span>
                  </span>
                  <span className="text-[#524437]">•</span>
                  <span className="inline-flex items-center gap-1 text-[#c084fc]">
                    <span className="w-2 h-2 rounded-full bg-[#c084fc]" />
                    IDL: <strong className="font-bold text-white">{hrActualIDL.toLocaleString()}</strong> HC
                    <span className="text-[10px] text-[#c084fc]/80">({hrIdlPercent}%)</span>
                  </span>
                </div>
                <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/80 bg-[#131316] px-1.5 py-0.5 rounded border border-[#524437]/40">
                  DL/IDL Ratio: <strong className="text-[#38bdf8]">{hrRatioStr}</strong>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-[#131316] flex border border-[#524437]/30">
                <div
                  className="h-full bg-[#5de6ff] transition-all duration-300"
                  style={{ width: `${hrDlPercent}%` }}
                  title={`HR DL: ${displayActual.toLocaleString()} HC (${hrDlPercent}%)`}
                />
                <div
                  className="h-full bg-[#c084fc] transition-all duration-300"
                  style={{ width: `${hrIdlPercent}%` }}
                  title={`HR IDL: ${hrActualIDL.toLocaleString()} HC (${hrIdlPercent}%)`}
                />
              </div>
            </div>

            {/* 2. HR Paid DL & IDL cards */}
            <div className="grid grid-cols-2 gap-2 pt-0.5 text-[11px] font-['JetBrains_Mono']">
              <div className="bg-[#131316]/90 border border-[#524437]/50 rounded p-2 flex flex-col justify-between h-[74px] hover:border-[#5de6ff]/50 transition-all">
                <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#5de6ff]">
                  <span className="flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-xs">badge</span>
                    HR Paid DL
                  </span>
                  <span className="px-1 py-0.2 rounded text-[9px] bg-[#5de6ff]/15 text-[#5de6ff] font-bold border border-[#5de6ff]/30">
                    Direct Paid
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-['JetBrains_Mono'] text-base font-extrabold text-white">
                    {displayActual.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#5de6ff]/80 font-semibold">HC</span>
                </div>
                <div className="text-[9px] text-[#d7c3b2]/60 flex justify-between items-center">
                  <span>Headcount Share:</span>
                  <span className="text-[#5de6ff] font-medium">{hrDlPercent}%</span>
                </div>
              </div>

              <div className="bg-[#131316]/90 border border-[#524437]/50 rounded p-2 flex flex-col justify-between h-[74px] hover:border-[#c084fc]/50 transition-all">
                <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#c084fc]">
                  <span className="flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-xs">support_agent</span>
                    HR Paid IDL
                  </span>
                  <span className="px-1 py-0.2 rounded text-[9px] bg-[#c084fc]/15 text-[#c084fc] font-bold border border-[#c084fc]/30">
                    Indirect Paid
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-['JetBrains_Mono'] text-base font-extrabold text-white">
                    {hrActualIDL.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#c084fc]/80 font-semibold">HC</span>
                </div>
                <div className="text-[9px] text-[#d7c3b2]/60 flex justify-between items-center">
                  <span>Headcount Share:</span>
                  <span className="text-[#c084fc] font-medium">{hrIdlPercent}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card 3: NET MANPOWER GAP & Fulfillment Rate */}
      {showNetGapCard && (
        <div
          className={`bg-[#1C1D22] border border-[#524437]/60 p-5 rounded-lg flex flex-col justify-between border-l-4 transition-all shadow-lg ${
            hasDeficit
              ? 'border-l-[#F59E0B] hover:border-[#F59E0B]/80'
              : 'border-l-[#4edea3] hover:border-[#4edea3]/80'
          }`}
        >
          {/* Top: Net Manpower GAP */}
          <div className="min-h-[58px]">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#d7c3b2]/90 uppercase tracking-wider block">
                    NET MANPOWER GAP
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-['JetBrains_Mono'] font-bold border ${
                      hasDeficit
                        ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
                        : 'bg-[#4edea3]/15 text-[#4edea3] border-[#4edea3]/30'
                    }`}
                  >
                    {hasDeficit ? 'Deficit' : 'Surplus'}
                  </span>
                </div>
                <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/60 mt-0.5 block">
                  HR Paid Actual − APS Demand
                </span>
              </div>
              <div className="text-right">
                <div className="flex items-baseline justify-end gap-1">
                  <span
                    className={`font-['JetBrains_Mono'] text-3xl sm:text-4xl font-extrabold tracking-tight ${
                      hasDeficit ? 'text-[#F59E0B]' : 'text-[#4edea3]'
                    }`}
                  >
                    {displayGap > 0 ? `+${displayGap}` : displayGap}
                  </span>
                  <span
                    className={`text-xs font-['JetBrains_Mono'] font-semibold ${
                      hasDeficit ? 'text-[#F59E0B]/80' : 'text-[#4edea3]/80'
                    }`}
                  >
                    HC
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Fulfillment rate and action */}
          <div className="pt-3 border-t border-[#524437]/40 space-y-2.5">
            {/* 1. Manpower Fulfillment Rate */}
            <div className="min-h-[38px] flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs font-['JetBrains_Mono'] mb-1.5">
                <span className="text-[#d7c3b2]/90 font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs text-[#4edea3]">donut_large</span>
                  Manpower Fulfillment Rate:
                </span>
                <div className="flex items-baseline gap-1">
                  <strong
                    className={`text-sm font-bold ${
                      hasDeficit ? 'text-[#F59E0B]' : 'text-[#4edea3]'
                    }`}
                  >
                    {Math.round((totalHrHeadcount / (totalWorkforce || 1)) * 100)}%
                  </strong>
                  <span className="text-[10px] text-[#d7c3b2]/60">
                    (DL: {Math.round((displayActual / (displayDemand || 1)) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="w-full h-1.5 rounded-full overflow-hidden bg-[#131316] flex border border-[#524437]/30">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    hasDeficit
                      ? 'bg-gradient-to-r from-[#d97706] to-[#F59E0B]'
                      : 'bg-gradient-to-r from-[#059669] to-[#4edea3]'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round((totalHrHeadcount / (totalWorkforce || 1)) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* 2. Status and action */}
            <div className="grid grid-cols-2 gap-2 pt-0.5 text-[11px] font-['JetBrains_Mono']">
              <div className="bg-[#131316]/90 border border-[#524437]/50 rounded p-2 flex flex-col justify-between h-[74px] hover:border-[#d7c3b2]/40 transition-all">
                <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/80">
                  <span className="flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-xs">
                      {hasDeficit ? 'warning' : 'check_circle'}
                    </span>
                    Variance Status
                  </span>
                  <span
                    className={`px-1 py-0.2 rounded text-[9px] font-bold border ${
                      hasDeficit
                        ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
                        : 'bg-[#4edea3]/15 text-[#4edea3] border-[#4edea3]/30'
                    }`}
                  >
                    {hasDeficit ? 'Deficit' : 'Surplus'}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span
                    className={`font-['JetBrains_Mono'] text-base font-extrabold ${
                      hasDeficit ? 'text-[#F59E0B]' : 'text-[#4edea3]'
                    }`}
                  >
                    {hasDeficit ? `Shortage ${Math.abs(displayGap)}` : `Surplus +${displayGap}`}
                  </span>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/70 font-semibold">HC</span>
                </div>
                <div className="text-[9px] text-[#d7c3b2]/60 flex justify-between items-center">
                  <span>Net Gap %:</span>
                  <span className="text-white font-medium">
                    {Math.abs(Math.round((displayGap / (totalWorkforce || 1)) * 100))}%
                  </span>
                </div>
              </div>

              <div className="bg-[#131316]/90 border border-[#524437]/50 rounded p-2 flex flex-col justify-between h-[74px] hover:border-[#d7c3b2]/40 transition-all">
                <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/80">
                  <span className="flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-xs">tune</span>
                    Action Strategy
                  </span>
                  <span className="px-1 py-0.2 rounded text-[9px] bg-[#4edea3]/15 text-[#4edea3] font-bold border border-[#4edea3]/30">
                    Action
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-['JetBrains_Mono'] text-xs font-bold text-white truncate">
                    {hasDeficit ? 'Cross-Support / OT' : 'Shift Balanced'}
                  </span>
                </div>
                <div className="text-[9px] text-[#d7c3b2]/60 flex justify-between items-center">
                  <span>Plan:</span>
                  <span className="text-[#4edea3] font-medium">{hasDeficit ? 'Dynamic Rebalance' : 'Maintain Standard'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
