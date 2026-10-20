# Merry Zoapmas - Helgtre edition

Mobiele kerst-webapp voor teams, met registratie, gps/kompas, quiz, gedeeld scorebord en optionele AI-selfies.

## Netlify

Koppel deze repository aan Netlify. De instellingen worden automatisch uit `netlify.toml` gelezen. Netlify Blobs bewaart de teams en scores, dus Supabase is niet nodig.

Voor AI-selfies voeg je in Netlify onder **Site configuration > Environment variables** toe:

- `OPENAI_API_KEY`: een geldige OpenAI API-sleutel met toegang tot afbeeldingsbewerking
- `OPENAI_IMAGE_MODEL`: optioneel, standaard `gpt-image-1`

Zonder deze variabelen werken alle onderdelen behalve het genereren van de AI-selfie.

## Lokaal

Gebruik `npm install`, gevolgd door `npx netlify dev`. Alleen een statische preview via een gewone webserver ondersteunt de Netlify Functions niet.

## Spelinstellingen

De standaard spelcode is `HELGTRE`. De gps-posten in `app.js` hebben bewust nog geen vaste coördinaten. Vul de echte locaties in bij `stops` wanneer ze bekend zijn. Zonder coördinaten werkt het kompas als bewegingssensor en kan een begeleider een post handmatig bevestigen.
