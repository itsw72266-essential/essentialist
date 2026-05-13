'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';

import Axios from '../../utils/Axios';
import SummaryApi from '../../common/SummaryApi';

import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(
  () => import('react-quill-new').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="rounded border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
        Loading editor...
      </div>
    ),
  }
);

const DEFAULT_FORM = {
  title: '',
  excerpt: '',
  coverImage: '',
  tagsInput: '',
  status: 'draft',
  metaTitle: '',
  metaDescription: '',
};

const BlogEditor = ({ initialData, onCancel, onSubmit, isSubmitting }) => {
  const [formState, setFormState] = useState(DEFAULT_FORM);
  const [content, setContent] = useState('');
  const quillRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormState({
        title: initialData.title || '',
        excerpt: initialData.excerpt || '',
        coverImage: initialData.coverImage || '',
        tagsInput: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
        status: initialData.status || 'draft',
        metaTitle: initialData.metaTitle || initialData.title || '',
        metaDescription: initialData.metaDescription || initialData.excerpt || '',
      });
      setContent(initialData.content || '');
    } else {
      setFormState(DEFAULT_FORM);
      setContent('');
    }
  }, [initialData]);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be smaller than 5MB');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      try {
        const { method, url } = SummaryApi.uploadImage;
        const response = await Axios({
          method,
          url,
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const imageUrl =
          response?.data?.data?.url ||
          response?.data?.data?.secure_url ||
          response?.data?.data?.path ||
          response?.data?.url ||
          response?.data?.path;

        if (!imageUrl) {
          throw new Error('Upload succeeded but no URL was returned. Adjust the response parser to match your upload API.');
        }

        const quillInstance = quillRef.current?.getEditor?.();
        if (quillInstance) {
          const range = quillInstance.getSelection(true);
          quillInstance.insertEmbed(range.index, 'image', imageUrl, 'user');
          quillInstance.setSelection(range.index + 1, 0);
        }
        toast.success('Image inserted into the article');
      } catch (error) {
        console.error('Image upload error:', error);
        toast.error(error?.response?.data?.message || error?.message || 'Failed to upload image');
      }
    };
  }, []);

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }, { color: [] }, { background: [] }],
          ['link', 'image', 'video'],
          ['clean'],
        ],
        handlers: {
          image: handleImageUpload,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [handleImageUpload]
  );

  const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ];

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formState.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!content || !content.trim()) {
      toast.error('Content is required');
      return;
    }

    const payload = {
      title: formState.title.trim(),
      excerpt: formState.excerpt.trim(),
      coverImage: formState.coverImage.trim(),
      content,
      tags: formState.tagsInput,
      status: formState.status,
      metaTitle: formState.metaTitle.trim(),
      metaDescription: formState.metaDescription.trim(),
    };

    await onSubmit(payload);
  };

  const coverPreview =
    formState.coverImage?.startsWith('http') || formState.coverImage?.startsWith('/')
      ? formState.coverImage
      : '';

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <header className="flex flex-col gap-2 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {initialData ? 'Edit Article' : 'Create New Article'}
          </h2>
          <p className="text-sm text-slate-500">
            Share tutorials, store updates, promotions, and more with your community.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-primary-200 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Article' : 'Publish Article'}
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Title *</span>
            <input
              type="text"
              value={formState.title}
              onChange={handleInputChange('title')}
              placeholder="e.g. Top 5 Setting Powders for Humid Weather"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-200 focus:ring-2 focus:ring-primary-100"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Short Description (Excerpt)</span>
            <textarea
              rows={3}
              value={formState.excerpt}
              onChange={handleInputChange('excerpt')}
              placeholder="A quick summary that will be shown on the blog list."
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-200 focus:ring-2 focus:ring-primary-100"
            />
          </label>

          <div>
            <span className="text-sm font-semibold text-slate-700">Article Content *</span>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={quillModules}
              className="mt-2"
            />
          </div>
        </div>

        <aside className="space-y-6">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Cover Image URL</span>
            <input
              type="text"
              value={formState.coverImage}
              onChange={handleInputChange('coverImage')}
              placeholder="https://..."
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-200 focus:ring-2 focus:ring-primary-100"
            />
            <p className="mt-1 text-xs text-slate-500">
              Paste an absolute URL (Cloudinary, S3, etc.). Use the toolbar image button to upload inline images.
            </p>
            {coverPreview && (
              <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverPreview} alt="Cover preview" className="h-40 w-full object-cover" />
              </div>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Tags</span>
            <input
              type="text"
              value={formState.tagsInput}
              onChange={handleInputChange('tagsInput')}
              placeholder="e.g. skincare, setting powder, tutorial"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-200 focus:ring-2 focus:ring-primary-100"
            />
            <p className="mt-1 text-xs text-slate-500">
              Separate tags with commas. Tags help customers find related articles.
            </p>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Visibility</span>
            <select
              value={formState.status}
              onChange={handleInputChange('status')}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-200 focus:ring-2 focus:ring-primary-100"
            >
              {statuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">SEO Title</span>
              <input
                type="text"
                value={formState.metaTitle}
                onChange={handleInputChange('metaTitle')}
                placeholder="Custom title for search engines"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-200 focus:ring-2 focus:ring-primary-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">SEO Description</span>
              <textarea
                rows={3}
                value={formState.metaDescription}
                onChange={handleInputChange('metaDescription')}
                placeholder="Up to ~160 characters for search results."
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-200 focus:ring-2 focus:ring-primary-100"
              />
            </label>
          </div>
        </aside>
      </div>
    </form>
  );
};

export default BlogEditor;