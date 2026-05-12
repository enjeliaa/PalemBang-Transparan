alter table comments add column if not exists post_slug text;
alter table comments alter column post_id drop not null;

alter table comments drop constraint if exists comments_post_reference_check;
alter table comments add constraint comments_post_reference_check
  check (post_id is not null or post_slug is not null);

create index if not exists comments_post_slug_idx on comments(post_slug);

drop policy if exists "Public can read comments" on comments;
create policy "Public can read comments" on comments
  for select using (is_deleted = false);

drop policy if exists "Public can insert comments" on comments;
create policy "Public can insert comments" on comments
  for insert with check (true);
