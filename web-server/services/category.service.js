const Category = require('../schemas/Category.schema');

class CategoryService {
  async createCategory(data) {
    const category = new Category(data);
    return await category.save();
  }

  async getAllCategories(query = {}) {
    const mongoQuery = {};
    if (query.type) mongoQuery.type = query.type;
    if (query.is_featured !== undefined) mongoQuery.is_featured = query.is_featured === 'true';
    if (query.parent_id) mongoQuery.parent_id = query.parent_id;

    return await Category.find(mongoQuery).sort({ name: 1 });
  }

  async getCategoryById(id) {
    return await Category.findById(id);
  }

  async getCategoryBySlug(slug) {
    return await Category.findOne({ slug });
  }

  async updateCategory(id, data) {
    return await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteCategory(id) {
    // Lưu ý: Cần xử lý logic ràng buộc nếu có Cake đang thuộc Category này (ở controller/logic nghiệp vụ)
    return await Category.findByIdAndDelete(id);
  }
}

module.exports = new CategoryService();
