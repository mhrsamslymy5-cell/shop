import Navbar from "@/components/Navbar";
import PlanCard from "@/components/PlanCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getPlans() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  const availableConfigs = await prisma.config.count({
    where: { status: "AVAILABLE" },
  });
  return { plans, inStock: availableConfigs > 0 };
}

export default async function HomePage() {
  const { plans, inStock } = await getPlans();

  return (
    <main>
      <Navbar />

      <section className="mx-4 mt-14 text-center sm:mx-8">
        <h1 className="text-3xl font-extrabold sm:text-5xl">
          <span className="text-brand-400">Aurevon</span>Filter
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-300">
          دسترسی سریع، پایدار و امن به اینترنت آزاد - با پلن‌های متنوع و
          تحویل آنی پس از تأیید پرداخت.
        </p>
      </section>

      <section className="mx-4 mt-12 grid grid-cols-1 gap-6 pb-16 sm:mx-8 sm:grid-cols-2 lg:grid-cols-3">
        {plans.length === 0 && (
          <p className="col-span-full text-center text-slate-400">
            در حال حاضر پلنی برای نمایش وجود ندارد.
          </p>
        )}
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} inStock={inStock} />
        ))}
      </section>
    </main>
  );
}
