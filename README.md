# Umgebungskarte

Interaktive Karte: Alle Städte mit mehr als 50.000 Einwohnern, die ab einem Zentrum (Start: Unna) mit dem Pkw in höchstens 6 Stunden erreichbar sind.

## Benutzung

`index.html` im Browser öffnen (Internetverbindung nötig).

- Klick auf eine Stadt: als neues Kartenzentrum wählen oder die nähere Umgebung erkunden.
- Neues Zentrum: Städte und Fahrzeiten werden live berechnet.
- Umgebung erkunden: Sehenswürdigkeiten bis 30 Minuten Fahrzeit werden nach und nach geladen und mit Bildern angezeigt.
- Filter nach Fahrzeitband und Einwohnerzahl, Zoom und Verschieben.

## Datenquellen

- Städte: OpenStreetMap über die Overpass API, ergänzt um eine eingebettete Liste
- Fahrzeiten und Strecken: OSRM (öffentlicher Demo-Server, Pkw, ohne Verkehr)
- Sehenswürdigkeiten, Bilder, Texte: Wikipedia (de) und Wikimedia Commons
- Küstenlinie: Natural Earth (über jsDelivr, `world-atlas`), mit eingebetteter Ersatzkarte

Die Unna-Ansicht beim Start ist eingebettet und braucht kein Netz. Die öffentlichen Server können Anfragen drosseln, ein Zentrumwechsel dauert dann länger.
