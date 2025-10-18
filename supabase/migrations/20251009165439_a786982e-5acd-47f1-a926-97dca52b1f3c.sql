-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create stocks table (for mock stock data)
CREATE TABLE public.stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  current_price DECIMAL(10, 2) NOT NULL,
  change_percent DECIMAL(5, 2) NOT NULL,
  market_cap BIGINT,
  sector TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on stocks (public read)
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stocks"
  ON public.stocks FOR SELECT
  USING (true);

-- Create investment_groups table
CREATE TABLE public.investment_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id TEXT UNIQUE NOT NULL,
  group_name TEXT NOT NULL,
  stock_id UUID REFERENCES public.stocks(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  description TEXT,
  target_amount DECIMAL(12, 2),
  current_amount DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on investment_groups
ALTER TABLE public.investment_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view investment groups"
  ON public.investment_groups FOR SELECT
  USING (true);

CREATE POLICY "Users can create investment groups"
  ON public.investment_groups FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their groups"
  ON public.investment_groups FOR UPDATE
  USING (auth.uid() = creator_id);

-- Create group_members table
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.investment_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  investment_amount DECIMAL(10, 2) DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS on group_members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view group members"
  ON public.group_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join groups"
  ON public.group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their membership"
  ON public.group_members FOR UPDATE
  USING (auth.uid() = user_id);

-- Create user_portfolios table
CREATE TABLE public.user_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stock_id UUID REFERENCES public.stocks(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  average_price DECIMAL(10, 2) NOT NULL,
  current_value DECIMAL(12, 2),
  total_invested DECIMAL(12, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, stock_id)
);

-- Enable RLS on user_portfolios
ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own portfolio"
  ON public.user_portfolios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their portfolio entries"
  ON public.user_portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their portfolio"
  ON public.user_portfolios FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to generate unique group ID
CREATE OR REPLACE FUNCTION generate_group_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 6-character alphanumeric ID
    new_id := 'INV' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    
    -- Check if ID already exists
    SELECT EXISTS(SELECT 1 FROM public.investment_groups WHERE group_id = new_id) INTO exists;
    
    IF NOT exists THEN
      RETURN new_id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate group_id
CREATE OR REPLACE FUNCTION set_group_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.group_id IS NULL OR NEW.group_id = '' THEN
    NEW.group_id := generate_group_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_investment_group
BEFORE INSERT ON public.investment_groups
FOR EACH ROW
EXECUTE FUNCTION set_group_id();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert mock stock data
INSERT INTO public.stocks (symbol, name, current_price, change_percent, market_cap, sector) VALUES
  ('AAPL', 'Apple Inc.', 178.50, 2.35, 2800000000000, 'Technology'),
  ('GOOGL', 'Alphabet Inc.', 142.80, 1.82, 1750000000000, 'Technology'),
  ('MSFT', 'Microsoft Corp.', 425.20, -0.45, 3100000000000, 'Technology'),
  ('TSLA', 'Tesla Inc.', 248.75, 5.67, 780000000000, 'Automotive'),
  ('AMZN', 'Amazon.com Inc.', 178.30, 1.23, 1850000000000, 'E-commerce'),
  ('RELIANCE', 'Reliance Industries', 2845.50, 0.89, 19200000000000, 'Energy'),
  ('TCS', 'Tata Consultancy Services', 3678.20, 1.45, 13400000000000, 'IT Services'),
  ('INFY', 'Infosys Limited', 1512.80, -0.67, 6280000000000, 'IT Services'),
  ('HDFC', 'HDFC Bank', 1642.30, 0.34, 12100000000000, 'Banking'),
  ('ICICI', 'ICICI Bank', 1089.60, 1.12, 7650000000000, 'Banking');