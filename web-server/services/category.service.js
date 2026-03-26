const Category = require('../schemas/Category.schema');

class CategoryService {
  async createCategory(data) {
    const category = new Category(data);
    return await category.save();
  }

  async getAllCategories() {
    return await Category.find().sort({ name: 1 });
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
