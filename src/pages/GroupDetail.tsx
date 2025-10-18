import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, TrendingUp, Target, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface GroupDetails {
  id: string;
  group_id: string;
  group_name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  stocks: {
    symbol: string;
    name: string;
    current_price: number;
  };
  profiles: {
    full_name: string;
    email: string;
  };
}

interface Member {
  profiles: {
    full_name: string;
    email: string;
  };
  investment_amount: number;
  joined_at: string;
}

const GroupDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchGroupDetails();
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchGroupDetails = async () => {
    try {
      // Fetch group details
      const { data: groupData, error: groupError } = await supabase
        .from("investment_groups")
        .select(`
          *,
          stocks (symbol, name, current_price),
          profiles (full_name, email)
        `)
        .eq("id", id)
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);

      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from("group_members")
        .select(`
          investment_amount,
          joined_at,
          profiles (full_name, email)
        `)
        .eq("group_id", id);

      if (membersError) throw membersError;
      setMembers(membersData || []);
    } catch (error) {
      toast.error("Failed to load group details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">Group not found</div>
        </div>
      </div>
    );
  }

  const progressPercent = group.target_amount 
    ? (group.current_amount / group.target_amount) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/groups")}
          className="mb-6"
        >
          ← Back to Groups
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{group.group_name}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      <span>{group.stocks.symbol} - {group.stocks.name}</span>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-primary/10 rounded-lg">
                    <span className="text-sm font-mono font-semibold text-primary">
                      {group.group_id}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.description && (
                  <p className="text-muted-foreground">{group.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">Current Price</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      ${Number(group.stocks.current_price).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Members</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {members.length}
                    </div>
                  </div>
                </div>

                {group.target_amount > 0 && (
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Investment Progress</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-foreground font-semibold">
                        ${group.current_amount.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">
                        ${group.target_amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-background rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary to-success h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle>Created By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {group.profiles.full_name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">
                      {group.profiles.full_name || "User"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {group.profiles.email}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Members List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Members ({members.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member, index) => (
                    <div key={index} className="flex items-center gap-3 pb-3 border-b last:border-0">
                      <Avatar>
                        <AvatarFallback>
                          {member.profiles.full_name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {member.profiles.full_name || "User"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${Number(member.investment_amount).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
