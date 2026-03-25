import { CakeDetail } from "@/modules/cakes/components/CakeDetail";

export default function CakeDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <CakeDetail id={params.id} />
    </div>
  );
}
