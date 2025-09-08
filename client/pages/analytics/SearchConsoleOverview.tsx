import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, CheckCircle2, Info } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { generateOverview, generatePerformance } from "@/lib/gscDummy";

function Stat({ label, value, postfix, hint }: { label: string; value: number | string; postfix?: string; hint?: string }) {
  return (
    <div className="p-4 rounded-lg bg-white border border-blue-100">
      <p className="text-xs text-blue-600">{label}</p>
      <p className="text-2xl font-semibold text-blue-900">{value}{postfix ?? ""}</p>
      {hint && <p className="text-xs text-blue-500 mt-1">{hint}</p>}
    </div>
  );
}

export default function SearchConsoleOverview() {
  const data = generateOverview();
  const perf = generatePerformance(30);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><BarChart3 className="w-6 h-6"/>Search Console • Overview</h1>
        <span className="text-xs text-gray-500">Business: {data.business.name} • Simulated data</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance (last {data.period})</CardTitle>
            
            <CardDescription className="text-black">Clicks, impressions, CTR and average position.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Total clicks" value={data.performance.clicks}/>
              <Stat label="Total impressions" value={data.performance.impressions}/>
              <Stat label="Average CTR" value={Number(data.performance.ctr.toFixed(2))} postfix="%"/>
              <Stat label="Average position" value={Number(data.performance.position.toFixed(1))}/>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indexing</CardTitle>
            <CardDescription className="text-black">Index coverage for pages.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                <p className="text-xs text-green-700">Indexed</p>
                <p className="text-2xl font-semibold text-green-800">{data.indexing.indexed}</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-700">Not indexed</p>
                <p className="text-2xl font-semibold text-blue-800">{data.indexing.notIndexed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Core Web Vitals</CardTitle>
            <CardDescription className="text-black">Experience summary (simulated).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Mobile</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-green-700 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/>Good</span><span>{data.coreWebVitals.mobile.good}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-blue-700">Needs improvement</span><span>{data.coreWebVitals.mobile.needsImprovement}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-red-700">Poor</span><span>{data.coreWebVitals.mobile.poor}</span></div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Desktop</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-green-700 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/>Good</span><span>{data.coreWebVitals.desktop.good}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-blue-700">Needs improvement</span><span>{data.coreWebVitals.desktop.needsImprovement}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-red-700">Poor</span><span>{data.coreWebVitals.desktop.poor}</span></div>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-3 flex items-center gap-2"><Info className="w-3 h-3"/>This is staged data; will be replaced by live API later.</div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Traffic trend (last {perf.period})</CardTitle>
            <CardDescription>Clicks and impressions trend for the selected business.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={perf.timeline} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" minTickGap={24} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="clicks" name="Clicks" stroke="#2563eb" dot={false} />
                  <Line type="monotone" dataKey="impressions" name="Impressions" stroke="#fb923c" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}