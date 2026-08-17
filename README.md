# Design systém gov.cz pro potřeby data.gov.cz

Toto není [oficiální repozitář pro Design systém Gov.cz](https://code.gov.cz/gov-cz/gov-design-system).
Pro více informací prosím navštivte [oficiální dokumentaci](https://designsystem.gov.cz/).

## Použití

Pro použití je možné vyjít z níže uvedeného fragmentu.
V něm je třeba nahradit {DS} za URL, na které je dostupný Docker image tohoto repositáře.

```html
<head>
	<script>
		window.GOV_DS_CONFIG = { canValidateWcagOnRender: true, iconsPath: "../../icons" }
	</script>
	<link rel="stylesheet" href="{DS}/assets/components/core/core.css">
	<link rel="stylesheet" href="{DS}/assets/fonts/roboto.css">
	<script type="module" src="{DS}/assets/components/core/core.esm.js"></script>
	<script nomodule src="{DS}/assets/components/core/core.js"></script>
</head>
```

## Lokální sestavení a vývojářský mód

Nejprve je třeba nainstalovat balíčky.

```shell
npm ci
```

Následně je možné si vybrat jeden z dalších příkazů.
Příkazy spouští přímo [nx](https://nx.dev/), který je použitý pro správu toho repositáře.

## Spuštěná vývojového módu

```shell
npx nx run core:serve
```

Při tomto spuštění dojde k úvodnímu sestavení závislostí jako jsou CSS styly, ikonky a fonty.

Bohužel jednotlivé závislosti nejsou automaticky sestavovány v případě změny.
Z tohoto důvodu je třeba spouštět sestavení ručně.
Třeba CSS styly je možné sestavit pro serve příkaz pomocí následujícího příkazu.

```shell
npx nx run styles:serve
```

## Sestavení

```shell
npx nx run core:build
```
