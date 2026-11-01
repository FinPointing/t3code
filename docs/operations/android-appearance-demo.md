# Android appearance demo

This fork adds independent interface, prompt, code, and terminal font choices under
**Settings → Appearance**. Prompt size and font can follow interface text or use their own
values. Settings are saved on the phone. The preview app installs beside the official app as
**T3 Appearance Demo** (`com.finpointing.t3code.appearance`).

## Install on your phone

1. In [the fork's Actions page](https://github.com/FinPointing/t3code/actions/workflows/android-appearance-demo.yml),
   enable Actions if GitHub asks, then run **Android Appearance Demo** on the branch containing
   the changes.
2. When the build succeeds, download the **t3-appearance-demo-arm64** artifact from that run.
   You need to be signed in to GitHub. Extract the ZIP and transfer the APK to your phone.
3. Open the APK in Files and allow installation from that app if Android asks. The build targets
   ARM64 phones and includes its JavaScript bundle; it does not need Expo Go, an Expo account,
   or a running Metro server.
4. Open **T3 Appearance Demo → Settings → Appearance**. Try an interface font, a separate prompt
   font and size, and Meslo versus system monospace in code and terminal. Reopen the app to
   confirm the choices persist.

With Android platform tools on a computer and USB debugging enabled, you can install the same
APK using `adb install -r /path/to/app-release.apk`. The generated release build uses the
template's debug signing key for this demo; it is not a Play Store release.

## Connect to Horseman

The appearance previews work without a coding environment. To use real threads, add the
existing environment under **Settings → Environments** using a fresh pairing URL or QR code.
Keep the host's listener on `127.0.0.1`.

For a phone connection without a public route, run an SSH client on the phone (for example,
OpenSSH in Termux) and forward the existing T3 server port:

```sh
ssh -N -L 3773:127.0.0.1:SERVER_PORT white@horseman
```

Replace `SERVER_PORT` with the existing server's port. Keep that SSH session open and use
`http://127.0.0.1:3773` as the address when generating the fresh pairing URL. Port 3773 is on
the phone; it reaches Horseman through SSH. Generate the pairing URL locally in T3 Code's
sharing settings and paste or scan it in the demo. Do not share the URL publicly.

If using a computer as the SSH client instead, use
`ssh -N -L 3773:127.0.0.1:SERVER_PORT white@horseman` on that computer and then
`adb reverse tcp:3773 tcp:3773` with the phone connected by USB. The same phone address works.
For an existing authenticated HTTPS route, use its normal address only if the native client
can complete that route's authentication.

## Build locally

Use the versions in `mise.toml` and the pinned pnpm package manager:

```sh
mise install
mise exec -- pnpm install --frozen-lockfile --filter @t3tools/mobile... --filter @t3tools/monorepo
cd apps/mobile
APP_VARIANT=preview T3CODE_ANDROID_DEMO=1 mise exec -- pnpm exec expo prebuild --clean --platform android --no-install
cd android
mise exec -- ./gradlew :app:assembleRelease --no-daemon --max-workers=2 -PreactNativeArchitectures=arm64-v8a
```

Local APK builds additionally need an Android SDK/NDK; the Actions workflow provisions its own
SDK. The APK is under `apps/mobile/android/app/build/outputs/apk/release/`. Native compilation
uses a 4 GiB Gradle heap, so use the hosted build while Horseman is sharing its memory with
other services. The demo disables upstream OTA updates so it keeps running this fork's bundle.

Font choices use bundled and platform fonts, not desktop's installed-font enumeration or CSS
font stacks. Desktop-only custom theme editing/import and glass effects are not added by this
demo.
