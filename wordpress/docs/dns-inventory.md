# Production Domain and DNS Inventory

Captured read-only on 2026-08-25 at approximately 10:46 UTC. No DNS, domain,
hosting, certificate, email, or application setting was changed while gathering
this evidence.

## Public web routing

| Name | Public answer | Observed application |
| --- | --- | --- |
| `teethbytrev.com` | `A 160.153.0.235`, TTL approximately 3600 seconds | HTTP 200; GoDaddy `paas-nodejs-v1`; Next.js cache and prerender headers |
| `www.teethbytrev.com` | `CNAME teethbytrev.com`, TTL 3600 seconds | HTTP 200; same GoDaddy Node/Next.js application |
| `32741.us6.myftpupload.com` | `A 160.153.0.148` | HTTP 200; separate GoDaddy Managed WordPress production host |
| `1254861.us6.myftpupload.com` | `A 160.153.0.148` | HTTP 200; protected GoDaddy Managed WordPress staging clone |
| `ukasxgp8ig.preview.c36.airoapp.ai` | `A 160.153.0.189`, TTL 60 seconds | GoDaddy Airo preview; anonymous request currently returns HTTP 401 |

The custom production domain is therefore attached to and serving the live
GoDaddy Airo Node/Next.js environment, not either temporary WordPress hostname.
The public response identifies the Node product but does not disclose the
current GoDaddy deployment/release ID or the actor and time that created the
domain binding. Those control-plane facts must be captured after GoDaddy
reauthentication.

## DNS authority and email preservation

| Record | Current value |
| --- | --- |
| Authoritative nameservers | `ns43.domaincontrol.com`, `ns44.domaincontrol.com` |
| Apex IPv4 | `160.153.0.235` |
| Apex IPv6 | No public answer |
| `www` | `CNAME teethbytrev.com` |
| MX | Priority 0: `mx1-usg1.ppe-hosted.com`, `mx2-usg1.ppe-hosted.com`, `mx3-usg1.ppe-hosted.com` |
| DMARC | `v=DMARC1; p=none; rua=mailto:teethbytrev@gmail.com; fo=1` |

The MX and DMARC records are independent of the website cutover and must not be
changed. Before any future cutover, capture a fresh DNS export and GoDaddy
domain-binding screenshot, preserve the Node release ID and environment-name
inventory, and establish the exact rollback record values and TTL window.

## Read-only health snapshot

- `https://teethbytrev.com/` — HTTP 200.
- `https://32741.us6.myftpupload.com/` — HTTP 200.
- `https://1254861.us6.myftpupload.com/` — HTTP 200.
- Staging TBT health — `ok: true`, plugin 0.2.7, Airtable configured, zero
  pending enquiry/deposit records, and Square disabled.

This inventory proves the current public routing state only. It does not
authorize or schedule a cutover, and it is not a substitute for a GoDaddy DNS
export, hosting backup, or rollback rehearsal.
