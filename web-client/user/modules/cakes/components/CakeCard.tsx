import { Card } from "antd";
import Link from "next/link";
import { ICake } from "../types";

export const CakeCard = ({ cake }: { cake: ICake }) => {
  return (
    <Link href={`/cakes/${cake.id}`}>
      <Card
        hoverable
        className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border-gray-100 h-full flex flex-col"
        cover={
          <img
            alt={cake.name}
            src={cake.imageUrl}
            className="h-48 w-full object-cover"
          />
        }
      >
        <div className="flex flex-col gap-2 h-full justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{cake.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{cake.description}</p>
          </div>
          <div className="mt-2 text-xl font-bold text-indigo-600">
            {cake.formattedPrice}
          </div>
        </div>
      </Card>
    </Link>
  );
};
