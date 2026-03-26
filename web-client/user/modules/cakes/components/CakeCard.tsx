import { Card, Rate, Button, message, App } from "antd";
import { HeartOutlined, HeartFilled, ShoppingCartOutlined } from "@ant-design/icons";
import Link from "next/link";
import { ICake } from "../types";
import { useWishlist } from "../../../hooks/use-wishlist";
import { useMeQuery } from "../../auth/hooks";
import { useAddToCartMutation } from "../../cart/hooks";

export const CakeCard = ({ cake }: { cake: ICake }) => {
  const { isLiked, toggleWishlist, isPending: wishlistPending } = useWishlist();
  const { data: user } = useMeQuery();
  const { mutate: addToCart, isPending: cartPending } = useAddToCartMutation();
  const { message: antdMessage } = App.useApp();
  
  const liked = isLiked(cake.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      antdMessage.info("Vui lòng đăng nhập để lưu vào danh sách yêu thích");
      return;
    }
    
    toggleWishlist(cake.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart(
      { cake_id: cake.id, quantity: 1 },
      {
        onSuccess: () => antdMessage.success("Đã thêm vào giỏ hàng!"),
        onError: (err: any) => antdMessage.error(err.message || "Lỗi khi thêm vào giỏ"),
      }
    );
  };

  return (
    <Link href={`/cakes/${cake.id}`} className={cake.stock === 0 ? "pointer-events-none opacity-60" : ""}>
      <Card
        hoverable={cake.stock > 0}
        className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border-gray-100 h-full flex flex-col relative group"
        cover={
          <div className="relative overflow-hidden">
            <img
              alt={cake.name}
              src={cake.imageUrl}
              className="h-48 w-full object-cover transition-transform group-hover:scale-110 duration-500"
            />
            {/* Wishlist Button */}
            <div className="absolute top-2 right-2 z-10">
              <Button
                type="text"
                shape="circle"
                icon={liked ? <HeartFilled className="text-red-500" /> : <HeartOutlined className="text-white drop-shadow-md" />}
                className={`backdrop-blur-md ${liked ? 'bg-white/80' : 'bg-black/20 hover:bg-white/40'} border-none shadow-sm transition-all duration-300 scale-90 hover:scale-100`}
                onClick={handleWishlistClick}
                loading={wishlistPending}
              />
            </div>
            {/* Display Tags as Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {cake.tags.map((tag, idx) => (
                <span key={idx} className="bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-[10px] font-black text-indigo-600 shadow-sm border border-indigo-100 uppercase tracking-tighter">
                  {tag}
                </span>
              ))}
            </div>
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
            <div className="flex justify-between items-start gap-2">
              <h3 className="text-lg font-bold text-gray-800 line-clamp-1 flex-1">{cake.name}</h3>
              <div className="flex flex-wrap gap-1 justify-end max-w-[40%]">
                {(cake.categories && cake.categories.length > 0 ? cake.categories : (cake.category ? [cake.category] : [])).slice(0, 1).map((cat, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded text-[9px] font-black uppercase tracking-wider whitespace-nowrap border border-indigo-100/50">
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
            {cake.reviewCount > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <Rate disabled defaultValue={cake.averageRating} allowHalf className="text-xs" />
                <span className="text-[10px] text-gray-400">({cake.reviewCount})</span>
              </div>
            )}
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{cake.description}</p>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-indigo-600">{cake.formattedPrice}</span>
              {cake.stock > 0 && <span className="text-[10px] font-normal text-gray-400 uppercase tracking-widest">Còn {cake.stock} bánh</span>}
            </div>
            {cake.stock > 0 && (
              <Button 
                type="primary"
                shape="circle"
                size="large"
                icon={<ShoppingCartOutlined className="text-lg" />}
                onClick={handleAddToCart}
                loading={cartPending}
                className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 flex items-center justify-center h-12 w-12"
              />
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};
