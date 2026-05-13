'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import SummaryApi from './../../common/SummaryApi'
import Axios from './../../utils/Axios'
import AxiosToastError from './../../utils/AxiosToastError'
import CardProduct from './../../components/CardProduct'
import InfiniteScroll from 'react-infinite-scroll-component'
// import noDataImage from '/public/assets/nothing here yet.webp'
import Search from './../../components/Search'
import CardLoading from './../../components/CardLoading';

export default function SearchPage() {
  const [data,setData] = useState([])
  const [loading,setLoading] = useState(true)
  const loadingArrayCard = new Array(10).fill(null)
  const [page,setPage] = useState(1)
  const [totalPage,setTotalPage] = useState(1)
  const searchParams = useSearchParams()
  const searchText = searchParams.get('q')

  const fetchData = async() => {
    try {
      setLoading(true)
        const response = await Axios({
            ...SummaryApi.searchProduct,
            data : {
              search : searchText ,
              page : page,
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
    fetchData()
  },[page,searchText])

  const handleFetchMore = ()=>{
    if(totalPage > page){
      setPage(preve => preve + 1)
    }
  }

  return (
    <section className='bg-white'>
      <div className='container mx-auto p-4'>
        <div className="block sm:hidden mb-4">
          <Search />
        </div>

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
    </section>
  )
}