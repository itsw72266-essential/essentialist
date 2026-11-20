'use client'

import { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import SummaryApi from '@/backend/contracts/summaryApi'
import Axios from '@/lib/apiClient'
import AxiosToastError from '@/lib/axiosToastError'
import CardProduct from '@/components/CardProduct'
import CardLoading from '@/components/CardLoading'
import { useHomeFilters } from './HomeFiltersContext'

export default function HomeFilteredProducts() {
  const { categoryId, selectedBrands, priceRange, discountRange } = useHomeFilters()
  const brandIds = selectedBrands.map((b) => b._id)

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState(1)
  const loadingArrayCard = new Array(10).fill(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.searchProduct,
        data: {
          page,
          filters: {
            ...(categoryId ? { categoryIds: [categoryId] } : {}),
            ...(brandIds.length ? { brandIds } : {}),
            ...(priceRange ? { price: { min: priceRange[0], max: priceRange[1] } } : {}),
            ...(discountRange ? { discount: { min: discountRange[0], max: discountRange[1] } } : {}),
          },
        },
      })

      const { data: responseData } = response
      if (responseData.success) {
        if (responseData.page === 1) {
          setData(responseData.data)
        } else {
          setData((prev) => [...prev, ...responseData.data])
        }
        setTotalPage(responseData.totalPage)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [categoryId, selectedBrands, priceRange, discountRange])

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, categoryId, selectedBrands, priceRange, discountRange])

  const handleFetchMore = () => {
    if (totalPage > page) setPage((prev) => prev + 1)
  }

  return (
    <div>
      <p className="font-semibold mb-2">Filtered Results: {data.length}</p>
      <InfiniteScroll dataLength={data.length} hasMore={true} next={handleFetchMore}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((p, index) => (
            <CardProduct data={p} key={`${p?._id}-homeFiltered-${index}`} />
          ))}
          {loading &&
            loadingArrayCard.map((_, index) => <CardLoading key={`loading-home-filtered-${index}`} />)}
        </div>
      </InfiniteScroll>

      {!data[0] && !loading && (
        <div className="flex flex-col justify-center items-center w-full mx-auto py-10">
          <p className="font-semibold">No products match these filters</p>
        </div>
      )}
    </div>
  )
}
