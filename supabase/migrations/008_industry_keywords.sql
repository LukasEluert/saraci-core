-- Branchen-Keywords für Auto-Erkennung

alter table industries add column if not exists keywords text[];

update industries set keywords = array[
  'restaurant', 'gaststätte', 'gaststaette', 'speisekarte', 'küche', 'kueche', 'menü', 'menu',
  'gastro', 'cafe', 'café', 'bistro', 'catering', 'kitchen', 'dining', 'gastronomie'
] where slug = 'gastronomie';

update industries set keywords = array[
  'hotel', 'übernachtung', 'uebernachtung', 'zimmer', 'buchen', 'booking', 'gästehaus', 'gaestehaus',
  'pension', 'hospitality', 'accommodation', 'rezeption', 'reception', 'hotellerie', 'hostel'
] where slug = 'hotellerie';

update industries set keywords = array[
  'handwerk', 'meisterbetrieb', 'installateur', 'elektriker', 'sanitär', 'sanitaer', 'maler',
  'schreiner', 'craftsman', 'trade', 'werkstatt', 'handwerker', 'shk'
] where slug = 'handwerk';

update industries set keywords = array[
  'einzelhandel', 'shop', 'laden', 'verkauf', 'retail', 'produkte', 'store', 'shopping',
  'boutique', 'filiale', 'waren', 'handel'
] where slug = 'einzelhandel';

update industries set keywords = array[
  'retail', 'handel', 'shop', 'laden', 'verkauf', 'store', 'shopping', 'boutique', 'einzelhandel'
] where slug = 'retail-handel';

update industries set keywords = array[
  'produktion', 'industrie', 'fertigung', 'manufacturing', 'factory', 'maschinen', 'industriebetrieb',
  'produktionsbetrieb', 'werk', 'industrial'
] where slug = 'produktion-industrie';

update industries set keywords = array[
  'software', 'it-dienstleistung', 'digital', 'app', 'entwicklung', 'hosting', 'cloud',
  'programming', 'tech', 'saas', 'webentwicklung', 'it-beratung'
] where slug = 'it-software';

update industries set keywords = array[
  'marketing', 'werbung', 'agentur', 'branding', 'social media', 'kampagne', 'advertising',
  'media', 'kommunikation', 'seo agentur', 'performance marketing'
] where slug = 'marketing-werbung';

update industries set keywords = array[
  'beratung', 'consulting', 'unternehmensberatung', 'coach', 'strategie', 'consultancy',
  'managementberatung', 'business consulting'
] where slug = 'beratung';

update industries set keywords = array[
  'gesundheit', 'praxis', 'medizin', 'klinik', 'therapie', 'healthcare', 'patient', 'arzt',
  'gesundheitswesen', 'medical', 'behandlung'
] where slug = 'gesundheitswesen';

update industries set keywords = array[
  'anwalt', 'rechtsanwalt', 'kanzlei', 'juristisch', 'legal', 'law firm', 'mandant',
  'rechtsberatung', 'recht', 'attorney', 'jura'
] where slug = 'recht';

update industries set keywords = array[
  'finanz', 'bank', 'versicherung', 'investment', 'finance', 'kredit', 'vermögen', 'vermoegen',
  'finanzberatung', 'vermögensberatung', 'asset'
] where slug = 'finanzen';

update industries set keywords = array[
  'steuerberater', 'steuerberatung', 'tax', 'buchhaltung', 'steuer', 'steuerkanzlei',
  'tax advisor', 'lohnbuchhaltung', 'jahresabschluss', 'finanzbuchhaltung'
] where slug = 'steuerberater';

update industries set keywords = array[
  'immobilie', 'immobilien', 'makler', 'wohnung', 'haus', 'real estate', 'property', 'miete',
  'immobilienmakler', 'verkauf immobilie', 'hausverwaltung'
] where slug = 'immobilien';

update industries set keywords = array[
  'bildung', 'schule', 'kurs', 'training', 'akademie', 'lernen', 'education', 'seminar',
  'weiterbildung', 'coaching', 'schulung', 'e-learning'
] where slug = 'bildung';

update industries set keywords = array[
  'logistik', 'transport', 'spedition', 'lieferung', 'logistics', 'versand', 'lager', 'freight',
  'kurier', 'supply chain', 'distribution'
] where slug = 'logistik';

update industries set keywords = array[
  'online shop', 'onlineshop', 'warenkorb', 'checkout', 'ecommerce', 'e-commerce', 'webshop',
  'bestellen', 'shop online', 'online-store'
] where slug = 'e-commerce';

update industries set keywords = array[
  'zahnarzt', 'zahnärzte', 'zahnaerzte', 'praxis', 'dentist', 'prophylaxe', 'zahnmedizin',
  'dental', 'zahnbehandlung', 'zahnarztpraxis', 'implantologie'
] where slug in ('zahnaerzte', 'zahnarzt', 'zahnärzte');

update industries set keywords = array[
  'friseur', 'friseursalon', 'haarschnitt', 'hairdresser', 'salon', 'styling', 'barbershop',
  'haare', 'frisör', 'coiffeur', 'barber'
] where slug in ('friseure', 'friseur');

update industries set keywords = array[
  'autowerkstatt', 'kfz', 'werkstatt', 'reparatur', 'auto', 'tire', 'reifen', 'car repair',
  'mechaniker', 'fahrzeug', 'automotive', 'inspektion', 'tüv'
] where slug in ('autowerkstatt', 'kfz-werkstatt', 'kfz');
