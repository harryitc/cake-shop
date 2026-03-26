import { CakeDetail } from "@/modules/cakes/components/CakeDetail";

export default async function CakeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-gray-50">
      <CakeDetail id={id} />
    </div>
  );
}
