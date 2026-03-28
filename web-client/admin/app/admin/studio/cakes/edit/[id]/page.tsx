"use client";

import { useParams } from "next/navigation";
import { CakeStudioForm } from "@/modules/cakes/components/CakeStudioForm";
import { useCakeQuery } from "@/modules/cakes/hooks";

export default function EditCakeStudioPage() {
  const { id } = useParams();
  const { data: initialData, isLoading } = useCakeQuery(id as string);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CakeStudioForm initialData={initialData} loading={isLoading} />
    </div>
  );
}
