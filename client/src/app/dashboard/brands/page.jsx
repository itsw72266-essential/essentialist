//D:\essentialist_next_ecommerce\client\src\app\dashboard\brands\page.jsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { FaCloudUploadAlt, FaStar } from 'react-icons/fa';
import { IoClose, IoSearchOutline } from 'react-icons/io5';
import { MdDelete, MdEdit, MdOutlinePublishedWithChanges } from 'react-icons/md';

import SummaryApi from '../../../common/SummaryApi';
import Axios from '../../../utils/Axios';
import uploadImage from '../../../utils/UploadImage';
import successAlert from '../../../utils/SuccessAlert';
import AxiosToastError from '../../../utils/AxiosToastError';
import AdminPermission from '../../../components/AdminPermission';
import Loading from '../../../components/Loading';
import { setAllBrands, setLoadingBrands } from '../../../store/productSlice';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

const MarkdownPreview = dynamic(
  () => import('@uiw/react-markdown-preview').then((mod) => mod.default),
  { ssr: false }
);

const emptyBrand = {
  name: '',
  description: '',
  isActive: true,
  isFeatured: false,
  logo: ''
};

const limitOptions = [
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '200', value: 200 }
];

export default function BrandsDashboardPage() {
  const dispatch = useDispatch();
  const { allBrands, loadingBrands } = useSelector((state) => state.product);

  const [form, setForm] = useState(emptyBrand);
  const [activeTab, setActiveTab] = useState('create');
  const [pageState, setPageState] = useState({
    page: 1,
    limit: 50,
    search: '',
    sort: 'nameAsc'
  });
  const [totalCount, setTotalCount] = useState(0);
  const [editingBrandId, setEditingBrandId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewingBrand, setViewingBrand] = useState(null);

  const selectedBrand = useMemo(
    () => allBrands.find((brand) => brand._id === viewingBrand) || null,
    [viewingBrand, allBrands]
  );

  const fetchBrands = useCallback(async () => {
    try {
      dispatch(setLoadingBrands(true));
      const response = await Axios({
        ...SummaryApi.getBrands,
        params: {
          page: pageState.page,
          limit: pageState.limit,
          search: pageState.search,
          sort: pageState.sort
        }
      });

      const { data: responseData } = response;
      if (responseData.success) {
        dispatch(setAllBrands(responseData.data));
        setTotalCount(responseData.totalCount);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      dispatch(setLoadingBrands(false));
    }
  }, [dispatch, pageState]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSubmitting(true);
      const response = await uploadImage(file);
      const imageUrl = response?.data?.data?.url;

      if (imageUrl) {
        setForm((prev) => ({ ...prev, logo: imageUrl }));
        toast.success('Logo uploaded');
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error('Brand name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBrandId) {
        const response = await Axios({
          ...SummaryApi.updateBrand(editingBrandId),
          data: form
        });
        if (response?.data?.success) {
          successAlert(response.data.message);
          setEditingBrandId(null);
          setForm(emptyBrand);
          fetchBrands();
        }
      } else {
        const response = await Axios({
          ...SummaryApi.createBrand,
          data: form
        });
        if (response?.data?.success) {
          successAlert(response.data.message);
          setForm(emptyBrand);
          fetchBrands();
        }
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (brandId) => {
    const brand = allBrands.find((item) => item._id === brandId);
    if (!brand) return;

    setForm({
      name: brand.name,
      description: brand.description || '',
      isActive: brand.isActive,
      isFeatured: brand.isFeatured,
      logo: brand.logo || ''
    });
    setEditingBrandId(brandId);
    setActiveTab('create');
  };

  const handleReset = () => {
    setEditingBrandId(null);
    setForm(emptyBrand);
  };

  const handleDelete = async (brandId) => {
    const confirmDelete = window.confirm(
      'Deleting this brand requires all associated products to be reassigned first. Do you want to continue?'
    );
    if (!confirmDelete) return;

    try {
      setSubmitting(true);
      const response = await Axios({
        ...SummaryApi.deleteBrand(brandId)
      });
      if (response?.data?.success) {
        successAlert(response.data.message);
        fetchBrands();
        if (viewingBrand === brandId) {
          setViewingBrand(null);
        }
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (brandId, currentValue) => {
    try {
      const response = await Axios({
        ...SummaryApi.updateBrand(brandId),
        data: { isActive: !currentValue }
      });
      if (response?.data?.success) {
        successAlert(
          `${response.data.data.name} is now ${!currentValue ? 'active' : 'inactive'}`
        );
        fetchBrands();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const handleToggleFeatured = async (brandId, currentValue) => {
    try {
      const response = await Axios({
        ...SummaryApi.updateBrand(brandId),
        data: { isFeatured: !currentValue }
      });
      if (response?.data?.success) {
        successAlert(
          `${response.data.data.name} is ${!currentValue ? 'featured' : 'no longer featured'}`
        );
        fetchBrands();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const totalPages = Math.max(Math.ceil(totalCount / pageState.limit), 1);
  const canPrev = pageState.page > 1;
  const canNext = pageState.page < totalPages;

  const switchPage = (direction) => {
    setPageState((prev) => ({
      ...prev,
      page: direction === 'next' ? prev.page + 1 : prev.page - 1
    }));
  };

  const handleSearchChange = (event) => {
    setPageState((prev) => ({
      ...prev,
      search: event.target.value,
      page: 1
    }));
  };

  return (
    <AdminPermission>
      <section className="bg-[#F7F9FC] min-h-[75vh]">
        <div className="p-4 bg-white shadow-sm flex items-center justify-between border-b border-gray-100">
          <h2 className="font-semibold text-lg text-gray-900">Brand Management</h2>
          <div className="flex gap-2">
            <button
              className={`px-3 py-2 rounded text-sm font-semibold border transition-colors ${
                activeTab === 'create'
                  ? 'bg-[#FDE68A] border-[#FACC15] text-gray-900'
                  : 'bg-white border-gray-200 text-gray-600'
              }`}
              onClick={() => setActiveTab('create')}
            >
              {editingBrandId ? 'Edit brand' : 'Create brand'}
            </button>
            <button
              className={`px-3 py-2 rounded text-sm font-semibold border transition-colors ${
                activeTab === 'list'
                  ? 'bg-[#FDE68A] border-[#FACC15] text-gray-900'
                  : 'bg-white border-gray-200 text-gray-600'
              }`}
              onClick={() => setActiveTab('list')}
            >
              Brand list
            </button>
          </div>
        </div>

        {activeTab === 'create' && (
          <div className="p-6 grid lg:grid-cols-[680px,1fr] gap-6">
            <form onSubmit={handleSubmit} className="grid gap-4 bg-white border border-gray-100 shadow-sm p-5 rounded-2xl">
              <div className="grid gap-1">
                <label className="font-medium text-sm text-gray-700" htmlFor="brand-name">
                  Brand name
                </label>
                <input
                  id="brand-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Velvet Bloom"
                  required
                  className="bg-[#F7F9FC] border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDE68A]"
                />
              </div>

              <div className="grid gap-1">
                <label className="font-medium text-sm text-gray-700">Logo</label>
                <label className="border border-dashed border-[#FACC15] bg-[#FFF9E6] min-h-[150px] rounded-xl flex flex-col justify-center items-center gap-2 cursor-pointer transition hover:bg-[#FFF4CC]">
                  {submitting ? (
                    <Loading />
                  ) : form.logo ? (
                    <img
                      src={form.logo}
                      alt={form.name || 'Brand logo'}
                      className="h-24 object-contain"
                    />
                  ) : (
                    <>
                      <FaCloudUploadAlt size={36} className="text-[#F7B500]" />
                      <span className="text-sm text-gray-600 font-medium">Upload brand logo</span>
                      <span className="text-xs text-gray-400">(PNG, JPG up to 2 MB)</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={submitting}
                  />
                </label>
                {form.logo && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, logo: '' }))}
                    className="text-xs text-red-500 hover:underline self-start"
                  >
                    Remove logo
                  </button>
                )}
              </div>

              <div className="grid gap-1">
                <label className="font-medium text-sm text-gray-700" htmlFor="brand-description">
                  Brand story (Markdown)
                </label>
                <div className="bg-[#F7F9FC] border border-gray-200 rounded-xl overflow-hidden">
                  <MDEditor
                    value={form.description}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, description: value || '' }))
                    }
                    height={220}
                    textareaProps={{
                      placeholder: 'Tell shoppers what makes this brand unique…'
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-[#F59E0B] focus:ring-[#FACC15]"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-[#F59E0B] focus:ring-[#FACC15]"
                  />
                  Featured
                </label>
              </div>

              <div className="flex gap-5 px-10 items-center justify-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#F59E0B] hover:bg-[#F97316] text-white px-10  py-2 rounded-lg font-semibold transition disabled:opacity-60"
                >
                  {editingBrandId ? 'Update Brand' : 'Create Brand'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={submitting}
                  className="bg-white border border-gray-200 px-4 py-2 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-60"
                >
                  Reset
                </button>
              </div>
            </form>

            <aside className="hidden lg:block rounded-2xl border border-gray-200 bg-[#FFFDF6] p-6 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-600 mb-4">
                Instructions
              </h3>
              <ul className="space-y-3 text-sm text-gray-700 list-disc list-outside pl-5 leading-relaxed">
                <li>
                  <span className="font-semibold text-gray-800">Slug</span> is auto-generated
                  from the brand name (lowercase, hyphenated).
                </li>
                <li>
                  Upload a transparent PNG (≥ 300×300) for crisp logo rendering.
                </li>
                <li>
                  Set <span className="font-semibold text-gray-800">Featured</span> to surface
                  the brand on your storefront landing pages.
                </li>
                <li>
                  Use Markdown to craft a brand story—ideal for hero sections and SEO.
                </li>
              </ul>
            </aside>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="p-6">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <div className="flex flex-wrap gap-3 items-center justify-between mb-5">
                <div className="relative w-full sm:w-72">
                  <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={pageState.search}
                    onChange={handleSearchChange}
                    placeholder="Search brands…"
                    className="w-full bg-[#F7F9FC] border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FDE68A]"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={pageState.sort}
                    onChange={(event) =>
                      setPageState((prev) => ({
                        ...prev,
                        sort: event.target.value,
                        page: 1
                      }))
                    }
                    className="bg-[#F7F9FC] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FDE68A]"
                  >
                    <option value="nameAsc">Name A → Z</option>
                    <option value="nameDesc">Name Z → A</option>
                    <option value="featured">Featured first</option>
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>

                  <select
                    value={pageState.limit}
                    onChange={(event) =>
                      setPageState((prev) => ({
                        ...prev,
                        limit: Number(event.target.value),
                        page: 1
                      }))
                    }
                    className="bg-[#F7F9FC] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FDE68A]"
                  >
                    {limitOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} / page
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-gray-100">
                <div className="hidden lg:grid grid-cols-[160px,1fr,120px,140px,140px,140px] bg-[#F9FBFF] text-xs uppercase tracking-wide text-gray-500">
                  <div className="px-4 py-3">Logo</div>
                  <div className="px-4 py-3">Brand</div>
                  <div className="px-4 py-3 text-center">Status</div>
                  <div className="px-4 py-3 text-center">Featured</div>
                  <div className="px-4 py-3 text-center">Created</div>
                  <div className="px-4 py-3 text-center">Actions</div>
                </div>

                {loadingBrands ? (
                  <div className="py-16 flex justify-center">
                    <Loading />
                  </div>
                ) : allBrands.length === 0 ? (
                  <div className="py-10 text-center text-gray-500">No brands found.</div>
                ) : (
                  allBrands.map((brand) => (
                    <article
                      key={brand._id}
                      className="grid lg:grid-cols-[160px,1fr,120px,140px,140px,140px] border-t border-gray-100 text-sm bg-white hover:bg-[#FDFBF4] transition"
                    >
                      <div className="px-4 py-3 flex items-center justify-center">
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="h-16 w-16 object-contain bg-white border border-gray-100 rounded-lg shadow-sm cursor-pointer"
                            onClick={() =>
                              setViewingBrand((prev) => (prev === brand._id ? null : brand._id))
                            }
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                            No logo
                          </div>
                        )}
                      </div>

                      <div className="px-4 py-3 flex flex-col gap-1">
                        <div className="font-semibold text-gray-900 uppercase tracking-wide">
                          {brand.name}
                        </div>
                        <div className="text-xs text-gray-500">/{brand.slug}</div>
                        {brand.description && (
                          <button
                            type="button"
                            onClick={() =>
                              setViewingBrand((prev) => (prev === brand._id ? null : brand._id))
                            }
                            className="text-xs text-[#F59E0B] hover:underline mt-1 self-start font-medium"
                          >
                            View description
                          </button>
                        )}
                      </div>

                      <div className="px-4 py-3 flex items-center justify-center">
                        <button
                          onClick={() => handleToggleActive(brand._id, brand.isActive)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                            brand.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {brand.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>

                      <div className="px-4 py-3 flex items-center justify-center">
                        <button
                          onClick={() => handleToggleFeatured(brand._id, brand.isFeatured)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                            brand.isFeatured
                              ? 'bg-[#FEF3C7] text-[#B45309] border-[#FCD34D]'
                              : 'bg-white text-gray-600 border-gray-200'
                          }`}
                        >
                          <FaStar className={brand.isFeatured ? 'text-[#F59E0B]' : 'text-gray-400'} />
                          {brand.isFeatured ? 'Featured' : 'Mark featured'}
                        </button>
                      </div>

                      <div className="px-4 py-3 text-xs text-gray-500 flex items-center justify-center">
                        {new Date(brand.createdAt).toLocaleDateString()}
                      </div>

                      <div className="px-4 py-3 flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(brand._id)}
                          className="p-2 rounded-full border border-[#FACC15] text-[#B45309] hover:bg-[#FEF3C7] transition"
                          title="Edit"
                        >
                          <MdEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(brand._id, brand.isActive)}
                          className="p-2 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 transition"
                          title="Toggle status"
                        >
                          <MdOutlinePublishedWithChanges size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(brand._id)}
                          className="p-2 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <MdDelete size={16} />
                        </button>
                      </div>

                      {viewingBrand === brand._id && brand.description && (
                        <div className="lg:col-span-6 col-span-full bg-[#FDFBF4] border-t border-[#FDE68A] px-5 py-4 text-sm text-gray-700">
                          <div className="flex items-center justify-between mb-3">
                            <strong className="text-gray-800 uppercase tracking-wide text-xs">
                              Brand story
                            </strong>
                            <button
                              className="text-xs text-gray-500 flex items-center gap-1 hover:text-gray-700"
                              onClick={() => setViewingBrand(null)}
                            >
                              <IoClose /> Close
                            </button>
                          </div>
                          <article
                            data-color-mode="light"
                            className="wmde-markdown prose prose-sm max-w-none"
                          >
                            <MarkdownPreview source={brand.description || ''} />
                          </article>
                        </div>
                      )}
                    </article>
                  ))
                )}
              </div>

              <div className="flex flex-wrap justify-between items-center text-sm mt-6 gap-3">
                <button
                  onClick={() => switchPage('prev')}
                  disabled={!canPrev}
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Previous
                </button>
                <div className="text-gray-600">
                  Page {pageState.page} / {totalPages} • {totalCount} brands
                </div>
                <button
                  onClick={() => switchPage('next')}
                  disabled={!canNext}
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </AdminPermission>
  );
}