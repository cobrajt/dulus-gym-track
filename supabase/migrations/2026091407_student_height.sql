begin;

alter table public.dulus_students
 add column if not exists height_cm numeric(5,1)
 check(height_cm is null or height_cm between 100 and 250);

grant update(height_cm) on public.dulus_students to authenticated;

commit;
