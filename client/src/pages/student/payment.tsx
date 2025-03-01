import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
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
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function StudentPayment() {
  const { feeId } = useParams();
  const [, setLocation] = useLocation();
  const { data: fees, isLoading } = useQuery<Fee[]>({
    queryKey: ["/api/student/fees"],
  });

  const fee = fees?.find((f) => f.id === parseInt(feeId));

  const paymentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/student/fees/${feeId}/pay`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/student/fees"] });
      setLocation("/");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!fee) {
    return (
      <div className="max-w-4xl mx-auto p-4 py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Fee not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway</CardTitle>
          <CardDescription>Complete your fee payment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Payment Details</h3>
              <p className="text-sm text-muted-foreground">
                Fee Type: {fee.type}
              </p>
              <p className="text-sm text-muted-foreground">
                Amount: ₹{fee.amount}
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => paymentMutation.mutate()}
                disabled={paymentMutation.isPending}
              >
                {paymentMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Pay Now
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
