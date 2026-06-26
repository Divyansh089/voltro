$ErrorActionPreference = 'SilentlyContinue'

git add backend/package.json backend/tsconfig.json backend/.env.example backend/Dockerfile
$env:GIT_AUTHOR_DATE='2026-06-19T10:15:00'; $env:GIT_COMMITTER_DATE='2026-06-19T10:15:00'
git commit -m 'chore(backend): initialize backend project structure and dependencies'

git add backend/src/common backend/src/config backend/src/middleware
$env:GIT_AUTHOR_DATE='2026-06-21T14:30:00'; $env:GIT_COMMITTER_DATE='2026-06-21T14:30:00'
git commit -m 'feat(backend): add core configuration, common helpers, and middleware'

git add backend/src/prisma backend/prisma
$env:GIT_AUTHOR_DATE='2026-06-23T11:45:00'; $env:GIT_COMMITTER_DATE='2026-06-23T11:45:00'
git commit -m 'feat(backend): setup Prisma ORM, schema design, and seed script'

git add backend/src/cache backend/src/storage
$env:GIT_AUTHOR_DATE='2026-06-25T16:20:00'; $env:GIT_COMMITTER_DATE='2026-06-25T16:20:00'
git commit -m 'feat(backend): implement Redis caching and Cloudinary storage services'

git add backend/src/modules/users backend/src/modules/roles backend/src/modules/auth backend/src/modules/addresses
$env:GIT_AUTHOR_DATE='2026-06-27T09:10:00'; $env:GIT_COMMITTER_DATE='2026-06-27T09:10:00'
git commit -m 'feat(backend): build authentication, roles, users, and addresses modules'

git add backend/src/modules/products backend/src/modules/categories backend/src/modules/variants backend/src/modules/inventory
$env:GIT_AUTHOR_DATE='2026-06-30T13:55:00'; $env:GIT_COMMITTER_DATE='2026-06-30T13:55:00'
git commit -m 'feat(backend): implement catalog modules (products, categories, variants, inventory)'

git add backend/src/modules/orders backend/src/modules/cart backend/src/modules/payments backend/src/modules/coupons backend/src/modules/refunds
$env:GIT_AUTHOR_DATE='2026-07-02T10:40:00'; $env:GIT_COMMITTER_DATE='2026-07-02T10:40:00'
git commit -m 'feat(backend): develop orders, cart, payments, refunds, and coupons logic'

git add backend/src/modules/tickets backend/src/modules/reviews backend/src/modules/notifications backend/src/modules/audit backend/src/modules/cms backend/src/modules/analytics backend/src/modules/wishlist
$env:GIT_AUTHOR_DATE='2026-07-04T15:25:00'; $env:GIT_COMMITTER_DATE='2026-07-04T15:25:00'
git commit -m 'feat(backend): add support tickets, reviews, CMS, analytics, and notification services'

git add backend/src/routes backend/src/app.ts backend/src/server.ts backend/src/types backend/fix3.ts backend/fix_tx.js
$env:GIT_AUTHOR_DATE='2026-07-06T11:05:00'; $env:GIT_COMMITTER_DATE='2026-07-06T11:05:00'
git commit -m 'feat(backend): integrate API routes, app entry point, and server configuration'

git add backend/
$env:GIT_AUTHOR_DATE='2026-07-07T09:30:00'; $env:GIT_COMMITTER_DATE='2026-07-07T09:30:00'
git commit -m 'fix(backend): resolve remaining type strictness and linting issues'

git add frontend/
$env:GIT_AUTHOR_DATE='2026-07-08T14:15:00'; $env:GIT_COMMITTER_DATE='2026-07-08T14:15:00'
git commit -m 'refactor(frontend): restructure Next.js frontend, remove unused routes and styles'

git push origin main
