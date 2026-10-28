# Advertising Calculator implementation

Owner approved Advertising Calculator, Chinese 广告盈亏计算器, /zh/acos-calculator/ and /en/acos-calculator/. Manual per-order contribution model, one item/order; not account connection or automatic fee lookup. Implement inline in existing static KJAMZ architecture.

Reference research: AmzToolBox /functionality/cpc-compass combines manual profit, CPC/ACOS and auto-fee config; /functionality/ad-calc is bidding modifiers. AMZ123 /tools-chengbenlirun is category/cost/profit. Do not copy their fee tables or strategy multipliers. Official definitions: https://advertising.amazon.com/library/guides/acos-advertising-cost-of-sales and https://advertising.amazon.com/library/guides/ads-math . ACOS=ad spend/ad-attributed revenue; ROAS inverse; CPA=CPC/CVR.

Inputs: same-currency price>0 and per-item product cost required; inbound freight, fulfillment, commission (% or amount), other per-order costs default0. CVR0..100% required, nonzero minimum0.0001%. Optional current CPC and target profit >=0; blank remains missing, zero distinct. Currency display USD/EUR/GBP/CNY/JPY, no exchange conversion. Money cap1e9, invalid/nonfinite reject. Empty clears results immediately. Demo is explicit, not automatic preset fees.

Compute total non-ad cost, contribution M=price-cost; positive M => break-even ACOS=M/price, ROAS=price/M, CPC=M*CVR. M=0 only0adspend break-even; negative M has no nonnegative break-even ad budget (null thresholds, actual negative contribution remains shown). Optional target T <= M => targetACOS=(M-T)/price and CPC=(M-T)*CVR, T>M => unattainable even without ads, null caps. At CVR0, no order-level CPA/profit/ACOS estimate, break-evenCPC0 if M>=0; current ROAS0 when positive CPC, otherwise undefined. Current CPC0 with positive CVR yields CPA0, ACOS0, profitM, ROAS undefined. No Infinity/NaN in display/export. Don't call contribution true net profit beyond included costs; no bid/ranking guarantee.

UI: bilingual two-column input/results, sample/clear, cost breakdown, live results, positive/break-even/loss notices, optional target caps, CSV/TXT exports with same inputs/assumptions. Existing shell/footer/quiet updates, own-page nav, mobile stack. Positive feature copy, actual mathematical edge warnings only. No data uploaded/stored. Original FAQ/formulas with official sources.

- [ ] Failing tests: standard sample, percent/amount commission equivalence, CVR0, CPC0, zero/negative margin, unattainable targets, blank/invalid/limits, safe export.
- [ ] Implement core and localized controller/generator/CSS.
- [ ] Home card/page registry/SEO/CSP/sitemap/hreflang, v1.4.0 released entry2026-10-29.
- [ ] Build/test/GEO; desktop/mobile, edge states/export/no transmission; independent source review.
- [ ] Inspect remote, upload preserving history, deploy existing worker, live validation/report/rollback.

Run acos-2026-10-29; backup/checkpoint .local/acos-release/. Prior source/HTML/package/hash snapshots. Previous production89c2fc37-b612-453d-8249-0de29dae7970 (confirm deployments-before). No PDF backend, visitor quota, credentials or crawler training preferences altered.
