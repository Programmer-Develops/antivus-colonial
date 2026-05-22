-- ─── Antivus Colonial Wars — initial database schema ─────────────────────────
-- Run this in Supabase SQL Editor or via: supabase db push

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── Players ──────────────────────────────────────────────────────────────────
create table if not exists players (
  id           text primary key,          -- socket.id or auth uid
  username     text not null default 'Ant Queen',
  avatar_color text not null default '#4ade80',
  total_games  int  not null default 0,
  total_wins   int  not null default 0,
  last_seen    timestamptz default now(),
  created_at   timestamptz default now()
);

-- ── Game sessions ─────────────────────────────────────────────────────────────
create table if not exists game_sessions (
  id          uuid primary key default gen_random_uuid(),
  room_id     text not null,
  map_seed    int  not null,
  player_ids  text[] not null,
  duration_ms int,
  winner_id   text references players(id),
  ended_at    timestamptz default now()
);

-- ── Scores (one row per player per session) ───────────────────────────────────
create table if not exists scores (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references game_sessions(id) on delete cascade,
  player_id   text references players(id),
  username    text,
  kills       int  not null default 0,
  chambers_built int not null default 0,
  ants_spawned   int not null default 0,
  score       int  not null default 0,   -- calculated: kills*10 + chambers*5
  won         bool not null default false,
  created_at  timestamptz default now()
);

-- ── Leaderboard view ─────────────────────────────────────────────────────────
create or replace view leaderboard as
  select
    p.id          as player_id,
    p.username,
    p.avatar_color,
    p.total_wins,
    p.total_games,
    coalesce(sum(s.kills), 0)            as total_kills,
    coalesce(sum(s.score), 0)            as total_score,
    round(p.total_wins::numeric /
      nullif(p.total_games, 0) * 100, 1) as win_rate
  from players p
  left join scores s on s.player_id = p.id
  group by p.id, p.username, p.avatar_color, p.total_wins, p.total_games
  order by total_score desc;

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table players       enable row level security;
alter table game_sessions enable row level security;
alter table scores        enable row level security;

-- Public read on leaderboard data
create policy "public read players"
  on players for select using (true);

create policy "public read scores"
  on scores for select using (true);

-- Service role can do everything (your server uses service_role key)
create policy "service role all players"
  on players for all using (auth.role() = 'service_role');

create policy "service role all sessions"
  on game_sessions for all using (auth.role() = 'service_role');

create policy "service role all scores"
  on scores for all using (auth.role() = 'service_role');

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists idx_scores_player   on scores(player_id);
create index if not exists idx_scores_session  on scores(session_id);
create index if not exists idx_scores_score    on scores(score desc);