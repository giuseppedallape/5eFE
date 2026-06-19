# Nuovo5e

Frontend statico (vanilla JS, nessun framework/build step) per consultare il
compendio di D&D 5e con traduzioni in italiano, pensato per l'uso al tavolo
da un DM: ricerca/filtri sul compendio, schede di mostri/incantesimi/oggetti
ecc. e una **plancia DM** per gestire il combattimento.

## Plancia DM

Pannello dedicato per tenere più schede aperte fianco a fianco durante una
sessione:

- **Tracker PF** per i mostri pinnati, con tiro automatico (o media) dei
  punti ferita, applicazione di danno/cura che considera resistenze,
  immunità e vulnerabilità.
- **Iniziativa**: bottone globale che tira `d20 + mod. Destrezza` per ogni
  mostro che non ha ancora un valore, e ordina automaticamente tutte le
  schede per iniziativa decrescente.
- **Segnalibri PG**: card compatte a tinta unita per inserire i giocatori
  nella sequenza di iniziativa insieme ai mostri.
- **Colori**: evidenzia le schede dei mostri con un accento colorato a
  scelta tra una decina di colori.
- **Schermo intero**: nasconde sidebar e lista per usare tutto lo spazio su
  un grande schermo da tavolo.

## Stack

- HTML/CSS/JS statici, nessuna dipendenza npm.
- Dati forniti da [dndapi.fromtheb.ee](https://dndapi.fromtheb.ee).
- Servito in produzione da **nginx** (Docker), che fa anche da proxy verso
  l'API esterna (`/api/*`, `/img/*`) per evitare problemi di CORS.
- PWA installabile (manifest + service worker).

## Avvio in locale

### Con Docker (consigliato, riproduce la configurazione di produzione)

```bash
docker compose up -d --build
```

L'app è disponibile su `http://localhost:3000`.

Dopo ogni modifica ai file statici va rifatto il build **e** la ricreazione
del container (un semplice `--build` non basta se il container è già in
esecuzione):

```bash
docker compose up -d --build --force-recreate
```

### Senza Docker

Un piccolo proxy Node (senza dipendenze npm) serve i file statici e
inoltra `/api/*` all'API esterna:

```bash
node proxy.js
```

Disponibile su `http://localhost:3000`.

## Struttura del progetto

```
index.html              markup dell'app (sidebar, lista, dettaglio, plancia DM)
app.js                   logica dell'app (routing, rendering, plancia DM, PWA)
style.css                stili
nginx.conf               config nginx per il container di produzione
Dockerfile / docker-compose.yml
proxy.js                 proxy Node per lo sviluppo locale senza Docker
manifest.webmanifest / sw.js   PWA
swagger.yaml             documentazione dell'API esterna usata come fonte dati
```
