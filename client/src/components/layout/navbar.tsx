import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <Link href={user.role === "ADMIN" ? "/admin" : "/"}>
            <a className="text-xl font-bold text-primary">School Fee System</a>
          </Link>

          {user.role === "ADMIN" && (
            <div className="hidden md:flex space-x-4">
              <Link href="/admin/collect-fees">
                <a className="text-gray-600 hover:text-primary">Collect Fees</a>
              </Link>
              <Link href="/admin/reports">
                <a className="text-gray-600 hover:text-primary">Reports</a>
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Welcome, {user.name}
          </span>
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
