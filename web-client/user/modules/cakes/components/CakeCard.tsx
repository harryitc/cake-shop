import { Card } from "antd";
import Link from "next/link";
import { ICake } from "../types";

export const CakeCard = ({ cake }: { cake: ICake }) => {
  return (
    <Link href={`/cakes/${cake.id}`} className={cake.stock === 0 ? "pointer-events-none opacity-60" : ""}>
      <Card
        hoverable={cake.stock > 0}
        className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border-gray-100 h-full flex flex-col relative"
        cover={
          <div className="relative">
            <img
              alt={cake.name}
              src={cake.imageUrl}
              className="h-48 w-full object-cover"
            />
            {cake.stock === 0 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                <span className="bg-red-600 text-white font-black px-4 py-2 rounded-lg rotate-[-12deg] text-lg border-2 border-white shadow-xl">
                  HẾT HÀNG
                </span>
              </div>
            )}
          </div>
        }
      >
        <div className="flex flex-col gap-2 h-full justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{cake.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{cake.description}</p>
          </div>
          <div className="mt-2 text-xl font-bold text-indigo-600 flex justify-between items-center">
            <span>{cake.formattedPrice}</span>
            {cake.stock > 0 && <span className="text-xs font-normal text-gray-400">Còn {cake.stock}</span>}
          </div>
        </div>
      </Card>
    </Link>
  );
};
