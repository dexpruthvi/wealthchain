import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Shield, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="mb-6 w-20 h-20 bg-gradient-to-br from-primary to-success rounded-3xl flex items-center justify-center">
            <TrendingUp className="w-12 h-12 text-primary-foreground" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Invest Smarter,
            <br />
            <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              Together
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            Join InvestHub - the modern investment platform where you can invest individually or create groups to invest together with friends, family, and like-minded investors.
          </p>
          
          <div className="flex gap-4">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">Group Investing</h3>
            <p className="text-muted-foreground">
              Create investment groups with unique IDs. Invite others to join and invest together in your favorite stocks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">Real-time Data</h3>
            <p className="text-muted-foreground">
              Track your investments with real-time stock prices and portfolio performance metrics.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">Secure & Trusted</h3>
            <p className="text-muted-foreground">
              Your data and investments are protected with enterprise-grade security and encryption.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-success/10 border border-primary/20 text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Ready to start your investment journey?
          </h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of investors who are already building wealth together
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Create Your Free Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
