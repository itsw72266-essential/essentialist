'use client';

import React from 'react';
import { FiEdit3, FiTrash2 } from 'react-icons/fi';

const statusStyles = {
  published: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  draft: 'bg-slate-100 text-slate-600 border border-slate-200',
  archived: 'bg-amber-100 text-amber-700 border border-amber-200',
};

const BlogListTable = ({
  blogs,
  loading,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
}) => {
  if (loading) {
    return (
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-10 rounded bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  const hasPosts = Array.isArray(blogs) && blogs.length > 0;

  return (
    <div className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Tags
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Published
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Reading Time
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!hasPosts && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  No blog articles found. Create one to get started.
                </td>
              </tr>
            )}

            {hasPosts &&
              blogs.map((blog) => {
                const publishedDate = blog.publishedAt || blog.createdAt;
                const readableDate = publishedDate
                  ? new Date(publishedDate).toLocaleDateString()
                  : '—';
                const readingTimeLabel = blog.readingTime
                  ? `${blog.readingTime} min read`
                  : '—';

                return (
                  <tr key={blog._id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <div className="text-sm font-semibold text-slate-900 line-clamp-2">
                          {blog.title}
                        </div>
                        <div className="mt-1 text-xs text-slate-500 line-clamp-2">
                          {blog.excerpt}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          statusStyles[blog.status] || statusStyles.draft
                        }`}
                      >
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {(blog.tags || []).slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                        {Array.isArray(blog.tags) && blog.tags.length > 3 && (
                          <span className="text-xs text-slate-400">
                            +{blog.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{readableDate}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {readingTimeLabel}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => onEdit(blog)}
                          className="rounded border border-primary-200 px-3 py-1 text-sm font-medium text-primary-200 hover:bg-primary-50"
                        >
                          <span className="flex items-center gap-2">
                            <FiEdit3 size={16} />
                            Edit
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(blog)}
                          className="rounded border border-red-200 px-3 py-1 text-sm font-medium text-red-500 hover:bg-red-50"
                        >
                          <span className="flex items-center gap-2">
                            <FiTrash2 size={16} />
                            Delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {pagination?.totalPages > 1 && (
        <footer className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <div>
            Showing page {pagination.page} of {pagination.totalPages} (
            {pagination.totalCount} total)
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default BlogListTable;