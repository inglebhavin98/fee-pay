import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const mockData = {
  collectionByClass: [
    { class: "1", collected: 45000, pending: 15000 },
    { class: "2", collected: 52000, pending: 8000 },
    { class: "3", collected: 48000, pending: 12000 },
    { class: "4", collected: 50000, pending: 10000 },
    { class: "5", collected: 47000, pending: 13000 },
    { class: "6", collected: 49000, pending: 11000 },
    { class: "7", collected: 51000, pending: 9000 },
    { class: "8", collected: 53000, pending: 7000 },
    { class: "9", collected: 54000, pending: 6000 },
    { class: "10", collected: 55000, pending: 5000 },
  ],
  summary: {
    totalCollected: "504,000",
    totalPending: "96,000",
    totalStudents: "450",
    lastMonthCollection: "125,000",
  },
};

export default function Reports() {
  return (
    <div className="max-w-7xl mx-auto p-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Fee Reports</h1>
        <p className="text-muted-foreground">
          Overview of fee collection status
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{mockData.summary.totalCollected}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{mockData.summary.totalPending}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockData.summary.totalStudents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Month Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{mockData.summary.lastMonthCollection}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Fee Collection by Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockData.collectionByClass}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="collected"
                  name="Collected"
                  stackId="a"
                  fill="hsl(var(--primary))"
                />
                <Bar
                  dataKey="pending"
                  name="Pending"
                  stackId="a"
                  fill="hsl(var(--muted))"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Coming soon...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
