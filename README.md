# AurevonFilter

سایت فروش اشتراک با پنل کاربر و پنل ادمین، ساخته‌شده با Next.js 14 (App Router) +
TypeScript + Prisma + PostgreSQL + Tailwind CSS.

## ⚠️ وضعیت واقعی این پروژه (صادقانه)

این پروژه در محیطی بدون دسترسی به اینترنت نوشته شده، بنابراین:

- **`npm install` هرگز اجرا نشده** و `node_modules` وجود ندارد.
- **`package-lock.json` وجود ندارد** (چون نصب انجام نشده).
- **`prisma generate` و `prisma migrate` اجرا نشده‌اند** (چون نیاز به دانلود Prisma engines و اتصال به دیتابیس واقعی دارند).
- **هیچ build یا `npm run dev` واقعی اجرا نشده** - پس نمی‌توانم تضمین کنم که کد صد‌درصد بدون خطای تایپ یا رفرنس اجرا می‌شود، فقط از نظر منطقی و ساختاری بازبینی شده.
- کدها به‌صورت دستی برای درستی import/export و سازگاری با Next.js 14 App Router بازبینی شدند، اما تنها راه تأیید قطعی، اجرای واقعی `npm install && npm run dev` روی سیستم شماست.

لطفاً قبل از هر چیز مراحل زیر را لوکال انجام دهید و اگر خطایی دیدید (مثلاً یک import اشتباه)، برایم بفرستید تا اصلاح کنم.

## ساختار پروژه

```
prisma/schema.prisma      مدل‌های دیتابیس (User, Admin, Plan, Config, Order,
                           Subscription, Coupon, Ticket, TicketMessage, Payment, Setting)
prisma/seed.ts             seed غیرحساس (فقط چند پلن نمونه - بدون کانفیگ واقعی)
src/lib/                   auth کاربر/ادمین، Prisma client، payment abstraction،
                           subscription builder، validators (zod)
src/middleware.ts          محافظت از صفحات /admin/*
src/app/                   صفحات (App Router) + API routes زیر src/app/api
src/components/            کامپوننت‌های مشترک (Navbar, PlanCard, QrCode, CopyButton)
```

## پیش‌نیازها

- Node.js 20+
- یک دیتابیس PostgreSQL (لوکال، Docker، یا Railway Postgres plugin)

## راه‌اندازی Local

```bash
# 1. نصب وابستگی‌ها (این مرحله package-lock.json را هم می‌سازد)
npm install

# 2. فایل env بسازید
cp .env.example .env
# مقادیر DATABASE_URL, JWT_SECRET, ADMIN_JWT_SECRET,
# ADMIN_USERNAME, ADMIN_PASSWORD را پر کنید

# 3. (اختیاری) اگر Postgres لوکال ندارید:
docker compose up -d

# 4. اجرای migration اولیه
npx prisma migrate dev --name init

# 5. seed داده‌های نمونه (فقط پلن‌ها - بدون کانفیگ واقعی)
npm run seed

# 6. اجرای پروژه
npm run dev
```

سپس:
- سایت کاربر: http://localhost:3000
- ورود ادمین: http://localhost:3000/admin/login (با مقادیر ADMIN_USERNAME/ADMIN_PASSWORD در .env)

**نکته مهم:** بلافاصله بعد از نصب، از پنل ادمین وارد بخش **Configs** شوید و
کانفیگ‌های واقعی خودتان را وارد کنید. هیچ کانفیگی به‌صورت خودکار ساخته نمی‌شود.

## Environment Variables

| متغیر | توضیح |
|---|---|
| `DATABASE_URL` | آدرس اتصال PostgreSQL |
| `JWT_SECRET` | کلید امضای JWT کاربران عادی |
| `JWT_EXPIRES_IN` | مدت اعتبار توکن کاربر (پیش‌فرض `7d`) |
| `ADMIN_USERNAME` | نام کاربری ادمین |
| `ADMIN_PASSWORD` | رمز عبور ادمین (هرگز در کد Hardcode نشده) |
| `ADMIN_JWT_SECRET` | کلید امضای JWT ادمین (جدا از کاربر عادی) |
| `NEXT_PUBLIC_BASE_URL` | آدرس عمومی سایت، برای ساخت Subscription URL |

## Deploy روی Railway

1. یک پروژه جدید در Railway بسازید و **PostgreSQL plugin** را اضافه کنید (این کار
   به‌صورت خودکار متغیر `DATABASE_URL` را می‌سازد).
2. ریپوی این پروژه را به Railway وصل کنید (Railway به‌طور خودکار `Dockerfile` را
   تشخیص می‌دهد و از آن برای build استفاده می‌کند).
3. متغیرهای محیطی زیر را در تنظیمات سرویس Railway اضافه کنید:
   - `JWT_SECRET`
   - `ADMIN_JWT_SECRET`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_BASE_URL` (دامنه‌ای که Railway به شما می‌دهد، مثلاً
     `https://your-app.up.railway.app`)
4. بعد از اولین deploy موفق، یک‌بار از طریق Railway Shell (یا لوکال با
   `DATABASE_URL` پروداکشن) این دستور را اجرا کنید تا جداول ساخته شوند:
   ```bash
   npx prisma migrate deploy
   ```
5. (اختیاری) برای seed چند پلن نمونه:
   ```bash
   npm run seed
   ```
6. از پنل ادمین وارد شوید و کانفیگ‌های واقعی را اضافه کنید.

### درباره Dockerfile و lockfile

چون این پروژه تازه ساخته شده، `package-lock.json` هنوز وجود ندارد (طبق قانون
پروژه، من بدون اجرای واقعی `npm install` این فایل را نساختم تا چیزی جعلی/نادرست
commit نشود). به همین دلیل Dockerfile فعلاً از `npm install` استفاده می‌کند، نه
`npm ci`. **پیشنهاد:** بعد از اجرای `npm install` لوکال، فایل
`package-lock.json` تولیدشده را commit کنید و در `Dockerfile` خط
`RUN npm install --no-audit --no-fund` را به `RUN npm ci` تغییر دهید تا build
پروداکشن کاملاً reproducible باشد.

## جریان خرید (خلاصه)

1. کاربر یک پلن را در صفحه اصلی انتخاب می‌کند (پلن‌ها از DB خوانده می‌شوند).
2. سفارش با وضعیت `PENDING` ساخته می‌شود؛ قیمت نهایی همیشه سمت سرور از روی
   `Plan` و `Coupon` محاسبه می‌شود، نه از ورودی کاربر.
3. روش پرداخت فعلی `CARD_TO_CARD` است: کاربر به صفحه راهنمای کارت‌به‌کارت
   هدایت می‌شود.
4. ادمین از **Admin > Orders** پرداخت را تأیید می‌کند (`تأیید پرداخت`).
5. با تأیید، سیستم به‌صورت اتمیک: یک کانفیگ `AVAILABLE` انتخاب و `SOLD`
   می‌کند، یک `Subscription` می‌سازد و سفارش را `DELIVERED` می‌کند.
6. کاربر از **داشبورد > اشتراک‌ها** لینک Subscription، QR و کانفیگ‌های خودش
   را می‌بیند.

معماری پرداخت (`src/lib/payment/provider.ts`) به‌شکل abstraction نوشته شده تا
افزودن یک درگاه واقعی بعداً فقط نیاز به پیاده‌سازی همان interface داشته باشد -
بدون تغییر در بقیه‌ی سیستم سفارش.

## تست‌هایی که واقعاً انجام نشد (صادقانه)

- [ ] `npm install` واقعی و بررسی نبود تداخل نسخه‌ها
- [ ] `npx prisma generate` / `npx prisma migrate dev`
- [ ] اجرای واقعی `npm run dev` و باز شدن صفحات در مرورگر
- [ ] تست عملی جریان کامل خرید تا تحویل کانفیگ
- [ ] build واقعی Docker image

فقط بازبینی دستی کد (import/exportها، نام فایل‌های route.ts، سازگاری با
قراردادهای Next.js App Router، منطق Prisma) انجام شده است.
