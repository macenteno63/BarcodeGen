# Étiquettes de bibliothèque

Application web simple pour préparer et imprimer des étiquettes de livres avec un code-barres **CODE128**. Elle utilise Next.js (App Router), TypeScript, Tailwind CSS et JsBarcode.

## Démarrer

Prérequis : Node.js et pnpm. Le projet indique `pnpm@10.4.1` dans `package.json`.

```bash
pnpm install
pnpm dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000).

## Utiliser l'application

1. Saisissez le nom de la bibliothèque. Il est enregistré automatiquement dans le stockage local du navigateur et réapparaît lors de la prochaine visite sur le même navigateur.
2. Saisissez ou scannez le code d'un livre. L'aperçu du code-barres apparaît pendant la saisie.
3. Appuyez sur **Entrée** ou sur **Ajouter à la planche**. Le champ du code se vide et garde le focus pour le livre suivant.
4. Répétez l'opération, puis cliquez sur **Imprimer la planche**. Le bouton **Tout effacer** vide la planche.

La planche peut contenir plusieurs pages. Chaque page A4 comprend jusqu'à **48 étiquettes**, disposées en quatre colonnes et douze rangées. Chaque étiquette mesure **40 × 20 mm**. Le nom de la bibliothèque est conservé sur chaque étiquette au moment de son ajout ; le changer ensuite n'altère pas les étiquettes déjà ajoutées.

Pour conserver les dimensions à l'impression, choisissez le papier **A4 en portrait**, une échelle de **100 %**, et désactivez les en-têtes et pieds de page du navigateur si celui-ci les propose. Vérifiez l'aperçu avant d'imprimer sur une planche d'étiquettes.

Le nom de la bibliothèque est conservé localement. La liste des étiquettes reste uniquement dans la page ouverte : un rechargement la vide.

## Vérifications

```bash
pnpm lint
pnpm build
```

Le rendu des étiquettes se trouve dans `app/page.tsx` et les règles d'impression A4 dans `app/globals.css`.

## Déploiement GitHub Pages

Le workflow `.github/workflows/deploy-pages.yml` vérifie le code, génère un export statique dans `out/`, puis le publie à chaque push sur `main`. Il peut aussi être lancé manuellement depuis l'onglet **Actions** de GitHub. Aucun serveur Next.js n'est nécessaire pour héberger cet export.

Dans les paramètres du dépôt GitHub, ouvrez **Settings → Pages** et sélectionnez **GitHub Actions** comme source de publication. L'application sera disponible à l'adresse [https://macenteno63.github.io/BarcodeGen/](https://macenteno63.github.io/BarcodeGen/) après le premier déploiement réussi.

Le build destiné à Pages utilise le préfixe `/BarcodeGen` pour les ressources Next.js. Le serveur de développement local et `pnpm build` sans la variable `GITHUB_PAGES` restent à la racine. Pour vérifier localement l'export destiné à Pages :

```bash
GITHUB_PAGES=true pnpm build
```
