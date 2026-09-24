# Design systém pro potřeby data.gov.cz

Toto není [oficiální repositář pro Design systém Gov.cz](https://code.gov.cz/gov-cz/gov-design-system).
Pro více informací navštivte [oficiální dokumentaci](https://designsystem.gov.cz/).

## Konfigurace

| Proměnná | Výchozí hodnota | Význam |
| -------- | --------------- | ------ |
| CORS_ENABLED | 0 | Nastavte na `1`, aby server publikoval hlavičky CORS. Jakákoliv jiná hodnota CORS vypne. |
| NGINX_PORT | 80 | Port, na kterém je HTTP server dostupný. |

## Změny proti gov-design-system

Provedené změny jsou v souborech v adresáři `patch`.
Zavádění vlastních změny by mělo být minimální a vždy navázaní na issue v gov-design-system repositáři.
Bohužel neb gov-design-system nevyužívá issues tak není snadné stav sledovat,
Jedná se tedy o "best effort" přístup bez záruky.

Pro plnou funkčnost je třeba využít všech dodatečných souborů v adresáři `third-party`.
