import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Download, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";

const CLASSES = Array.from({ length: 10 }, (_, i) => i + 1);
const SECTIONS = ["A", "B", "C"];

export default function CollectFees() {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [feeAmount, setFeeAmount] = useState<string>("");
  const { toast } = useToast();

  // Always call useQuery to maintain consistent hook order
  const { data: students, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/students", selectedClass, selectedSection],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: selectedClass !== null && selectedSection !== null,
  });

  const createFeeMutation = useMutation({
    mutationFn: async (studentId: number) => {
      const res = await apiRequest("POST", "/api/admin/fees", {
        studentId,
        type: "Annual Fee",
        amount: feeAmount,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: "UNPAID",
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Fee created",
        description: "The fee has been assigned successfully",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/students", selectedClass, selectedSection],
      });
    },
  });

  if (!selectedClass) {
    return (
      <div className="max-w-4xl mx-auto p-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Select Class</h1>
          <p className="text-muted-foreground">Choose a class to manage fees</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {CLASSES.map((classNum) => (
            <Card
              key={classNum}
              className="cursor-pointer hover:bg-accent"
              onClick={() => setSelectedClass(classNum)}
            >
              <CardHeader>
                <CardTitle className="text-center">Class {classNum}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Fee Status
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedSection) {
    return (
      <div className="max-w-4xl mx-auto p-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Class {selectedClass}</h1>
          <p className="text-muted-foreground">Select a section to continue</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => setSelectedClass(null)}
          >
            Back to Classes
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {SECTIONS.map((section) => (
            <Card
              key={section}
              className="cursor-pointer hover:bg-accent"
              onClick={() => setSelectedSection(section)}
            >
              <CardHeader>
                <CardTitle className="text-center">Section {section}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Section Data
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Class {selectedClass} - Section {selectedSection}
            </h1>
            <p className="text-muted-foreground">Manage student fees</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedSection(null);
              setFeeAmount("");
            }}
          >
            Back to Sections
          </Button>
        </div>

        <div className="mt-4 flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium">Set Fee Amount (₹)</label>
            <Input
              type="number"
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
          <Button
            disabled={!feeAmount || !students?.length}
            onClick={() =>
              students?.forEach((student) =>
                createFeeMutation.mutate(student.id)
              )
            }
          >
            Assign Fee to All
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Fee Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students?.map((student) => (
                  <tr key={student.id} className="border-b">
                    <td className="p-4">{student.name}</td>
                    <td className="p-4">{student.username}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </td>
                    <td className="p-4">
                      <Button size="sm" variant="outline">
                        <Send className="mr-2 h-4 w-4" />
                        Send Reminder
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}