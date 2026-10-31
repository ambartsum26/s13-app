# Cross-device interface quality checklist

This matrix complements automated source-level regression checks. It does **not**
claim to replace visual tests on actual devices.

## Device / viewport matrix

| Environment | Viewport / mode | Must check |
|---|---|---|
| Small Android phone | 320–359 CSS px, portrait | Header controls fit; RU/FR readable; login button accessible |
| Samsung Galaxy, Chrome | 360–430 CSS px, portrait | One UI pill, status cards, cities, edit dialogs, keyboard |
| Samsung Internet | 360–430 CSS px, portrait | Same as Chrome; native keyboard and browser toolbar |
| Android phone | Short landscape (<540 px tall) | Editing panels still scroll; close / save actions reachable |
| iPhone Safari | 375–430 CSS px | Safe areas, iOS touch, login, dropdowns, alerts |
| iPad portrait | 640–899 CSS px | Cards and publisher list, overlays, split layout |
| iPad landscape | 900–1199 CSS px | Toolbar, city strip, cards, search and keyboard |
| Laptop | 1200–1499 CSS px | 3-column territory cards; tab and keyboard focus |
| Wide desktop | >=1500 CSS px | 4-column card grid; sensible reading width |
| Large desktop | >=1800 CSS px | Header and content width cap; no stretched controls |

## Required functional smoke sequence (RU and FR)

1. Open logged-out screen. Switch to FR. Refresh. Confirm FR remains selected.
2. Authenticate; confirm FR remains selected and the slider / labels agree.
3. Switch to RU, refresh, and check RU remains selected.
4. Open the app in a second tab. Changing language in the first tab
   should update the second one without losing the active city.
5. Simulate unavailable browser storage: switching language still works
   until reload; no crash and no data is stored by the preference feature.
6. Open the territory, publisher and history pages; search and scroll
   through long lists. No unwanted horizontal page scrolling.
7. Open edit and publisher-picker dialogs. Check visible title, fields,
   and actions with and without the software keyboard. This release does
   **not** redesign the popup or add keyboard repositioning.
8. Trigger invalid date, duplicate record, and other recoverable alerts.
   Confirm the localized notice can be dismissed by its button or Escape,
   and that a second notice does not replace the first one silently.
9. Confirm destructive operations still use their original confirmation
   and can be cancelled safely.
10. Test tap, physical keyboard Tab/Shift+Tab, rotated display,
    browser zoom 200%, dark theme and reduced-motion preference.

## Release gates

- Run `npm test` and the reproducible build / Firestore emulator CI.
- Require green CodeQL.
- Run the matrix above on at least one Android device, one Apple touch
  device, and desktop before claiming device-specific visual parity.
- Do not upload screenshots containing real publisher names or other
  congregation data to the public repository; use synthetic fixtures.

## Scope of this change

The persisted language is a harmless UI preference in localStorage.
Passwords, authorisation tokens, publisher names and territory data are
**not** stored in that preference. All Firestore access rules are unchanged.
