-- PLZ-Zuordnung für Regionen-Auto-Erkennung

alter table regions add column if not exists postal_codes text[];

update regions set postal_codes = array['76530', '76532', '76534']
where slug = 'baden-baden';

update regions set postal_codes = array[
  '76131', '76133', '76135', '76137', '76139', '76149',
  '76185', '76187', '76189', '76199', '76227', '76228', '76229'
]
where slug = 'karlsruhe';

update regions set postal_codes = array['76437']
where slug = 'rastatt';

update regions set postal_codes = array['77815']
where slug = 'buehl';
