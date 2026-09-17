import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { SiteData, TimePeriod, CostCenterPayrollWeekly } from '../types';
import { calculateSiteMetrics } from '../utils/calculations';
import {
  generateMonthlyApsPlan,
  generateCostCenterPayrollData,
  generate12MonthTrend,
  getMonthlyApsVolumes,
} from '../utils/apsSchedule';

interface ExecutiveOverviewViewProps {
  sites: Record<string, SiteData>;
  currentSite: SiteData;
  timePeriod: TimePeriod;
  selectedYear: number;
  selectedMonth: number;
  onChangeMonth: (month: number) => void;
  onSelectSite: (siteId: string) => void;
  onNavigateToForecast: () => void;
}

const AnnualCustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isTotalDeficit = (data.varianceGap ?? 0) < 0;
    const isDlDeficit = (data.dlVarianceGap ?? 0) < 0;

    const totalAps = data.totalApsDemand ?? ((data.apsDemandDL || 0) + (data.apsDemandIDL || 0));
    const totalHr = data.totalHrActual ?? ((data.hrActualDL || 0) + (data.hrActualIDL || 0));

    return (
      <div className="bg-[#131316]/95 border border-[#524437] rounded-lg p-4 shadow-2xl backdrop-blur-md text-xs font-['Inter'] min-w-[280px]">
        <div className="font-['JetBrains_Mono'] text-[#ffb86b] font-bold pb-2 border-b border-[#524437]/50 mb-2.5 flex items-center justify-between gap-4">
          <span className="text-sm">{label} — APS vs HR Headcount Analysis</span>
          <div className="flex items-center gap-1">
            {data.isHistoricalAps && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#4edea3]/20 text-[#4edea3] font-bold border border-[#4edea3]/40">
                Jan–Aug APS Plan
              </span>
            )}
            {data.isSelected && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#ffb86b] text-[#492900] font-bold">
                CURRENT
              </span>
            )}
          </div>
        </div>

        {/* 1. APS Total Headcount (DL + IDL) */}
        <div className="mb-2.5 pb-2 border-b border-[#524437]/30 space-y-1 font-['JetBrains_Mono']">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#ffb86b] font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#ffb86b]"></span>
              APS Demand Total (DL+IDL):
            </span>
            <span className="font-bold text-[#ffb86b] text-sm">
              {(totalAps ?? 0).toLocaleString()} HC
            </span>
          </div>
          <div className="flex justify-between pl-4 text-[11px] text-[#d7c3b2]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ffb86b]"></span>
              Direct DL:
            </span>
            <span className="font-semibold text-white">
              {(data.apsDemandDL ?? 0).toLocaleString()} DL
            </span>
          </div>
          <div className="flex justify-between pl-4 text-[11px] text-[#d7c3b2]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#fb923c]"></span>
              Indirect IDL:
            </span>
            <span className="font-semibold text-white">
              {(data.apsDemandIDL || 0).toLocaleString()} IDL
            </span>
          </div>
        </div>

        {/* 2. HR Paid Total Headcount (DL + IDL) */}
        <div className="mb-2.5 pb-2 border-b border-[#524437]/30 space-y-1 font-['JetBrains_Mono']">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#5de6ff] font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#5de6ff]"></span>
              HR Paid Total (DL+IDL):
            </span>
            <span className="font-bold text-[#5de6ff] text-sm">
              {(totalHr ?? 0).toLocaleString()} HC
            </span>
          </div>
          <div className="flex justify-between pl-4 text-[11px] text-[#d7c3b2]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#5de6ff]"></span>
              Direct DL:
            </span>
            <span className="font-semibold text-white">
              {(data.hrActualDL ?? 0).toLocaleString()} DL
            </span>
          </div>
          <div className="flex justify-between pl-4 text-[11px] text-[#d7c3b2]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#c084fc]"></span>
              Indirect IDL:
            </span>
            <span className="font-semibold text-white">
              {(data.hrActualIDL || 0).toLocaleString()} IDL
            </span>
          </div>
        </div>

        {/* 3. Net Variance & Fulfillment */}
        <div className="space-y-1 font-['JetBrains_Mono']">
          <div className="flex justify-between gap-4 text-xs">
            <span className="text-[#d7c3b2]">Net Total GAP:</span>
            <span
              className={`font-bold ${
                isTotalDeficit ? 'text-[#F59E0B]' : 'text-[#4edea3]'
              }`}
            >
              {data.varianceGap > 0 ? `+${data.varianceGap}` : data.varianceGap} HC
            </span>
          </div>
          <div className="flex justify-between gap-4 text-[11px] text-[#d7c3b2]/80">
            <span>Net Direct DL GAP:</span>
            <span
              className={`font-semibold ${
                isDlDeficit ? 'text-[#F59E0B]' : 'text-[#4edea3]'
              }`}
            >
              {(data.dlVarianceGap ?? data.varianceGap) > 0
                ? `+${data.dlVarianceGap ?? data.varianceGap}`
                : data.dlVarianceGap ?? data.varianceGap}{' '}
              DL
            </span>
          </div>
          <div className="flex justify-between gap-4 text-[11px] text-[#d7c3b2]/80 pt-1 border-t border-[#524437]/30">
            <span>Staffing Fulfillment:</span>
            <span className="font-bold text-[#e5e1e6]">
              {data.fulfillmentRate}%
            </span>
          </div>
          <div className="flex justify-between gap-4 text-[10px] text-[#d7c3b2]/50 pt-1">
            <span>Active Lines & Shifts:</span>
            <span className="text-[#e5e1e6]">
              {data.activeLines || 8} Lines · {data.totalShifts || 18} Shifts/day
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const ExecutiveOverviewView: React.FC<ExecutiveOverviewViewProps> = ({
  sites,
  currentSite,
  timePeriod,
  selectedYear,
  selectedMonth,
  onChangeMonth,
  onSelectSite,
  onNavigateToForecast,
}) => {
  const currentMetrics = calculateSiteMetrics(currentSite, timePeriod);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthLabel = monthNames[selectedMonth - 1] || `Month ${selectedMonth}`;

  // Compute monthly APS plan and Cost Center payroll data
  const currentApsPlan = generateMonthlyApsPlan(currentSite, selectedYear, selectedMonth);
  const costCenterData = generateCostCenterPayrollData(currentSite, currentApsPlan);

  const monthlyApsDemandDL = currentApsPlan.totalApsDemandDL;
  const monthlyApsDemandIDL = currentMetrics.totalIDL;
  const monthlyApsTotal = monthlyApsDemandDL + monthlyApsDemandIDL;

  const hrMonthEndDL = costCenterData.reduce((sum, r) => sum + r.monthEndDL, 0);
  const hrMonthEndIDL = currentSite.actualHrIDL !== undefined ? currentSite.actualHrIDL : currentMetrics.totalIDL;
  const hrTotalPaid = hrMonthEndDL + hrMonthEndIDL;

  const netVariance = hrMonthEndDL - monthlyApsDemandDL;
  const netTotalVariance = hrTotalPaid - monthlyApsTotal;
  const fulfillmentRate = Math.round((hrTotalPaid / (monthlyApsTotal || 1)) * 100);

  // 12-Month Annual Trend Data
  const annualTrend = generate12MonthTrend(currentSite, selectedYear, selectedMonth);

  // Department variance comparison for BarChart
  const deptVarianceData = costCenterData.map((row) => ({
    name: row.processType,
    apsDemand: row.apsDemandDL,
    hrActual: row.monthEndDL,
    variance: row.varianceDL,
  }));

  // Multi-site consolidated metrics (excluding internal TAO sub-plants)
  const isInternalSubPlant = (s: SiteData) =>
    s.id === 'tp08' ||
    s.id === 'tp15' ||
    s.id === 'tp16' ||
    s.code === 'TP08' ||
    s.code === 'TP15' ||
    s.code === 'TP16';

  const allSiteMetrics = (Object.values(sites) as SiteData[])
    .filter((s) => !isInternalSubPlant(s))
    .map((s) => ({
      site: s,
      metrics: calculateSiteMetrics(s, timePeriod),
      apsPlan: generateMonthlyApsPlan(s, selectedYear, selectedMonth),
    }));

  // Resolve plant-level gap indication for action plan
  const getRowPlantActionText = (row: CostCenterPayrollWeekly): string => {
    if (currentSite.id === 'overall') {
      const siteBreakdown: Array<{ name: string; gap: number }> = [];
      allSiteMetrics
        .filter((m) => m.site.id !== 'overall')
        .forEach(({ site, apsPlan }) => {
          const siteCC = generateCostCenterPayrollData(site, apsPlan);
          const dept = siteCC.find((d) => d.processType === row.processType);
          if (dept && dept.varianceDL !== 0) {
            siteBreakdown.push({ name: site.name, gap: dept.varianceDL });
          }
        });

      if (row.varianceDL < 0) {
        const deficits = siteBreakdown
          .filter((s) => s.gap < 0)
          .sort((a, b) => a.gap - b.gap);
        if (deficits.length > 0) {
          return `Deficit Plants: ${deficits.slice(0, 3).map((s) => `${s.name} (${s.gap} DL)`).join(', ')}`;
        }
      } else if (row.varianceDL > 0) {
        const surpluses = siteBreakdown
          .filter((s) => s.gap > 0)
          .sort((a, b) => b.gap - a.gap);
        if (surpluses.length > 0) {
          return `Surplus Plants: ${surpluses.slice(0, 3).map((s) => `${s.name} (+${s.gap} DL)`).join(', ')}`;
        }
      }
      return 'Plant headcount balanced (No significant gap)';
    }

    return row.actionNeeded;
  };

  return (
    <div className="space-y-6 pb-8 select-none">
      {/* 1. ⭐ Visual Chart 1: Annual APS Demand VS HR (Jan - Dec Bar Chart) ⭐ */}
      <div className="bg-[#1C1D22] border border-[#524437]/60 rounded-lg p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-['JetBrains_Mono'] text-[#ffb86b] uppercase tracking-wider mb-1">
              <span>Annual Staffing Comparison</span>
            </div>
            <h4 className="font-['Inter'] text-lg font-bold text-[#e5e1e6] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffb86b]">equalizer</span>
              Annual APS Demand VS HR (Jan – Dec Total DL+IDL Stacked Comparison)
            </h4>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="w-full h-[380px] bg-[#131316]/60 border border-[#524437]/30 rounded-lg p-4 backdrop-blur-sm">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={annualTrend}
              margin={{ top: 15, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#524437" opacity={0.3} />
              <XAxis
                dataKey="monthName"
                stroke="#d7c3b2"
                opacity={0.8}
                tick={{ fill: '#d7c3b2', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              />
              <YAxis
                stroke="#d7c3b2"
                opacity={0.8}
                tick={{ fill: '#d7c3b2', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              />
              <Tooltip content={<AnnualCustomTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: '12px',
                  fontSize: '11px',
                  fontFamily: 'Inter',
                  color: '#e5e1e6',
                }}
              />
              <ReferenceLine
                y={0}
                stroke="#F59E0B"
                strokeDasharray="4 4"
                label={{
                  value: '0 Gap Equilibrium',
                  fill: '#F59E0B',
                  fontSize: 10,
                  position: 'insideTopRight',
                  fontFamily: 'JetBrains Mono',
                }}
              />
              {/* APS Stacked Bar: stackId="aps" */}
              <Bar
                dataKey="apsDemandDL"
                stackId="aps"
                name="APS DL (Direct Labor)"
                fill="#ffb86b"
                barSize={18}
              />
              <Bar
                dataKey="apsDemandIDL"
                stackId="aps"
                name="APS IDL (Indirect Labor)"
                fill="#fb923c"
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
              {/* HR Stacked Bar: stackId="hr" */}
              <Bar
                dataKey="hrActualDL"
                stackId="hr"
                name="HR DL (Direct Labor)"
                fill="#5de6ff"
                barSize={18}
              />
              <Bar
                dataKey="hrActualIDL"
                stackId="hr"
                name="HR IDL (Indirect Labor)"
                fill="#c084fc"
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
              {/* Line: Net Variance Gap (Total GAP) */}
              <Line
                type="monotone"
                dataKey="varianceGap"
                name="Net Variance GAP (HR Paid − APS Demand)"
                stroke="#4edea3"
                strokeWidth={3}
                dot={{ r: 4, fill: '#4edea3', stroke: '#131316', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#4edea3', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Selected Month Summary Ribbon below chart */}
        <div className="mt-4 p-3 bg-[#131316] rounded-lg border border-[#524437]/40 flex flex-wrap items-center justify-between gap-4 text-xs font-['JetBrains_Mono']">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="w-2 h-2 rounded-full bg-[#ffb86b]"></span>
            <span className="text-[#d7c3b2]">Selected Month Analysis ({monthLabel} {selectedYear}):</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#201f23] rounded border border-[#ffb86b]/40">
              <span className="text-[#ffb86b] font-bold">APS Total: {monthlyApsTotal.toLocaleString()} HC</span>
              <span className="text-[11px] text-[#d7c3b2]/70">
                (DL: <strong className="text-[#ffb86b]">{monthlyApsDemandDL}</strong> + IDL: <strong className="text-[#fb923c]">{monthlyApsDemandIDL}</strong>)
              </span>
            </div>
            <span className="text-[#d7c3b2]/40">•</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#201f23] rounded border border-[#5de6ff]/40">
              <span className="text-[#5de6ff] font-bold">HR Total: {hrTotalPaid.toLocaleString()} HC</span>
              <span className="text-[11px] text-[#d7c3b2]/70">
                (DL: <strong className="text-[#5de6ff]">{hrMonthEndDL}</strong> + IDL: <strong className="text-[#c084fc]">{hrMonthEndIDL}</strong>)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#d7c3b2]">Net Headcount Gap:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                netTotalVariance < 0
                  ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                  : 'bg-[#4edea3]/20 text-[#4edea3]'
              }`}
            >
              {netTotalVariance > 0 ? `+${netTotalVariance}` : netTotalVariance} HC
            </span>
            <span className="text-[#d7c3b2]/40">•</span>
            <span className="text-[#d7c3b2]">Fulfillment: {fulfillmentRate}%</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Chart 2: Cost Center Department Variance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1C1D22] border border-[#524437]/60 rounded-lg p-6">
          <h4 className="font-['Inter'] text-base font-semibold text-[#e5e1e6] flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[#ffb86b]">bar_chart</span>
            Process Cost Center Paid Headcount vs APS Demand
          </h4>
          <div className="w-full h-[280px] bg-[#131316]/60 border border-[#524437]/30 rounded-lg p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deptVarianceData}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#524437" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  stroke="#d7c3b2"
                  tick={{ fill: '#d7c3b2', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                />
                <YAxis
                  stroke="#d7c3b2"
                  tick={{ fill: '#d7c3b2', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C1D22',
                    borderColor: '#524437',
                    borderRadius: '8px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Inter' }} />
                <Bar dataKey="apsDemand" name="APS Demand DL" fill="#ffb86b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="hrActual" name="HR Paid DL" fill="#5de6ff" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Center Variance Analysis Matrix */}
        <div className="bg-[#1C1D22] border border-[#524437]/60 rounded-lg p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-['Inter'] text-base font-semibold text-[#e5e1e6] flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#ffb86b]">troubleshoot</span>
              Cost Center Headcount Gap Diagnosis & Action Plan
            </h4>
            <div className="space-y-2.5 overflow-y-auto max-h-[280px] custom-scrollbar pr-1">
              {costCenterData.map((row) => {
                const actionPlanText = getRowPlantActionText(row);
                return (
                  <div
                    key={row.department}
                    className="bg-[#131316] p-3 rounded-lg border border-[#524437]/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#e5e1e6] flex items-center gap-2">
                        <span>{row.department}</span>
                        <span className="text-[10px] text-[#a78bfa] font-['JetBrains_Mono']">
                          [{row.costCenters.join(', ')}]
                        </span>
                      </div>
                      <div className="text-[11px] text-[#d7c3b2]/80 mt-1 flex flex-wrap items-center gap-1.5 font-['JetBrains_Mono']">
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full ${
                            row.varianceDL < 0
                              ? 'bg-[#ffb86b]'
                              : row.varianceDL > 0
                              ? 'bg-[#4edea3]'
                              : 'bg-[#d7c3b2]/40'
                          }`}
                        />
                        <span
                          className={
                            row.varianceDL < 0
                              ? 'text-[#ffb86b] font-medium'
                              : row.varianceDL > 0
                              ? 'text-[#4edea3]'
                              : 'text-[#d7c3b2]/70'
                          }
                        >
                          {actionPlanText}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-['JetBrains_Mono']">
                      <div
                        className={`font-bold ${
                          row.varianceDL < 0 ? 'text-[#F59E0B]' : 'text-[#4edea3]'
                        }`}
                      >
                        {row.varianceDL > 0 ? `+${row.varianceDL}` : row.varianceDL} DL
                      </div>
                      <div className="text-[10px] text-[#d7c3b2]/60">
                        Demand {row.apsDemandDL} / Paid {row.monthEndDL}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Global Multi-Plant Manpower Summary Table */}
      <div className="bg-[#1C1D22] border border-[#524437]/60 rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
          <div>
            <h4 className="font-['Inter'] text-base font-semibold text-[#e5e1e6] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffb86b]">factory</span>
              Plant SMT / CPU Production Volume & APS Demand vs HR Paid Summary ({monthLabel} {selectedYear})
            </h4>
            <p className="text-xs text-[#d7c3b2]/70 mt-0.5">
              Consolidated plant monthly SMT & CPU production volumes against APS Demand (DL / IDL / Total) vs HR Paid (DL / IDL / Total) Net Manpower Gap
            </p>
          </div>
          <span className="font-['JetBrains_Mono'] text-xs text-[#ffb86b] bg-[#ffb86b]/10 px-2.5 py-1 rounded border border-[#ffb86b]/20">
            Total Plants: {allSiteMetrics.filter((item) => item.site.id !== 'overall').length} Manufacturing Sites
          </span>
        </div>

        <div className="overflow-x-auto rounded border border-[#524437]/40 bg-[#131316]">
          <table className="w-full text-left font-['Inter'] text-xs min-w-[1180px]">
            <thead className="bg-[#201f23] text-[#d7c3b2]/80 font-['JetBrains_Mono'] text-[11px]">
              <tr className="border-b border-[#524437]/40">
                <th rowSpan={2} className="p-3 border-r border-[#524437]/40 align-middle">
                  PLANT / SITE
                </th>
                <th colSpan={2} className="p-2 text-center border-r border-[#524437]/40 bg-[#1a232b] text-[#38bdf8] font-semibold">
                  MONTHLY PRODUCTION VOLUME
                </th>
                <th colSpan={3} className="p-2 text-center border-r border-[#524437]/40 bg-[#29221b] text-[#ffb86b] font-semibold">
                  APS TOTAL DEMAND
                </th>
                <th colSpan={3} className="p-2 text-center border-r border-[#524437]/40 bg-[#14232a] text-[#5de6ff] font-semibold">
                  HR TOTAL PAID
                </th>
                <th rowSpan={2} className="p-3 border-r border-[#524437]/40 text-right align-middle">
                  NET MANPOWER GAP
                </th>
                <th rowSpan={2} className="p-3 border-r border-[#524437]/40 text-right align-middle">
                  FULFILLMENT
                </th>
                <th rowSpan={2} className="p-3 border-r border-[#524437]/40 text-center align-middle">
                  STATUS
                </th>
                <th rowSpan={2} className="p-3 text-center align-middle">
                  ACTION
                </th>
              </tr>
              <tr className="border-b border-[#524437]/40 bg-[#18181c] text-[10px]">
                <th className="p-2 text-right border-r border-[#524437]/20 text-[#38bdf8]">SMT Volume (pcs)</th>
                <th className="p-2 text-right border-r border-[#524437]/40 text-[#a78bfa]">CPU Volume (Units)</th>
                <th className="p-2 text-right border-r border-[#524437]/20 text-[#ffb86b]">DL</th>
                <th className="p-2 text-right border-r border-[#524437]/20 text-[#fb923c]">IDL</th>
                <th className="p-2 text-right border-r border-[#524437]/40 text-[#ffb86b] font-bold bg-[#ffb86b]/10">Total</th>
                <th className="p-2 text-right border-r border-[#524437]/20 text-[#5de6ff]">DL</th>
                <th className="p-2 text-right border-r border-[#524437]/20 text-[#c084fc]">IDL</th>
                <th className="p-2 text-right border-r border-[#524437]/40 text-[#5de6ff] font-bold bg-[#5de6ff]/10">Total</th>
              </tr>
            </thead>
            <tbody>
              {allSiteMetrics
                .filter((item) => item.site.id !== 'overall')
                .map(({ site: s, metrics, apsPlan }) => {
                  const sVolumes = getMonthlyApsVolumes(s, selectedMonth);
                  const sApsDL = apsPlan.totalApsDemandDL;
                  const sApsIDL = metrics.totalIDL;
                  const sApsTotal = sApsDL + sApsIDL;

                  const sHrDL = s.actualHrDL || sApsDL;
                  const sHrIDL = s.actualHrIDL !== undefined ? s.actualHrIDL : metrics.totalIDL;
                  const sHrTotal = sHrDL + sHrIDL;

                  const sNetGap = sHrTotal - sApsTotal;
                  const sGapDL = sHrDL - sApsDL;
                  const sRate = Math.round((sHrTotal / (sApsTotal || 1)) * 100);
                  const isCurrent = s.id === currentSite.id;

                  return (
                    <tr
                      key={s.id}
                      className={`border-b border-[#524437]/20 hover:bg-[#1c1b1f] transition-colors ${
                        isCurrent ? 'bg-[#ffb86b]/5' : ''
                      }`}
                    >
                      <td className="p-3 font-semibold text-[#e5e1e6] font-['JetBrains_Mono'] flex items-center gap-2 border-r border-[#524437]/30">
                        {isCurrent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ffb86b]"></span>
                        )}
                        <span>{s.name}</span>
                        <span className="text-[10px] text-[#d7c3b2]/50">({s.code})</span>
                      </td>
                      <td className="p-2.5 text-right font-['JetBrains_Mono'] text-[#38bdf8] border-r border-[#524437]/20">
                        {(sVolumes?.smtVolume ?? 0).toLocaleString()}
                      </td>
                      <td className="p-2.5 text-right font-['JetBrains_Mono'] text-[#a78bfa] border-r border-[#524437]/40">
                        {(sVolumes?.cpuVolume ?? 0).toLocaleString()}
                      </td>
                      <td className="p-2.5 text-right font-['JetBrains_Mono'] text-[#ffb86b] border-r border-[#524437]/20">
                        {(sApsDL ?? 0).toLocaleString()}
                      </td>
                      <td className="p-2.5 text-right font-['JetBrains_Mono'] text-[#fb923c] border-r border-[#524437]/20">
                        {(sApsIDL ?? 0).toLocaleString()}
                      </td>
                      <td className="p-2.5 text-right font-['JetBrains_Mono'] font-bold text-[#ffb86b] bg-[#ffb86b]/5 border-r border-[#524437]/40">
                        {(sApsTotal ?? 0).toLocaleString()}
                      </td>
                      <td className="p-2.5 text-right font-['JetBrains_Mono'] text-[#5de6ff] border-r border-[#524437]/20">
                        {(sHrDL ?? 0).toLocaleString()}
                      </td>
                      <td className="p-2.5 text-right font-['JetBrains_Mono'] text-[#c084fc] border-r border-[#524437]/20">
                        {(sHrIDL ?? 0).toLocaleString()}
                      </td>
                      <td className="p-2.5 text-right font-['JetBrains_Mono'] font-bold text-[#5de6ff] bg-[#5de6ff]/5 border-r border-[#524437]/40">
                        {(sHrTotal ?? 0).toLocaleString()}
                      </td>
                      <td className="p-2.5 text-right font-['JetBrains_Mono'] font-bold border-r border-[#524437]/30">
                        <div className={sNetGap < 0 ? 'text-[#F59E0B]' : 'text-[#4edea3]'}>
                          {sNetGap > 0 ? `+${sNetGap}` : sNetGap}
                        </div>
                        <div className="text-[10px] text-[#d7c3b2]/60 font-normal">
                          DL: {sGapDL > 0 ? `+${sGapDL}` : sGapDL}
                        </div>
                      </td>
                      <td className="p-2.5 text-right font-['JetBrains_Mono'] text-[#e5e1e6] border-r border-[#524437]/30">
                        {sRate}%
                      </td>
                      <td className="p-2.5 text-center border-r border-[#524437]/30">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold border ${
                            sNetGap < 0
                              ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                              : 'bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/30'
                          }`}
                        >
                          {sNetGap < 0 ? 'DEFICIT' : 'SUFFICIENT'}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => onSelectSite(s.id)}
                          className={`px-2.5 py-1 text-[11px] font-['JetBrains_Mono'] rounded transition-all border ${
                            isCurrent
                              ? 'bg-[#ffb86b] text-[#492900] font-bold border-[#ffb86b]'
                              : 'text-[#d7c3b2] border-[#524437]/60 hover:text-[#ffb86b] hover:border-[#ffb86b]'
                          }`}
                        >
                          {isCurrent ? 'Selected' : 'Switch Plant'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            {/* Global Total Row */}
            {(() => {
              const activeSites = allSiteMetrics.filter((item) => item.site.id !== 'overall');
              const totals = activeSites.reduce(
                (acc, { site: s, metrics, apsPlan }) => {
                  const vol = getMonthlyApsVolumes(s, selectedMonth);
                  const apsDL = apsPlan.totalApsDemandDL;
                  const apsIDL = metrics.totalIDL;
                  const apsTotal = apsDL + apsIDL;

                  const hrDL = s.actualHrDL || apsDL;
                  const hrIDL = s.actualHrIDL !== undefined ? s.actualHrIDL : metrics.totalIDL;
                  const hrTotal = hrDL + hrIDL;

                  const netGap = hrTotal - apsTotal;
                  const gapDL = hrDL - apsDL;

                  return {
                    smtVolume: acc.smtVolume + vol.smtVolume,
                    cpuVolume: acc.cpuVolume + vol.cpuVolume,
                    apsDL: acc.apsDL + apsDL,
                    apsIDL: acc.apsIDL + apsIDL,
                    apsTotal: acc.apsTotal + apsTotal,
                    hrDL: acc.hrDL + hrDL,
                    hrIDL: acc.hrIDL + hrIDL,
                    hrTotal: acc.hrTotal + hrTotal,
                    netGap: acc.netGap + netGap,
                    gapDL: acc.gapDL + gapDL,
                  };
                },
                {
                  smtVolume: 0,
                  cpuVolume: 0,
                  apsDL: 0,
                  apsIDL: 0,
                  apsTotal: 0,
                  hrDL: 0,
                  hrIDL: 0,
                  hrTotal: 0,
                  netGap: 0,
                  gapDL: 0,
                }
              );
              const totalRate = Math.round((totals.hrTotal / (totals.apsTotal || 1)) * 100);

              return (
                <tfoot className="bg-[#1a191e] border-t-2 border-[#524437]/80 font-['JetBrains_Mono'] text-xs font-bold">
                  <tr>
                    <td className="p-3 text-[#e5e1e6] border-r border-[#524437]/40 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#ffb86b]">corporate_fare</span>
                      <span>TOTAL</span>
                    </td>
                    <td className="p-2.5 text-right text-[#38bdf8] border-r border-[#524437]/20">
                      {(totals?.smtVolume ?? 0).toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right text-[#a78bfa] border-r border-[#524437]/40">
                      {(totals?.cpuVolume ?? 0).toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right text-[#ffb86b] border-r border-[#524437]/20">
                      {(totals?.apsDL ?? 0).toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right text-[#fb923c] border-r border-[#524437]/20">
                      {(totals?.apsIDL ?? 0).toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right text-[#ffb86b] bg-[#ffb86b]/15 border-r border-[#524437]/40 font-extrabold">
                      {(totals?.apsTotal ?? 0).toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right text-[#5de6ff] border-r border-[#524437]/20">
                      {(totals?.hrDL ?? 0).toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right text-[#c084fc] border-r border-[#524437]/20">
                      {(totals?.hrIDL ?? 0).toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right text-[#5de6ff] bg-[#5de6ff]/15 border-r border-[#524437]/40 font-extrabold">
                      {(totals?.hrTotal ?? 0).toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right border-r border-[#524437]/30">
                      <div className={totals.netGap < 0 ? 'text-[#F59E0B]' : 'text-[#4edea3]'}>
                        {totals.netGap > 0 ? `+${totals.netGap}` : totals.netGap}
                      </div>
                      <div className="text-[10px] text-[#d7c3b2]/60 font-normal">
                        DL: {totals.gapDL > 0 ? `+${totals.gapDL}` : totals.gapDL}
                      </div>
                    </td>
                    <td className="p-2.5 text-right text-[#e5e1e6] border-r border-[#524437]/30">
                      {totalRate}%
                    </td>
                    <td className="p-2.5 text-center border-r border-[#524437]/30">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          totals.netGap < 0
                            ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                            : 'bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/30'
                        }`}
                      >
                        {totals.netGap < 0 ? 'DEFICIT' : 'SUFFICIENT'}
                      </span>
                    </td>
                    <td className="p-2.5 text-center text-[#d7c3b2]/50 text-[10px]">
                      ALL PLANTS
                    </td>
                  </tr>
                </tfoot>
              );
            })()}
          </table>
        </div>
      </div>
    </div>
  );
};
