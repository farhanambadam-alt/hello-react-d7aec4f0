# Cursor AI Prompt — Add Share Button to Existing Flutter WebView App

> **Copy-paste this into Cursor AI to add native sharing to your existing ChicSalon Flutter app.**

---

## WHAT THIS DOES

Adds a `shareContent` JavaScript handler to your existing `InAppWebView` so the React web app can trigger the native Android/iOS share sheet.

---

## STEP 1 — Add Dependency

In `pubspec.yaml`, add under `dependencies:`:

```yaml
share_plus: ^7.0.0
```

Then run `flutter pub get`.

---

## STEP 2 — Import

In `main.dart`, add this import at the top:

```dart
import 'package:share_plus/share_plus.dart';
```

---

## STEP 3 — Register Handler

Inside your existing `onWebViewCreated` callback (where `routeChanged` and `mapActive` handlers already exist), add this handler **alongside** them:

```dart
controller.addJavaScriptHandler(
  handlerName: 'shareContent',
  callback: (args) {
    final data = args.isNotEmpty ? args[0] as Map<String, dynamic> : {};
    final title = data['title']?.toString() ?? '';
    final text = data['text']?.toString() ?? '';
    final url = data['url']?.toString() ?? '';
    debugPrint('[SHARE] shareContent received: $title');
    debugPrint('[SHARE] Opening native share sheet');
    Share.share(
      '$text\n$url',
      subject: title,
    );
  },
);
```

---

## BRIDGE CONTRACT

| Field   | Type     | Example                                    |
|---------|----------|--------------------------------------------|
| `title` | `String` | `"Glamour Studio"`                         |
| `text`  | `String` | `"Check out Glamour Studio on ChicSalon"`  |
| `url`   | `String` | `"https://groosalon.lovable.app/salon/42"` |

Handler name: **`shareContent`** (exact match required)

---

## RULES

- ❌ DO NOT remove or modify existing handlers (`routeChanged`, `mapActive`, `openDirections`)
- ❌ DO NOT create a new `onWebViewCreated` — add inside the existing one
- ✅ Handler name MUST be exactly `shareContent`
- ✅ Must work on Android (primary) and iOS

---

## VERIFICATION

After building, tap Share in the web app → native share sheet should open with the salon name and URL.
