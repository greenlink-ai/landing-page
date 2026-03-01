# landing-page
# GreenLink — Sovereign AI Infrastructure

> **AI Infrastructure Platform: High-Performance Training, Fine-tuning, and Inference.**
> Optimized for the NVIDIA Blackwell architecture.

---

## Project Vision
GreenLink offers a sovereign alternative to traditional Cloud Service Providers. We focus on bridging the gap between massive compute power and the specific needs of critical sectors (Healthcare, Finance, Industry), ensuring full GDPR compliance and high-density performance.

### Location and Sustainability
* **Site:** Ferreira do Alentejo, Portugal.
* **Power:** Dedicated 1000 kVA infrastructure.
* **Sustainability:** >3,000 annual sun hours, solar-powered facility.
* **Efficiency:** Target **PUE < 1.2**.

---

## The Hardware
The cluster is engineered for the next generation of generative models and AI workloads:

* **GPU:** 832x **NVIDIA RTX PRO 6000 Blackwell** 96GB VRAM.
* **Compute:** **AMD EPYC™ 9005 Series (Turin)** nodes with 128 PCIe Gen5 lanes.
* **Networking:** 100Gbps Redundant Fabric with **RoCE v2** and **NVIDIA ConnectX-7** SmartNICs.
* **Storage:** HPE Alletra MP X10000 All-Flash NVMe (Persistent) + Local NVMe (Ephemeral).

---

## Tech Stack
Current development focuses on the public presence and price transparency engine:

* **Framework:** Next.js 15 (App Router) + TypeScript.
* **Styling:** Tailwind CSS 4 + Shadcn/UI.
* **Animations:** Framer Motion.
* **Database:** PostgreSQL (Supabase) + Drizzle ORM.
* **Deployment:** Vercel (Edge Network).

---

## Design System
* **Theme:** Dark-first (Zinc-950) with Emerald-500 accents.
* **Typography:** **Cabinet Grotesk** (Display) & **Geist** (Body/UI).
* **Key Visual:** The **Digital Tree** (circuitry-meets-nature) — a fusion of Tech and Nature.

## Collaboration

### Getting Started
1.  **Clone the repository:** `git clone https://github.com/greenlink-ai/greenlink-web.git`
2.  **Install dependencies:** `npm install`
3.  **Set up environment:** Copy `.env.example` to `.env.local`.
4.  **Start dev server:** `npm run dev`

### Project Rules
* **I18n:** All UI strings must be stored in `dictionaries/pt.json` and `en.json`.
* **Types:** Strict TypeScript. Avoid using `any` at all costs.
* **Git:** Follow the **Conventional Commits** specification (`feat:`, `fix:`, `docs:`, etc.).