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
    visibleCardsCount === 5
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8 select-none'
      : visibleCardsCount === 4
      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8 select-none'
      : visibleCardsCount === 3
      ? 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 select-none'
      : visibleCardsCount === 2
      ? 'grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 select-none'
      : visibleCardsCount === 1
      ? 'grid grid-cols-1 gap-6 mb-8 select-none'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8 select-none';

  return (
    <div className={gridColsClass}>
      {/* Card 1: Monthly APS Demand Total (DL + IDL) */}
      {showApsTotalDemandCard && (
        <div className="bg-gradient-to-br from-[#272119] via-[#1c1b20] to-[#12141a] border border-[#ffb86b]/35 hover:border-[#ffb86b]/70 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group select-none transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_40px_rgba(255,184,107,0.15)]">
          {/* Ambient glow accent */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#ffb86b]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#ffb86b]/15 transition-all duration-500" />

          {/* Top: Monthly APS Total Demand (DL + IDL) */}
          <div className="relative z-10">
            <div className="flex justify-between items-start gap-3 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#ffb86b]/15 border border-[#ffb86b]/30 flex items-center justify-center text-[#ffb86b] shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-2xl">groups</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#ffb86b] uppercase tracking-wider block">
                      Monthly APS Demand Total
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold bg-[#ffb86b]/15 text-[#ffb86b] border border-[#ffb86b]/30">
                      DL + IDL
                    </span>
                  </div>
                  <span className="text-xs font-['Inter'] text-[#d7c3b2]/75 mt-1 block">
                    {monthLabel} {selectedYear} Scheduled Total Workforce
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-baseline justify-end gap-1.5">
                  <span className="font-['JetBrains_Mono'] text-4xl lg:text-[42px] font-black text-[#ffb86b] tracking-tight drop-shadow-[0_2px_12px_rgba(255,184,107,0.3)]">
                    {totalWorkforce.toLocaleString()}
                  </span>
                  <span className="text-xs font-['JetBrains_Mono'] text-[#ffb86b]/90 font-bold uppercase tracking-wider">HC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: DL & IDL breakdown */}
          <div className="relative z-10 pt-4 border-t border-white/[0.08] space-y-3.5">
            {/* 1. DL and IDL values and ratio */}
            <div className="flex flex-col justify-between gap-1.5">
              <div className="flex justify-between items-center text-xs font-['JetBrains_Mono']">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[#ffb86b]">
                    <span className="w-2 h-2 rounded-full bg-[#ffb86b]" />
                    DL: <strong className="font-bold text-white">{displayDemand.toLocaleString()}</strong> HC
                    <span className="text-[10px] text-[#ffb86b]/80">({dlPercent}%)</span>
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="inline-flex items-center gap-1.5 text-[#5de6ff]">
                    <span className="w-2 h-2 rounded-full bg-[#5de6ff]" />
                    IDL: <strong className="font-bold text-white">{totalIDL.toLocaleString()}</strong> HC
                    <span className="text-[10px] text-[#5de6ff]/80">({idlPercent}%)</span>
                  </span>
                </div>
                <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/90 bg-[#111319] px-2 py-0.5 rounded-lg border border-white/10">
                  DL/IDL Ratio: <strong className="text-[#4edea3]">{ratioStr}</strong>
                </span>
              </div>

              {/* DL vs IDL Progress Bar */}
              <div className="w-full h-2 rounded-full overflow-hidden bg-[#0d0f14] flex border border-white/10 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#e09033] to-[#ffb86b] transition-all duration-500 rounded-l-full shadow-[0_0_8px_rgba(255,184,107,0.5)]"
                  style={{ width: `${dlPercent}%` }}
                  title={`DL: ${displayDemand.toLocaleString()} HC (${dlPercent}%)`}
                />
                <div
                  className="h-full bg-gradient-to-r from-[#0284c7] to-[#5de6ff] transition-all duration-500 rounded-r-full shadow-[0_0_8px_rgba(93,230,255,0.5)]"
                  style={{ width: `${idlPercent}%` }}
                  title={`IDL: ${totalIDL.toLocaleString()} HC (${idlPercent}%)`}
                />
              </div>
            </div>

            {/* 2. Breakdown or SMT & CPU planned output */}
            {activeTab === 'overview' ? (
              <div className="grid grid-cols-2 gap-3 pt-0.5 text-[11px] font-['JetBrains_Mono']">
                {/* SMT Forecast Output */}
                <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#38bdf8]/40 transition-all flex flex-col justify-between min-h-[80px]">
                  <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                    <span className="flex items-center gap-1.5 font-semibold text-[#38bdf8]">
                      <span className="material-symbols-outlined text-sm">memory</span>
                      SMT Forecast Vol
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#38bdf8]/15 text-[#38bdf8] font-bold border border-[#38bdf8]/30">
                      APS
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between my-0.5">
                    <span className="font-['JetBrains_Mono'] text-base font-extrabold text-[#38bdf8]">
                      {(volumes?.smtVolume ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#38bdf8]/80 font-semibold">pcs</span>
                  </div>
                  <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                    <span>Daily (22D):</span>
                    <span className="text-white font-medium">
                      {Math.round((volumes?.smtVolume ?? 0) / 22).toLocaleString()} pcs/day
                    </span>
                  </div>
                </div>

                {/* CPU Forecast Output */}
                <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#a78bfa]/40 transition-all flex flex-col justify-between min-h-[80px]">
                  <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                    <span className="flex items-center gap-1.5 font-semibold text-[#a78bfa]">
                      <span className="material-symbols-outlined text-sm">developer_board</span>
                      CPU Forecast Vol
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#a78bfa]/15 text-[#a78bfa] font-bold border border-[#a78bfa]/30">
                      APS
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between my-0.5">
                    <span className="font-['JetBrains_Mono'] text-base font-extrabold text-[#a78bfa]">
                      {(volumes?.cpuVolume ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#a78bfa]/80 font-semibold uppercase">UNITS</span>
                  </div>
                  <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                    <span>Daily (22D):</span>
                    <span className="text-white font-medium">
                      {Math.round((volumes?.cpuVolume ?? 0) / 22).toLocaleString()} units/day
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 pt-0.5 text-[11px] font-['JetBrains_Mono']">
                <div className="bg-[#111319]/90 rounded-xl p-2.5 border border-white/[0.08] hover:border-[#ffb86b]/40 transition-all flex flex-col justify-between min-h-[80px]">
                  <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                    <span className="flex items-center gap-1 font-semibold text-[#ffb86b]">
                      <span className="material-symbols-outlined text-xs">precision_manufacturing</span>
                      Line DL
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#ffb86b]/15 text-[#ffb86b] font-bold border border-[#ffb86b]/30">Direct</span>
                  </div>
                  <div className="flex items-baseline justify-between my-0.5">
                    <span className="font-['JetBrains_Mono'] text-base font-bold text-white">
                      {(onlineDL ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#ffb86b]/80 font-medium">HC</span>
                  </div>
                  <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                    <span>Share:</span>
                    <span className="text-[#ffb86b] font-medium">
                      {Math.round(((onlineDL ?? 0) / (totalWorkforce || 1)) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="bg-[#111319]/90 rounded-xl p-2.5 border border-white/[0.08] hover:border-[#ffb86b]/40 transition-all flex flex-col justify-between min-h-[80px]">
                  <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                    <span className="flex items-center gap-1 font-semibold text-[#ffb86b]">
                      <span className="material-symbols-outlined text-xs">handyman</span>
                      Offline DL
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#ffb86b]/15 text-[#ffb86b] font-bold border border-[#ffb86b]/30">Offline</span>
                  </div>
                  <div className="flex items-baseline justify-between my-0.5">
                    <span className="font-['JetBrains_Mono'] text-base font-bold text-white">
                      {(offlineDL ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#ffb86b]/80 font-medium">HC</span>
                  </div>
                  <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                    <span>Share:</span>
                    <span className="text-[#ffb86b] font-medium">
                      {Math.round(((offlineDL ?? 0) / (totalWorkforce || 1)) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="bg-[#111319]/90 rounded-xl p-2.5 border border-white/[0.08] hover:border-[#5de6ff]/40 transition-all flex flex-col justify-between min-h-[80px]">
                  <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                    <span className="flex items-center gap-1 font-semibold text-[#5de6ff]">
                      <span className="material-symbols-outlined text-xs">support_agent</span>
                      Support IDL
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#5de6ff]/15 text-[#5de6ff] font-bold border border-[#5de6ff]/30">Indirect</span>
                  </div>
                  <div className="flex items-baseline justify-between my-0.5">
                    <span className="font-['JetBrains_Mono'] text-base font-bold text-white">
                      {totalIDL.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#5de6ff]/80 font-medium">HC</span>
                  </div>
                  <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                    <span>Share:</span>
                    <span className="text-[#5de6ff] font-medium">
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
        <div className="bg-gradient-to-br from-[#1b232f] via-[#161a22] to-[#12141a] border border-[#38bdf8]/35 hover:border-[#38bdf8]/70 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_40px_rgba(56,189,248,0.15)] relative overflow-hidden group select-none">
          {/* Ambient glow accent */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#38bdf8]/15 transition-all duration-500" />

          {/* Top: SMT Monthly Total */}
          <div className="relative z-10">
            <div className="flex justify-between items-start gap-3 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-2xl">memory</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#38bdf8] uppercase tracking-wider block">
                      SMT Monthly Production Volume
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30">
                      APS SMT
                    </span>
                  </div>
                  <span className="text-xs font-['Inter'] text-[#d7c3b2]/75 mt-1 block">
                    {monthLabel} {selectedYear} SMT PCBA Planned Output
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-baseline justify-end gap-1.5">
                  <span className="font-['JetBrains_Mono'] text-4xl lg:text-[42px] font-black text-[#38bdf8] tracking-tight drop-shadow-[0_2px_12px_rgba(56,189,248,0.3)]">
                    {(volumes?.smtVolume ?? 0).toLocaleString()}
                  </span>
                  <span className="text-xs font-['JetBrains_Mono'] text-[#38bdf8]/90 font-bold uppercase tracking-wider">pcs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Daily target & Process specs */}
          <div className="relative z-10 pt-4 border-t border-white/[0.08] space-y-3.5">
            {/* 1. Daily production target & gauge */}
            <div className="flex flex-col justify-between gap-1.5">
              <div className="flex justify-between items-center text-xs font-['JetBrains_Mono']">
                <span className="text-[#d7c3b2]/85 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
                  Daily Target (22 Workdays):
                </span>
                <span className="font-['JetBrains_Mono'] text-sm font-bold text-white flex items-center gap-1.5">
                  {Math.round((volumes?.smtVolume ?? 0) / 22).toLocaleString()}{' '}
                  <span className="text-[11px] text-[#38bdf8] font-semibold">pcs/day</span>
                </span>
              </div>

              {/* Proportional 8px Progress Bar */}
              <div className="w-full h-2 rounded-full overflow-hidden bg-[#0d0f14] flex border border-white/10 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#0284c7] via-[#38bdf8] to-[#7dd3fc] transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* 2. SMT Process Info Tiles */}
            <div className="grid grid-cols-2 gap-3 pt-0.5 text-[11px] font-['JetBrains_Mono']">
              <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#38bdf8]/40 transition-all flex flex-col justify-between min-h-[80px]">
                <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                  <span className="flex items-center gap-1.5 font-semibold text-[#38bdf8]">
                    <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
                    Process Group
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#38bdf8]/15 text-[#38bdf8] font-bold border border-[#38bdf8]/30">
                    PCBA
                  </span>
                </div>
                <div className="my-1 font-['JetBrains_Mono'] text-sm font-bold text-white truncate">
                  SMT Surface Mount
                </div>
                <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                  <span>Spec:</span>
                  <span className="text-[#38bdf8] font-medium">High Density SMT</span>
                </div>
              </div>

              <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#38bdf8]/40 transition-all flex flex-col justify-between min-h-[80px]">
                <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                  <span className="flex items-center gap-1.5 font-semibold text-[#38bdf8]">
                    <span className="material-symbols-outlined text-sm">tune</span>
                    Schedule Plan
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#4edea3]/15 text-[#4edea3] font-bold border border-[#4edea3]/30">
                    LOCKED
                  </span>
                </div>
                <div className="my-1 font-['JetBrains_Mono'] text-sm font-bold text-white truncate">
                  APS Master
                </div>
                <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                  <span>Status:</span>
                  <span className="text-[#4edea3] font-medium">Locked Plan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CPU Monthly Volume (Standalone Card on Right) */}
      {showSmtCpuCards && (
        <div className="bg-gradient-to-br from-[#241c30] via-[#1a1624] to-[#12141a] border border-[#a78bfa]/35 hover:border-[#a78bfa]/70 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_40px_rgba(167,139,250,0.15)] relative overflow-hidden group select-none">
          {/* Ambient glow accent */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#a78bfa]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#a78bfa]/15 transition-all duration-500" />

          {/* Top: CPU Monthly Total */}
          <div className="relative z-10">
            <div className="flex justify-between items-start gap-3 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#a78bfa]/15 border border-[#a78bfa]/30 flex items-center justify-center text-[#a78bfa] shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-2xl">developer_board</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#a78bfa] uppercase tracking-wider block">
                      CPU Monthly Production Volume
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold bg-[#a78bfa]/15 text-[#a78bfa] border border-[#a78bfa]/30">
                      APS CPU
                    </span>
                  </div>
                  <span className="text-xs font-['Inter'] text-[#d7c3b2]/75 mt-1 block">
                    {monthLabel} {selectedYear} System Assembly & Test Volume
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-baseline justify-end gap-1.5">
                  <span className="font-['JetBrains_Mono'] text-4xl lg:text-[42px] font-black text-[#a78bfa] tracking-tight drop-shadow-[0_2px_12px_rgba(167,139,250,0.3)]">
                    {(volumes?.cpuVolume ?? 0).toLocaleString()}
                  </span>
                  <span className="text-xs font-['JetBrains_Mono'] text-[#a78bfa]/90 font-bold uppercase tracking-wider">UNITS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Daily target & Process specs */}
          <div className="relative z-10 pt-4 border-t border-white/[0.08] space-y-3.5">
            {/* 1. Daily production target & gauge */}
            <div className="flex flex-col justify-between gap-1.5">
              <div className="flex justify-between items-center text-xs font-['JetBrains_Mono']">
                <span className="text-[#d7c3b2]/85 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#a78bfa] animate-pulse" />
                  Daily Target (22 Workdays):
                </span>
                <span className="font-['JetBrains_Mono'] text-sm font-bold text-white flex items-center gap-1.5">
                  {Math.round((volumes?.cpuVolume ?? 0) / 22).toLocaleString()}{' '}
                  <span className="text-[11px] text-[#a78bfa] font-semibold uppercase">units/day</span>
                </span>
              </div>

              {/* Proportional 8px Progress Bar */}
              <div className="w-full h-2 rounded-full overflow-hidden bg-[#0d0f14] flex border border-white/10 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#7c3aed] via-[#a78bfa] to-[#c4b5fd] transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(167,139,250,0.5)]"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* 2. CPU Assembly Info Tiles */}
            <div className="grid grid-cols-2 gap-3 pt-0.5 text-[11px] font-['JetBrains_Mono']">
              <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#a78bfa]/40 transition-all flex flex-col justify-between min-h-[80px]">
                <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                  <span className="flex items-center gap-1.5 font-semibold text-[#a78bfa]">
                    <span className="material-symbols-outlined text-sm">developer_board</span>
                    Process Group
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#a78bfa]/15 text-[#a78bfa] font-bold border border-[#a78bfa]/30">
                    SYSTEM
                  </span>
                </div>
                <div className="my-1 font-['JetBrains_Mono'] text-sm font-bold text-white truncate">
                  System Assembly
                </div>
                <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                  <span>Test:</span>
                  <span className="text-[#a78bfa] font-medium">Burn-In & Test</span>
                </div>
              </div>

              <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#a78bfa]/40 transition-all flex flex-col justify-between min-h-[80px]">
                <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                  <span className="flex items-center gap-1.5 font-semibold text-[#a78bfa]">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    Schedule Plan
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#4edea3]/15 text-[#4edea3] font-bold border border-[#4edea3]/30">
                    LOCKED
                  </span>
                </div>
                <div className="my-1 font-['JetBrains_Mono'] text-sm font-bold text-white truncate">
                  APS Master
                </div>
                <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                  <span>Status:</span>
                  <span className="text-[#4edea3] font-medium">Locked Plan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card 2: HR COST CENTER PAID HEADCOUNT (DL + IDL) */}
      {showHrPaidCard && (
        <div className="bg-gradient-to-br from-[#18242a] via-[#151c22] to-[#12141a] border border-[#5de6ff]/35 hover:border-[#5de6ff]/70 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_40px_rgba(93,230,255,0.15)] relative overflow-hidden group select-none">
          {/* Ambient glow accent */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#5de6ff]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#5de6ff]/15 transition-all duration-500" />

          {/* Top: HR Paid Total */}
          <div className="relative z-10">
            <div className="flex justify-between items-start gap-3 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#5de6ff]/15 border border-[#5de6ff]/30 flex items-center justify-center text-[#5de6ff] shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-2xl">badge</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#5de6ff] uppercase tracking-wider block">
                      HR COST CENTER PAID HEADCOUNT
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold bg-[#5de6ff]/15 text-[#5de6ff] border border-[#5de6ff]/30">
                      DL + IDL
                    </span>
                  </div>
                  <span className="text-xs font-['Inter'] text-[#d7c3b2]/75 mt-1 block">
                    {monthLabel} {selectedYear} Month-End Paid Headcount
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-baseline justify-end gap-1.5">
                  <span className="font-['JetBrains_Mono'] text-4xl lg:text-[42px] font-black text-[#5de6ff] tracking-tight drop-shadow-[0_2px_12px_rgba(93,230,255,0.3)]">
                    {totalHrHeadcount.toLocaleString()}
                  </span>
                  <span className="text-xs font-['JetBrains_Mono'] text-[#5de6ff]/90 font-bold uppercase tracking-wider">HC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: HR DL and IDL */}
          <div className="relative z-10 pt-4 border-t border-white/[0.08] space-y-3.5">
            {/* 1. HR DL and IDL values and ratio */}
            <div className="flex flex-col justify-between gap-1.5">
              <div className="flex justify-between items-center text-xs font-['JetBrains_Mono']">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[#5de6ff]">
                    <span className="w-2 h-2 rounded-full bg-[#5de6ff]" />
                    DL: <strong className="font-bold text-white">{displayActual.toLocaleString()}</strong> HC
                    <span className="text-[10px] text-[#5de6ff]/80">({hrDlPercent}%)</span>
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="inline-flex items-center gap-1.5 text-[#c084fc]">
                    <span className="w-2 h-2 rounded-full bg-[#c084fc]" />
                    IDL: <strong className="font-bold text-white">{hrActualIDL.toLocaleString()}</strong> HC
                    <span className="text-[10px] text-[#c084fc]/80">({hrIdlPercent}%)</span>
                  </span>
                </div>
                <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/90 bg-[#111319] px-2 py-0.5 rounded-lg border border-white/10">
                  DL/IDL Ratio: <strong className="text-[#38bdf8]">{hrRatioStr}</strong>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full overflow-hidden bg-[#0d0f14] flex border border-white/10 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#0284c7] to-[#5de6ff] transition-all duration-500 rounded-l-full shadow-[0_0_8px_rgba(93,230,255,0.5)]"
                  style={{ width: `${hrDlPercent}%` }}
                  title={`HR DL: ${displayActual.toLocaleString()} HC (${hrDlPercent}%)`}
                />
                <div
                  className="h-full bg-gradient-to-r from-[#7c3aed] to-[#c084fc] transition-all duration-500 rounded-r-full shadow-[0_0_8px_rgba(192,132,252,0.5)]"
                  style={{ width: `${hrIdlPercent}%` }}
                  title={`HR IDL: ${hrActualIDL.toLocaleString()} HC (${hrIdlPercent}%)`}
                />
              </div>
            </div>

            {/* 2. HR Paid DL & IDL cards */}
            <div className="grid grid-cols-2 gap-3 pt-0.5 text-[11px] font-['JetBrains_Mono']">
              <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#5de6ff]/40 transition-all flex flex-col justify-between min-h-[80px]">
                <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#5de6ff]">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className="material-symbols-outlined text-sm">badge</span>
                    HR Paid DL
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#5de6ff]/15 text-[#5de6ff] font-bold border border-[#5de6ff]/30">
                    Direct Paid
                  </span>
                </div>
                <div className="flex items-baseline justify-between my-0.5">
                  <span className="font-['JetBrains_Mono'] text-base font-extrabold text-white">
                    {displayActual.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#5de6ff]/80 font-semibold">HC</span>
                </div>
                <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                  <span>Headcount Share:</span>
                  <span className="text-[#5de6ff] font-medium">{hrDlPercent}%</span>
                </div>
              </div>

              <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#c084fc]/40 transition-all flex flex-col justify-between min-h-[80px]">
                <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#c084fc]">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className="material-symbols-outlined text-sm">support_agent</span>
                    HR Paid IDL
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#c084fc]/15 text-[#c084fc] font-bold border border-[#c084fc]/30">
                    Indirect Paid
                  </span>
                </div>
                <div className="flex items-baseline justify-between my-0.5">
                  <span className="font-['JetBrains_Mono'] text-base font-extrabold text-white">
                    {hrActualIDL.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#c084fc]/80 font-semibold">HC</span>
                </div>
                <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
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
          className={`bg-gradient-to-br from-[#1d1f24] via-[#16181d] to-[#12141a] border ${
            hasDeficit
              ? 'border-[#F59E0B]/40 hover:border-[#F59E0B]/80 shadow-[0_12px_32px_rgba(245,158,11,0.12)]'
              : 'border-[#4edea3]/40 hover:border-[#4edea3]/80 shadow-[0_12px_32px_rgba(78,222,163,0.12)]'
          } p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden group select-none`}
        >
          {/* Ambient glow accent */}
          <div
            className={`absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
              hasDeficit
                ? 'bg-[#F59E0B]/10 group-hover:bg-[#F59E0B]/15'
                : 'bg-[#4edea3]/10 group-hover:bg-[#4edea3]/15'
            }`}
          />

          {/* Top: Net Manpower GAP */}
          <div className="relative z-10">
            <div className="flex justify-between items-start gap-3 mb-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform border ${
                    hasDeficit
                      ? 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#F59E0B]'
                      : 'bg-[#4edea3]/15 border-[#4edea3]/30 text-[#4edea3]'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {hasDeficit ? 'trending_down' : 'trending_up'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#d7c3b2]/90 uppercase tracking-wider block">
                      NET MANPOWER GAP
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold border ${
                        hasDeficit
                          ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
                          : 'bg-[#4edea3]/15 text-[#4edea3] border-[#4edea3]/30'
                      }`}
                    >
                      {hasDeficit ? 'Deficit' : 'Surplus'}
                    </span>
                  </div>
                  <span className="text-xs font-['Inter'] text-[#d7c3b2]/75 mt-1 block">
                    HR Paid Actual − APS Demand
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-baseline justify-end gap-1.5">
                  <span
                    className={`font-['JetBrains_Mono'] text-4xl lg:text-[42px] font-black tracking-tight ${
                      hasDeficit
                        ? 'text-[#F59E0B] drop-shadow-[0_2px_12px_rgba(245,158,11,0.3)]'
                        : 'text-[#4edea3] drop-shadow-[0_2px_12px_rgba(78,222,163,0.3)]'
                    }`}
                  >
                    {displayGap > 0 ? `+${displayGap}` : displayGap}
                  </span>
                  <span
                    className={`text-xs font-['JetBrains_Mono'] font-bold uppercase tracking-wider ${
                      hasDeficit ? 'text-[#F59E0B]/90' : 'text-[#4edea3]/90'
                    }`}
                  >
                    HC
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Fulfillment rate and action */}
          <div className="relative z-10 pt-4 border-t border-white/[0.08] space-y-3.5">
            {/* 1. Manpower Fulfillment Rate */}
            <div className="flex flex-col justify-between gap-1.5">
              <div className="flex justify-between items-center text-xs font-['JetBrains_Mono']">
                <span className="text-[#d7c3b2]/85 font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#4edea3]">donut_large</span>
                  Manpower Fulfillment Rate:
                </span>
                <div className="flex items-baseline gap-1.5">
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

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full overflow-hidden bg-[#0d0f14] flex border border-white/10 p-0.5">
                <div
                  className={`h-full transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(78,222,163,0.4)] ${
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
            <div className="grid grid-cols-2 gap-3 pt-0.5 text-[11px] font-['JetBrains_Mono']">
              <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between min-h-[80px]">
                <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/80">
                  <span className="flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-sm">
                      {hasDeficit ? 'warning' : 'check_circle'}
                    </span>
                    Variance Status
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                      hasDeficit
                        ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
                        : 'bg-[#4edea3]/15 text-[#4edea3] border-[#4edea3]/30'
                    }`}
                  >
                    {hasDeficit ? 'Deficit' : 'Surplus'}
                  </span>
                </div>
                <div className="flex items-baseline justify-between my-0.5">
                  <span
                    className={`font-['JetBrains_Mono'] text-base font-extrabold ${
                      hasDeficit ? 'text-[#F59E0B]' : 'text-[#4edea3]'
                    }`}
                  >
                    {hasDeficit ? `Shortage ${Math.abs(displayGap)}` : `Surplus +${displayGap}`}
                  </span>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/70 font-semibold">HC</span>
                </div>
                <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                  <span>Net Gap %:</span>
                  <span className="text-white font-medium">
                    {Math.abs(Math.round((displayGap / (totalWorkforce || 1)) * 100))}%
                  </span>
                </div>
              </div>

              <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between min-h-[80px]">
                <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/80">
                  <span className="flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-sm">tune</span>
                    Action Strategy
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#4edea3]/15 text-[#4edea3] font-bold border border-[#4edea3]/30">
                    Action
                  </span>
                </div>
                <div className="flex items-baseline justify-between my-0.5">
                  <span className="font-['JetBrains_Mono'] text-xs font-bold text-white truncate">
                    {hasDeficit ? 'Cross-Support / OT' : 'Shift Balanced'}
                  </span>
                </div>
                <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
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
