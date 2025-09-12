"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell } from "recharts";

const issueByCategoryData = [
  { name: 'Roads', value: 400 },
  { name: 'Sanitation', value: 300 },
  { name: 'Electricity', value: 300 },
  { name: 'Water Supply', value: 200 },
];

const issueStatusData = [
  { name: 'Pending', value: 247 },
  { name: 'Resolved', value: 987 },
];

const resolutionTimeData = [
  { name: 'Jan', avgTime: 4.0 },
  { name: 'Feb', avgTime: 3.0 },
  { name: 'Mar', avgTime: 5.0 },
  { name: 'Apr', avgTime: 4.5 },
  { name: 'May', avgTime: 2.5 },
  { name: 'Jun', avgTime: 3.2 },
];

const COLORS_CATEGORY = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];
const COLORS_STATUS = ['hsl(var(--chart-5))', 'hsl(var(--chart-1))'];

export default function ReportsPage() {
  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Analytics & Reports</CardTitle>
          <CardDescription>
            Detailed analytics and reports on civic issues.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie data={issueByCategoryData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {issueByCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_CATEGORY[index % COLORS_CATEGORY.length]} />
                        ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Issue Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie data={issueStatusData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {issueStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                        ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
       <Card>
          <CardHeader>
            <CardTitle>Average Resolution Time (Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={resolutionTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgTime" fill="hsl(var(--primary))" />
                    </RechartsBarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
    </div>
  );
}
