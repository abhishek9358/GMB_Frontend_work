import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, Brush } from "recharts";
import { generatePerformance } from "@/lib/gscDummy";

export default function SearchConsolePerformance() {
  const data = generatePerformance(90);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><BarChart3 className="w-6 h-6"/>Search Console • Performance</h1>
        <span className="text-xs text-gray-500">Business: {data.business.name} • Simulated data</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline (last {data.period})</CardTitle>
          <CardDescription>Clicks, impressions, CTR and position over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.timeline} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" minTickGap={24}/>
                <YAxis yAxisId="left" orientation="left"/>
                <YAxis yAxisId="right" orientation="right"/>
                <Tooltip/>
                <Legend/>
                <Line yAxisId="left" type="monotone" dataKey="clicks" name="Clicks" stroke="#2563eb" dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="impressions" name="Impressions" stroke="#fb923c" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="ctr" name="CTR %" stroke="#16a34a" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="position" name="Position" stroke="#9333ea" dot={false} />
                <Brush dataKey="date" height={20} stroke="#94a3b8"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top queries</CardTitle>
          <CardDescription>Search terms driving traffic.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-4">Query</th>
                  <th className="py-2 pr-4">Clicks</th>
                  <th className="py-2 pr-4">Impressions</th>
                  <th className="py-2 pr-4">CTR %</th>
                  <th className="py-2 pr-4">Position</th>
                </tr>
              </thead>
              <tbody>
                {data.topQueries.map((q)=> (
                  <tr key={q.query} className="border-black border-t">
                    <td className="py-2 pr-4 font-medium text-gray-900">{q.query}</td>
                    <td className="py-2 pr-4">{q.clicks}</td>
                    <td className="py-2 pr-4">{q.impressions}</td>
                    <td className="py-2 pr-4">{Number(q.ctr.toFixed(2))}</td>
                    <td className="py-2 pr-4">{Number(q.position.toFixed(1))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
