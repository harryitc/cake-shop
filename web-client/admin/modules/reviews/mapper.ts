export const mapReviewToModel = (dto: any) => {
  return {
    id: dto._id,
    user: {
      id: dto.user?._id,
      name: dto.user?.name,
      email: dto.user?.email,
      avatar: dto.user?.avatar,
    },
    cake: {
      id: dto.cake?._id,
      name: dto.cake?.name,
      image: dto.cake?.image,
    },
    rating: dto.rating,
    comment: dto.comment,
    reply: dto.reply,
    is_approved: dto.is_approved,
    createdAt: dto.createdAt,
  };
};

export type ReviewModel = ReturnType<typeof mapReviewToModel>;
