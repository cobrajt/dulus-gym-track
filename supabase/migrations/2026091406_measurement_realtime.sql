begin;
do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='dulus_measurements') then
  alter publication supabase_realtime add table public.dulus_measurements;
 end if;
end $$;
commit;