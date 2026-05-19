-- Status für Research-Result-Aktionen (übernehmen / verwerfen)

alter table research_results drop constraint if exists research_results_status_check;
alter table research_results add constraint research_results_status_check check (
  status in (
    'pending',
    'checked',
    'converted',
    'failed',
    'new',
    'saved',
    'dismissed',
    'duplicate'
  )
);
