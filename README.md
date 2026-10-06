# theodora-portfolio

Portfolio de Théodora Ballet — directrice artistique & motion designer freelance (Paris).

**Stack** : Astro 7 (un fichier Markdown par projet), GSAP + ScrollTrigger + Draggable, Lenis, sans framework UI. Lottie à ajouter quand il y aura des animations à intégrer.

## Commandes
- `npm install`
- `npm run dev` — serveur local
- `npm run build` — site statique dans `dist/`

## Structure
- `src/content/projects/*.md` — un projet par fichier (titre, client, année, disciplines, couleur pastel, vidéos Vimeo, images)
- `src/data/carnet.json` — shots Dribbble (section « Carnet »)
- `src/data/site.ts` — liens, clients, accroche
- `src/pages/` — accueil et fiche projet
- `public/images/` — visuels (récupérés depuis Behance et Dribbble, convertis en WebP)
- `_extraction/` — données brutes récupérées sur Behance, Vimeo et Dribbble

## À compléter
- Clients inconnus : Radio – DAB+, Game-ON, Le chat qui nage, Showreel 2022
- Projets LVMH, Intersport, Crédit Mutuel, Jellysmack, SNCF : absents des 3 plateformes
- Adresse e-mail ou formulaire de contact (pour l'instant : Malt)
- Résumés des projets : seuls les textes présents sur Behance ont été repris
