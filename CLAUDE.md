# Public Boat Ramps ,  CLAUDE.md

> Source of truth for Claude Code on this project. Last updated: 2026-04-30

## Project Identity

- **Site**: Public Boat Ramps
- **Domain**: publicboatramps.com
- **Purpose**: Location finder for public boat ramps and launch sites across the United States
- **Type**: utility-site (ad-supported location directory)
- **Compliance Tier**: Standard

## Tech Stack

- **Framework**: Next.js | **Deployment**: Vercel | **Language**: TypeScript | **Styling**: Tailwind CSS | **Package Manager**: npm

## 1. AdSense & Monetization

- **Publisher ID**: `ca-pub-7171402107622932`
- **ads.txt**: `google.com, pub-7171402107622932, DIRECT, f08c47fec0942fa0`

## 2. SEO

- SSR/SSG required
- Each ramp page: name, location, ramp surface, trailer parking, fee (if any), hours, GPS coordinates
- Seasonal content: many ramps close seasonally ,  reflect current status where possible

## 3. Core Web Vitals

- **LCP** ≤ 2.5s | **INP** ≤ 200ms | **CLS** ≤ 0.1

## 4. E-E-A-T

- Attribution: "Built by an experienced web developer" ,  no personal name
- "Verify access and fees directly with the managing agency before launching" disclaimer on each page

## 5. Structured Data

- Organization, WebSite, Place (for natural ramps), LocalBusiness (for managed facilities), BreadcrumbList
- Include geo coordinates (latitude/longitude) in schema

## 6. Mobile-First

- Touch targets 48px+, maps responsive, 16px+ body text

## 7. Bing Optimization

- meta keywords, SSR mandatory, IndexNow on deploy

## 8. GEO / AI

- `/llms.txt` at root, standard AI crawler rules
- Lead content with water body name, city/county, and ramp type

## 9. Privacy & Consent

- `/privacy` and `/terms` required

## 10. Accessibility (WCAG 2.1 AA)

- Alt text on ramp photos, keyboard navigation, skip links

## 11. Security Headers

Standard Empire security headers

## 12. Sitemaps & Metadata

Sitemap via `app/sitemap.ts`, submit to GSC and Bing WMT

## Cross-Site Links

Footer: all sister sites (excluding self)

## Deployment

Vercel | main | `npm run build` | Env: INDEXNOW_API_KEY

## Warnings

Standard Empire warnings. Never present ramp access as guaranteed ,  closures due to water levels, maintenance, or seasonal restrictions are common. Always include "verify before launching" guidance.
