import { Switch, Route } from "wouter";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/new-invoice" component={InvoiceForm} />
      <Route path="/edit-invoice/:id" component={InvoiceForm} />
      <Route path="/invoices" component={InvoicesList} />
      <Route path="/analytics" component={Analytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Router />
          </main>
          <footer className="bg-white border-t border-neutral-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="text-neutral-500 text-sm">&copy; {new Date().getFullYear()} Invoice Generator. All rights reserved.</p>
                </div>
                <div className="flex space-x-6">
                  <a href="#" className="text-neutral-500 hover:text-primary text-sm">Terms</a>
                  <a href="#" className="text-neutral-500 hover:text-primary text-sm">Privacy</a>
                  <a href="#" className="text-neutral-500 hover:text-primary text-sm">Support</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
