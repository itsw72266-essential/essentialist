'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SummaryApi from '@/backend/contracts/summaryApi'
import Axios from '@/lib/apiClient'
import AxiosToastError from '@/lib/axiosToastError'
import CardProduct from './../../components/CardProduct'
import InfiniteScroll from 'react-infinite-scroll-component'
// import noDataImage from '/public/assets/nothing here yet.webp'
import Search from './../../components/Search'
import CardLoading from './../../components/CardLoading';
import FiltersSidebar from './../../components/filters/FiltersSidebar'
import QuickFilterChips, { DEAL_FILTERS } from './../../components/filters/QuickFilterChips'

export default function SearchPage() {
  const [data,setData] = useState([])
  const [loading,setLoading] = useState(true)
  const loadingArrayCard = new Array(10).fill(null)
  const [page,setPage] = useState(1)
  const [totalPage,setTotalPage] = useState(1)
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchText = searchParams.get('q')
  const categoryId = searchParams.get('category') || ''

  const [selectedBrands, setSelectedBrands] = useState(() => {
    const ids = (searchParams.get('brand') || '').split(',').filter(Boolean)
    const names = (searchParams.get('brandNames') || '').split(',').filter(Boolean)
    return ids.map((id, i) => ({ _id: id, name: names[i] || id }))
  })
  const brandIds = selectedBrands.map((b) => b._id)

  const [priceRange, setPriceRange] = useState(() => {
    const min = searchParams.get('priceMin')
    const max = searchParams.get('priceMax')
    return min && max ? [Number(min), Number(max)] : null
  })
  const [discountRange, setDiscountRange] = useState(() => {
    const min = searchParams.get('discountMin')
    const max = searchParams.get('discountMax')
    return min && max ? [Number(min), Number(max)] : null
  })

  const [dealKey, setDealKey] = useState('all')
  const dealFilters = DEAL_FILTERS.find((d) => d.key === dealKey)?.filters || {}

  const setDepartment = (nextCategoryId) => {
    const params = new URLSearchParams(searchParams.toString())
    if (nextCategoryId) params.set('category', nextCategoryId)
    else params.delete('category')
    router.replace(`/search?${params.toString()}`)
  }

  const fetchData = async() => {
    try {
      setLoading(true)
        const hasFilters = categoryId || brandIds.length || priceRange || discountRange || dealKey !== 'all'
        const response = await Axios({
            ...SummaryApi.searchProduct,
            data : {
              search : searchText ,
              page : page,
              ...(hasFilters ? { filters : {
                ...(categoryId ? { categoryIds : [categoryId] } : {}),
                ...(brandIds.length ? { brandIds } : {}),
                ...(priceRange ? { price : { min: priceRange[0], max: priceRange[1] } } : {}),
                ...(discountRange ? { discount : { min: discountRange[0], max: discountRange[1] } } : {}),
                ...dealFilters,
              } } : {}),
            }
        })

        const { data : responseData } = response

        if(responseData.success){
            if(responseData.page == 1){
              setData(responseData.data)
            }else{
              setData((preve)=>{
                return[
                  ...preve,
                  ...responseData.data
                ]
              })
            }
            setTotalPage(responseData.totalPage)
        }
    } catch (error) {
        AxiosToastError(error)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    setPage(1)
  },[searchText,categoryId,selectedBrands,priceRange,discountRange,dealKey])

  useEffect(()=>{
    fetchData()
  },[page,searchText,categoryId,selectedBrands,priceRange,discountRange,dealKey])

  const handleFetchMore = ()=>{
    if(totalPage > page){
      setPage(preve => preve + 1)
    }
  }

  return (
    <section className='bg-white'>
      <div className='px-4 lg:pl-0 lg:pr-4'>
        <div className='flex flex-col lg:flex-row gap-4'>
          <aside className='w-full lg:w-56 shrink-0 py-4 px-4 lg:pl-0 lg:pr-0'>
            <FiltersSidebar
              categoryId={categoryId}
              onCategoryChange={setDepartment}
              selectedBrands={selectedBrands}
              onBrandsChange={setSelectedBrands}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              discountRange={discountRange}
              onDiscountChange={setDiscountRange}
            />
          </aside>

          <div className='flex-1 min-w-0 py-4'>
            <div className="block sm:hidden mb-4">
              <Search />
            </div>

            <QuickFilterChips active={dealKey} onSelect={setDealKey} />

            <p className='font-semibold'>Search Results: {data.length}  </p>

            <InfiniteScroll
                  dataLength={data.length}
                  hasMore={true}
                  next={handleFetchMore}
            >
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 py-4 gap-4'>
                  {
                    data.map((p,index)=>{
                      return(
                        <CardProduct data={p} key={p?._id+"searchProduct"+index}/>
                      )
                    })
                  }

                {
                  loading && (
                    loadingArrayCard.map((_,index)=>{
                      return(
                        <CardLoading key={"loadingsearchpage"+index}/>
                      )
                    })
                  )
                }
            </div>
            </InfiniteScroll>

                  {
                    !data[0] && !loading && (
                      <div className='flex flex-col justify-center items-center w-full mx-auto'>
                        <img
                          src="/assets/nothing here yet.webp"
                          className='w-full h-full max-w-xs max-h-xs block'
                        />
                        <p className='font-semibold my-2'>No Data found</p>
                      </div>
                    )
                  }
          </div>
        </div>
      </div>
    </section>
  )
}