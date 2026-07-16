-- 随身刷题本数据库初始化脚本
-- 在 Supabase SQL Editor 中执行

-- 用户资料表
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  nickname text,
  avatar_url text,
  balance_points integer default 0 not null,
  total_recharged integer default 0 not null,
  created_at timestamp with time zone default now()
);

-- 题目表
create table if not exists public.questions (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  subject text not null,
  type text not null check (type in ('single','multiple','fill','shortanswer','judgement')),
  content text not null,
  options jsonb,
  answer text not null,
  analysis text,
  passage text,
  images jsonb default '[]'::jsonb,
  difficulty integer default 1,
  source text,
  tags jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

-- 错题本
create table if not exists public.wrong_answers (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users on delete cascade not null,
  question_id text references public.questions on delete cascade not null,
  wrong_count integer default 1 not null,
  first_wrong timestamp with time zone default now(),
  last_wrong timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, question_id)
);

-- 收藏
create table if not exists public.favorites (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users on delete cascade not null,
  question_id text references public.questions on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, question_id)
);

-- 积分流水
create table if not exists public.points_transactions (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('in','out')),
  amount integer not null,
  balance_after integer not null,
  action_type text not null,
  description text,
  tokens_input integer,
  tokens_output integer,
  created_at timestamp with time zone default now()
);

-- 充值订单
create table if not exists public.recharge_orders (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users on delete cascade not null,
  amount_yuan numeric(10,2) not null,
  points_added integer not null,
  payment_method text default 'epay',
  transaction_id text,
  status text default 'pending' check (status in ('pending','paid','failed')),
  paid_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- 用户设置
create table if not exists public.user_settings (
  user_id uuid references auth.users on delete cascade primary key,
  settings jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default now()
);

-- RLS 策略
alter table public.user_profiles enable row level security;
alter table public.questions enable row level security;
alter table public.wrong_answers enable row level security;
alter table public.favorites enable row level security;
alter table public.points_transactions enable row level security;
alter table public.recharge_orders enable row level security;
alter table public.user_settings enable row level security;

create policy "Users own profile" on public.user_profiles for all using (auth.uid() = id);
create policy "Users own questions" on public.questions for all using (auth.uid() = user_id);
create policy "Users own wrongs" on public.wrong_answers for all using (auth.uid() = user_id);
create policy "Users own favs" on public.favorites for all using (auth.uid() = user_id);
create policy "Users own txs" on public.points_transactions for all using (auth.uid() = user_id);
create policy "Users own orders" on public.recharge_orders for all using (auth.uid() = user_id);
create policy "Users own settings" on public.user_settings for all using (auth.uid() = user_id);

-- 扣除积分函数
create or replace function public.deduct_points(
  p_user_id uuid, p_amount integer, p_action_type text, p_description text
) returns boolean as $$
declare v_balance integer;
begin
  select balance_points into v_balance from public.user_profiles where id = p_user_id;
  if v_balance is null or v_balance < p_amount then return false; end if;
  update public.user_profiles set balance_points = balance_points - p_amount where id = p_user_id;
  insert into public.points_transactions (user_id, type, amount, balance_after, action_type, description)
  values (p_user_id, 'out', p_amount, v_balance - p_amount, p_action_type, p_description);
  return true;
end;
$$ language plpgsql security definer;
