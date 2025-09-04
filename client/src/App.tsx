import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/navbar";
import Home from "@/pages/home";
import InvoiceForm from "@/pages/invoice-form";
import InvoicesList from "@/pages/invoices-list";
import Analytics from "@/pages/analytics";
import MLInsights from "@/pages/ml-insights";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Support from "@/pages/support";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/new-invoice" component={InvoiceForm} />
      <Route path="/edit-invoice/:id" component={InvoiceForm} />
      <Route path="/invoices" component={InvoicesList} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/ml-insights" component={MLInsights} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/support" component={Support} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Router />
      </main>
      <footer className="bg-white border-t border-neutral-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-neutral-500 text-sm">&copy; {new Date().getFullYear()} Samasi Professional Services. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-neutral-500 hover:text-primary text-sm">Terms</Link>
              <Link href="/privacy" className="text-neutral-500 hover:text-primary text-sm">Privacy</Link>
              <Link href="/support" className="text-neutral-500 hover:text-primary text-sm">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
