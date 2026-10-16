# Mobile App Development Playbook (React Native)

**Knowledge Transfer document: project setup, repositories, store accounts, Firebase, environments, releases and post-launch monitoring**

| | |
|---|---|
| **Prepared by** | Saad Bawany, React Native Lead |
| **Prepared for** | Management and the incoming Mobile Lead / Mobile Team |
| **Date** | 15 October 2026 |
| **Status** | v1.0 (handover) |

> **How to use this document**
> Sections 1–9 are the processes, in the order a project goes through them. Section 10 lists the remaining recurring responsibilities. Section 11 is a set of copy-paste templates and checklists.
> Store policies change every year. Wherever a date or a number is mentioned (fees, API levels, Xcode versions), verify it against the official link before acting.

---

## Table of Contents

1. [Golden Rules (read this first)](#1-golden-rules-read-this-first)
2. [New Project Setup: Kick-off Checklist](#2-new-project-setup-kick-off-checklist)
3. [Repository Setup (GitHub & GitLab)](#3-repository-setup-github--gitlab)
4. [Environment Variables (.env): what goes in, what never does, and backups](#4-environment-variables-env-what-goes-in-what-never-does-and-backups)
5. [Firebase Setup for Mobile Apps](#5-firebase-setup-for-mobile-apps)
6. [Store Developer Accounts: Apple & Google](#6-store-developer-accounts-apple--google)
7. [Production Environment Setup (before go-live)](#7-production-environment-setup-before-go-live)
8. [Publishing to the App Store & Google Play](#8-publishing-to-the-app-store--google-play)
9. [Live Apps: Detecting Google/Apple Policy & Platform Changes](#9-live-apps-detecting-googleapple-policy--platform-changes)
10. [Other Key Responsibilities of the Mobile Lead](#10-other-key-responsibilities-of-the-mobile-lead)
11. [Templates & Checklists](#11-templates--checklists)
12. [Official Reference Links](#12-official-reference-links)

---

## 1. Golden Rules (read this first)

These rules exist because breaking any one of them has, at some point in the industry, cost a company an app, a client or weeks of recovery work.

1. **The company owns everything.** Every repository, store account, Firebase project, domain, email and third-party service is created from a **company-owned account** (company email on the company domain), never a personal one.
2. **No single person is a single point of failure.** Every critical account has at least **two company admins**, and its credentials live in the company password manager.
3. **Access is role-based and removed on the day someone leaves.** See the [Offboarding Checklist](#115-offboarding-checklist-same-day).
4. **Signing keys are irreplaceable.** The Android keystore and iOS signing assets are backed up in two places the day they are created. Losing them means you may not be able to update the app.
5. **Secrets never go into Git, and never into the mobile app.** A mobile app bundle can be decompiled; anything shipped inside it is public.
6. **Every project has one Project Registry file** (template in [11.1](#111-project-registry-template)) holding all key information about that project. If it isn't in the registry, it doesn't exist.
7. **Production is never released from a developer's laptop without a tag.** Every store build maps to a Git tag and a version number.

---

## 2. New Project Setup: Kick-off Checklist

Run this checklist on **day 1** of every new mobile project.

### 2.1 Business & ownership decisions (before any code)

| # | Question | Why it matters |
|---|----------|----------------|
| 1 | **Whose store account will the app be published under: the company's or the client's?** | Decides who owns the app listing, reviews, revenue and user data. If it's the client's, they must invite our company account with the right role. Recommended for client work: **client's own organization account**, our company added as Admin/Developer. |
| 2 | Who owns the source code, and where is it hosted after delivery? | Contract/IP clarity. Repo transfer may be required at handover. |
| 3 | Who pays for third-party services (Firebase Blaze, Maps, SMS, Sentry, etc.)? | Billing must be on the owner's card/account, not an employee's. |
| 4 | Target platforms & minimum OS versions | Affects library choices and testing matrix. |
| 5 | Final **App name**, **Bundle ID / Application ID** | Bundle ID (`com.company.appname`) **cannot be changed** after the first store release. Decide once. |
| 6 | Privacy policy URL, Terms URL, Support email/URL | Mandatory on both stores. Ask the client early. |
| 7 | Are there in-app purchases / subscriptions? | Requires paid-app agreements, tax & banking setup on both stores (takes days). |
| 8 | Login methods (Google, Apple, Facebook, Phone OTP) | If any third-party/social login is used on iOS, **Sign in with Apple** is generally required as well. |

### 2.2 Technical kick-off

- [ ] Create the repository from the **company organization** (Section 3).
- [ ] Choose the stack: **React Native CLI** or **Expo (with EAS)**. Recommended default for new projects: **Expo + EAS Build/Submit/Update**, unless there is a strong native requirement. Both support the New Architecture (default since RN 0.76).
- [ ] Use **TypeScript**, ESLint, Prettier, Husky + lint-staged from the first commit.
- [ ] Set up **three environments**: `development`, `staging`, `production` (Section 4).
- [ ] Create **separate Firebase projects** per environment (Section 5).
- [ ] Register the Bundle ID / Application ID on Apple Developer and Play Console early (reserves the name, unlocks push/capabilities).
- [ ] Generate the **Android upload keystore** and back it up immediately ([7.3](#73-signing-keys-the-most-critical-assets)).
- [ ] Set up CI (GitHub Actions / GitLab CI) for lint + type-check + tests on every PR.
- [ ] Set up internal distribution: **TestFlight** (iOS) and **Play Internal Testing** or **Firebase App Distribution** (Android).
- [ ] Create the **Project Registry** file and fill in everything known so far ([11.1](#111-project-registry-template)).
- [ ] Add the project to the company's master project index (one line per project, linking to its registry).

### 2.3 Recommended folder structure (React Native)

```
src/
  api/            # API clients, interceptors
  assets/         # images, fonts, lottie
  components/     # reusable UI components
  config/         # env access, constants, feature flags
  hooks/
  navigation/
  screens/        # one folder per feature/screen
  services/       # firebase, analytics, push, storage
  store/          # state management (Redux Toolkit / Zustand / React Query)
  theme/          # colors, typography, spacing
  utils/
  i18n/
```

---

## 3. Repository Setup (GitHub & GitLab)

**Current company policy:** legacy projects live on **GitLab**; **all new projects are created on GitHub.**

### 3.1 Non-negotiable rules

1. **Always create the repo inside the company GitHub Organization** (or company GitLab Group), **never** under a personal account and then "transferred later".
2. Visibility: **Private** by default. Public only with management approval.
3. Access is given through **Teams/Groups**, not to individuals one by one. This makes offboarding a one-click action.
4. **When anyone leaves the company, they are removed from the Organization/Group on their last working day** (not just from the repo). Removing someone from the org removes their access to every repo at once.
5. Freelancers/contractors are added as **Outside Collaborators** on specific repos only, with an end date recorded in the registry.
6. **2FA is mandatory** for all organization members (enforce it in org settings).

### 3.2 GitHub: step-by-step repository creation

**One-time organization setup (done once by an Org Owner):**

1. Organization **Settings → Authentication security → Require two-factor authentication** for everyone.
2. **Settings → Member privileges**:
   - Base permissions: **No permission** (access only through teams).
   - Repository creation: restrict to **Owners/Admins only**. This prevents random repos.
   - Disable repository forking for private repos.
   - Disable "Allow members to delete or transfer repositories".
3. Create **Teams**, e.g. `mobile-leads` (Maintain/Admin), `mobile-devs` (Write), `qa` (Triage/Read), `clients-readonly` (Read).
4. **Code security**: enable **Secret scanning + Push protection**, **Dependabot alerts** and **Dependabot security updates** for all new repos by default.
5. At least **two Org Owners**, both company management, not just one developer.

**Creating a new repo (every project):**

1. Go to the **company organization** → **New repository**. Double-check the *Owner* dropdown shows the **organization**, not your username.
2. **Name**, using the naming convention:
   `<client-or-product>-<app>-<platform>` → e.g. `acme-delivery-mobile`, `acme-delivery-backend`, `acme-delivery-admin`
   (lowercase, hyphen-separated, no spaces).
3. **Description**: one line, e.g. *"Acme Delivery: React Native customer app (iOS/Android)."*
4. **Visibility: Private.**
5. Initialize with **README**, **.gitignore** (Node template, then add the React Native entries below), **no license** for client/proprietary work.
6. **Settings → Collaborators and teams**: add `mobile-leads` (Admin/Maintain) and `mobile-devs` (Write). No individual additions except outside collaborators.
7. **Settings → General**:
   - Default branch: `main`.
   - Enable **"Automatically delete head branches"** after merge.
   - Allow **Squash merging** (recommended), disable merge commits if you want linear history.
8. **Settings → Rules → Rulesets** (or Branch protection) for `main` and `develop`:
   - Require a pull request before merging, **minimum 1 approval** (2 for `main` on large teams).
   - Dismiss stale approvals when new commits are pushed.
   - Require status checks to pass (lint, type-check, tests).
   - Require conversation resolution.
   - **Block force pushes** and **block deletion**.
   - Restrict who can push directly: nobody. Everything via PR.
9. Add these files in the first commit:
   - `README.md`: project overview, setup steps, how to run, env setup, release steps.
   - `.env.example`: all keys with dummy values (see Section 4).
   - `.github/CODEOWNERS`, e.g. `* @company/mobile-leads`, so the leads are auto-requested as reviewers.
   - `.github/pull_request_template.md`: what changed, screenshots, test steps, checklist.
   - `.github/workflows/ci.yml`: lint, type-check, test.
   - `.nvmrc` / `.node-version`: pin the Node version.
   - `docs/PROJECT_REGISTRY.md` **or** a link to the registry in the password manager (never put secrets in the repo; the registry in the repo contains **references only**).
10. Record the repo URL in the **Project Registry**.

**Recommended `.gitignore` additions for React Native:**

```gitignore
# Environment & secrets
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
android/app/google-services.json        # if you choose not to commit it (see 5.4)
ios/GoogleService-Info.plist            # same as above

# Build outputs
android/app/build/
ios/build/
ios/Pods/
*.ipa
*.apk
*.aab
```

### 3.3 Branching & release strategy

| Branch | Purpose | Deploys to |
|--------|---------|-----------|
| `main` | Always equals what is live in the stores | Production (store builds) |
| `develop` | Integration branch for the next release | Staging / internal testing |
| `feature/<ticket>-<short-name>` | New work | — |
| `release/x.y.z` | Stabilization before a store release | TestFlight / Play closed testing |
| `hotfix/x.y.z` | Urgent production fix from `main` | Production |

- Every production release is **tagged**: `v1.4.0` (and optionally `v1.4.0+42` with the build number).
- Commit messages: **Conventional Commits** (`feat:`, `fix:`, `chore:`…) to make changelogs automatic.

### 3.4 GitLab (legacy projects)

The same principles apply:

- Repos live under the **company Group** (use sub-groups per client, e.g. `company/acme/...`).
- Give access at **Group level** with roles: *Maintainer* (leads), *Developer* (devs), *Reporter* (QA/clients).
- **Settings → Repository → Protected branches**: `main` and `develop` → *Allowed to push: No one*, *Allowed to merge: Maintainers*.
- **Settings → Merge requests**: require approvals, pipelines must succeed.
- CI/CD variables (`Settings → CI/CD → Variables`): mark secrets as **Masked** and **Protected**.
- **Offboarding:** remove the user from the **top-level group** (this removes access to all sub-groups/projects) and, if they had a company GitLab account, **block** it.
- Plan: migrate actively maintained legacy projects to GitHub when convenient (GitHub has a built-in importer that keeps history, branches and tags). Archive the GitLab project afterwards (read-only) instead of deleting it.

---

## 4. Environment Variables (.env): what goes in, what never does, and backups

### 4.1 The most important fact

> **Everything inside a mobile app is public.** `.env` values in React Native are compiled into the JavaScript bundle / native code. Anyone can extract them from the APK/IPA in minutes.
> Therefore `.env` in a mobile app is for **configuration**, not for **secrets**.

### 4.2 What SHOULD go in the app's `.env`

| Put in `.env` | Example |
|---------------|---------|
| Environment name | `APP_ENV=production` |
| API base URLs | `API_BASE_URL=https://api.example.com/v1` |
| Web/socket URLs | `SOCKET_URL=wss://...` |
| **Public/publishable** client keys | Stripe *publishable* key, Google Maps key (restricted by package name/bundle ID + SHA-1), Sentry DSN, OneSignal App ID, RevenueCat public key, Mixpanel token |
| OAuth **client IDs** (not secrets) | Google Sign-In web/iOS client ID |
| Feature flags / toggles | `ENABLE_ANALYTICS=true` |
| App-level constants that differ per environment | `DEEP_LINK_SCHEME=myapp-staging` |

### 4.3 What must NEVER go in the app (or in Git)

| Never in the app / never committed | Where it belongs instead |
|-----------------------------------|--------------------------|
| Any **secret** key: Stripe secret key, payment gateway secrets, AWS secret keys, Twilio auth token, SendGrid key, OpenAI/LLM API keys | **Backend only.** The app calls our backend; the backend calls the third party. |
| Database credentials, admin passwords | Backend / password manager |
| Firebase **service account** JSON (Admin SDK) | Backend / CI secrets only |
| Android keystore & passwords, iOS `.p12`, `.p8` keys | Password manager + CI secrets ([7.3](#73-signing-keys-the-most-critical-assets)) |
| App Store Connect API key, Google Play service account JSON (used by Fastlane/EAS) | CI secrets + password manager |
| Personal tokens of any developer | Nowhere. Use company/bot tokens. |

> **Rule of thumb:** if a value would allow someone to **spend money, read other users' data, or impersonate the company**, it must not be in the app.

### 4.4 Recommended setup

- **React Native CLI:** `react-native-config` with `.env.development`, `.env.staging`, `.env.production`, selected per build scheme/flavor.
- **Expo:** variables prefixed with `EXPO_PUBLIC_` are bundled into the app; store per-environment values in **EAS Environment Variables** (development / preview / production), using "secret" visibility for build-time-only values.
- Commit **only** `.env.example` (all keys, dummy values, a comment explaining each one).
- Access env values through a single `src/config/env.ts` file that validates them at startup (e.g. with `zod`). The app should fail loudly in dev if a key is missing.
- Restrict every public key at the provider side (Google Cloud API key restrictions by package name + SHA-1 / bundle ID; Firebase App Check).

### 4.5 Backing up `.env` files: yes, always

`.env` files are not in Git, so **if they are only on a developer's laptop they will be lost** when that person leaves or the laptop dies.

**Backup policy:**

1. Every project has a vault/folder in the **company password manager** (e.g. 1Password, Bitwarden, or similar business plan) named after the project.
2. Each environment's `.env` is stored there as a **Secure Note** or attached document: `acme-delivery / .env.production`, `.env.staging`, `.env.development`.
3. Whenever a value changes, the person changing it **updates the vault in the same PR/day**. Add this to the PR template checklist.
4. CI/CD secrets (GitHub Actions secrets / GitLab CI variables / EAS env) are a **copy** for automation, **not** the backup, because they can't be read back once saved.
5. Access to the vault is through groups (Mobile Leads, Management), never shared via WhatsApp/Slack/email.
6. If a password manager is not yet in place: at minimum, store an **encrypted** archive (e.g. password-protected 7z / age / GPG) on the company Google Drive in a management-owned folder, with the password held by management. **Getting a proper password manager is strongly recommended.**

---

## 5. Firebase Setup for Mobile Apps

### 5.1 Why Firebase is an essential part of almost every app

| Firebase service | What it gives us | Why it matters |
|------------------|------------------|----------------|
| **Cloud Messaging (FCM)** | Push notifications on Android **and** iOS (via APNs) | Almost every app needs push. |
| **Crashlytics** | Real-time crash & ANR reports with stack traces, affected users, OS/device | The #1 tool to know if a live app is broken, especially after a new iOS/Android OS release. |
| **Analytics** | Users, sessions, retention, events, funnels | Business reporting; also powers Remote Config targeting. |
| **Remote Config** | Change app behaviour without a store release | **Force/soft update** prompts, feature flags, kill switches, maintenance mode. |
| **App Distribution** | Send test builds to QA/clients | Fast internal testing (alternative to TestFlight/Play testing tracks). |
| **Performance Monitoring** | App start time, network latency, slow screens | Detect performance regressions. |
| **App Check** | Ensures requests come from our genuine app | Protects Firebase/backend from abuse. |
| Auth / Firestore / Storage (optional) | Backend-as-a-service | Used when the project doesn't have its own backend. |

> **Note:** Firebase Dynamic Links has been **shut down (August 2025)**. Do not use it in new projects. Use native **Universal Links (iOS) / App Links (Android)** or a third-party deep-link service instead.
>
> **Note:** Microsoft App Center (incl. CodePush) was retired in **March 2025**. For over-the-air JS updates use **Expo EAS Update** or a self-hosted alternative.

### 5.2 Ownership & access

- Create Firebase projects while logged in with the **company Google account** (e.g. `mobile@company.com` or the client's account if the client owns the app).
- In **Project settings → Users and permissions** (IAM), ensure at least **two company Owners**. Developers get **Editor** or narrower roles.
- Link billing (**Blaze plan**) to the **company/client billing account**, and set a **budget alert** in Google Cloud Billing.

### 5.3 Step-by-step setup

1. **Create one Firebase project per environment:**
   `acme-delivery-dev`, `acme-delivery-staging`, `acme-delivery-prod`.
   (Mixing test and production data in one project pollutes analytics and risks sending test pushes to real users.)
2. In each project, **add an Android app** with the environment's application ID (e.g. `com.acme.delivery.staging` / `com.acme.delivery`).
   - Add the **SHA-1 and SHA-256** fingerprints of: the debug keystore, the upload keystore, **and the Play App Signing key** (from *Play Console → Test and release → App integrity*). Missing the Play signing SHA is the most common cause of "Google Sign-In works in testing but fails in production".
   - Download `google-services.json`.
3. **Add an iOS app** with the matching bundle ID. Download `GoogleService-Info.plist`.
4. Install **React Native Firebase** (`@react-native-firebase/app` + needed modules) or configure via the Expo config plugin.
5. Place config files per environment (Android product flavors: `android/app/src/<flavor>/google-services.json`; iOS: one plist per scheme copied by a build phase script, or via Expo's `app.config.js` per profile).
6. **Push notifications on iOS:**
   - In Apple Developer → *Keys* → create an **APNs Auth Key (.p8)**. One key works for all apps in the team and **does not expire** (preferred over yearly `.p12` certificates).
   - Note the **Key ID** and **Team ID**, upload the `.p8` to *Firebase → Project settings → Cloud Messaging → Apple app configuration*.
   - **Back up the .p8 immediately**: Apple lets you download it **only once**.
   - Enable *Push Notifications* and *Background Modes → Remote notifications* capabilities in Xcode.
   - Android 13+: request the `POST_NOTIFICATIONS` runtime permission.
7. **Crashlytics:** enable, add the Gradle plugin and the iOS dSYM upload build phase (otherwise iOS crashes appear unsymbolicated). Force a test crash in staging to verify.
8. **Remote Config:** add at minimum these parameters on every project:
   - `min_supported_version_android`, `min_supported_version_ios` → **force update** below this version.
   - `latest_version_android`, `latest_version_ios` → **soft update** prompt.
   - `maintenance_mode` (boolean) + `maintenance_message`.
9. **Crashlytics alerts:** in *Project settings → Integrations / Alerts*, enable email alerts (new fatal issue, regressed issue, **velocity alert**) to a shared mobile team mailbox, not a personal email.
10. **App Check:** enable with Play Integrity (Android) and App Attest/DeviceCheck (iOS) for production.
11. Record all project IDs, console links and owners in the **Project Registry**.

### 5.4 Should `google-services.json` / `GoogleService-Info.plist` be committed?

These files contain **identifiers, not secrets** (Firebase security is enforced by Security Rules and App Check, not by hiding these files). Committing them in a **private** repo is acceptable and simplifies builds. If the repo is ever public, or company policy prefers it, keep them out of Git and inject them from CI secrets. **Either way, back them up in the project vault.** In addition:

- Restrict the API key inside them in Google Cloud Console (Android apps by package + SHA-1, iOS apps by bundle ID).
- Write proper **Firestore/Storage Security Rules**. Never ship with test-mode rules (`allow read, write: if true`).

---

## 6. Store Developer Accounts: Apple & Google

### 6.1 Account types compared

#### Apple Developer Program

| | **Individual** | **Organization** | Enterprise Program |
|---|---|---|---|
| Fee | USD 99 / year | USD 99 / year | USD 299 / year |
| Seller name on App Store | **Person's legal name** | **Company legal name** | — (no App Store) |
| Requirements | Apple Account with 2FA, government ID | Legal entity, **D-U-N-S Number**, company website, company-domain email, signer with legal authority | Larger organizations, strict eligibility |
| Team members | Only the individual has developer program membership; can add App Store Connect users, but cannot manage a full developer team | **Full team** with roles (Admin, App Manager, Developer, Marketing, Finance…) | Team |
| Who it's for | Freelancers, personal projects | **Companies, client apps (recommended)** | **Internal employee apps only**. Cannot publish to the public App Store. |
| Limitation | App appears under a person's name; if that person leaves, the account leaves with them | Takes longer to set up (D-U-N-S + verification) | Not for public distribution |

#### Google Play Console

| | **Personal** | **Organization** |
|---|---|---|
| Fee | USD 25, one-time | USD 25, one-time |
| Requirements | Google account, legal name, address, ID verification, phone & email verification | Organization details, **D-U-N-S Number**, organization website, verified contact phone & email, ID verification of the account owner |
| Public developer info | Personal name (and address/contact for monetizing apps) shown publicly | Company name & contact details shown |
| **New-app testing requirement** | **Yes.** Personal accounts created after Nov 2023 must run a **closed test with at least 12 testers opted-in for 14 consecutive days** before they can apply for production access. | **No.** Organization accounts can publish to production directly. |
| Some app categories (e.g. finance, health, government, VPN) | May be restricted / require an organization account | Allowed (subject to policy) |
| Who it's for | Hobbyists, individual developers | **Companies, client apps (recommended)** |

> **Recommendation:** For the company and for every client, use **Organization** accounts on **both** stores. Individual/personal accounts tie the app to one person's identity and add the 14-day testing hurdle on Google Play.
>
> Apps **can be transferred** between accounts later on both stores (Apple: *App Transfer* in App Store Connect; Google: *App transfer request* in Play Console), but it is a slow manual process. Get it right from day one.
>
> Google has also announced **Android developer identity verification** for apps installed on certified Android devices (rolling out from late 2026). Play Console accounts that are already verified are largely covered, but keep the account's legal details accurate and watch the Play Console inbox.

### 6.2 Prerequisite for both: D-U-N-S Number

- A free, 9-digit identifier issued by **Dun & Bradstreet**, used by Apple and Google to verify the company is a real legal entity.
- Check/request it via Apple's **D-U-N-S lookup tool** (developer.apple.com/enroll/duns-lookup). It can take **up to ~5 business days** (sometimes longer) to be issued, and Apple may need a further 1–2 days to receive it.
- The **legal name and address must exactly match** the company's registration documents and what you enter in Apple/Google forms. Mismatches are the #1 cause of rejection.

### 6.3 Step-by-step: Apple Developer (Organization) account

1. **Create a company-owned Apple Account** using a shared, company-domain email, e.g. `appledev@company.com` (not a personal Gmail). Enable **two-factor authentication** with a **company phone number** that management controls.
2. Confirm the company has a **D-U-N-S Number** (6.2).
3. Make sure the company has a **public website on the same domain** as the email.
4. Enroll at **developer.apple.com/programs/enroll**, preferably through the **Apple Developer app** (iPhone/iPad/Mac), which is the fastest route and supports in-app payment.
5. Choose **"Company / Organization"**, enter the legal entity name, D-U-N-S, website, and the enrolling person's details. That person must have **legal authority to bind the company** (Apple may call to verify).
6. Pay **USD 99**. Apple verifies (from a couple of days up to ~2 weeks).
7. After approval, in **App Store Connect → Business (Agreements, Tax & Banking)**: accept the **Free Apps agreement**, and if the app sells anything, complete the **Paid Apps agreement**, tax forms (e.g. W-8BEN-E for non-US companies) and bank account.
8. **Users and Access**: invite team members with least-privilege roles:
   - **Account Holder**: the company account above, controlled by management. Only one per account; it's the only role that can accept agreements and renew membership.
   - **Admin**: Mobile Lead (+ one more management person).
   - **App Manager / Developer**: developers. Use "Access to Certificates, Identifiers & Profiles" only where needed.
   - **Marketing / Customer Support / Finance**: as needed.
9. Create an **App Store Connect API Key** (Users and Access → Integrations) for CI/Fastlane/EAS. Store it in the vault.
10. Turn on **auto-renew**. **If membership lapses, apps are removed from the App Store.**
11. Fill in the account details in the **Project/Company Registry**.

**Client-owned Apple account:** the client enrolls (steps above) and invites our company email as **Admin** or **App Manager**. We never ask for the client's Apple password.

### 6.4 Step-by-step: Google Play Console (Organization) account

1. **Create or use a company-owned Google account**, e.g. `playconsole@company.com` (Google Workspace account on the company domain preferred). Enable 2-step verification with a company-controlled phone.
2. Have the **D-U-N-S Number** and legal documents ready.
3. Go to **play.google.com/console/signup** → choose **"An organization or business"**.
4. Enter the organization name & address (must match D-U-N-S), organization website, a **contact email & phone** (verified by Google, shown to users), and the developer name shown on Google Play.
5. Pay the **USD 25** one-time fee.
6. Complete **identity verification** (documents for the organization and the account owner). Verification can take a few days.
7. **Users and permissions**: invite team members with specific permissions (Admin for leads; release/testing permissions for developers; finance/reporting as needed). Prefer **per-app** permissions for contractors.
8. If selling: set up a **Payments profile / merchant account** (bank, tax).
9. For CI automation (Fastlane/EAS Submit), create a **Google Cloud service account**, grant it access in Play Console → Users and permissions, and store its JSON key in the vault and CI secrets.
10. Log in at least occasionally and keep the account active: Google may **close inactive developer accounts** that haven't published or logged in for an extended period.

**Client-owned Play account:** the client creates it and invites our company Google account with Admin (or release) permissions for their apps.

### 6.5 Comparison of store fees & key timelines

| Item | Apple | Google |
|------|-------|--------|
| Account fee | USD 99 / year (renew!) | USD 25 once |
| Account approval | ~2 days – 2 weeks (Org) | ~2–7 days (verification) |
| First app review | Typically 24–48h, longer if rejected | From hours to ~7 days for new apps/accounts |
| Personal-account extra step | — | 12 testers × 14 days closed test |
| Store commission | 15% (Small Business Program, < USD 1M/year) or 30% | 15% on first USD 1M/year, then 30% (subscriptions 15%) |

---

## 7. Production Environment Setup (before go-live)

Start this **at least 2–3 weeks before** the planned launch date.

### 7.1 Backend & services

- [ ] Production API deployed, HTTPS only, with a domain owned by the company/client.
- [ ] Production **Firebase project** (5.3) and all third-party services switched to **production/live keys** (payments, maps, SMS, email, analytics).
- [ ] `.env.production` finalized, **backed up in the vault**.
- [ ] Payment gateway in **live mode** and tested with a real small transaction.
- [ ] Deep links: host `/.well-known/apple-app-site-association` (iOS Universal Links) and `/.well-known/assetlinks.json` (Android App Links, including the **Play App Signing** SHA-256) on the production domain.
- [ ] Monitoring: Crashlytics (and/or Sentry) enabled, alerts going to a shared mailbox/Slack channel.
- [ ] Remote Config: force/soft update values set for v1.0.

### 7.2 App configuration

- [ ] Final **app name, icon (all sizes), splash screen**.
- [ ] Final **Bundle ID / Application ID** (cannot change after release).
- [ ] **Version strategy:** `versionName`/`CFBundleShortVersionString` = `1.0.0` (semantic), `versionCode`/`CFBundleVersion` = integer build number that **always increases**.
- [ ] Release build settings:
  - Android: **R8/ProGuard** minification enabled (with tested keep-rules), **Hermes** on, `android:debuggable=false`, cleartext traffic disabled, **AAB** output.
  - iOS: Release scheme, dSYM upload to Crashlytics/Sentry, `NSAppTransportSecurity` without global exceptions.
  - Remove `console.log` in production (babel plugin `transform-remove-console`), no dev menus or test endpoints.
- [ ] **Permissions audit:** request only what's used. Every iOS permission has a clear, specific usage description string (vague strings are a common rejection reason).
- [ ] **iOS Privacy Manifest** (`PrivacyInfo.xcprivacy`) present and covering "required reason" APIs; third-party SDKs up to date with their own manifests.
- [ ] **Target SDK** meets the current Google Play requirement (9.2).
- [ ] **Account deletion:** if users can create an account, they must be able to **delete it from inside the app** (Apple) and via a **web link** (Google Play). Both are mandatory.
- [ ] **Sign in with Apple** implemented if other social logins exist on iOS.
- [ ] Test the **release build** (not debug) on real low-end Android and older iPhone devices.

### 7.3 Signing keys: the most critical assets

#### Android

- Use **Play App Signing** (mandatory for new apps): Google holds the **app signing key**; we hold the **upload key**.
- Generate the **upload keystore** once per app:
  ```bash
  keytool -genkeypair -v -storetype PKCS12 -keystore acme-delivery-upload.keystore \
    -alias acme-delivery-upload -keyalg RSA -keysize 2048 -validity 10000
  ```
- **Back up immediately** to the project vault: the `.keystore` file, **store password, key alias, key password**, and SHA-1/SHA-256 fingerprints.
- Keep `keystore.properties` out of Git; CI reads the keystore from secrets (base64-encoded).
- If the upload key is lost/compromised, the Account Owner can request an **upload key reset** in Play Console (possible only because Play App Signing is used, and it takes time). Without a backup, every release is blocked until then.

#### iOS

- Prefer **automatic signing** for development and **EAS / Fastlane match** for CI so certificates are shared and reproducible, not stuck on one Mac.
- Assets to back up in the vault: **Distribution certificate (.p12 + password)**, **APNs Auth Key (.p8, Key ID)**, **App Store Connect API Key (.p8, Key ID, Issuer ID)**.
- Distribution certificates & provisioning profiles **expire after 1 year**. Put renewal dates in the calendar (Section 10.4).

### 7.4 Store listing assets & information (prepare in advance)

| Item | Apple App Store | Google Play |
|------|-----------------|-------------|
| App name | max 30 chars | max 30 chars |
| Subtitle / short description | Subtitle 30 chars | Short description 80 chars |
| Description | up to 4000 chars | up to 4000 chars |
| Keywords | 100 chars | — (from description) |
| Icon | 1024×1024 PNG, no transparency | 512×512 PNG |
| Screenshots | iPhone 6.9"/6.5" required, iPad if supported | Phone min 2 (recommended 4–8); tablets if supported |
| Feature graphic | — | 1024×500 required |
| Privacy policy URL | Required | Required |
| Support URL / email | Required | Email required |
| Privacy declaration | **App Privacy "nutrition labels"** | **Data safety form** |
| Age rating | Age rating questionnaire | IARC content rating questionnaire |
| Review/demo account | **Required** if app has login (with any OTP bypass explained) | Required in *App access* if login needed |
| Other forms | Export compliance (encryption) | Target audience, ads declaration, news/government/financial declarations, etc. |

---

## 8. Publishing to the App Store & Google Play

### 8.1 Apple App Store: release process

1. **Register the Bundle ID** in *Certificates, Identifiers & Profiles → Identifiers*, enable needed capabilities (Push, Sign in with Apple, Associated Domains…).
2. **Create the app record** in *App Store Connect → Apps → +*: platform, name, primary language, bundle ID, SKU (internal, e.g. `acme-delivery-ios`).
3. **Build & upload:**
   - Bump version/build number.
   - Xcode → *Product → Archive* → *Distribute App → App Store Connect*, **or** `eas build -p ios --profile production` + `eas submit`, **or** Fastlane `gym` + `pilot`.
   - The build must use the **minimum Xcode/SDK Apple currently requires** (from April 2026: Xcode 26 / iOS 26 SDK).
4. **TestFlight:** build processes in ~10–30 min. Internal testers (up to 100 team users) get it immediately; **external testers** need a short beta review first. Do full QA on TestFlight.
5. **Fill in the version page:** screenshots, description, keywords, support/marketing URLs, promotional text, "What's New".
6. **App Privacy**: complete the privacy questionnaire (must match what the app and SDKs actually collect).
7. **App Review Information:** demo username/password, contact details, notes for the reviewer (explain non-obvious features, OTP bypass, hardware needed, etc.).
8. **Age rating**, **pricing & availability** (countries), **export compliance**.
9. Choose release option: **Manual release** (recommended, so we control launch time), automatic, or **phased release over 7 days** (recommended for updates).
10. **Submit for Review.** Typical review time: 24–48 hours.
11. **If rejected:** read the message in **Resolution Center**, fix, reply or resubmit. If the rejection is unclear, reply asking for clarification or request a call; you can appeal to the App Review Board.
12. After approval: release, verify the live listing, **tag the commit** (`v1.0.0`) and update the Project Registry.

**Most common Apple rejection reasons:** crashes/bugs found during review (Guideline 2.1), missing demo account, incomplete metadata or placeholder content, vague permission strings, no in-app account deletion, missing Sign in with Apple, external payment links for digital goods (outside allowed regions/entitlements), "minimum functionality" (app is just a website wrapper).

### 8.2 Google Play: release process

1. **Create app** in Play Console: app name, default language, app or game, free or paid (**free → paid is not possible later**), accept declarations.
2. **Set up your app** (dashboard tasks), all mandatory:
   - Privacy policy · App access (demo login) · Ads declaration · Content rating (IARC) · Target audience & content · **Data safety** · Government/financial/health declarations if applicable · News app declaration · **Account deletion URL** if accounts exist.
3. **Store listing:** short & full description, icon, feature graphic, screenshots, category, contact details.
4. **Build & upload an AAB:**
   - Bump `versionCode` (must always increase) and `versionName`.
   - `cd android && ./gradlew bundleRelease`, **or** `eas build -p android --profile production`, **or** Fastlane `gradle` + `supply`.
   - Enroll in **Play App Signing** on first upload (default).
5. **Testing tracks (in order):**
   - **Internal testing** (up to 100 testers, available within minutes, no review) → QA.
   - **Closed testing** → client UAT. **Personal accounts:** 12+ testers opted-in for 14 consecutive days before production access can be requested.
   - **Open testing** (optional public beta).
6. Check the **Pre-launch report** (automated tests on real devices: crashes, accessibility, security warnings) and fix critical issues.
7. **Production release:** create release → select the AAB → release notes → choose **staged rollout** (e.g. 10% → 25% → 50% → 100%) for updates.
8. **Send for review.** New apps/new accounts can take several days; updates are often hours to ~2 days. Use **Managed publishing** if you want to control the exact go-live moment after approval.
9. **If rejected / policy issue:** see *Policy status* and the **Inbox** in Play Console, fix and resubmit, or **appeal** if you believe it's incorrect.
10. After going live: verify the listing, **tag the commit**, update the Project Registry.

### 8.3 Every update: release checklist

See [11.3 Release Checklist](#113-release-checklist-every-store-release).

---

## 9. Live Apps: Detecting Google/Apple Policy & Platform Changes

Apple and Google change their platforms **every year**: new OS versions, new SDK requirements, new privacy rules and new policies. A live app that isn't maintained will eventually be **rejected on its next update, hidden from new users, or removed**. The job is to find out **before** users or clients do.

### 9.1 How an app gets "hit"

| Type of change | Typical effect on a live app |
|----------------|------------------------------|
| **New Google Play target API requirement** (every year, deadline usually 31 August) | Updates are **blocked** until the app targets the new API level; apps targeting too-old API levels become **unavailable to new users** on newer Android devices. |
| **New Xcode/iOS SDK minimum** (every spring) | **New builds can't be uploaded** until rebuilt with the new Xcode/SDK. |
| **New OS release** (iOS every September, Android yearly) | Crashes, UI/layout breaks (e.g. Android edge-to-edge enforcement), permission behaviour changes, deprecated APIs. |
| **New store policy** (privacy, permissions, payments, account deletion, data safety, age ratings…) | Policy warning email with a deadline → app **removed or updates rejected** if not fixed. |
| **Third-party SDK becomes non-compliant or deprecated** (Google Play SDK Index, Facebook SDK, ads SDKs, Firebase services) | Policy violation or broken functionality (e.g. Dynamic Links shutdown). |
| **Expiry of certificates/keys/memberships** | Push stops (old .p12 certs), CI can't sign, Apple membership lapse removes apps. |
| **Backend/API dependency changes** (Google Maps pricing, social login API versions) | Silent feature breakage. |

### 9.2 Current platform requirements (verify every quarter)

| Platform | Requirement (as of Oct 2026) | Where to verify |
|----------|------------------------------|-----------------|
| Google Play | New apps & updates must target **Android 16 (API 36)** from 31 Aug 2026 (+ the yearly bump each August). Apps targeting Android 15+ must support **16 KB memory page sizes** (keep RN & native libs updated). | developer.android.com/google/play/requirements/target-sdk |
| Apple | Uploads must be built with **Xcode 26 / iOS 26 SDK** or later (from April 2026). Privacy manifests required for apps and listed third-party SDKs. | developer.apple.com/news/upcoming-requirements |
| Both | In-app account deletion, accurate privacy labels / Data safety form, only necessary permissions. | Store policy pages |

### 9.3 Detection channels: who watches what

Make sure **notification emails from both stores go to a shared company mailbox** (e.g. `mobile-alerts@company.com`) that more than one person reads, **not** to a personal inbox. This is the single most important step.

**Google Play Console**
- **Inbox** (bell icon) and the account owner's **email**: policy warnings, deadlines and new requirements are announced here first.
- **Policy status** page (*Policy and programs → Policy status*): shows any app with violations/warnings and deadlines.
- **Dashboard warnings** per app: e.g. "Your app must target API level XX by …".
- **Android vitals**: crash rate & ANR rate vs. the "bad behaviour" thresholds (exceeding them reduces store visibility).
- **Pre-launch report** on every upload.
- **SDK Index / SDK console warnings**: Play shows warnings if an included SDK version is outdated or policy-violating.

**App Store Connect / Apple**
- Account Holder & Admin **emails** and the **App Store Connect app** notifications.
- **Apple Developer News & "Upcoming requirements"** page: all new SDK/Xcode/policy deadlines are published here.
- **App Review Guidelines change log** (updated after WWDC each June and occasionally during the year).
- **Resolution Center** messages and **App Store Connect → Apps → (app) → App Store / Ratings & Reviews**.
- **Xcode Organizer → Crashes / Energy / Hangs** and **App Analytics** for live-app health.
- **Developer program membership status** (renewal date).

**Our own monitoring**
- **Firebase Crashlytics** velocity & new-issue alerts (to shared mailbox/Slack). A spike right after an iOS/Android release usually means the new OS broke something.
- **Store reviews**: sudden 1-star reviews mentioning "crash after update" or a specific device/OS.
- **Dependabot / `npm audit`** on every repo, plus React Native release notes.
- **OS beta testing:** every June (WWDC, iOS beta) and with each Android beta, install the beta on a test device and smoke-test all live apps **before** the public release in September.

### 9.4 Recurring monitoring routine

| Frequency | Task | Owner |
|-----------|------|-------|
| **Daily** (5 min) | Scan shared mailbox for store emails; check Crashlytics alerts | Mobile Lead / on-duty dev |
| **Weekly** | Play Console Inbox + Policy status; App Store Connect messages; review new store ratings | Mobile Lead |
| **Monthly** | Fill the **Live Apps Health Sheet** ([11.4](#114-live-apps-health-sheet)) for every live app: crash-free %, ANR %, target SDK, last release date, pending warnings | Mobile Lead |
| **Quarterly** | Read Apple "Upcoming requirements" + Android "Target API" + Play policy updates; plan updates for affected apps; check certificate/profile/membership expiry dates | Mobile Lead |
| **June (WWDC)** | Test all live apps on iOS beta; read new App Review Guidelines | Mobile Team |
| **Before 31 Aug** | All live Android apps updated to the new target API level | Mobile Team |
| **September** | Verify all live apps on the new public iOS/Android release; watch Crashlytics closely | Mobile Team |
| **Yearly** | Upgrade React Native / Expo SDK on each maintained app (staying max ~1 year behind); renew Apple memberships | Mobile Lead |

### 9.5 When an issue is found

1. Log it in the **Live Apps Health Sheet** with the deadline.
2. Inform **management & the client** (if client-owned) with: what changed, deadline, impact if ignored, estimated effort.
3. Plan the fix release well before the deadline (store reviews can be slow near deadlines).
4. After the fix is live, confirm the warning disappears from Play Console / Apple and close the item.
5. If a deadline is impossible to meet, Google Play often lets you **request an extension** from the warning in Play Console (usually a few months). Use it early, not on the last day.

---

## 10. Other Key Responsibilities of the Mobile Lead

### 10.1 Code quality & standards
- TypeScript strict mode; ESLint + Prettier; Husky pre-commit (lint-staged) and pre-push (type-check).
- **Mandatory code review** on all PRs (rulesets enforce this).
- Shared component library / theme so apps look consistent and are faster to build.
- Unit tests for business logic (Jest), component tests (React Native Testing Library); E2E (Maestro or Detox) for critical flows (login, payment, checkout).

### 10.2 CI/CD
- PR pipeline: lint → type-check → tests.
- Release pipeline: build signed AAB/IPA and upload to internal testing / TestFlight automatically (**GitHub Actions + Fastlane**, or **EAS Build + EAS Submit**).
- All signing material lives in CI secrets **and** the vault, never on one person's machine.

### 10.3 Dependency & React Native upgrades
- Use the **React Native Upgrade Helper** for CLI projects; for Expo, upgrade one SDK at a time.
- Keep each maintained app **no more than 1–2 RN versions behind**. Old versions eventually fail new store requirements (target API, Xcode SDK, 16 KB pages).
- Prefer well-maintained libraries compatible with the **New Architecture**. Check the React Native Directory before adding a dependency.
- Run `npm audit` / Dependabot regularly; patch critical vulnerabilities.

### 10.4 Expiry & renewal calendar (shared company calendar)

| Item | Validity | Consequence if missed |
|------|----------|-----------------------|
| Apple Developer Program membership | 1 year | **Apps removed from App Store**, no new builds |
| iOS Distribution certificate | 1 year | Can't sign new builds (live apps keep working) |
| iOS provisioning profiles | 1 year | Can't build/distribute (Enterprise: installed apps stop) |
| APNs .p12 push certificate (if used instead of .p8) | 1 year | **Push notifications stop** |
| Domain names (API, deep links, privacy policy) | Per registrar | App breaks, deep links fail, store listing invalid |
| SSL certificates (if not auto-renewed) | Varies | API calls fail |
| Third-party SaaS subscriptions (Maps, SMS, Sentry, RevenueCat…) | Varies | Features break |
| Google Play target API deadline | Yearly (Aug) | Updates blocked |

### 10.5 Security
- Store auth tokens in **Keychain/Keystore** (`react-native-keychain` / `expo-secure-store`), **not** AsyncStorage.
- HTTPS everywhere; consider **SSL pinning** for banking/fintech apps.
- Obfuscation (R8) for Android; no secrets in the bundle (Section 4).
- Firebase Security Rules reviewed before launch; App Check enabled.
- Root/jailbreak detection only where business requires (fintech).

### 10.6 Versioning, release notes & communication
- Semantic versioning (`MAJOR.MINOR.PATCH`), build numbers always increase.
- Maintain a `CHANGELOG.md` per repo (auto-generated from Conventional Commits).
- Inform client/management before each production release with release notes and the planned rollout.

### 10.7 Documentation & handover
- Every repo's README must allow a **new developer to run the app within one hour**: prerequisites, Node/Java/Xcode versions, env setup, how to build each flavor/scheme, how to release.
- Keep the **Project Registry** up to date after every change in accounts, keys, owners or URLs.
- Record architecture decisions in `docs/adr/` (short Architecture Decision Records).

### 10.8 Team & process
- Estimation includes **store review time + buffer** (at least 1 week for first release).
- Device lab: maintain at least one low-end Android, one recent Android, one older iPhone, one recent iPhone (+ iPad if supported).
- Onboarding/offboarding checklists followed **every time** ([11.5](#115-offboarding-checklist-same-day)).

### 10.9 Client handover (when a project ends)
- Transfer repo (or provide a full archive with history) as per contract.
- Transfer app to the client's store accounts if it was published under ours (Apple *App Transfer*, Google *App transfer*).
- Hand over: Project Registry, keystore + passwords, `.env` files, Firebase project ownership, all third-party accounts, documentation, and remove our access afterwards if the contract says so.

---

## 11. Templates & Checklists

### 11.1 Project Registry template

> One per project. Keep the **filled copy in the company password manager** (it references secrets). A copy **without secrets** may live in the repo at `docs/PROJECT_REGISTRY.md`.

```markdown
# Project Registry: <Project Name>

## General
- Client / Product owner:
- Project start date:            Go-live date:
- Mobile Lead:                   Backend Lead:          PM:
- Status: In development | Live | Maintenance | Archived
- Contract notes (code ownership, support period):

## Identity
- App name (iOS / Android):
- iOS Bundle ID:                 Android Application ID:
- Staging IDs (if different):
- Current live version (iOS / Android):
- Min OS supported (iOS / Android):     Target SDK (Android):

## Repositories
- Mobile repo URL (GitHub/GitLab):
- Backend repo URL:              Admin panel repo URL:
- Default branch / release branch:

## Store Accounts
- Apple: account owner (company / client), Team ID, Account Holder email:
- App Store Connect app ID / Apple ID:  SKU:
- App Store listing URL:
- Google Play: developer account owner, Account owner email, Developer ID:
- Play Console app link / package:
- Play Store listing URL:
- Who from our team has access (role):

## Firebase / Google Cloud
- Dev project ID:        Staging project ID:        Prod project ID:
- Owners (emails):
- Billing account & budget alert:
- Services used: FCM / Crashlytics / Analytics / Remote Config / Auth / Firestore / ...

## Environments
| Env | API base URL | Firebase project | Vault item for .env |
|-----|--------------|------------------|----------------------|
| development | | | |
| staging | | | |
| production | | | |

## Signing & Keys (stored in vault; list the vault item names here, NOT the values)
- Android upload keystore: vault item ____ (alias, passwords, SHA-1/SHA-256)
- Play App Signing SHA-1/SHA-256:
- iOS Distribution cert (.p12): vault item ____, expires on ____
- Provisioning profiles: expire on ____
- APNs Auth Key (.p8): Key ID ____, vault item ____
- App Store Connect API key: Key ID ____, Issuer ID ____, vault item ____
- Google Play service account JSON: vault item ____

## Third-party Services
| Service | Purpose | Account owner email | Plan/billing | Vault item | Renewal date |
|---------|---------|---------------------|--------------|------------|--------------|
| Google Maps | | | | | |
| Sentry | | | | | |
| Payment gateway | | | | | |
| SMS/OTP | | | | | |

## Domains & URLs
- API domain:            Deep link domain:
- Privacy policy URL:    Terms URL:     Support URL/email:
- Domain registrar & renewal date:

## Store Review
- Demo account for reviewers (vault item):
- Notes for reviewer:

## Release History
| Version | Build | Platform | Release date | Notes |
|---------|-------|----------|--------------|-------|

## Known Issues / Warnings / Deadlines
| Date found | Source (Play/Apple/Crashlytics) | Issue | Deadline | Status |
|------------|----------------------------------|-------|----------|--------|
```

### 11.2 New Project Checklist (short version)

```markdown
- [ ] Ownership decided (company vs client store accounts)
- [ ] Bundle ID / Application ID finalized
- [ ] Repo created in company GitHub org, private, teams added, rulesets on
- [ ] README, .env.example, CODEOWNERS, PR template, CI workflow committed
- [ ] dev/staging/prod environments configured
- [ ] .env files stored in the password-manager vault
- [ ] Firebase dev/staging/prod projects created by company account (2+ owners)
- [ ] APNs .p8 key created & backed up
- [ ] Android upload keystore generated & backed up (file + passwords)
- [ ] App IDs registered on Apple Developer & Play Console
- [ ] TestFlight / Internal testing / App Distribution set up
- [ ] Crashlytics + alerts to shared mailbox
- [ ] Remote Config force-update keys added
- [ ] Project Registry created and linked in the master index
```

### 11.3 Release Checklist (every store release)

```markdown
Pre-release
- [ ] Release branch created from develop; version & build numbers bumped
- [ ] Correct .env (production) and production Firebase config used
- [ ] No console logs / dev menus / test endpoints in release build
- [ ] Release build tested on real devices (low-end Android, older iPhone)
- [ ] Critical flows tested: signup/login, payments, push, deep links, account deletion
- [ ] Crashlytics receiving events from the release build
- [ ] Target SDK / Xcode version meets current store requirements
- [ ] Privacy labels / Data safety updated if new data or SDK added
- [ ] Store screenshots & "What's New" updated
- [ ] Demo account for reviewers working

Release
- [ ] Uploaded to TestFlight + Play internal track; QA sign-off
- [ ] Client/management sign-off
- [ ] Submitted for review (iOS manual/phased release; Android staged rollout)

Post-release
- [ ] Merged release → main, tagged vX.Y.Z, merged back to develop
- [ ] Monitored Crashlytics & reviews for 48–72h before increasing rollout
- [ ] Remote Config "latest version" updated (and min version if forcing update)
- [ ] Project Registry release history updated
```

### 11.4 Live Apps Health Sheet

Maintain as a shared spreadsheet, one row per app per platform, reviewed monthly.

| App | Platform | Account owner | Live version | Last release | Target SDK / Xcode | Crash-free users % | ANR % (Android) | Open store warnings + deadline | RN / Expo version | Next action | Owner |
|-----|----------|---------------|--------------|--------------|--------------------|--------------------|-----------------|-------------------------------|-------------------|-------------|-------|
| Acme Delivery | Android | Client | 2.3.1 | 2026-08-10 | API 36 | 99.6% | 0.2% | None | 0.8x | — | — |

Healthy targets: **crash-free users ≥ 99.5%**, Android **user-perceived crash rate < 1.09%** and **ANR rate < 0.47%** (Google's "bad behaviour" thresholds).

### 11.5 Offboarding Checklist (same day)

When **any** developer, QA, designer or contractor leaves, complete this **on their last working day**, and record it with date and who did it.

| # | System | Action |
|---|--------|--------|
| 1 | **GitHub** | Remove from the **Organization** (not just repos). Check Outside Collaborators on all repos. Revoke any deploy keys/PATs they created; transfer any repos they own personally that belong to company work. |
| 2 | **GitLab** | Remove from the **top-level Group**; block their company GitLab user if applicable. |
| 3 | **App Store Connect / Apple Developer** | Remove the user from *Users and Access*. If they had access to certificates, consider revoking/re-issuing certificates and the App Store Connect API key they used. |
| 4 | **Google Play Console** | Remove from *Users and permissions*. |
| 5 | **Firebase / Google Cloud** | Remove from IAM on every project. Rotate any service-account keys they downloaded. |
| 6 | **Expo / EAS** | Remove from the Expo organization. |
| 7 | **CI/CD** | Rotate tokens/secrets they had personal access to. |
| 8 | **Password manager** | Remove from vaults; **rotate passwords of shared accounts** they knew (store accounts, third-party dashboards). |
| 9 | **Third-party dashboards** | Sentry, payment gateways, Maps, SMS, analytics, App Distribution, etc. |
| 10 | **Communication** | Slack/Teams/Email, Jira/Trello/ClickUp, Google Drive shares. |
| 11 | **Devices** | Collect test devices; remove their devices from the Apple device list if needed. |
| 12 | **Knowledge** | Collect KT documents, update Project Registries with anything only they knew; reassign their open PRs/tickets. |

### 11.6 Onboarding Checklist (new team member)

```markdown
- [ ] Company email created; 2FA enabled
- [ ] Added to GitHub org team (and GitLab group if working on legacy projects)
- [ ] Added to required store accounts with the least-privilege role
- [ ] Added to Firebase projects (Editor/Viewer as needed)
- [ ] Access to the relevant password-manager vaults
- [ ] Walkthrough of this playbook + the relevant Project Registries
- [ ] Able to run each assigned app locally within day 1–2
```

---

## 12. Official Reference Links

**Apple**
- Apple Developer Program enrollment: https://developer.apple.com/programs/enroll/
- D-U-N-S Number lookup: https://developer.apple.com/enroll/duns-lookup/
- Upcoming requirements: https://developer.apple.com/news/upcoming-requirements/
- App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- App Store Connect Help: https://developer.apple.com/help/app-store-connect/
- Privacy manifest files: https://developer.apple.com/documentation/bundleresources/privacy-manifest-files
- Account deletion requirement: https://developer.apple.com/support/offering-account-deletion-in-your-app/

**Google**
- Play Console sign-up: https://play.google.com/console/signup
- Play Console Help: https://support.google.com/googleplay/android-developer/
- Target API level requirements: https://developer.android.com/google/play/requirements/target-sdk
- Testing requirements for new personal accounts: https://support.google.com/googleplay/android-developer/answer/14151465
- Play App Signing: https://support.google.com/googleplay/android-developer/answer/9842756
- Developer Program Policy: https://play.google/developer-content-policy/
- Android vitals: https://developer.android.com/topic/performance/vitals

**Firebase / React Native**
- Firebase console: https://console.firebase.google.com/
- React Native Firebase: https://rnfirebase.io/
- React Native docs: https://reactnative.dev/
- React Native Upgrade Helper: https://react-native-community.github.io/upgrade-helper/
- Expo / EAS docs: https://docs.expo.dev/
- React Native Directory: https://reactnative.directory/

**GitHub / GitLab**
- GitHub rulesets: https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets
- GitHub organization security: https://docs.github.com/organizations
- GitLab protected branches: https://docs.gitlab.com/user/project/repository/branches/protected/

---

*Document owner after handover: the incoming Mobile Lead. Review and update this playbook at least every 6 months, and whenever Apple or Google announce a new requirement.*
