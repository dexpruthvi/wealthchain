import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import GroupCard from "@/components/GroupCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";

interface Group {
  id: string;
  group_id: string;
  group_name: string;
  stock_id: string;
  description: string;
  target_amount: number;
  current_amount: number;
  stocks: {
    symbol: string;
  };
  group_members: { id: string }[];
}

interface Stock {
  id: string;
  symbol: string;
  name: string;
}

const Groups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinGroupId, setJoinGroupId] = useState("");

  // Create group form state
  const [groupName, setGroupName] = useState("");
  const [selectedStock, setSelectedStock] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");

  useEffect(() => {
    checkAuth();
    fetchGroups();
    fetchStocks();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchGroups = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("group_members")
        .select(`
          id,
          investment_groups (
            id,
            group_id,
            group_name,
            stock_id,
            description,
            target_amount,
            current_amount,
            stocks (symbol),
            group_members (id)
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      const groupsData = data
        ?.map((item: any) => item.investment_groups)
        .filter(Boolean) || [];
      
      setGroups(groupsData);
    } catch (error) {
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const fetchStocks = async () => {
    const { data, error } = await supabase
      .from("stocks")
      .select("id, symbol, name")
      .order("symbol");

    if (!error && data) {
      setStocks(data);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data: newGroup, error: groupError } = await supabase
        .from("investment_groups")
        .insert([{
          group_name: groupName,
          stock_id: selectedStock,
          creator_id: user.id,
          description,
          target_amount: parseFloat(targetAmount) || null,
          group_id: '',
        }])
        .select()
        .single();

      if (groupError) throw groupError;

      // Auto-join the creator
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: newGroup.id,
          user_id: user.id,
        });

      if (memberError) throw memberError;

      toast.success(`Group created! Your Group ID is: ${newGroup.group_id}`);
      setCreateDialogOpen(false);
      resetCreateForm();
      fetchGroups();
    } catch (error: any) {
      toast.error(error.message || "Failed to create group");
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Find group by group_id
      const { data: group, error: findError } = await supabase
        .from("investment_groups")
        .select("id")
        .eq("group_id", joinGroupId.trim().toUpperCase())
        .single();

      if (findError || !group) {
        toast.error("Invalid Group ID");
        return;
      }

      // Check if already a member
      const { data: existing } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", group.id)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        toast.error("You're already a member of this group");
        return;
      }

      // Join the group
      const { error: joinError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: user.id,
        });

      if (joinError) throw joinError;

      toast.success("Successfully joined the group!");
      setJoinDialogOpen(false);
      setJoinGroupId("");
      fetchGroups();
    } catch (error: any) {
      toast.error(error.message || "Failed to join group");
    }
  };

  const resetCreateForm = () => {
    setGroupName("");
    setSelectedStock("");
    setDescription("");
    setTargetAmount("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Investment Groups</h1>
            <p className="text-muted-foreground">
              Create or join groups to invest together
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UsersIcon className="w-4 h-4 mr-2" />
                  Join Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join Investment Group</DialogTitle>
                  <DialogDescription>
                    Enter the Group ID shared by the group creator
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleJoinGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupId">Group ID</Label>
                    <Input
                      id="groupId"
                      placeholder="INV123ABC"
                      value={joinGroupId}
                      onChange={(e) => setJoinGroupId(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Join Group
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Investment Group</DialogTitle>
                  <DialogDescription>
                    Start a new group to invest with others
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Group Name</Label>
                    <Input
                      id="groupName"
                      placeholder="Tech Giants Fund"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Select value={selectedStock} onValueChange={setSelectedStock} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a stock" />
                      </SelectTrigger>
                      <SelectContent>
                        {stocks.map((stock) => (
                          <SelectItem key={stock.id} value={stock.id}>
                            {stock.symbol} - {stock.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your investment strategy..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetAmount">Target Amount (Optional)</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      step="0.01"
                      placeholder="10000.00"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Group
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading groups...</div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">No Groups Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create a group or join an existing one to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                id={group.id}
                groupId={group.group_id}
                groupName={group.group_name}
                stockSymbol={group.stocks.symbol}
                memberCount={group.group_members.length}
                targetAmount={Number(group.target_amount)}
                currentAmount={Number(group.current_amount)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
