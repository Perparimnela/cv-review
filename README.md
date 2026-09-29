# CV Builder — kopje për shqyrtim

> **Të gjitha të dhënat personale në këtë kopje janë fiktive** (Max Mustermann, example.com, +49 000 0000000, Musterstraße 1, numra ID X00000000X). Kodi dhe dokumentacioni janë identikë me versionin zyrtar V537.

| Skedari | Përmbajtja |
|---|---|
| `index.html` | Aplikacioni i plotë (V537). "Kushtetuta" e projektit është në krye të skedarit. |
| `RELEASE_PROCESS.md` | Çdo ndryshim V510–V537: shkaku, rregullimi, provat, promovimet. |
| `BACKUP_INDEX.md` | Kopjet e ruajtura, rikthimi dhe pastrimi. |
| `ARCHITECTURE.md`, `ARCHITECTURE_DECISIONS.md` | Struktura dhe vendimet arkitekturore. |

```text
PËRMBLEDHJE E PUNËS — "Ultra Instinct CV" (27–29 shtator 2026)

PROJEKTI
- Aplikacion CV në një skedar të vetëm HTML (~1.3 MB), me redaktim në shfletues dhe eksport PDF/foto (html2canvas + jsPDF).
- Rregullat e punës ("Kushtetuta") janë në krye të skedarit: punohet në sandbox (index-test.html), prodhimi (index.html) preket vetëm me OK të pronarit pas provës në telefon; para çdo ndryshimi backup; pas çdo versioni snapshot dhe verifikim me hash; ndalohen "patch"-et (override CSS, !important, monkey-patch) — rregullimi bëhet në rrënjë.

ÇFARË U BË (versione prove → versione zyrtare)

V520 (prodhim, 27.09) — eksporti në celular
- Ndarja e PDF-ve në iPhone aktivizohet vetëm kur shfletuesi e mbështet ndarjen e skedarëve (përndryshe shkarkim), jo sipas llojit të pajisjes.
- Paketa publikohet vetëm e plotë; një përgatitje në një kohë (jo gara mes dy përgatitjeve).
- Titulli i Terminalit 1 centrohet me translate (iOS nuk zgjidhte margin:auto).
- Në PDF: numri i telefonit nuk del më blu në iOS; kontaktet e dizajnit Modern të lexueshme.
- Dy versione të tërhequra gjatë punës (V514 priste titullin, V516 s'kishte efekt).

V529 (prodhim, 28.09)
- PDF në celular me gjysmën e pikselave (32 → 16 MP, brenda kufirit të iOS), e njëjta madhësi faqeje → më e shpejtë.
- Titulli te dizajnet 3 dhe 4 në qendër në PDF (html2canvas e aplikonte transform-in dy herë për shkak të një !important).
- Siguri: Subresource Integrity (hash sha512) për bibliotekat nga CDN.
- Pastrime: modal "PDF Export" i vdekur u hoq; një bajt NUL në kod; njohja e celularit në një vend të vetëm; bibliotekat ngarkohen paralelisht, një tag për secilën.
- V522 (buzë turkeze te kontaktet) u tërhoq me kërkesë të pronarit.

V531 (prodhim, 29.09)
- Të gjitha njoftimet (57) vijnë nga një katalog i vetëm gjuhësh (de/en/sq) dhe ndjekin flamurin e gjuhës së projektit.

V537 (prodhim, 29.09)
- window.Utils u ekspozua: disa njoftime (shiriti i fotove, "eksporti i PDF-së dështoi") nuk kishin dalë kurrë.
- Dritarja e eksportit ndjek flamurin e gjuhës.
- Telefoni merr viewport-in desktop (1200px) që në kokën e faqes → pa "kërcim" nga pamja celular në desktop gjatë ngarkimit.
- Reset Default nuk e kthen më gjuhën në gjermanisht.
- Ekran ngarkimi (perde + tregues) derisa faqja të jetë e plotë. Zbulim: me opacity 0 ose visibility:hidden Safari nuk vizaton asgjë (ekran i bardhë) — u përdor perde + trup 1% opacity.

SI U VERIFIKUA
- Backup + snapshot + hash për çdo version; promovim me kopje rikthimi të verifikuar.
- Simulator iOS (iPhone 17), server lokal i ngadalësuar për të riprodhuar ngarkimin në Wi-Fi, prova A/B me versionin e mëparshëm si kontroll, kontroll sintakse i çdo skripti me node, dhe prova e pronarit në iPhone para promovimit.

PASTRIM (29.09)
- 146 kopje pune dhe versione prove (148 MB) në Trash; u hoqën edhe nga historia e git-it me kërkesë të pronarit. U mbajtën backup-et e prodhimit dhe snapshot-et zyrtare.

PYETJE PËR SHQYRTIM
1. A janë rregullimet në rrënjë apo ka "patch" (Kushtetuta, Neni 8)?
2. Rreziqe/regresione te eksporti PDF në iPhone, gjuhët, ekrani i ngarkimit, viewport-i, reset-i?
3. Çfarë do të bëje ndryshe dhe çfarë mungon në testim?
4. A është procesi (versione, backup, promovim) i arsyeshëm apo i tepërt?
```
