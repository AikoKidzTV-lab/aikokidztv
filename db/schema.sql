-- 1. Coupons ka Table banayein 
create table coupons ( 
  code text primary key, 
  discount_percent integer not null, 
  min_plan_price integer default 0, -- Kam se kam kitne dollar ka plan hona chahiye 
  is_active boolean default true 
); 

-- 2. Transactions ka Table (Hisaab rakhne ke liye) 
create table transactions ( 
  id uuid default gen_random_uuid() primary key, 
  user_id uuid references auth.users not null, 
  amount numeric, 
  gems_added integer, 
  plan_name text, 
  created_at timestamp with time zone default timezone('utc'::text, now()) 
); 

-- 3. Aapke Special Coupons daalein 
insert into coupons (code, discount_percent, min_plan_price) values 
('YOUTUBE25', 25, 6),   -- Sirf $5 se upar wale plans par chalega (isliye min 6 rakha) 
('AIKOFAMILY', 100, 0); -- Sab par chalega, 100% off 

-- 4. User Policy (User sirf apna transaction dekhe) 
create policy "Users can view own transactions" on transactions 
  for select using (auth.uid() = user_id); 
  
alter table transactions enable row level security; 
alter table coupons enable row level security; 
create policy "Everyone can read coupons" on coupons for select using (true);