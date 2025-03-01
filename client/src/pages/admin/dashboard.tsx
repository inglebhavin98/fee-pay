import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto p-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage fee collection and reports
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/admin/collect-fees">
          <Card className="cursor-pointer hover:bg-accent">
            <CardHeader>
              <CardTitle>Collect Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View and manage fee collection by class and section
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/reports">
          <Card className="cursor-pointer hover:bg-accent">
            <CardHeader>
              <CardTitle>Fee Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Generate and view fee collection reports
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
