-- Create bookmarks table
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  url text not null,
  is_quick_access boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table bookmarks enable row level security;

-- Create policy: Users can only see their own bookmarks
create policy "Users can view their own bookmarks"
  on bookmarks for select
  using (auth.uid() = user_id);

-- Create policy: Users can insert their own bookmarks
create policy "Users can insert their own bookmarks"
  on bookmarks for insert
  with check (auth.uid() = user_id);

-- Create policy: Users can delete their own bookmarks
create policy "Users can delete their own bookmarks"
  on bookmarks for delete
  using (auth.uid() = user_id);

-- Create policy: Users can update their own bookmarks
create policy "Users can update their own bookmarks"
  on bookmarks for update
  using (auth.uid() = user_id);

-- Create index for better performance
create index bookmarks_user_id_idx on bookmarks(user_id);
