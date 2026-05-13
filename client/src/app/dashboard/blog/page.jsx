'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import AdminPermision from '../../../layouts/AdminPermission';
import Axios from '../../../utils/Axios';
import AxiosToastError from '../../../utils/AxiosToastError';
import SummaryApi from '../../../common/SummaryApi';

import BlogEditor from '../../../components/blog/BlogEditor';
import BlogListTable from '../../../components/blog/BlogListTable';

const PAGE_SIZE = 10;

const DashboardBlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showEditor, setShowEditor] = useState(false);
  const [editorMode, setEditorMode] = useState('create');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
    totalCount: 0,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchBlogs = async ({ page = 1, search = searchTerm, status = filterStatus } = {}) => {
    try {
      setLoading(true);
      const { method, url } = SummaryApi.blogList;

      const params = {
        page,
        limit: PAGE_SIZE,
        scope: 'admin',
      };

      if (status !== 'all') {
        params.status = status;
      }

      if (search) {
        params.search = search;
      }

      const response = await Axios({
        method,
        url,
        params,
      });

      const payload = response?.data;
      setBlogs(payload?.data || []);
      setPagination({
        page: payload?.page || page,
        limit: payload?.limit || PAGE_SIZE,
        totalPages: payload?.totalPages || 1,
        totalCount: payload?.totalCount || 0,
      });
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchBlogs({ page: 1, status: filterStatus, search: searchTerm });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const handleCreateClick = () => {
    setEditorMode('create');
    setSelectedBlog(null);
    setShowEditor(true);
  };

  const handleEdit = (blog) => {
    setEditorMode('edit');
    setSelectedBlog(blog);
    setShowEditor(true);
  };

  const handleDelete = async (blog) => {
    const confirmed = window.confirm(`Delete article "${blog.title}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      const { method, url } = SummaryApi.blogDelete(blog._id);
      await Axios({ method, url });
      toast.success('Blog deleted successfully');
      await fetchBlogs({ page: pagination.page });
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const handleSubmit = async (payload) => {
    try {
      setIsSaving(true);

      if (editorMode === 'create') {
        await Axios({
          ...SummaryApi.blogCreate,
          data: payload,
        });
        toast.success('Blog published successfully');
      } else if (editorMode === 'edit' && selectedBlog?._id) {
        await Axios({
          ...SummaryApi.blogUpdate(selectedBlog._id),
          data: payload,
        });
        toast.success('Blog updated successfully');
      }

      setShowEditor(false);
      setSelectedBlog(null);
      await fetchBlogs({ page: editorMode === 'create' ? 1 : pagination.page });
    } catch (error) {
      AxiosToastError(error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    fetchBlogs({ page: nextPage });
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    await fetchBlogs({ page: 1, search: searchTerm, status: filterStatus });
  };

  return (
    <AdminPermision>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Blog Manager</h1>
            <p className="mt-1 text-sm text-slate-500">
              Publish announcements, tutorials, promotions, and brand stories to engage customers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fetchBlogs({ page: pagination.page })}
              className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={handleCreateClick}
              className="rounded bg-primary-200 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-300"
            >
              New Article
            </button>
          </div>
        </header>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <form onSubmit={handleSearchSubmit} className="flex w-full flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <label className="flex flex-1 flex-col">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search Articles
              </span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by title, excerpt, or tag"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-200 focus:ring-2 focus:ring-primary-100"
              />
            </label>

            <div className="flex items-center gap-3">
              <label className="flex flex-col text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
                <select
                  value={filterStatus}
                  onChange={(event) => setFilterStatus(event.target.value)}
                  className="mt-1 min-w-[140px] rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-200 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="all">All</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </label>

              <button
                type="submit"
                className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Apply
              </button>
            </div>
          </form>
        </div>

        {showEditor ? (
          <BlogEditor
            initialData={editorMode === 'edit' ? selectedBlog : null}
            onCancel={() => {
              setShowEditor(false);
              setSelectedBlog(null);
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSaving}
          />
        ) : (
          <BlogListTable
            blogs={blogs}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}
      </section>
    </AdminPermision>
  );
};

export default DashboardBlogPage;