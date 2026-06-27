# Field Marker App (Leaflet + Android)

Simple Android app using Leaflet to:
- Place markers on a map
- Save species, date, time
- Attach photos
- Export markers to CSV
- Sync markers to Google Sheets
- Use GPS to auto-locate

## Structure

- `web_app/` – Leaflet web app (HTML/JS/CSS)
- `android_app/` – Android Studio project (WebView loading `index.html` from assets)

## Build APK

Open `android_app` in Android Studio:

- Build → Build Bundle(s) / APK(s) → Build APK(s)
- APK will be in `android_app/app/build/outputs/apk/debug/app-debug.apk`
