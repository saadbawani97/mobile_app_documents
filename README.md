# Mobile App Development Playbook

I've written this as my handover before leaving. It's everything I'd want the next mobile lead to know on their first day: how we start a project, how repos and accounts are set up, how an app goes live on both stores, and how we keep an eye on apps that are already live. Most of it comes from things that went wrong at some point, here or on projects I've seen elsewhere, so I'd ask that the rules in Section 1 are treated as rules and not suggestions.

| | |
|---|---|
| Prepared by | Saad Bawany, React Native Lead |
| For | Management and whoever takes over mobile |
| Date | 19 October 2026 |
| Version | 1.0 |

A note on dates and numbers: Apple and Google change their requirements every year. Wherever I've mentioned a fee, an API level or an Xcode version, please check it against the official link in Section 12 before acting on it.

---

## Contents

1. [Ground Rules](#1-ground-rules)
2. [Starting a New Project](#2-starting-a-new-project)
3. [Repository Setup and Ownership](#3-repository-setup-and-ownership)
4. [Environment Variables (.env)](#4-environment-variables-env)
5. [Firebase Setup](#5-firebase-setup)
6. [Store Developer Accounts (Apple and Google)](#6-store-developer-accounts-apple-and-google)
7. [Getting Production Ready](#7-getting-production-ready)
8. [Publishing to the App Store and Google Play](#8-publishing-to-the-app-store-and-google-play)
9. [Live Apps: Catching Apple and Google Changes Early](#9-live-apps-catching-apple-and-google-changes-early)
10. [Other Things the Mobile Lead Owns](#10-other-things-the-mobile-lead-owns)
11. [Templates and Checklists](#11-templates-and-checklists)
12. [Official Links](#12-official-links)

---

## 1. Ground Rules

If someone only reads one page of this document, it should be this one.

1. **The company owns everything.** Every repo, store account, Firebase project, domain and third-party service is created from a company account on the company email domain. Never from someone's personal Gmail or personal GitHub, not even "temporarily".
2. **Every repo is private.** No exceptions without written approval from management. Client code, our internal tools, documentation, all of it.
3. **Only one person creates repos.** We have a designated Repo Owner (Section 3.1). Developers don't create repos themselves; they ask the Repo Owner, who creates it as private, under the company organization, with the right access.
4. **When someone leaves, their access goes on their last day.** GitHub, GitLab, App Store Connect, Play Console, Firebase, the password manager, everything. Not next week. The [Offboarding Checklist](#115-offboarding-checklist) is mandatory.
5. **Every important account has at least two company admins.** If only one person can get into the Apple account and that person is on leave or has left, we're stuck.
6. **Signing keys are backed up the day they're created.** If we lose the Android upload key or the iOS signing assets, we can lose the ability to update the app. See [Signing Keys](#73-signing-keys).
7. **No secrets in Git and no secrets inside the app.** Anything bundled in a mobile app can be pulled out of the APK or IPA by anyone who downloads it.
8. **Every project has a Project Registry.** One file with all the key information about that project ([template](#111-project-registry-template)). If it's not in the registry, assume nobody else knows it.
9. **Every store release has a Git tag.** We should always be able to say exactly which code is running in production.

---

## 2. Starting a New Project

### 2.1 Settle these before writing any code

Most of the painful problems I've seen on projects came from questions nobody asked at the start. These are the ones to sort out with the client and management in the first week.

| Question | Why it matters |
|---|---|
| Whose store accounts will the app go out on, ours or the client's? | Whoever owns the account owns the app listing, reviews, revenue and user data. For client projects my recommendation is the client's own organization account, with our company account invited as Admin. |
| Who owns the code, and where does it live after delivery? | Needs to be clear in the contract. We may have to transfer the repo at handover. |
| Who pays for Firebase, Maps, SMS, Sentry and other services? | Billing should be on the owner's card, never an employee's personal card. |
| App name and Bundle ID / Application ID | The Bundle ID (`com.company.appname`) can't be changed once the app is on the store. Decide it once and write it in the registry. |
| Privacy policy URL, terms URL, support email | Both stores require them. Clients usually take a while to provide these, so ask early. |
| Any in-app purchases or subscriptions? | Needs paid-app agreements, tax and bank details on both stores. That alone can take a week or more. |
| Which login methods? | If the iOS app has Google or Facebook login, Apple will generally require Sign in with Apple as well. |
| Minimum OS versions and devices | Affects library choices and how much testing we need. |

### 2.2 Day-one technical setup

- Ask the Repo Owner for a private repo under the company organization (Section 3).
- Pick the stack. For most new projects I'd go with **Expo + EAS** (Build, Submit, Update) unless there's a real native requirement that rules it out. Plain React Native CLI is fine too. Both use the New Architecture by default now.
- TypeScript, ESLint, Prettier and Husky from the very first commit. Adding them later is always more painful.
- Three environments from the start: `development`, `staging`, `production` (Section 4).
- A separate Firebase project for each environment (Section 5).
- Register the Bundle ID / Application ID on the Apple Developer portal and in Play Console early. It reserves the ID and lets you turn on push and other capabilities.
- Generate the Android upload keystore and back it up straight away ([Signing Keys](#73-signing-keys)).
- Set up CI so every pull request runs lint, type-check and tests.
- Set up test distribution: TestFlight for iOS, Play internal testing or Firebase App Distribution for Android.
- Create the Project Registry and fill in what's known so far.

### 2.3 Folder structure we use

```
src/
  api/            # API clients, interceptors
  assets/         # images, fonts, animations
  components/     # shared UI components
  config/         # env access, constants, feature flags
  hooks/
  navigation/
  screens/        # one folder per feature
  services/       # firebase, analytics, push, storage
  store/          # state (Redux Toolkit / Zustand / React Query)
  theme/          # colors, typography, spacing
  utils/
  i18n/
```

---

## 3. Repository Setup and Ownership

Older projects are on the company GitLab. All new projects go on the company GitHub organization.

### 3.1 Who Creates Repositories

Creating repos is the job of one designated person, the **Repo Owner**. This should be the Mobile Lead or an engineering manager, and management should name a backup for when they're away. Nobody else creates repos, and the GitHub organization settings should enforce that (3.3), so it's not just a matter of trust.

The reason is simple. When anyone can create a repo, you end up with repos under personal accounts, public repos by accident, and nobody who knows what exists or who has access. One owner fixes all of that.

The Repo Owner is responsible for:

- Creating every new repo, **always private**, always under the company organization. Never under a personal account.
- Giving access through teams only, and only to the people working on that project.
- Setting up branch protection and the standard files (3.4) before handing the repo over.
- Keeping the **Repository Inventory** up to date ([template](#117-repository-inventory)): every repo, its client, visibility, teams and the date it was created.
- Doing a monthly access review: going through each repo's collaborators and teams and removing anyone who shouldn't be there.
- Removing people who leave from the organization on their last working day (3.8).
- Archiving repos for projects that have ended, rather than deleting them.

How a developer gets a repo: they send the Repo Owner the project name, client, and who needs access. The Repo Owner creates it the same day, adds it to the inventory and shares the link.

### 3.2 Rules for Every Repo

- **Private, always.** A public repo needs written approval from management.
- Created under the company organization (GitHub) or company group (GitLab). Never created on a personal account and "transferred later".
- Access through teams, not by adding individuals one by one. That way removing someone is one click, not twenty.
- Freelancers and contractors are added as outside collaborators on the specific repos they need, with an end date written in the inventory.
- Two-factor authentication is required for everyone in the organization.

### 3.3 One-Time GitHub Organization Settings

These are done once by an organization owner. They are what actually enforce the rules above.

1. **Settings → Authentication security:** require two-factor authentication for everyone.
2. **Settings → Member privileges:**
   - Base permissions: **No permission**. People only get access through teams.
   - Repository creation: **disable for members**, so only owners (the Repo Owner and management) can create repos.
   - Uncheck "Allow members to change repository visibilities", so nobody can flip a private repo to public.
   - Disable forking of private repositories.
   - Uncheck "Allow members to delete or transfer repositories".
3. **Teams:** for example `mobile-leads` (Admin), `mobile-devs` (Write), `qa` (Read), `clients-readonly` (Read).
4. **Code security:** turn on secret scanning with push protection, Dependabot alerts and Dependabot security updates for all new repos.
5. At least two organization owners, both from management or leadership. Not just one developer.

### 3.4 Creating a Repo, Step by Step

1. In the company organization click **New repository**. Check the **Owner** dropdown shows the organization and not your own username. This is the most common mistake.
2. Name it `<client>-<app>-<type>`, lowercase with hyphens. For example `acme-delivery-mobile`, `acme-delivery-backend`, `acme-delivery-admin`.
3. Add a one-line description, e.g. "Acme Delivery customer app (React Native, iOS and Android)".
4. Select **Private**.
5. Add a README and a Node `.gitignore` (then add the React Native entries from 3.5). No license file for client or proprietary work.
6. **Settings → Collaborators and teams:** add `mobile-leads` and `mobile-devs`. No individuals, apart from outside collaborators.
7. **Settings → General:** default branch `main`, turn on "Automatically delete head branches", allow squash merging.
8. **Settings → Rules → Rulesets** for `main` and `develop`:
   - Pull request required, at least one approval.
   - Dismiss old approvals when new commits are pushed.
   - Status checks must pass (lint, type-check, tests).
   - Block force pushes and branch deletion.
9. Commit the standard files:
   - `README.md` with how to set up, run and release the app.
   - `.env.example` with every key and dummy values.
   - `.github/CODEOWNERS`, e.g. `* @company/mobile-leads`, so leads are added as reviewers automatically.
   - `.github/pull_request_template.md`.
   - `.github/workflows/ci.yml` for lint, type-check and tests.
   - `.nvmrc` with the Node version.
10. Add the repo to the Repository Inventory and the Project Registry.

### 3.5 What to Add to .gitignore

```gitignore
# Environment files and secrets
.env
.env.*
!.env.example

# Signing
*.keystore
*.jks
!debug.keystore
*.p8
*.p12
*.mobileprovision
android/keystore.properties

# Build output
android/app/build/
ios/build/
ios/Pods/
*.ipa
*.apk
*.aab
```

### 3.6 Branches and Releases

| Branch | What it's for | Goes to |
|---|---|---|
| `main` | Always matches what's live on the stores | Production |
| `develop` | Work for the next release | Staging / internal testing |
| `feature/<ticket>-<name>` | New work | Nothing, merged into develop |
| `release/x.y.z` | Stabilising a release | TestFlight / Play closed testing |
| `hotfix/x.y.z` | Urgent fix off `main` | Production |

Every production release gets a tag like `v1.4.0`. For commit messages we use Conventional Commits (`feat:`, `fix:`, `chore:`), which makes changelogs easy to generate.

### 3.7 GitLab (Older Projects)

The same rules apply on GitLab:

- Repos live under the company group, with a sub-group per client (`company/acme/...`).
- Access is given at group level: Maintainer for leads, Developer for developers, Reporter for QA and clients.
- **Settings → Repository → Protected branches:** nobody pushes directly to `main` or `develop`, only Maintainers can merge.
- Secrets in **Settings → CI/CD → Variables** are marked Masked and Protected.
- When a project becomes active again it's worth moving it to GitHub. GitHub's importer keeps the full history, branches and tags. Archive the GitLab project afterwards instead of deleting it.

### 3.8 Removing People Who Leave

This is mandatory and it happens on the person's last working day, not later. The Repo Owner removes them from the **GitHub organization** (not just individual repos, which leaves gaps) and from the **top-level GitLab group**. Then the rest of the [Offboarding Checklist](#115-offboarding-checklist) is completed and signed off with the date and the name of whoever did it.

One thing people miss: if the person who left created deploy keys, personal access tokens or CI secrets, those need to be rotated as well. Removing the account doesn't revoke a token that was copied somewhere else.

---

## 4. Environment Variables (.env)

### 4.1 The thing most people get wrong

Values in a React Native `.env` file end up compiled into the app. Anyone can unpack an APK or IPA and read them in a few minutes. So `.env` in a mobile app is for configuration, not for secrets. Real secrets belong on our backend.

### 4.2 What goes in the app's .env

| Goes in .env | Example |
|---|---|
| Environment name | `APP_ENV=production` |
| API and socket URLs | `API_BASE_URL=https://api.example.com/v1` |
| Public or "publishable" keys | Stripe publishable key, Google Maps key (restricted to our package name and SHA-1 / bundle ID), Sentry DSN, OneSignal App ID |
| OAuth client IDs | Google Sign-In client IDs (these are not secrets) |
| Feature flags | `ENABLE_ANALYTICS=true` |
| Per-environment values | `DEEP_LINK_SCHEME=myapp-staging` |

### 4.3 What never goes in the app or in Git

| Never in the app | Where it lives instead |
|---|---|
| Secret keys: Stripe secret key, payment gateway secrets, AWS keys, Twilio token, SendGrid key, AI/LLM API keys | On the backend. The app calls our server and our server calls the third party. |
| Database credentials, admin passwords | Backend and password manager |
| Firebase service account JSON | Backend or CI secrets only |
| Android keystore and passwords, iOS .p12 and .p8 files | Password manager and CI secrets |
| App Store Connect API key, Google Play service account JSON | Password manager and CI secrets |
| Anyone's personal tokens | Nowhere. Use company or bot tokens. |

A simple test: if a value would let someone spend our money, read other users' data or act as the company, it doesn't go in the app.

### 4.4 How we set it up

- React Native CLI: `react-native-config` with `.env.development`, `.env.staging` and `.env.production`, picked per build flavor / scheme.
- Expo: anything prefixed `EXPO_PUBLIC_` is bundled into the app. Per-environment values go in EAS environment variables.
- Only `.env.example` is committed, with every key, a dummy value and a short comment.
- The app reads env values through one file (`src/config/env.ts`) that checks them at startup, so a missing key fails loudly in development instead of quietly in production.
- Public keys are restricted on the provider side: Google Cloud API keys locked to our package name and SHA-1 or bundle ID, and Firebase App Check turned on.

### 4.5 Backing up .env files

Yes, they need a backup. Because `.env` files aren't in Git, if they only exist on one developer's laptop they disappear when that person leaves or the laptop dies. I've seen a team lose a day rebuilding production config from memory because of this.

How we keep them safe:

1. Every project has a vault in the company password manager (1Password, Bitwarden or similar business plan), named after the project.
2. Each environment's `.env` is saved there as a secure note: `acme-delivery / .env.production`, `.env.staging`, `.env.development`.
3. Whoever changes a value updates the vault the same day. This is a line in the pull request template.
4. CI secrets (GitHub Actions, GitLab variables, EAS) are copies for automation, not the backup. You can't read them back once they're saved.
5. Vault access is by group (mobile leads, management). Never share `.env` files over WhatsApp, Slack or email.

If we don't have a password manager yet: at the very least, keep a password-protected archive on the company Google Drive in a folder management owns, with management holding the password. But honestly, a proper password manager is worth the cost and I'd strongly recommend getting one.

---

## 5. Firebase Setup

### 5.1 Why we use Firebase on almost every app

| Service | What it does for us |
|---|---|
| Cloud Messaging (FCM) | Push notifications on Android and iOS. Almost every app needs push. |
| Crashlytics | Crash and ANR reports with stack traces, device and OS. This is how we find out a live app is broken, usually before the client does. |
| Analytics | Users, retention, events and funnels for the business side. |
| Remote Config | Change app behaviour without a release: force-update prompts, feature flags, maintenance mode. |
| App Distribution | Send test builds to QA and the client quickly. |
| Performance Monitoring | App start time, slow screens, network latency. |
| App Check | Makes sure requests to Firebase and our backend come from our real app. |
| Auth, Firestore, Storage | Only when the project doesn't have its own backend. |

Two things that no longer exist and shouldn't be used: **Firebase Dynamic Links** was shut down in August 2025, so use native Universal Links and App Links instead. **App Center and CodePush** were retired in March 2025, so for over-the-air updates use Expo EAS Update or a self-hosted option.

### 5.2 Ownership

- Create Firebase projects while logged into the company Google account (or the client's, if they own the app).
- In project settings, make sure there are at least two company Owners. Developers get Editor or less.
- Billing (Blaze plan) goes on the company or client billing account, with a budget alert set in Google Cloud.

### 5.3 Setting it up

1. **One Firebase project per environment:** `acme-delivery-dev`, `acme-delivery-staging`, `acme-delivery-prod`. Mixing test and live data in one project messes up analytics and you risk sending test pushes to real users.
2. **Add the Android app** with that environment's application ID. Add the SHA-1 and SHA-256 fingerprints of the debug key, the upload key **and the Play App Signing key** (from Play Console → App integrity). Forgetting the Play signing key is the usual reason Google Sign-In works in testing and breaks in production.
3. **Add the iOS app** with the matching bundle ID.
4. Install React Native Firebase (`@react-native-firebase/app` plus the modules you need), or use the Expo config plugin.
5. Put `google-services.json` and `GoogleService-Info.plist` in place per environment (Android flavors, iOS schemes, or Expo `app.config.js` per profile).
6. **Push on iOS:**
   - Create an **APNs Auth Key (.p8)** under Apple Developer → Keys. One key covers every app in the team and it doesn't expire, so it's better than the old yearly .p12 certificates.
   - Upload it to Firebase → Project settings → Cloud Messaging with the Key ID and Team ID.
   - Back up the .p8 file straight away. Apple only lets you download it once.
   - Turn on Push Notifications and Background Modes → Remote notifications in Xcode.
   - On Android 13 and above, ask for the `POST_NOTIFICATIONS` permission.
7. **Crashlytics:** add the Gradle plugin and the dSYM upload build phase on iOS, otherwise iOS crashes show up without readable stack traces. Trigger a test crash on staging to confirm it works.
8. **Remote Config:** every app should have at least these keys:
   - `min_supported_version_android` and `min_supported_version_ios` for force updates.
   - `latest_version_android` and `latest_version_ios` for a soft "update available" prompt.
   - `maintenance_mode` and `maintenance_message`.
9. **Crashlytics alerts** (new issue, regressed issue, velocity alert) go to a shared team email, not someone's personal inbox.
10. **App Check** on production with Play Integrity (Android) and App Attest (iOS).
11. Write the project IDs, console links and owners in the Project Registry.

### 5.4 Should the Firebase config files be committed?

`google-services.json` and `GoogleService-Info.plist` contain identifiers, not secrets. Firebase is protected by security rules and App Check, not by hiding these files. Since our repos are private, committing them is fine and makes builds simpler. Either way, keep a copy in the project vault, restrict the API key inside them in Google Cloud Console, and never ship Firestore or Storage rules that allow everyone to read and write.

---

## 6. Store Developer Accounts (Apple and Google)

### 6.1 Individual vs organization accounts

**Apple Developer Program**

| | Individual | Organization | Enterprise |
|---|---|---|---|
| Fee | USD 99 a year | USD 99 a year | USD 299 a year |
| Name shown on the App Store | The person's legal name | The company's legal name | Not on the App Store |
| What you need | Apple Account with two-factor, government ID | Registered company, D-U-N-S number, company website, company email, someone with authority to sign for the company | Larger organizations with strict eligibility |
| Team | Just that one person in the developer team; App Store Connect users can be added but there's no real team setup | A full team with roles (Admin, App Manager, Developer, Marketing, Finance and so on) | Team |
| Suitable for | Freelancers, personal projects | Companies and client apps | Internal employee apps only, can't publish publicly |
| The catch | The app sits under one person's name. If they leave, the account leaves with them. | Takes longer to set up because of D-U-N-S and verification | No public distribution |

**Google Play Console**

| | Personal | Organization |
|---|---|---|
| Fee | USD 25, once | USD 25, once |
| What you need | Google account, legal name, address, ID, phone and email verification | Company details, D-U-N-S number, company website, verified contact phone and email, ID of the account owner |
| Shown publicly | The person's name (plus address and contact for apps that make money) | The company name and contact details |
| Testing before first release | Accounts created after November 2023 must run a closed test with at least 12 testers opted in for 14 days in a row before they can apply for production | Not required, you can publish straight to production |
| Restricted categories (finance, health, VPN, government and others) | May need an organization account | Allowed, subject to policy |
| Suitable for | Individual developers | Companies and client apps |

My recommendation is organization accounts on both stores, for us and for clients. A personal account ties the app to one person, and on Google Play it adds the 14-day testing step before you can launch.

Apps can be moved between accounts later on both stores (App Transfer in App Store Connect, app transfer request in Play Console), but it's slow and manual. It's much easier to start on the right account.

Google has also announced developer identity verification for apps installed on certified Android devices, rolling out from late 2026. Play Console accounts that are already verified are mostly covered, but keep the account's legal details correct and keep an eye on the Play Console inbox.

### 6.2 D-U-N-S number (needed for both)

- A free nine-digit number from Dun & Bradstreet that Apple and Google use to confirm the company is a real legal entity.
- Look it up or request it through Apple's D-U-N-S lookup tool. A new one can take around five business days, sometimes longer, and Apple may need another day or two to see it.
- The legal name and address must match the company registration documents exactly, and match what you type into the Apple and Google forms. A mismatch is the most common reason enrollment gets rejected.

### 6.3 Setting up the Apple account (organization)

1. Create a company Apple Account on a shared company email, like `appledev@company.com`. Turn on two-factor with a company phone number that management controls.
2. Make sure the company has its D-U-N-S number (6.2) and a public website on the same domain as the email.
3. Enroll at developer.apple.com/programs/enroll. The Apple Developer app on iPhone or Mac is usually the quickest way.
4. Choose Company / Organization and enter the legal name, D-U-N-S number, website and the enrolling person's details. That person has to have authority to sign for the company, and Apple may call to confirm.
5. Pay USD 99. Approval takes anywhere from a couple of days to about two weeks.
6. In App Store Connect → Business, accept the Free Apps agreement. If the app sells anything, also complete the Paid Apps agreement, tax forms and bank details.
7. In Users and Access, add people with only the access they need:
   - **Account Holder:** the company account above, controlled by management. There's only one, and it's the only role that can accept agreements and renew the membership.
   - **Admin:** the mobile lead and one person from management.
   - **App Manager / Developer:** developers.
   - **Marketing, Finance, Customer Support:** as needed.
8. Create an App Store Connect API key (Users and Access → Integrations) for CI, Fastlane or EAS, and save it in the vault.
9. Turn on auto-renew. If the membership lapses, the apps are removed from the App Store.

If the client owns the account, the client enrolls and invites our company email as Admin or App Manager. We never ask for a client's Apple password.

### 6.4 Setting up the Google Play Console account (organization)

1. Use a company Google account, ideally on the company's Google Workspace domain, like `playconsole@company.com`. Turn on two-step verification with a company phone.
2. Have the D-U-N-S number and company documents ready.
3. Go to play.google.com/console/signup and choose "An organization or business".
4. Enter the company name and address (matching D-U-N-S), website, a contact email and phone (Google verifies these and shows them to users), and the developer name to show on Google Play.
5. Pay the USD 25 fee.
6. Complete identity verification for the company and the account owner. This takes a few days.
7. In Users and permissions, invite people. Admin for leads, release permissions for developers. Give contractors access to specific apps only.
8. If the app sells anything, set up the payments profile with bank and tax details.
9. For CI uploads, create a Google Cloud service account, give it access in Play Console, and keep its JSON key in the vault and CI secrets.
10. Log in now and then and keep the account active. Google can close developer accounts that haven't been used in a long time.

If the client owns the account, they create it and invite our company Google account with Admin or release access.

### 6.5 Fees and timelines at a glance

| | Apple | Google |
|---|---|---|
| Account fee | USD 99 every year | USD 25 once |
| Account approval | A few days to two weeks | Usually 2 to 7 days |
| First app review | Usually 1 to 2 days, longer if rejected | A few hours up to about a week for new apps and accounts |
| Extra step for personal accounts | None | 12 testers for 14 days |
| Store commission | 15% under the Small Business Program (under USD 1M a year), otherwise 30% | 15% on the first USD 1M a year, then 30% (15% on subscriptions) |

---

## 7. Getting Production Ready

I'd start this two to three weeks before the planned launch. It always takes longer than expected, mostly because of waiting on the client for content and on the stores for review.

### 7.1 Backend and services

- Production API is deployed on HTTPS, on a domain owned by us or the client.
- Production Firebase project is set up (Section 5), and every third-party service is switched to live keys: payments, maps, SMS, email.
- `.env.production` is final and saved in the vault.
- Payment gateway is in live mode and tested with a real small transaction.
- Deep links: `/.well-known/apple-app-site-association` for iOS and `/.well-known/assetlinks.json` for Android are on the production domain. The Android file needs the Play App Signing SHA-256, not just the upload key.
- Crashlytics (or Sentry) is on, with alerts going to the shared team email or Slack.
- Remote Config has the force-update and soft-update values set for version 1.0.

### 7.2 App configuration

- Final app name, icon in all sizes, splash screen.
- Final Bundle ID / Application ID. This can't change after release.
- Versions: the version name (`1.0.0`) follows semantic versioning, and the build number (`versionCode` / `CFBundleVersion`) always goes up.
- Release settings:
  - Android: R8 / ProGuard on and tested, Hermes on, not debuggable, no cleartext HTTP, building an AAB.
  - iOS: Release configuration, dSYMs uploading to Crashlytics or Sentry, no blanket App Transport Security exceptions.
  - No `console.log` output, dev menus or test endpoints in the production build.
- Permissions: only ask for what the app actually uses. Every iOS permission needs a clear, specific explanation string. Vague ones get rejected.
- iOS privacy manifest (`PrivacyInfo.xcprivacy`) is included, and third-party SDKs are on versions that include theirs.
- Android target SDK meets the current Google Play requirement (Section 9.2).
- Account deletion: if users can sign up, they must be able to delete their account from inside the app (Apple) and through a web link (Google Play). Both are required.
- Sign in with Apple is there if the iOS app has other social logins.
- Test the actual release build, not a debug build, on a cheap Android phone and an older iPhone.

### 7.3 Signing Keys

These are the most important files in the whole project. Lose them and you may not be able to update the app.

**Android**

- Play App Signing is mandatory for new apps. Google keeps the app signing key, and we keep the upload key.
- Create the upload keystore once per app:
  ```bash
  keytool -genkeypair -v -storetype PKCS12 -keystore acme-delivery-upload.keystore \
    -alias acme-delivery-upload -keyalg RSA -keysize 2048 -validity 10000
  ```
- Back it up to the project vault immediately: the `.keystore` file, the store password, the key alias, the key password and the SHA-1 and SHA-256 fingerprints.
- `keystore.properties` stays out of Git. CI gets the keystore from secrets.
- If the upload key is lost, the account owner can ask Google for an upload key reset. It's possible because of Play App Signing, but it takes time and blocks releases until it's done. A backup avoids all of that.

**iOS**

- Automatic signing is fine for development. For CI use EAS or Fastlane match, so certificates aren't stuck on one person's Mac.
- Back up to the vault: the distribution certificate (.p12 and its password), the APNs key (.p8 and Key ID), and the App Store Connect API key (.p8, Key ID and Issuer ID).
- Distribution certificates and provisioning profiles expire after a year. Put the dates on the shared calendar (Section 10.4).

### 7.4 Store listing: what to prepare

| | App Store | Google Play |
|---|---|---|
| App name | Up to 30 characters | Up to 30 characters |
| Subtitle / short description | Subtitle, 30 characters | Short description, 80 characters |
| Full description | Up to 4000 characters | Up to 4000 characters |
| Keywords | 100 characters | Not used (taken from the description) |
| Icon | 1024×1024 PNG, no transparency | 512×512 PNG |
| Screenshots | iPhone 6.9" or 6.5" required, iPad if the app supports it | At least 2 phone screenshots (4 to 8 is better), tablet if supported |
| Feature graphic | Not needed | 1024×500, required |
| Privacy policy URL | Required | Required |
| Support | Support URL required | Support email required |
| Privacy form | App Privacy questions | Data safety form |
| Age rating | Age rating questions | IARC content rating questions |
| Reviewer login | Required if the app has login (explain any OTP bypass) | Required under App access if there's a login |
| Other | Export compliance (encryption) | Target audience, ads, and other declarations |

---

## 8. Publishing to the App Store and Google Play

### 8.1 App Store

1. Register the Bundle ID under Certificates, Identifiers & Profiles and turn on the capabilities you need (Push, Sign in with Apple, Associated Domains).
2. Create the app in App Store Connect → Apps → +, with the name, language, bundle ID and an internal SKU like `acme-delivery-ios`.
3. Build and upload. Bump the version and build number, then either archive in Xcode and upload to App Store Connect, or use `eas build -p ios --profile production` followed by `eas submit`, or Fastlane. The build has to use the Xcode version Apple currently requires (Xcode 26 / iOS 26 SDK since April 2026).
4. TestFlight: the build processes in 10 to 30 minutes. Internal testers (up to 100 team members) get it right away. External testers need a short beta review first. Do the full QA pass here.
5. Fill in the version page: screenshots, description, keywords, support URL, What's New.
6. Complete App Privacy. It has to match what the app and its SDKs actually collect.
7. App Review Information: a working demo login, contact details and notes for the reviewer (anything non-obvious, an OTP bypass, special hardware).
8. Age rating, pricing and countries, export compliance.
9. Choose how to release. For a first launch I'd choose manual release, so we pick the launch time. For updates, phased release over 7 days is safer.
10. Submit for review. It's usually done in a day or two.
11. If it's rejected, read the message in the Resolution Center, fix it and resubmit, or reply asking for clarification. If you really believe the reviewer got it wrong, you can appeal.
12. Once it's live, check the listing, tag the release in Git (`v1.0.0`) and update the Project Registry.

**Why Apple usually rejects apps:** crashes or bugs found during review, no demo login, unfinished content or placeholder text, vague permission explanations, no in-app account deletion, social login without Sign in with Apple, payment links for digital goods outside Apple's rules, and apps that are basically just a website in a wrapper.

### 8.2 Google Play

1. Create the app in Play Console: name, language, app or game, free or paid. **A free app can't be changed to paid later.**
2. Finish every task under "Set up your app": privacy policy, app access (demo login), ads, content rating, target audience, Data safety, any government, financial or health declarations, and the account deletion URL if the app has accounts.
3. Store listing: descriptions, icon, feature graphic, screenshots, category, contact details.
4. Build and upload an AAB. Bump `versionCode` (it must always go up) and `versionName`, then run `cd android && ./gradlew bundleRelease`, or `eas build -p android --profile production`, or Fastlane. Play App Signing is set up on the first upload.
5. Testing tracks, in this order:
   - Internal testing: up to 100 testers, available in minutes, no review. Used for QA.
   - Closed testing: for client UAT. On a personal account this is where the 12 testers for 14 days happens.
   - Open testing: optional public beta.
6. Check the pre-launch report (Google runs the app on real devices) and fix anything serious.
7. Production: create a release, pick the AAB, add release notes. For updates use a staged rollout, for example 10%, then 25%, 50% and 100%.
8. Send for review. New apps and new accounts can take several days, updates usually hours to two days. Use managed publishing if you want to choose the exact go-live moment after approval.
9. If it's rejected or there's a policy issue, look at Policy status and the Play Console inbox, fix it and resubmit, or appeal if it's wrong.
10. Once it's live, check the listing, tag the release and update the Project Registry.

### 8.3 Every release after that

Follow the [Release Checklist](#113-release-checklist).

---

## 9. Live Apps: Catching Apple and Google Changes Early

Apple and Google change something every year: new OS versions, new SDK minimums, new privacy rules, new policies. An app that nobody looks after will eventually get its next update rejected, become hidden from new users, or get removed. Nobody from Apple or Google is going to call us about it. The warnings come by email to whoever's email is on the account, and they come with deadlines. So most of this job is making sure those emails go somewhere that people actually read, and having a routine.

### 9.1 How a live app gets hit

| What changes | What happens to the app |
|---|---|
| Google Play raises the target API level (every year, usually by 31 August) | Updates are blocked until the app targets the new level. Apps that fall too far behind stop showing to new users on newer phones. |
| Apple raises the minimum Xcode / iOS SDK (every spring) | We can't upload a new build until it's rebuilt with the new Xcode. |
| A new iOS or Android version comes out (iOS every September, Android every year) | Crashes, broken layouts (for example Android's edge-to-edge changes), different permission behaviour. |
| A store policy changes (privacy, permissions, payments, account deletion, data safety) | A warning email with a deadline. If it isn't fixed, updates get rejected or the app is removed. |
| A third-party SDK becomes outdated or is shut down | A policy warning or a feature that just stops working (Dynamic Links is a recent example). |
| A certificate, key or membership expires | Push stops working, CI can't sign, or the Apple apps get removed if the membership lapses. |
| An external service changes (Maps pricing, social login API versions) | A feature breaks without any warning from the stores. |

### 9.2 Current requirements (check every quarter)

| Platform | Requirement as of October 2026 | Where to check |
|---|---|---|
| Google Play | New apps and updates must target Android 16 (API 36) from 31 August 2026, and this moves up every August. Apps targeting Android 15 or higher must support 16 KB memory pages, which mostly means keeping React Native and native libraries up to date. | developer.android.com/google/play/requirements/target-sdk |
| Apple | Uploads must be built with Xcode 26 / iOS 26 SDK or later (since April 2026). Privacy manifests are required for the app and for listed third-party SDKs. | developer.apple.com/news/upcoming-requirements |
| Both | Account deletion inside the app, accurate privacy labels and Data safety form, only the permissions the app needs. | Store policy pages |

### 9.3 Where the warnings show up

The single most important step: **make sure all emails from both stores go to a shared company inbox** (something like `mobile-alerts@company.com`) that more than one person reads. Not to one person's inbox.

**Google Play Console**
- The inbox (bell icon) and the account owner's email. New requirements and policy warnings show up here first.
- Policy status page (Policy and programs → Policy status): any app with a warning, and its deadline.
- Warnings on each app's dashboard, like "Your app must target API level XX by...".
- Android vitals: crash rate and ANR rate. Going over Google's limits lowers how visible the app is on the store.
- The pre-launch report on every upload.
- SDK warnings, when Play flags an SDK version as outdated or against policy.

**App Store Connect and Apple**
- Emails to the Account Holder and Admins, and notifications in the App Store Connect app.
- Apple Developer News and the "Upcoming requirements" page, where every new deadline is announced.
- App Review Guidelines updates, usually after WWDC in June.
- Resolution Center messages and Ratings & Reviews for each app.
- Xcode Organizer for crashes and hangs, and App Analytics.
- The membership renewal date.

**Our own monitoring**
- Crashlytics alerts going to the shared inbox or Slack. A spike right after a new iOS or Android release almost always means the new OS broke something.
- Store reviews. A sudden run of one-star reviews saying "crashes after update" is a strong signal.
- Dependabot and `npm audit` on every repo.
- OS betas: every June when the iOS beta comes out, and with each Android beta, install it on a test phone and go through each live app before the public release in September.

### 9.4 Monitoring routine

| How often | What | Who |
|---|---|---|
| Daily, about 5 minutes | Check the shared inbox for store emails and look at Crashlytics alerts | Mobile lead or whoever is on duty |
| Weekly | Play Console inbox and Policy status, App Store Connect messages, new reviews | Mobile lead |
| Monthly | Update the [Live Apps Health Sheet](#114-live-apps-health-sheet) for every live app: crash-free rate, ANR rate, target SDK, last release, open warnings | Mobile lead |
| Quarterly | Read Apple's upcoming requirements, Android's target API page and Play policy updates. Plan updates for affected apps. Check certificate, profile and membership expiry dates. | Mobile lead |
| June (WWDC) | Test every live app on the iOS beta and read the updated review guidelines | Mobile team |
| Before 31 August | Every live Android app updated to the new target API level | Mobile team |
| September | Check every live app on the new iOS and Android release and watch Crashlytics closely | Mobile team |
| Yearly | Upgrade React Native or the Expo SDK on each maintained app (not more than about a year behind) and renew Apple memberships | Mobile lead |

### 9.5 When something comes up

1. Add it to the Live Apps Health Sheet with its deadline.
2. Tell management, and the client if it's their app: what changed, the deadline, what happens if we ignore it, and roughly how long the fix takes.
3. Plan the fix release well before the deadline. Reviews get slow when everyone is rushing for the same deadline.
4. Once the fix is live, confirm the warning is gone from Play Console or App Store Connect and close it in the sheet.
5. If we really can't make a Google deadline, Play Console often lets you request an extension from the warning itself, usually a few months. Ask early, not on the last day.

---

## 10. Other Things the Mobile Lead Owns

### 10.1 Code quality

- TypeScript in strict mode, ESLint and Prettier, Husky running lint on commit and type-check on push.
- Every pull request is reviewed before merging. The branch rules enforce this.
- A shared component library and theme, so apps look consistent and new screens are faster to build.
- Jest for business logic, React Native Testing Library for components, and Maestro or Detox for the critical flows (login, payment, checkout).

### 10.2 CI/CD

- On every pull request: lint, type-check, tests.
- On release: build a signed AAB and IPA and upload to internal testing and TestFlight automatically, with GitHub Actions and Fastlane, or EAS Build and EAS Submit.
- Signing files live in CI secrets and in the vault, never only on someone's laptop.

### 10.3 Keeping dependencies and React Native up to date

- React Native CLI projects: use the React Native Upgrade Helper. Expo projects: upgrade one SDK version at a time.
- Keep every maintained app within one or two React Native versions of the latest. Apps that fall far behind eventually fail the store requirements (target API, Xcode, 16 KB pages) and the upgrade becomes a big project.
- Before adding a library, check it's maintained and supports the New Architecture (React Native Directory is useful for this).
- Fix critical vulnerabilities flagged by `npm audit` or Dependabot.

### 10.4 Expiry calendar

These go on a shared company calendar with reminders a month ahead.

| What | Lasts | If we miss it |
|---|---|---|
| Apple Developer Program membership | 1 year | Apps removed from the App Store, no new builds |
| iOS distribution certificate | 1 year | Can't sign new builds (live apps keep working) |
| iOS provisioning profiles | 1 year | Can't build or distribute |
| APNs .p12 push certificate (if used instead of a .p8 key) | 1 year | Push notifications stop |
| Domains (API, deep links, privacy policy) | Depends on registrar | App breaks, deep links fail, store listing invalid |
| SSL certificates (if not auto-renewing) | Varies | API calls fail |
| Paid services (Maps, SMS, Sentry and so on) | Varies | Features stop working |
| Google Play target API deadline | Every August | Updates blocked |

### 10.5 Security

- Store login tokens in the Keychain / Keystore (`react-native-keychain` or `expo-secure-store`), not AsyncStorage.
- HTTPS everywhere. For banking or fintech apps, think about SSL pinning.
- R8 obfuscation on Android, and no secrets in the app (Section 4).
- Review Firebase security rules before launch and turn on App Check.
- Root and jailbreak detection only where the business actually needs it (fintech, for example).

### 10.6 Versions and release notes

- Semantic versions (`MAJOR.MINOR.PATCH`), build numbers always go up.
- A `CHANGELOG.md` in each repo, generated from commit messages.
- Before every production release, send management and the client the release notes and the rollout plan.

### 10.7 Documentation

- A repo's README should let a new developer run the app within an hour: required Node, Java and Xcode versions, env setup, how to build each environment, how to release.
- Update the Project Registry whenever an account, key, owner or URL changes.
- For bigger technical decisions, write a short note in `docs/adr/` explaining what was decided and why.

### 10.8 Team

- Estimates should include store review time plus a buffer. At least a week for the first release.
- Keep a small set of test devices: a cheap Android, a recent Android, an older iPhone, a recent iPhone, and an iPad if any app supports tablets.
- Use the onboarding and offboarding checklists every single time someone joins or leaves.

### 10.9 Handing a project over to a client

- Transfer the repo, or give a full archive with history, as the contract says.
- If the app was published on our store accounts, transfer it to the client's (App Transfer on Apple, app transfer on Google).
- Hand over the Project Registry, keystore and passwords, `.env` files, Firebase ownership, every third-party account and the documentation. Then remove our own access if the contract says so.

---

## 11. Templates and Checklists

### 11.1 Project Registry Template

One per project. The filled-in copy goes in the company password manager because it points to secrets. A copy without any secrets can also live in the repo as `docs/PROJECT_REGISTRY.md`.

```markdown
# Project Registry: <Project Name>

## General
- Client / product owner:
- Start date:                    Go-live date:
- Mobile lead:                   Backend lead:          PM:
- Status: In development | Live | Maintenance | Archived
- Contract notes (who owns the code, support period):

## App identity
- App name (iOS / Android):
- iOS Bundle ID:                 Android Application ID:
- Staging IDs (if different):
- Current live version (iOS / Android):
- Minimum OS (iOS / Android):    Android target SDK:

## Repositories
- Mobile repo URL:
- Backend repo URL:              Admin panel repo URL:
- Visibility (must be Private):  Created by (Repo Owner):
- Default branch / release branch:

## Store accounts
- Apple: account owner (company / client), Team ID, Account Holder email:
- App Store Connect app ID:      SKU:
- App Store link:
- Google Play: account owner, owner email, developer ID:
- Play Console package name:
- Play Store link:
- Our team members with access (and role):

## Firebase / Google Cloud
- Dev project ID:        Staging project ID:        Prod project ID:
- Owners (emails):
- Billing account and budget alert:
- Services used: FCM / Crashlytics / Analytics / Remote Config / Auth / Firestore / ...

## Environments
| Env | API base URL | Firebase project | Vault item for .env |
|-----|--------------|------------------|----------------------|
| development | | | |
| staging | | | |
| production | | | |

## Signing and keys (write the vault item names here, never the values)
- Android upload keystore: vault item ____ (alias, passwords, SHA-1 / SHA-256)
- Play App Signing SHA-1 / SHA-256:
- iOS distribution certificate (.p12): vault item ____, expires ____
- Provisioning profiles: expire ____
- APNs key (.p8): Key ID ____, vault item ____
- App Store Connect API key: Key ID ____, Issuer ID ____, vault item ____
- Google Play service account JSON: vault item ____

## Third-party services
| Service | Used for | Account owner email | Plan / billing | Vault item | Renewal date |
|---------|----------|---------------------|----------------|------------|--------------|
| Google Maps | | | | | |
| Sentry | | | | | |
| Payment gateway | | | | | |
| SMS / OTP | | | | | |

## Domains and URLs
- API domain:            Deep link domain:
- Privacy policy URL:    Terms URL:     Support URL / email:
- Domain registrar and renewal date:

## Store review
- Demo login for reviewers (vault item):
- Notes for reviewers:

## Release history
| Version | Build | Platform | Release date | Notes |
|---------|-------|----------|--------------|-------|

## Open warnings and deadlines
| Date found | Source (Play / Apple / Crashlytics) | Issue | Deadline | Status |
|------------|--------------------------------------|-------|----------|--------|
```

### 11.2 New Project Checklist

```markdown
- [ ] Decided whose store accounts the app goes on (ours or the client's)
- [ ] Bundle ID / Application ID decided and written in the registry
- [ ] Repo requested from the Repo Owner and created as private under the company org
- [ ] Teams added and branch rules turned on
- [ ] README, .env.example, CODEOWNERS, PR template and CI workflow committed
- [ ] development, staging and production environments set up
- [ ] .env files saved in the password manager vault
- [ ] Firebase dev, staging and prod projects created on the company account with 2+ owners
- [ ] APNs .p8 key created and backed up
- [ ] Android upload keystore created and backed up (file and passwords)
- [ ] App IDs registered on Apple Developer and Play Console
- [ ] TestFlight, Play internal testing or App Distribution set up
- [ ] Crashlytics on, with alerts going to the shared inbox
- [ ] Remote Config force-update keys added
- [ ] Project Registry created and repo added to the Repository Inventory
```

### 11.3 Release Checklist

```markdown
Before release
- [ ] Release branch created from develop, version and build numbers bumped
- [ ] Production .env and production Firebase config in use
- [ ] No console logs, dev menus or test endpoints in the release build
- [ ] Release build tested on real devices (cheap Android, older iPhone)
- [ ] Signup and login, payments, push, deep links and account deletion all tested
- [ ] Crashlytics receiving events from the release build
- [ ] Target SDK and Xcode version meet the current store requirements
- [ ] Privacy labels and Data safety updated if new data or SDKs were added
- [ ] Store screenshots and What's New updated
- [ ] Reviewer demo login works

Release
- [ ] Uploaded to TestFlight and Play internal testing, QA signed off
- [ ] Client or management signed off
- [ ] Submitted for review (iOS manual or phased release, Android staged rollout)

After release
- [ ] Release merged to main, tagged vX.Y.Z, merged back into develop
- [ ] Crashlytics and reviews watched for 2 to 3 days before widening the rollout
- [ ] Remote Config latest version updated (and minimum version if forcing an update)
- [ ] Release history in the Project Registry updated
```

### 11.4 Live Apps Health Sheet

A shared spreadsheet with one row per app per platform, updated every month.

| App | Platform | Account owner | Live version | Last release | Target SDK / Xcode | Crash-free users | ANR rate (Android) | Open warnings and deadline | RN / Expo version | Next step | Owner |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Acme Delivery | Android | Client | 2.3.1 | 2026-08-10 | API 36 | 99.6% | 0.2% | None | 0.8x | None | |

What healthy looks like: crash-free users at 99.5% or more. On Android, a user-perceived crash rate under 1.09% and an ANR rate under 0.47%. Those are the levels where Google starts treating the app as badly behaved.

### 11.5 Offboarding Checklist

**This is mandatory.** When any developer, QA, designer or contractor leaves, it's done on their last working day. Write down the date and who did each step.

| # | Where | What to do |
|---|---|---|
| 1 | GitHub | Remove them from the organization, not just from repos. Check outside collaborators on every repo. Revoke deploy keys and tokens they created. If they have company work on a personal account, move it to the org. |
| 2 | GitLab | Remove them from the top-level group. Block their company GitLab user if they had one. |
| 3 | App Store Connect / Apple Developer | Remove them from Users and Access. If they had access to certificates, consider revoking and reissuing certificates and the API key they used. |
| 4 | Google Play Console | Remove them from Users and permissions. |
| 5 | Firebase / Google Cloud | Remove them from every project. Rotate any service account keys they downloaded. |
| 6 | Expo / EAS | Remove them from the Expo organization. |
| 7 | CI/CD | Rotate any tokens or secrets they had access to. |
| 8 | Password manager | Remove them from every vault and change the passwords of shared accounts they knew. |
| 9 | Other dashboards | Sentry, payment gateways, Maps, SMS, analytics, App Distribution and so on. |
| 10 | Communication | Slack or Teams, email, Jira / Trello / ClickUp, Google Drive shares. |
| 11 | Devices | Collect test devices, and remove their devices from the Apple device list if needed. |
| 12 | Knowledge | Get a handover from them, add anything only they knew to the Project Registries, and reassign their open pull requests and tickets. |

Sign-off: ______________________ (Repo Owner) Date: __________

### 11.6 Onboarding Checklist

```markdown
- [ ] Company email created, two-factor turned on
- [ ] Added to the right GitHub team (and GitLab group for older projects)
- [ ] Added to the store accounts they need, with the lowest role that works
- [ ] Added to the Firebase projects they need (Editor or Viewer)
- [ ] Given access to the right password manager vaults
- [ ] Walked through this playbook and the Project Registries for their projects
- [ ] Can run each assigned app locally within their first day or two
```

### 11.7 Repository Inventory

Kept by the Repo Owner, as a shared sheet. One row per repo. Reviewed every month during the access review.

| Repo | Platform (GitHub / GitLab) | Client / project | Visibility | Teams with access | Outside collaborators (until) | Created by | Created on | Status | Last access review |
|---|---|---|---|---|---|---|---|---|---|
| acme-delivery-mobile | GitHub | Acme Delivery | Private | mobile-leads, mobile-devs | None | Repo Owner | 2026-03-02 | Active | 2026-10-01 |

Any repo showing anything other than Private gets fixed or explained to management the same day.

---

## 12. Official Links

**Apple**
- Developer Program enrollment: https://developer.apple.com/programs/enroll/
- D-U-N-S lookup: https://developer.apple.com/enroll/duns-lookup/
- Upcoming requirements: https://developer.apple.com/news/upcoming-requirements/
- App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- App Store Connect help: https://developer.apple.com/help/app-store-connect/
- Privacy manifest files: https://developer.apple.com/documentation/bundleresources/privacy-manifest-files
- Account deletion requirement: https://developer.apple.com/support/offering-account-deletion-in-your-app/

**Google**
- Play Console sign-up: https://play.google.com/console/signup
- Play Console help: https://support.google.com/googleplay/android-developer/
- Target API level requirements: https://developer.android.com/google/play/requirements/target-sdk
- Testing requirement for new personal accounts: https://support.google.com/googleplay/android-developer/answer/14151465
- Play App Signing: https://support.google.com/googleplay/android-developer/answer/9842756
- Developer Program Policy: https://play.google/developer-content-policy/
- Android vitals: https://developer.android.com/topic/performance/vitals

**Firebase and React Native**
- Firebase console: https://console.firebase.google.com/
- React Native Firebase: https://rnfirebase.io/
- React Native docs: https://reactnative.dev/
- Upgrade Helper: https://react-native-community.github.io/upgrade-helper/
- Expo and EAS docs: https://docs.expo.dev/
- React Native Directory: https://reactnative.directory/

**GitHub and GitLab**
- GitHub rulesets: https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets
- Restricting repository creation in an organization: https://docs.github.com/organizations/managing-organization-settings/restricting-repository-creation-in-your-organization
- Removing a member from an organization: https://docs.github.com/organizations/managing-membership-in-your-organization/removing-a-member-from-your-organization
- GitLab protected branches: https://docs.gitlab.com/user/project/repository/branches/protected/

---

Whoever takes over mobile now owns this document. Please go through it at least every six months, and whenever Apple or Google announce something new.
