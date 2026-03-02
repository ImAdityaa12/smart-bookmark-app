-- Create bookmarks table
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  url text not null,
  image_url text,
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

-- Folders table
create table folders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text default '#2563EB' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table folders enable row level security;
create policy "Users can view own folders" on folders for select using (auth.uid() = user_id);
create policy "Users can insert own folders" on folders for insert with check (auth.uid() = user_id);
create policy "Users can update own folders" on folders for update using (auth.uid() = user_id);
create policy "Users can delete own folders" on folders for delete using (auth.uid() = user_id);
create index folders_user_id_idx on folders(user_id);

-- Bookmark-Folder junction table (many-to-many)
create table bookmark_folders (
  bookmark_id uuid references bookmarks(id) on delete cascade not null,
  folder_id uuid references folders(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (bookmark_id, folder_id)
);

alter table bookmark_folders enable row level security;
create policy "Users can view own bookmark_folders"
  on bookmark_folders for select
  using (exists (select 1 from folders where folders.id = folder_id and folders.user_id = auth.uid()));
create policy "Users can insert own bookmark_folders"
  on bookmark_folders for insert
  with check (exists (select 1 from folders where folders.id = folder_id and folders.user_id = auth.uid()));
create policy "Users can delete own bookmark_folders"
  on bookmark_folders for delete
  using (exists (select 1 from folders where folders.id = folder_id and folders.user_id = auth.uid()));
