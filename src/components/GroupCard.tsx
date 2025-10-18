import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GroupCardProps {
  id: string;
  groupId: string;
  groupName: string;
  stockSymbol: string;
  memberCount: number;
  targetAmount?: number;
  currentAmount?: number;
}

const GroupCard = ({
  id,
  groupId,
  groupName,
  stockSymbol,
  memberCount,
  targetAmount,
  currentAmount = 0,
}: GroupCardProps) => {
  const navigate = useNavigate();
  const progressPercent = targetAmount ? (currentAmount / targetAmount) * 100 : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{groupName}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <TrendingUp className="w-4 h-4" />
              <span>{stockSymbol}</span>
            </CardDescription>
          </div>
          <div className="px-3 py-1 bg-primary/10 rounded-md">
            <span className="text-sm font-mono font-semibold text-primary">{groupId}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-sm">{memberCount} {memberCount === 1 ? 'Member' : 'Members'}</span>
          </div>

          {targetAmount && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-foreground">
                  ${currentAmount.toFixed(2)} / ${targetAmount.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-success h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
            </div>
          )}

          <Button
            className="w-full"
            onClick={() => navigate(`/groups/${id}`)}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupCard;
