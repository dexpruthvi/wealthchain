-- Add PowerSIP tables to support the gamified SIP journey

-- Create powersip_journeys table to track user SIP progress
CREATE TABLE public.powersip_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  current_level INTEGER DEFAULT 1,
  sip_months INTEGER DEFAULT 0,
  xp_points INTEGER DEFAULT 0,
  knowledge_tokens INTEGER DEFAULT 0,
  performance_boost DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on powersip_journeys
ALTER TABLE public.powersip_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own PowerSIP journey"
  ON public.powersip_journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their PowerSIP journey"
  ON public.powersip_journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their PowerSIP journey"
  ON public.powersip_journeys FOR UPDATE
  USING (auth.uid() = user_id);

-- Create sip_transactions table to track SIP investments
CREATE TABLE public.sip_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stock_id UUID REFERENCES public.stocks(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  units DECIMAL(10, 4) NOT NULL,
  nav_price DECIMAL(10, 2) NOT NULL,
  transaction_date DATE DEFAULT CURRENT_DATE,
  is_auto_sip BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on sip_transactions
ALTER TABLE public.sip_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own SIP transactions"
  ON public.sip_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create SIP transactions"
  ON public.sip_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create nft_collection table to track earned NFTs
CREATE TABLE public.nft_collection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nft_type TEXT NOT NULL, -- 'bronze', 'silver', 'gold', 'diamond'
  nft_name TEXT NOT NULL,
  nft_description TEXT,
  nft_icon TEXT,
  milestone_months INTEGER NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  rarity_score INTEGER DEFAULT 1,
  is_tradeable BOOLEAN DEFAULT false
);

-- Enable RLS on nft_collection
ALTER TABLE public.nft_collection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own NFT collection"
  ON public.nft_collection FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their NFT collection"
  ON public.nft_collection FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create learning_progress table to track quiz completions
CREATE TABLE public.learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  quiz_id INTEGER NOT NULL,
  quiz_title TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  tokens_earned INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  UNIQUE(user_id, quiz_id)
);

-- Enable RLS on learning_progress
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own learning progress"
  ON public.learning_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create learning progress"
  ON public.learning_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create milestones table to define achievement milestones
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  months_required INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reward_type TEXT NOT NULL,
  reward_description TEXT,
  nft_icon TEXT,
  bonus_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default milestones
INSERT INTO public.milestones (months_required, title, description, reward_type, reward_description, nft_icon, bonus_tokens) VALUES
  (3, 'First Quarter Champion', '3 months of consistent SIP investing', 'Bronze Badge NFT', '₹100 bonus tokens', '🥉', 100),
  (6, 'Half Year Hero', '6 months of SIP discipline', 'Silver Badge NFT', 'Priority customer perks', '🥈', 200),
  (12, 'Annual Achiever', '1 year of investment consistency', 'Gold Badge NFT', 'Free AI investment report', '🥇', 500),
  (24, 'Diamond Dynasty', '2 years of wealth building', 'Diamond Investor NFT', 'Fee waivers + cashback', '💎', 1000);

-- Enable RLS on milestones (public read)
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view milestones"
  ON public.milestones FOR SELECT
  USING (true);

-- Create performance_boosts table to track market outperformance
CREATE TABLE public.performance_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  boost_type TEXT NOT NULL, -- 'market_beat', 'consistency', 'top_performer'
  boost_percentage DECIMAL(5, 2) NOT NULL,
  description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Enable RLS on performance_boosts
ALTER TABLE public.performance_boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own performance boosts"
  ON public.performance_boosts FOR SELECT
  USING (auth.uid() = user_id);

-- Function to calculate and update PowerSIP level
CREATE OR REPLACE FUNCTION update_powersip_level(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  sip_count INTEGER;
  new_level INTEGER;
  new_xp INTEGER;
BEGIN
  -- Count SIP transactions for user
  SELECT COUNT(*) INTO sip_count
  FROM public.sip_transactions
  WHERE user_id = user_uuid;
  
  -- Calculate level based on months (simplified)
  CASE
    WHEN sip_count >= 24 THEN new_level := 4;
    WHEN sip_count >= 12 THEN new_level := 3;
    WHEN sip_count >= 6 THEN new_level := 2;
    ELSE new_level := 1;
  END CASE;
  
  new_xp := sip_count * 100;
  
  -- Update or insert PowerSIP journey
  INSERT INTO public.powersip_journeys (user_id, current_level, sip_months, xp_points)
  VALUES (user_uuid, new_level, sip_count, new_xp)
  ON CONFLICT (user_id)
  DO UPDATE SET
    current_level = new_level,
    sip_months = sip_count,
    xp_points = new_xp,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to award milestone NFTs
CREATE OR REPLACE FUNCTION award_milestone_nfts(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  user_months INTEGER;
  milestone_record RECORD;
BEGIN
  -- Get user's SIP months
  SELECT sip_months INTO user_months
  FROM public.powersip_journeys
  WHERE user_id = user_uuid;
  
  -- Award NFTs for reached milestones
  FOR milestone_record IN
    SELECT * FROM public.milestones
    WHERE months_required <= user_months
  LOOP
    -- Insert NFT if not already awarded
    INSERT INTO public.nft_collection (user_id, nft_type, nft_name, nft_description, nft_icon, milestone_months)
    VALUES (
      user_uuid,
      CASE
        WHEN milestone_record.months_required = 3 THEN 'bronze'
        WHEN milestone_record.months_required = 6 THEN 'silver'
        WHEN milestone_record.months_required = 12 THEN 'gold'
        WHEN milestone_record.months_required = 24 THEN 'diamond'
        ELSE 'special'
      END,
      milestone_record.title,
      milestone_record.description,
      milestone_record.nft_icon,
      milestone_record.months_required
    )
    ON CONFLICT DO NOTHING; -- Avoid duplicate NFTs
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update PowerSIP data when SIP transaction is added
CREATE OR REPLACE FUNCTION handle_sip_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Update PowerSIP level and XP
  PERFORM update_powersip_level(NEW.user_id);
  
  -- Award milestone NFTs
  PERFORM award_milestone_nfts(NEW.user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_sip_transaction
  AFTER INSERT ON public.sip_transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_sip_transaction();
