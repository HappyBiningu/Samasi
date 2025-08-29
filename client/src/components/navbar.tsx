import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import logoPath from "@assets/logo.png";

const Navbar = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <img src={logoPath} alt="Samasi Logo" className="h-10 w-auto" />
            <h1 className="ml-3 text-xl font-semibold text-secondary">Invoice Generator</h1>
          </div>
        </Link>
        <div className="flex items-center space-x-4">
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link 
                  href="/new-invoice"
                  className={`${location === "/new-invoice" ? "text-primary border-b-2 border-primary" : "text-neutral-500 hover:text-primary"} font-medium pb-1`}
                >
                  New Invoice
                </Link>
              </li>
              <li>
                <Link 
                  href="/invoices"
                  className={`${location === "/invoices" ? "text-primary border-b-2 border-primary" : "text-neutral-500 hover:text-primary"} font-medium pb-1`}
                >
                  My Invoices
                </Link>
              </li>
              <li>
                <Link 
                  href="/analytics"
                  className={`${location === "/analytics" ? "text-primary border-b-2 border-primary" : "text-neutral-500 hover:text-primary"} font-medium pb-1`}
                  data-testid="link-analytics"
                >
                  Analytics
                </Link>
              </li>
              <li>
                <Link 
                  href="/ml-insights"
                  className={`${location === "/ml-insights" ? "text-primary border-b-2 border-primary" : "text-neutral-500 hover:text-primary"} font-medium pb-1`}
                  data-testid="link-ml-insights"
                >
                  ML Insights
                </Link>
              </li>
            </ul>
          </nav>
          {user && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span data-testid="text-user-email">{user.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
