import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    Gift,
    Star,
    Clock,
    Sparkles,
    CheckCircle,
    Coins
} from "lucide-react";
import { toast } from "sonner";

interface DailyBonus {
    day: number;
    tokens: number;
    claimed: boolean;
    bonus?: string;
}

const DailyBonusSystem = () => {
    const [dailyBonuses, setDailyBonuses] = useState<DailyBonus[]>([]);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [canClaimToday, setCanClaimToday] = useState(true);
    const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);

    useEffect(() => {
        initializeDailyBonuses();
        checkDailyClaimStatus();
    }, []);

    const initializeDailyBonuses = () => {
        const bonuses: DailyBonus[] = [
            { day: 1, tokens: 50, claimed: false },
            { day: 2, tokens: 75, claimed: false },
            { day: 3, tokens: 100, claimed: false, bonus: "🎯 Achievement Badge" },
            { day: 4, tokens: 125, claimed: false },
            { day: 5, tokens: 150, claimed: false, bonus: "⚡ Speed Trader" },
            { day: 6, tokens: 200, claimed: false },
            { day: 7, tokens: 500, claimed: false, bonus: "👑 Weekly Master" }
        ];

        // Load from localStorage if available
        const saved = localStorage.getItem('investHub_dailyBonuses');
        if (saved) {
            setDailyBonuses(JSON.parse(saved));
        } else {
            setDailyBonuses(bonuses);
        }

        // Load streak
        const savedStreak = localStorage.getItem('investHub_streak');
        if (savedStreak) {
            setCurrentStreak(parseInt(savedStreak));
        }
    };

    const checkDailyClaimStatus = () => {
        const lastClaim = localStorage.getItem('investHub_lastClaimDate');
        const today = new Date().toDateString();

        if (lastClaim) {
            setLastClaimDate(lastClaim);
            setCanClaimToday(lastClaim !== today);
        }
    };

    const claimDailyBonus = () => {
        if (!canClaimToday) {
            toast.error("You've already claimed today's bonus! Come back tomorrow.");
            return;
        }

        const today = new Date().toDateString();
        const newStreak = currentStreak + 1;
        const dayIndex = (newStreak - 1) % 7;
        const bonus = dailyBonuses[dayIndex];

        // Update streak and bonuses
        setCurrentStreak(newStreak);
        setLastClaimDate(today);
        setCanClaimToday(false);

        // Mark bonus as claimed
        const updatedBonuses = dailyBonuses.map((b, index) =>
            index === dayIndex ? { ...b, claimed: true } : b
        );
        setDailyBonuses(updatedBonuses);

        // Save to localStorage
        localStorage.setItem('investHub_streak', newStreak.toString());
        localStorage.setItem('investHub_lastClaimDate', today);
        localStorage.setItem('investHub_dailyBonuses', JSON.stringify(updatedBonuses));

        // Update user tokens
        const currentTokens = JSON.parse(localStorage.getItem('investHub_tokens') || '{"totalTokens": 0}');
        const updatedTokens = {
            ...currentTokens,
            totalTokens: currentTokens.totalTokens + bonus.tokens,
            todayTokens: (currentTokens.todayTokens || 0) + bonus.tokens
        };
        localStorage.setItem('investHub_tokens', JSON.stringify(updatedTokens));

        // Success message
        let message = `Claimed ${bonus.tokens} tokens! 🎉`;
        if (bonus.bonus) {
            message += ` Bonus: ${bonus.bonus}`;
        }
        if (newStreak === 7) {
            message += " Congratulations on completing the weekly challenge!";
        }

        toast.success(message);

        // Reset weekly cycle
        if (newStreak % 7 === 0) {
            setTimeout(() => {
                const resetBonuses = dailyBonuses.map(b => ({ ...b, claimed: false }));
                setDailyBonuses(resetBonuses);
                localStorage.setItem('investHub_dailyBonuses', JSON.stringify(resetBonuses));
            }, 1000);
        }
    };

    const getTimeUntilNextClaim = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const timeLeft = tomorrow.getTime() - now.getTime();
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m`;
    };

    const currentDay = (currentStreak % 7) + 1;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Daily Login Bonus
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Streak Info */}
                <div className="text-center mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="text-lg font-bold">Day {currentStreak} Streak</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Keep logging in daily to maintain your streak!
                    </p>
                </div>

                {/* Daily Bonuses Grid */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                    {dailyBonuses.map((bonus, index) => {
                        const isCurrentDay = index + 1 === currentDay;
                        const isClaimed = bonus.claimed;

                        return (
                            <div
                                key={bonus.day}
                                className={`
                  relative p-3 rounded-lg border text-center transition-all
                  ${isCurrentDay && canClaimToday ? 'border-blue-500 bg-blue-50 shadow-lg' : ''}
                  ${isClaimed ? 'bg-green-50 border-green-200' : 'bg-muted border-border'}
                `}
                            >
                                <div className="text-xs font-medium mb-1">Day {bonus.day}</div>
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Coins className="h-3 w-3 text-yellow-500" />
                                    <span className="text-xs font-bold">{bonus.tokens}</span>
                                </div>

                                {bonus.bonus && (
                                    <div className="text-xs text-blue-600 mb-1">{bonus.bonus}</div>
                                )}

                                {isClaimed && (
                                    <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                                )}

                                {isCurrentDay && canClaimToday && (
                                    <Sparkles className="h-4 w-4 text-blue-500 mx-auto animate-pulse" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Claim Button */}
                <div className="text-center">
                    {canClaimToday ? (
                        <Button
                            onClick={claimDailyBonus}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                            size="lg"
                        >
                            <Gift className="h-4 w-4 mr-2" />
                            Claim Today's Bonus ({dailyBonuses[(currentStreak % 7)]?.tokens} tokens)
                        </Button>
                    ) : (
                        <div className="space-y-2">
                            <Button disabled className="w-full" size="lg">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Already Claimed Today
                            </Button>
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                Next bonus in {getTimeUntilNextClaim()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Weekly Progress */}
                <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Weekly Progress</span>
                        <Badge variant="secondary">
                            {currentStreak % 7}/7 days
                        </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${((currentStreak % 7) / 7) * 100}%` }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default DailyBonusSystem;
