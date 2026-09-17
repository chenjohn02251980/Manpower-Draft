import React from 'react';
import { SiteData, TimePeriod } from '../types';
import { generateMonthlyApsPlan, generateCostCenterPayrollData } from '../utils/apsSchedule';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface HrActualViewProps {
  site: SiteData;
  timePeriod: TimePeriod;
  selectedYear: number;
  selectedMonth: number;
  onNavigateToForecast: () => void;
}

export const HrActualView: React.FC<HrActualViewProps> = ({
  site,
  timePeriod,
  selectedYear,
  selectedMonth,
  onNavigateToForecast,
}) => {
  const apsPlan = generateMonthlyApsPlan(site, selectedYear, selectedMonth);
  const costCenterData = generateCostCenterPayrollData(site, apsPlan);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthLabel = monthNames[selectedMonth - 1] || `Month ${selectedMonth}`;

  const totalMonthEndDL = costCenterData.reduce((sum, row) => sum + row.monthEndDL, 0);
  const totalW3DL = costCenterData.reduce((sum, row) => sum + row.w3DL, 0);
  const totalApsDL = costCenterData.reduce((sum, row) => sum + row.apsDemandDL, 0);
  const totalVariance = totalMonthEndDL - totalApsDL;

  // Weekly trend for Recharts
  const weeklyTrend = [
    {
      week: 'Week 1 (W1)',
      SMT: costCenterData.find((r) => r.processType === 'SMT')?.w1DL || 0,
      PCA: costCenterData.find((r) => r.processType === 'PCA')?.w1DL || 0,
      Assembly: costCenterData.find((r) => r.processType === 'System Assembly')?.w1DL || 0,
      Support:
        (costCenterData.find((r) => r.processType === 'Quality')?.w1DL || 0) +
        (costCenterData.find((r) => r.processType === 'Troubleshooting')?.w1DL || 0) +
        (costCenterData.find((r) => r.processType === 'Warehouse')?.w1DL || 0),
      total: costCenterData.reduce((sum, r) => sum + r.w1DL, 0),
    },
    {
      week: 'Week 2 (W2)',
      SMT: costCenterData.find((r) => r.processType === 'SMT')?.w2DL || 0,
      PCA: costCenterData.find((r) => r.processType === 'PCA')?.w2DL || 0,
      Assembly: costCenterData.find((r) => r.processType === 'System Assembly')?.w2DL || 0,
      Support:
        (costCenterData.find((r) => r.processType === 'Quality')?.w2DL || 0) +
        (costCenterData.find((r) => r.processType === 'Troubleshooting')?.w2DL || 0) +
        (costCenterData.find((r) => r.processType === 'Warehouse')?.w2DL || 0),
      total: costCenterData.reduce((sum, r) => sum + r.w2DL, 0),
    },
    {
      week: 'Week 3 (W3 - Baseline)',
      SMT: costCenterData.find((r) => r.processType === 'SMT')?.w3DL || 0,
      PCA: costCenterData.find((r) => r.processType === 'PCA')?.w3DL || 0,
      Assembly: costCenterData.find((r) => r.processType === 'System Assembly')?.w3DL || 0,
      Support:
        (costCenterData.find((r) => r.processType === 'Quality')?.w3DL || 0) +
        (costCenterData.find((r) => r.processType === 'Troubleshooting')?.w3DL || 0) +
        (costCenterData.find((r) => r.processType === 'Warehouse')?.w3DL || 0),
      total: totalW3DL,
    },
    {
      week: 'Week 4 (W4)',
      SMT: costCenterData.find((r) => r.processType === 'SMT')?.w4DL || 0,
      PCA: costCenterData.find((r) => r.processType === 'PCA')?.w4DL || 0,
      Assembly: costCenterData.find((r) => r.processType === 'System Assembly')?.w4DL || 0,
      Support:
        (costCenterData.find((r) => r.processType === 'Quality')?.w4DL || 0) +
        (costCenterData.find((r) => r.processType === 'Troubleshooting')?.w4DL || 0) +
        (costCenterData.find((r) => r.processType === 'Warehouse')?.w4DL || 0),
      total: costCenterData.reduce((sum, r) => sum + r.w4DL, 0),
    },
    {
      week: 'Month-End (Final)',
      SMT: costCenterData.find((r) => r.processType === 'SMT')?.monthEndDL || 0,
      PCA: costCenterData.find((r) => r.processType === 'PCA')?.monthEndDL || 0,
      Assembly: costCenterData.find((r) => r.processType === 'System Assembly')?.monthEndDL || 0,
      Support:
        (costCenterData.find((r) => r.processType === 'Quality')?.monthEndDL || 0) +
        (costCenterData.find((r) => r.processType === 'Troubleshooting')?.monthEndDL || 0) +
        (costCenterData.find((r) => r.processType === 'Warehouse')?.monthEndDL || 0),
      total: totalMonthEndDL,
    },
  ];

  return (
    <div className="space-y-6 pb-8 select-none">
      {/* 1. Context Banner */}
      <div className="bg-[#1C1D22] border border-[#524437]/60 rounded-lg p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-['JetBrains_Mono'] text-[#ffb86b] uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-sm">badge</span>
              Human Resources Workday & Payroll Cost Center Sync
            </div>
            <h3 className="font-['Inter'] text-2xl font-bold text-[#e5e1e6]">
              HR ACTUAL Paid Headcount Tracking — {site.name} ({monthLabel} {selectedYear})
            </h3>
            <p className="text-xs text-[#d7c3b2]/80 mt-1 max-w-3xl leading-relaxed">
              HR ACTUAL tracks verified paid direct labor (Paid Headcount DL) weekly (W1, W2, W3, W4) and at month-end based on department{' '}
              <strong className="text-[#a78bfa]">Cost Center</strong> payroll records, comparing actual staffing against APS demand and IE standard requirements in real-time.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#5de6ff]/20 text-[#5de6ff] border border-[#5de6ff]/40 rounded text-xs font-['JetBrains_Mono'] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#5de6ff] animate-pulse"></span>
              COST CENTER PAYROLL LIVE
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#1C1D22] border border-[#524437]/60 p-5 rounded-lg">
          <span className="text-[11px] font-['JetBrains_Mono'] text-[#d7c3b2]/80 uppercase block">
            Month-End Actual Paid DL
          </span>
          <div className="text-3xl font-bold font-['JetBrains_Mono'] text-[#5de6ff] mt-2">
            {totalMonthEndDL.toLocaleString()}{' '}
            <span className="text-sm font-normal text-[#d7c3b2]/60">DL</span>
          </div>
          <p className="text-[11px] text-[#d7c3b2]/60 mt-1">
            Reconciled from Cost Center payroll master
          </p>
        </div>

        <div className="bg-[#1C1D22] border border-[#524437]/60 p-5 rounded-lg">
          <span className="text-[11px] font-['JetBrains_Mono'] text-[#d7c3b2]/80 uppercase block">
            Week 3 (W3) Snapshot Paid DL
          </span>
          <div className="text-3xl font-bold font-['JetBrains_Mono'] text-[#ffb86b] mt-2">
            {totalW3DL.toLocaleString()}{' '}
            <span className="text-sm font-normal text-[#d7c3b2]/60">DL</span>
          </div>
          <p className="text-[11px] text-[#d7c3b2]/60 mt-1">
            Baseline headcount at APS plan release
          </p>
        </div>

        <div className="bg-[#1C1D22] border border-[#524437]/60 p-5 rounded-lg">
          <span className="text-[11px] font-['JetBrains_Mono'] text-[#d7c3b2]/80 uppercase block">
            Monthly APS Demand DL
          </span>
          <div className="text-3xl font-bold font-['JetBrains_Mono'] text-[#e5e1e6] mt-2">
            {totalApsDL.toLocaleString()}{' '}
            <span className="text-sm font-normal text-[#d7c3b2]/60">DL</span>
          </div>
          <p className="text-[11px] text-[#d7c3b2]/60 mt-1">
            Derived from active lines and shifts
          </p>
        </div>

        <div className="bg-[#1C1D22] border border-[#524437]/60 p-5 rounded-lg">
          <span className="text-[11px] font-['JetBrains_Mono'] text-[#d7c3b2]/80 uppercase block">
            Actual Paid vs APS Variance Gap
          </span>
          <div
            className={`text-3xl font-bold font-['JetBrains_Mono'] mt-2 ${
              totalVariance < 0 ? 'text-[#F59E0B]' : 'text-[#4edea3]'
            }`}
          >
            {totalVariance > 0 ? `+${totalVariance}` : totalVariance}{' '}
            <span className="text-sm font-normal text-[#d7c3b2]/60">DL</span>
          </div>
          <p className="text-[11px] text-[#d7c3b2]/60 mt-1">
            {totalVariance < 0
              ? 'Deficit: recruitment & OT prioritized'
              : 'Adequate: headcount satisfies production schedule'}
          </p>
        </div>
      </div>

      {/* 3. Cost Center Weekly & Month-End Matrix Table */}
      <div className="bg-[#1C1D22] border border-[#524437]/60 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="font-['Inter'] text-base font-semibold text-[#e5e1e6] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffb86b]">domain</span>
              Department Cost Center Weekly & Month-End Payroll Tracking
            </h4>
            <p className="text-xs text-[#d7c3b2]/70 mt-0.5">
              Weekly punch-clock and month-end payroll records compared against APS production demand
            </p>
          </div>
          <button
            onClick={onNavigateToForecast}
            className="px-3 py-1.5 border border-[#ffb86b] text-[#ffb86b] hover:bg-[#ffb86b] hover:text-[#492900] transition-all text-xs font-['JetBrains_Mono'] font-bold rounded"
          >
            Calibrate IE Standards
          </button>
        </div>

        <div className="overflow-x-auto rounded border border-[#524437]/40 bg-[#131316]">
          <table className="w-full text-left font-['Inter'] text-xs">
            <thead className="bg-[#201f23] text-[#d7c3b2]/80 font-['JetBrains_Mono']">
              <tr>
                <th className="p-3 border-b border-[#524437]/40">Department</th>
                <th className="p-3 border-b border-[#524437]/40 text-center">Cost Centers</th>
                <th className="p-3 border-b border-[#524437]/40 text-right">W1 Paid</th>
                <th className="p-3 border-b border-[#524437]/40 text-right">W2 Paid</th>
                <th className="p-3 border-b border-[#524437]/40 text-right bg-[#ffb86b]/10 text-[#ffb86b]">
                  W3 (Baseline)
                </th>
                <th className="p-3 border-b border-[#524437]/40 text-right">W4 Paid</th>
                <th className="p-3 border-b border-[#524437]/40 text-right bg-[#5de6ff]/10 text-[#5de6ff] font-bold">
                  Month-End (Final)
                </th>
                <th className="p-3 border-b border-[#524437]/40 text-right">APS Demand</th>
                <th className="p-3 border-b border-[#524437]/40 text-right">Variance (Gap)</th>
                <th className="p-3 border-b border-[#524437]/40 text-center">Attendance</th>
                <th className="p-3 border-b border-[#524437]/40 text-center">Status & Action</th>
              </tr>
            </thead>
            <tbody>
              {costCenterData.map((row) => (
                <tr
                  key={row.department}
                  className="border-b border-[#524437]/20 hover:bg-[#1c1b1f] transition-colors"
                >
                  <td className="p-3 font-semibold text-[#e5e1e6]">{row.department}</td>
                  <td className="p-3 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      {row.costCenters.map((cc) => (
                        <span
                          key={cc}
                          className="px-1.5 py-0.5 rounded bg-[#201f23] border border-[#a78bfa]/40 text-[11px] font-bold text-[#a78bfa] font-['JetBrains_Mono']"
                        >
                          {cc}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-right font-['JetBrains_Mono'] text-[#d7c3b2]">
                    {row.w1DL}
                  </td>
                  <td className="p-3 text-right font-['JetBrains_Mono'] text-[#d7c3b2]">
                    {row.w2DL}
                  </td>
                  <td className="p-3 text-right font-['JetBrains_Mono'] font-bold text-[#ffb86b] bg-[#ffb86b]/5">
                    {row.w3DL}
                  </td>
                  <td className="p-3 text-right font-['JetBrains_Mono'] text-[#d7c3b2]">
                    {row.w4DL}
                  </td>
                  <td className="p-3 text-right font-['JetBrains_Mono'] font-bold text-[#5de6ff] bg-[#5de6ff]/5 text-sm">
                    {row.monthEndDL}
                  </td>
                  <td className="p-3 text-right font-['JetBrains_Mono'] text-[#e5e1e6]">
                    {row.apsDemandDL}
                  </td>
                  <td
                    className={`p-3 text-right font-['JetBrains_Mono'] font-bold ${
                      row.varianceDL < 0 ? 'text-[#F59E0B]' : 'text-[#4edea3]'
                    }`}
                  >
                    {row.varianceDL > 0 ? `+${row.varianceDL}` : row.varianceDL}
                  </td>
                  <td className="p-3 text-center font-['JetBrains_Mono'] text-[#d7c3b2]">
                    {row.attendanceRate}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold border ${
                        row.status === 'DEFICIT'
                          ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40'
                          : row.status === 'SURPLUS'
                          ? 'bg-[#4edea3]/20 text-[#4edea3] border-[#4edea3]/40'
                          : 'bg-[#5de6ff]/20 text-[#5de6ff] border-[#5de6ff]/40'
                      }`}
                      title={row.actionNeeded}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#201f23] font-['JetBrains_Mono'] font-bold text-xs text-[#e5e1e6]">
              <tr>
                <td className="p-3" colSpan={2}>
                  Total Plant Paid Headcount
                </td>
                <td className="p-3 text-right text-[#d7c3b2]">
                  {costCenterData.reduce((sum, r) => sum + r.w1DL, 0)}
                </td>
                <td className="p-3 text-right text-[#d7c3b2]">
                  {costCenterData.reduce((sum, r) => sum + r.w2DL, 0)}
                </td>
                <td className="p-3 text-right text-[#ffb86b] bg-[#ffb86b]/10">
                  {totalW3DL}
                </td>
                <td className="p-3 text-right text-[#d7c3b2]">
                  {costCenterData.reduce((sum, r) => sum + r.w4DL, 0)}
                </td>
                <td className="p-3 text-right text-[#5de6ff] bg-[#5de6ff]/10 text-sm">
                  {totalMonthEndDL}
                </td>
                <td className="p-3 text-right text-[#e5e1e6]">{totalApsDL}</td>
                <td
                  className={`p-3 text-right ${
                    totalVariance < 0 ? 'text-[#F59E0B]' : 'text-[#4edea3]'
                  }`}
                >
                  {totalVariance > 0 ? `+${totalVariance}` : totalVariance}
                </td>
                <td className="p-3 text-center text-[#d7c3b2]">98.2%</td>
                <td className="p-3 text-center text-[#ffb86b]">
                  {totalVariance < 0 ? 'DEFICIT GAP' : 'BALANCED'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 4. Weekly Payroll Progression Visual Chart */}
      <div className="bg-[#1C1D22] border border-[#524437]/60 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="font-['Inter'] text-base font-semibold text-[#e5e1e6] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffb86b]">stacked_bar_chart</span>
              Weekly (W1 ~ W4) & Month-End Paid Headcount Progression
            </h4>
            <p className="text-xs text-[#d7c3b2]/70 mt-0.5">
              Cumulative weekly punch-clock progression towards month-end final payroll reconciliation
            </p>
          </div>
        </div>

        <div className="w-full h-[300px] bg-[#131316]/60 border border-[#524437]/30 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyTrend} margin={{ top: 15, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#524437" opacity={0.3} />
              <XAxis
                dataKey="week"
                stroke="#d7c3b2"
                tick={{ fill: '#d7c3b2', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              />
              <YAxis
                stroke="#d7c3b2"
                tick={{ fill: '#d7c3b2', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1C1D22',
                  borderColor: '#524437',
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Inter' }} />
              <Bar dataKey="SMT" name="SMT Process" fill="#ffb86b" stackId="a" />
              <Bar dataKey="PCA" name="PCA Process" fill="#cd8939" stackId="a" />
              <Bar dataKey="Assembly" name="System Assembly" fill="#5de6ff" stackId="a" />
              <Bar dataKey="Support" name="QA / TS / WH Support" fill="#a78bfa" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
