export const mapCategoryToModel = (dto: any) => {
  return {
    id: dto._id || dto.id || "",
    name: dto.name || "Danh mục không tên",
    slug: dto.slug || "",
    description: dto.description || "",
    image_url: dto.image_url || "",
    type: dto.type || "OTHER",
    is_featured: dto.is_featured ?? false,
    parent_id: dto.parent_id || null,
    createdAt: dto.createdAt || new Date().toISOString(),
  };
};

export type CategoryModel = ReturnType<typeof mapCategoryToModel>;
