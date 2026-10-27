# Merry Zoapmas - Helgtre edition

Mobiele kerst-webapp voor teams, met registratie, gps/kompas, quiz, gedeeld scorebord en optionele AI-selfies.

De spelersapp staat op `/`. De aparte bediening voor de spelleider staat op `/leader.html`. De spelleider start iedere vraag pas nadat alle geregistreerde teams op de locatie zijn ingecheckt. Daarna loopt een gezamenlijke aftelling van vijf seconden en een antwoordtijd van dertig seconden. Een juist antwoord levert 50 basispunten en maximaal 50 tijdspunten op.

## Netlify

Koppel deze repository aan Netlify. De instellingen worden automatisch uit `netlify.toml` gelezen. Netlify Blobs bewaart de teams en scores.

Voor AI-selfies voeg je in Netlify onder **Site configuration > Environment variables** toe:

- `OPENAI_API_KEY`: een geldige OpenAI API-sleutel met toegang tot afbeeldingsbewerking
- `OPENAI_IMAGE_MODEL`: optioneel, standaard `gpt-image-1`

Zonder deze variabelen werken alle onderdelen behalve het genereren van de AI-selfie.

## Lokaal

Gebruik `npm install`, gevolgd door `npx netlify dev`. Alleen een statische preview via een gewone webserver ondersteunt de Netlify Functions niet.

## Spelinstellingen

De gps-posten in `netlify/functions/game.mjs` hebben bewust nog geen vaste coördinaten. Vul de echte locaties bij `rounds` in wanneer ze bekend zijn.

Voor tijdelijk testen staat locatiecontrole uit via `LOCATION_TEST_MODE` in `app.js` en `LOCATION_CHECKS_ENABLED` in `netlify/functions/game.mjs`. Zet beide waarden terug op `false` respectievelijk `true` om GPS-controle opnieuw te activeren.
