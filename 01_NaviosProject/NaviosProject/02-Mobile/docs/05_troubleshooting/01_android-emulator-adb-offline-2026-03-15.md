# Android Emulator ADB Offline Troubleshooting (2026-03-15)

## Summary
- Symptom: `npx expo run:android` failed with "No Android connected device found".
- Related error: `adb.exe: device offline` on `emulator-5554`.
- Impact: Android build/deploy blocked although app code itself was unchanged.

## Error Logs
```text
CommandError: No Android connected device found, and no emulators could be started automatically.
```

```text
CommandError: Failed to get properties for device (emulator-5554)
adb.exe: device offline
```

```text
List of devices attached
emulator-5554   offline
```

## Root Cause
- Runtime target issue (ADB/device state), not application logic.
- AVD process instability (process terminated) and stale ADB session caused `offline` state.
- In mixed environments (WSL + Windows), ADB server mismatch can worsen reconnection issues.

## Resolution Steps (Confirmed)
1. Stop stale ADB/Emulator processes.
2. Restart ADB server.
3. In Android Studio Device Manager:
- `Wipe Data`
- `Cold Boot Now`
4. Wait for full boot and verify:
```powershell
adb devices
```
Expected:
```text
emulator-5554   device
```
5. Run again:
```powershell
npx expo run:android
```

## Fast Recovery Commands (Windows PowerShell)
```powershell
adb kill-server
taskkill /F /IM adb.exe
taskkill /F /IM emulator.exe
taskkill /F /IM qemu-system-x86_64.exe
adb start-server
adb devices
```

## Prevention Checklist
- Use one ADB context consistently (prefer Windows PowerShell for Expo Android runs).
- Before `expo run:android`, always check `adb devices` is `device` (not `offline`).
- If emulator behaves oddly, do `Cold Boot Now` first, then `Wipe Data` if needed.
- If AVD repeatedly terminates, recreate the AVD (API 34/35, x86_64 image).

## Recommended Daily Workflow (WSL + Windows)
- Code editing and Git operations: use WSL.
- Android runtime tasks (`expo run:android`, `adb`, `emulator`, APK install): use Windows terminal only.
- Metro/dev server: prefer Windows side when running Android to avoid WSL/Windows path and ADB bridge mismatches.
- Do not mix WSL `adb` and Windows `adb` in the same run session.

## Notes for Next Session
- If the same error recurs, start from this file and run "Fast Recovery Commands" first.
- Treat this as infra/device troubleshooting, not app code regression.

## Additional Case: Build Tools 36.0.0 Corrupted

### Symptom
```text
Caused by: com.android.builder.errors.EvalIssueException: Installed Build Tools revision 36.0.0 is corrupted.
```

### Root Cause
- Android SDK Build Tools (`36.0.0`) files became inconsistent/corrupted.
- This can happen even if code is unchanged (interrupted SDK update, file lock, AV scan, or cache inconsistency).

### Resolution (Windows cmd)
```cmd
cd /d "%LOCALAPPDATA%\Android\Sdk"
rmdir /s /q "build-tools\36.0.0"
```

Reinstall via Android Studio SDK Manager:
- `Android SDK Build-Tools 36`

Or via sdkmanager:
```cmd
"%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat" "build-tools;36.0.0"
```

Verify:
```cmd
dir "%LOCALAPPDATA%\Android\Sdk\build-tools\36.0.0"
```

Then retry:
```cmd
cd /d D:\02-Project\01-Navios\01_NaviosProject\NaviosProject\02-Mobile
npx expo run:android
```
