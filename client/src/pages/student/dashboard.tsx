import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { Fee } from "@shared/schema";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: fees, isLoading } = useQuery<Fee[]>({
    queryKey: ["/api/student/fees"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Fee Dashboard</h1>
        <p className="text-muted-foreground">
          View and manage your fee payments
        </p>
      </div>

      <div className="grid gap-4">
        {fees?.map((fee) => (
          <Card key={fee.id}>
            <CardHeader>
              <CardTitle>{fee.type}</CardTitle>
              <CardDescription>Due: {new Date(fee.dueDate).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">₹{fee.amount}</p>
                  <p className="text-sm text-muted-foreground">
                    Status: {fee.status}
                  </p>
                </div>
                {fee.status === "UNPAID" ? (
                  <Link href={`/payment/${fee.id}`}>
                    <Button>Pay Fee</Button>
                  </Link>
                ) : (
                  <Button variant="outline">Download Receipt</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
