import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import logoPath from "@assets/logo.png";

export default function AuthPage() {
  const { user, loginMutation } = useAuth();
  const [, setLocation] = useLocation();
  
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleDemoLogin = () => {
    setLoginData({
      email: "admin@samasi.co.za",
      password: "Samasi@25",
    });
    loginMutation.mutate({
      email: "admin@samasi.co.za",
      password: "Samasi@25",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden border-primary/20">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
            <div className="flex items-center mb-4">
              <img src={logoPath} alt="Samasi Logo" className="h-12 w-auto mr-4" />
              <h2 className="text-2xl font-bold">Samasi Invoice Generator</h2>
            </div>
            <p className="text-neutral-700 mb-6">Generate professional invoices for your clients with the Samasi branded template.</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  data-testid="input-login-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  data-testid="input-login-password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 p-6 pt-0">
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90" 
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              <Button 
                type="button" 
                variant="secondary"
                className="w-full"
                onClick={handleDemoLogin}
                disabled={loginMutation.isPending}
                data-testid="button-demo-login"
              >
                Use Demo Credentials
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}