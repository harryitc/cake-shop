import { Category } from "./types";

export const mapCategoryToModel = (dto: Category) => {
  return {
    id: dto._id,
    name: dto.name,
    description: dto.description,
    image_url: dto.image_url,
    createdAt: dto.createdAt,
  };
};

export type CategoryModel = ReturnType<typeof mapCategoryToModel>;
