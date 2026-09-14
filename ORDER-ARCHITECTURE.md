# Order- en notificatiearchitectuur

AllRound Direct: Mollie (betalen), Resend (e-mail), D1 (data), Worker/Hono (API). R2 volgt later voor media/documenten.

Dit is geen vrijbrief voor live incasso. **Geen live Mollie-betalingen** zonder `MOLLIE_MODE=live`, `MOLLIE_ALLOW_LIVE=true` en `ENVIRONMENT=production`. Standaard is testmodus. Ontbreekt de test-key in development, dan is er een **mock** die nooit echt geld verplaatst.

De Mollie-secret blijft server-side. Nooit loggen, nooit naar de frontend.

## Order model

| Entiteit | Rol |
| --- | --- |
| `orders` | Interne UUID als PK. Publiek nummer `ARD-2026-000001` is geen security-id. |
| `order_items` | **Snapshot** bij bestellen: naam, SKU, variant, prijs, btw, image-ref, aantal. |
| `payments` | Mollie-betaling los van de order. |
| `shipments` / `shipment_items` | Meerdere zendingen per order (leveranciers). |
| `order_status_history` | Audit van statuswijzigingen. |
| `refunds` / `returns` | Terugbetalingen en retouren. |
| `user` + `customer_profiles` + `addresses` | Klant en adressen (geen aparte `customers`-tabel). |
| `order_number_counters` | Jaarlijkse teller voor leesbare nummers. |

Beginstatus: `pending_payment`. Pas na geverifieerde Mollie-status `paid` wordt het `payment_received`.

## Betaalflow

1. Winkelwagen / checkoutvalidatie (prijzen van de server of development-fixture, niet van de client).
2. Order `pending_payment` aanmaken.
3. `PaymentsService.createPayment` (Mollie test of mock).
4. Klant redirect naar Mollie of mock-url.
5. Webhook `POST /api/payments/mollie/webhook` **en/of** server-side `getPayment` vanaf de bevestigingspagina.
6. `syncProviderPayment` verifieert de **actuele** status bij de provider.
7. Order/payment bijwerken, events, e-mail.

De browser-redirect is **niet** leidend.

## Idempotentie

- `processed_webhooks`: dezelfde `mollie:{id}:{status}` wordt herkend.
- Order/payment-updates zijn reconcilierend (`paymentStatus === paid` wordt niet opnieuw gezet).
- `order_event_deliveries`: uniek per event + entiteit + kanaal → geen dubbele mails.
- `inventoryAdjustedAt` op de order: geen tweede voorraadmutatie (module is nu een no-op timestamp).

`POST /api/dev/payments/:id/settle` (alleen localhost/development) draait sync twee keer en verwacht `second.duplicate === true`.

## E-mail

Alles via `createEmailService(env).send({ template, to, data, related })`. Geen losse Resend-calls in routes.

Templates: verificatie, wachtwoord, orders, zendingen, retour/refund, zakelijke offerte.

Layout: logo, navy `#071F3F`, blauw `#087CEB`, veel wit, transactioneel.

`email_logs`: template, ontvanger, gerelateerde entiteit, status, provider-id, tijdstip, foutcode. **Geen volledige body.**

Zonder `RESEND_API_KEY` in development: outbox + log, geen crash. In production: fout tot de key er is.

## Events

`emitOrderEvent` koppelt later admin-notificaties zonder businesslogica te verspreiden.

`ORDER_CREATED`, `PAYMENT_CONFIRMED`, `ORDER_PROCESSING`, `SHIPMENT_CREATED` (klaar voor shipment-API), `SHIPMENT_SENT`, `ORDER_DELIVERED`, `ORDER_CANCELLED`, `RETURN_REQUESTED`, `RETURN_RECEIVED`, `REFUND_COMPLETED`, `BUSINESS_QUOTE_*`.

## API

- `POST /api/checkout/place` — start pending order + payment (geblokkeerd als live niet is toegestaan).
- `GET /api/checkout/status?order=&token=` — poll; triggert server-side Mollie-verify.
- `POST /api/payments/mollie/webhook`
- `POST /api/dev/orders/fixture` — development testdata
- `POST /api/dev/payments/:id/settle` — mock paid + dubbele sync

## Env

Zie `.env.example`: `MOLLIE_API_KEY`, `MOLLIE_MODE`, `MOLLIE_ALLOW_LIVE`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`.
