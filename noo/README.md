# Noo — refonte de marque du site noo-mediation.fr

Refonte visuelle de la page d'accueil de https://www.noo-mediation.fr/.
**Structure et contenus inchangés** (mêmes sections, même ordre, mêmes textes, mêmes liens) : seuls la marque et le design évoluent.

Ouvrir `index.html` dans un navigateur, ou servir le dossier : `python3 -m http.server` puis http://localhost:8000.

## Identité — « Deux cercles »
La médiation, c'est deux parties qui se rapprochent. Les deux « o » de *noo* deviennent deux cercles ; leur intersection — l'accord — est la seule touche de couleur vive du site. Ce symbole sert de logo, d'intro, de pictogramme pour les étapes (les cercles se rapprochent jusqu'à l'accord) et de signature géante en pied de page.

- **Palette** : papier `#f3efe7`, encre `#161512`, sable `#e8e1d3`, vert forêt `#1d322c`, brume `#c9d4c6`, argile `#c8573a` (accent unique).
- **Typo** : Instrument Serif (titres, chiffres), Geist (texte), Geist Mono (repères, petites étiquettes).
- **Mise en page** : éditoriale, filets fins, beaucoup d'air, sections numérotées (01)…(05).

## Mise en scène (section par section)
| Section | Effet |
|---|---|
| Intro | Compteur 000→100, les deux cercles se rejoignent, rideau qui se lève |
| Hero | Rendu WebGL : deux formes « verre » (les parties) qui fusionnent au défilement ; leur intersection argile (l'accord) grandit jusqu'à tout remplir. Une goutte suit la souris. Titre géant mot à mot, capsule photo qui s'ouvre, hero épinglé pendant la fusion |
| (01) Manifeste | La phrase s'allume mot à mot ; mosaïque (bento) dont la photo s'ouvre depuis une capsule |
| (02) Comparatif | Défilement horizontal épinglé, une infographie par chiffre : 80 points sur 100, barres 21 j vs 28 mois, cercles à l'échelle 49 € vs 5 000 €, anneau 70 % |
| (03) Étapes | Cartes empilées ; dans chaque carte, les deux cercles se rapprochent jusqu'à l'accord |
| (04) MIA | Le panneau vert s'agrandit jusqu'au plein écran, la conversation se redresse en 3D puis s'écrit |
| (05) Offres | Les trois cartes arrivent en éventail puis se déploient ; inclinaison 3D et reflet au survol |
| Témoignages | Bandeau qui accélère et s'incline selon la vitesse de défilement ; avis éparpillés qu'on peut attraper et lancer |
| Pied de page | Dévoilé sous le contenu ; les deux « o » géants se rejoignent |

Partout : défilement doux (Lenis), curseur personnalisé (deux cercles au survol des liens), boutons aimantés, en-tête flottant qui s'adapte au fond clair/sombre et se cache en descendant.

**Robustesse** : GSAP, ScrollTrigger et Lenis viennent de jsDelivr. Sans eux (ou sans WebGL), la page reste complète et propre (versions statiques). `prefers-reduced-motion` coupe toute la mise en scène. Sur mobile : pas d'épinglage horizontal ni d'éparpillement, les sections s'empilent proprement.

## Fichiers
- `index.html` — page d'accueil
- `assets/css/style.css` — design system et mise en page
- `assets/js/gl.js` — hero WebGL (shader des deux cercles)
- `assets/js/main.js` — mise en scène (GSAP + ScrollTrigger + Lenis)
- `assets/img/` — visuels du site actuel, recadrés et convertis en WebP

## Points à vérifier côté client
- Le lien du téléphone pointe vers `tel:0672214133` alors que le numéro affiché est 09.72.21.41.33 (repris tel quel du site actuel).
- Les boutons « MIA » ouvrent le widget Jotform s'il est présent sur la page, sinon la page de l'agent Jotform.
- Les liens pointent vers les pages existantes de noo-mediation.fr.
