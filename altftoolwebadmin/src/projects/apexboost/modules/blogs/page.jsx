import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Search, Filter, Eye, Settings } from "lucide-react";
import SectionHeadingEditor from "../../../../components/admin/SectionHeadingEditor";
import { emitAlert } from "@/lib/alertBus";
import {
  subscribeBlogPosts,
  updateBlogPost,
  subscribeBlogCategories,
  saveBlogCategories,
} from "../service/apexboost.service";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [blogToView, setBlogToView] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [blogToEdit, setBlogToEdit] = useState(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catText, setCatText] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  useEffect(() => {
    return subscribeBlogPosts(
      (data) => setBlogs(data.filter((b) => !b.deleted)),
      () => emitAlert({ type: "error", title: "Error", message: "Failed to load blogs." }),
    );
  }, []);

  useEffect(() => {
    if (isCatModalOpen && !isLoadingCategories && !catText) {
      setIsLoadingCategories(true);
      return subscribeBlogCategories(
        (data) => {
          setCatText(data.join("\n"));
          setIsLoadingCategories(false);
        },
        () => setIsLoadingCategories(false),
      );
    }
  }, [isCatModalOpen]);

  const categories = ["All", ...new Set(blogs.map((b) => b.category))];

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = useCallback((blogId) => {
    setBlogToDelete(blogId);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    // Soft delete: mark as deleted instead of removing
    const post = blogs.find((b) => b.id === blogToDelete);
    try {
      if (post) {
        await updateBlogPost(blogToDelete, { ...post, deleted: true });
      }
    } catch (error) {
      console.error('Failed to sync delete:', error);
      emitAlert({ type: "error", title: "Error", message: "Failed to delete blog." });
    }

    setIsDeleteModalOpen(false);
    setBlogToDelete(null);
  }, [blogToDelete, blogs]);

  const handleView = useCallback((blog) => {
    setBlogToView(blog);
    setIsViewModalOpen(true);
  }, []);

  const handleEdit = useCallback((blog) => {
    setBlogToEdit({ ...blog });
    setIsEditModalOpen(true);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    try {
      await updateBlogPost(blogToEdit.id, blogToEdit);
      setIsEditModalOpen(false);
      setBlogToEdit(null);
      emitAlert({ type: "success", title: "Success", message: "Blog updated!" });
    } catch (error) {
      console.error('Failed to save edit:', error);
      emitAlert({ type: "error", title: "Error", message: "Failed to update blog." });
    }
  }, [blogToEdit]);

  const handleSaveCategories = useCallback(async () => {
    const updated = catText.split("\n").map(s => s.trim()).filter(Boolean);
    try {
      await saveBlogCategories(updated);
      setIsCatModalOpen(false);
      emitAlert({ type: "success", title: "Success", message: "Categories updated!" });
    } catch (err) {
      emitAlert({ type: "error", title: "Error", message: "Error updating categories." });
    }
  }, [catText]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Manage Blogs
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Create, edit, and manage your blog content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SectionHeadingEditor
            sectionKey="blogHeading"
            defaultHeading={{
              eyebrow: "Blog & Insights",
              title: "Growth strategies you can",
              highlight: "steal today",
              subtitle: "Fresh thinking on SEO, affiliate programs, paid ads and the tactics driving modern marketing wins."
            }}
          />
          <button onClick={() => setIsCatModalOpen(true)} className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm hover:bg-gray-50">
            <Settings size={16} />
            Categories
          </button>
          <button className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90">
            <Plus size={16} />
            Add Blog
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Blog</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Author</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map((blog) => (
                <tr key={blog.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{blog.title}</p>
                        <p className="text-sm text-gray-500">{blog.readTime}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                      {blog.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{blog.author}</p>
                      <p className="text-sm text-gray-500">{blog.role}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{blog.date}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(blog)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="View"
                      >
                        <Eye size={18} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleEdit(blog)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="Edit"
                      >
                        <Edit size={18} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="p-2 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBlogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No blogs found</p>
          </div>
        )}
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              Are you sure you want to delete this blog?
            </h2>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isViewModalOpen && blogToView && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={blogToView.image}
                alt={blogToView.title}
                className="w-full h-64 object-cover rounded-t-xl"
              />
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white"
              >
                <Trash2 size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{blogToView.emoji}</span>
                <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                  {blogToView.category}
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-4">{blogToView.title}</h2>
              <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                <span>{blogToView.author}</span>
                <span>•</span>
                <span>{blogToView.role}</span>
                <span>•</span>
                <span>{blogToView.date}</span>
                <span>•</span>
                <span>{blogToView.readTime}</span>
              </div>
              <p className="text-gray-700 mb-6">{blogToView.intro}</p>
              <div className="space-y-4">
                {blogToView.content.map((section, index) => (
                  <div key={index}>
                    <h3 className="text-lg font-semibold mb-2">{section.heading}</h3>
                    <p className="text-gray-700">{section.body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Key Takeaways</h4>
                <ul className="list-disc list-inside space-y-1">
                  {blogToView.takeaways.map((takeaway, index) => (
                    <li key={index} className="text-gray-700">{takeaway}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && blogToEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Edit Blog</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={blogToEdit.title}
                    onChange={(e) => setBlogToEdit({ ...blogToEdit, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={blogToEdit.category}
                    onChange={(e) => setBlogToEdit({ ...blogToEdit, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={blogToEdit.author}
                    onChange={(e) => setBlogToEdit({ ...blogToEdit, author: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                  <textarea
                    value={blogToEdit.excerpt}
                    onChange={(e) => setBlogToEdit({ ...blogToEdit, excerpt: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={blogToEdit.image}
                    onChange={(e) => setBlogToEdit({ ...blogToEdit, image: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="border px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="bg-(--primary) text-white px-4 py-2 rounded"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCatModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 my-8 p-6">
            <h2 className="text-2xl font-bold mb-6">Manage Categories</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categories (one per line)
                </label>
                <textarea
                  rows={8}
                  value={catText}
                  onChange={(e) => setCatText(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
                  placeholder="All&#10;SEO Tips&#10;Affiliate Guides"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Tip: Always keep "All" as the first category so users can see every post.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategories}
                className="bg-(--primary) text-white px-4 py-2 rounded"
              >
                Save Categories
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
